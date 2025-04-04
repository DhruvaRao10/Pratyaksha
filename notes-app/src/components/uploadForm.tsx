import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link, Loader, FileText, X, CheckCircle, AlertCircle, Youtube } from 'lucide-react';
// import jwtDecode from "jwt-decode";
import axiosClient from '../services/axiosInstance';
import { Dialog, Transition } from '@headlessui/react';

const getYoutubeVideoId = (url: string) => {
  // Extract YouTube video ID using regex
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const UploadForm = () => {
  const [uploadType, setUploadType] = useState<'file' | 'youtube'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
      //   const decodedToken: { sub: string } = jwtDecode(token);
      //   setUserId(decodedToken.sub);
      } catch (err) {
        console.error('Token decode error:', err);
        setError('Authentication error. Please log in again.');
      }
    } else {
      setError('No authentication token found. Please log in.');
    }
  }, []);

  // Reset inputs when switching upload types
  useEffect(() => {
    setFile(null);
    setYoutubeUrl('');
    setYoutubeVideoId(null);
    setError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
  }, [uploadType]);

  // Update YouTube video ID when URL changes
  useEffect(() => {
    if (uploadType === 'youtube' && youtubeUrl) {
      const videoId = getYoutubeVideoId(youtubeUrl);
      setYoutubeVideoId(videoId);
    }
  }, [youtubeUrl, uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    },
    onDropRejected: () => {
      setError('Please upload a valid PDF file');
      setFile(null);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      if (uploadType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
 
        await axiosClient.post('/pdf-extract', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent: any) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
      } else if (uploadType === 'youtube' && youtubeUrl && youtubeVideoId) {
        await axiosClient.post('/video-extract', { url: youtubeUrl, userId });
      } else {
        setError('Please provide valid input.');
        setIsUploading(false);
        return;
      }

      setUploadSuccess(true);
      setTimeout(() => {
        setUploadProgress(0);
        setFile(null);
        setYoutubeUrl('');
        setYoutubeVideoId(null);
      }, 3000);

      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="relative p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadType('file')}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all ${
                uploadType === 'file'
                  ? 'text-purple-700 bg-purple-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setUploadType('youtube')}
              className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all ${
                uploadType === 'youtube'
                  ? 'text-pink-700 bg-pink-100'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="relative z-10 flex items-center">
                <Youtube className="w-4 h-4 mr-2" />
                YouTube
              </span>
            </motion.button>
          </div>
                </div>

        <AnimatePresence mode="wait">
                {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-700"
            >
              <AlertCircle className="w-5 h-5 mr-3" />
                    {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {uploadType === 'file' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  {...getRootProps()}
                  className={`
                    relative group cursor-pointer
                    border-2 border-dashed rounded-3xl
                    transition-all duration-200 ease-in-out
                    min-h-[300px] flex items-center justify-center
                    ${isDragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}
                    ${file ? 'bg-purple-50/50' : 'bg-gray-50/50'}
                  `}
                >
                  <input {...getInputProps()} />
                  <div className="absolute inset-4 rounded-2xl border border-gray-100/50 bg-white/50 backdrop-blur-sm"></div>
                  
                  <div className="relative z-10 text-center p-6">
                        {file ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                              }}
                          className="mt-4 px-4 py-2 text-sm text-red-500 hover:text-red-700 transition-colors"
                            >
                          Remove file
                            </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                          <Upload className="w-8 h-8 text-purple-600" />
                        </div>
                        <p className="text-lg font-medium text-gray-800 mb-2">
                          Drop your PDF here
                        </p>
                        <p className="text-sm text-gray-500">
                          or click to browse from your computer
                        </p>
                      </motion.div>
                      )}
                    </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                      <div className="relative">
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Paste YouTube URL here..."
                    className="w-full px-6 py-4 pl-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                        />
                  <Youtube className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                <AnimatePresence>
                      {youtubeVideoId && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="relative rounded-2xl overflow-hidden shadow-lg"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <img
                        src={`https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`}
                            alt="YouTube Thumbnail"
                        className="w-full h-48 object-cover"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {isUploading && (
            <div className="space-y-2">
              <div className="h-2 relative rounded-full overflow-hidden">
                <div className="w-full h-full bg-gray-100 absolute"></div>
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 absolute"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
              <p className="text-sm text-gray-500 text-right">{uploadProgress}%</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={
                        isUploading ||
                        !userId ||
                        (uploadType === 'file' && !file) ||
                        (uploadType === 'youtube' && (!youtubeUrl || !youtubeVideoId))
                      }
            className={`
              w-full py-4 px-6 rounded-2xl
              flex items-center justify-center space-x-2
              text-white font-medium transition-all
              ${
                        isUploading ||
                        !userId ||
                        (uploadType === 'file' && !file) ||
                        (uploadType === 'youtube' && (!youtubeUrl || !youtubeVideoId))
                  ? 'bg-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-200/50'
              }
            `}
          >
            {isUploading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </>
            )}
          </motion.button>
                </form>
              </div>
          </div>
  );
};

export default UploadForm;