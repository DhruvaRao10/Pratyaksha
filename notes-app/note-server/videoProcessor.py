import yt_dlp
import whisper
import boto3 
from botocore.exceptions import ClientError
import logging 
import tempfile
import os 
import json 
from datetime import datetime, timezone 

logger = logging.getLogger(__name__)

class YoutubeProcessor:
    def __init__(
        self, 
        aws_access_key_id: str, 
        aws_secret_access_key: str,
        aws_region: str,
        bucket_name: str, 
    ):
        self.s3_client = boto3.client(
            "s3", 
            aws_access_key_id=aws_access_key_id, 
            aws_secret_access_key=aws_secret_access_key,
            aws_region=aws_region,
            
        )
        self.bucket_name = bucket_name
        self.whisper_model = whisper.load_model("base")
        
    async def process_video(self, url:str, user_id: str, video_id: str) -> dict:
        """Process a video download the audio, transcribe and then upload to s3"""
        try:
            #downlaoad the video metadata and audio
            
            video_info = self._download_video_info(url)
            audio_path = self._download_audio(url)                               
                                                                                          
            #transcribe audio                                              
            transcript = self._transcribe_audio(audio_path)                                                        
                                                                                        
            #Generate s3 paths                                       
            timestamp = datetime.now(tz=timezone.utc)                                    
            transcript_key = f"transcripts/user_{user_id}/{timestamp}_{video_id}.txt"                       
            metadata_key = f"metadata/user_{user_id}/{timestamp}_{video_id}.json"                                
                                                                                                    
            #upload transcript and metadata to s3                                                  
            self._upload_to_s3(transcript, transcript_key, "text/plain")                 
            self._upload_to_s3(                                                   
                json.dumps(video_info),  
                metadata_key,                
                "application/json"
            )
            return{
                "transcript_key": transcript_key, 
                "metadata_key": metadata_key, 
                "duration": video_info.get("duration"), 
                "title": video_info.get("title"), 
            }
        except Exception as e:
            logger.errror(f"Error processing video: {str(e)}")
            raise
        finally:
            if os.path.exists(audio_path):
                os.remove(audio_path)
                
    
    def _download_video_info(self, url: str) -> dict:
        """Download video metadata w/yt-dlp"""
        ydl_opts = {
            "quiet": True, 
            "no_warnings": True, 
            "extract_flat": True, 
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)
        
    def _download_audio(self, url: str)  -> str:
        """Download audio from youtube video"""
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_file:
            ydl_opts = {
                "format": "bestaudio/best", 
                "postprocessors": [{
                    "key": "FFmpegExtractAudio", 
                    "preferredcodec": "mp3", 
                }], 
                "outtmpl": temp_file.name, 
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            return temp_file.name
        
    def _transcribe_audio(self, audio_path: str) -> str:
        """Transcribe audio using Whisper"""
        result = self.whisper_model.transcribe(audio_path)
        return result["text"]
    
    def _upload_to_s3(self, audio_path: str) -> str:
        """Transcribe audio using Whisper"""
        result = self.whisper_model.transcribe(audio_path)
        return result["text"]
    
    def _upload_to_s3(self, content: str, key: str, content_type: str):
        """Upload content to S3"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=content,
                ContentType=content_type,
            )
        except ClientError as e:
            logger.error(f"Error uploading to S3: {str(e)}")
            raise
        
        
                
        
                

