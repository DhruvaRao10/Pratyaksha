import React, { useState, ChangeEvent, useEffect } from 'react';
import { Upload, Link } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import axiosClient from '../services/axiosInstance';

const UploadForm = () => {
   const [uploadType, setUploadType] = useState<'pdf' | 'youtube'>('pdf');
   const [pdfFile, setPdfFile] = useState<File | null>(null);
   const [youtubeUrl, setYoutubeUrl] = useState('');
   const [fileName, setFileName] = useState('');
   const [userId, setUserId] = useState<string>('');
   const [isUploading, setIsUploading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [uploadSuccess, setUploadSuccess] = useState(false);

   useEffect(() => {
      const token = localStorage.getItem('access_token');
      console.log('Token from localStorage:', token ? 'Present' : 'Not found');
      
      if (token) {          
         try {                                                                                                          
            const decodedToken: { sub: string } = jwtDecode(token) ;      
            console.log('Decoded token sub:', decodedToken.sub) ;      
            setUserId(decodedToken.sub) ;                        
            console.log("Heres the token", decodedToken) ;  
         } catch (err) {
            console.error('Token decode error:', err) ;                                   
            setError('Authentication error. Please log in again.') ;           
         }
      } else {                                                               
         setError('No authentication token found. Please log in.') ;
      }                                                        
   }, []);

   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      console.log('File selected:', file);
      
      if (file && file.type === 'application/pdf') {
         setPdfFile(file);
         setFileName(file.name);
         setError(null);
         console.log('PDF file set successfully');
      } else {
         setError('Please upload a PDF file');
         setPdfFile(null);
         setFileName('');
         console.log('File rejected - not a PDF');
      }
   };

   const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
      setYoutubeUrl(e.target.value);
   };

   const handleSubmit = async (e?: React.FormEvent) => {
      if (e) {
         e.preventDefault();
      }
      
      console.log('Handle submit called');
      console.log('Current state:', {
         uploadType,
         pdfFile: pdfFile ? 'Present' : 'Not found',
         userId: userId || 'Not found'
      });

      if (uploadType === 'pdf' && pdfFile) {
         await handlePdfUpload();
      } else if (uploadType === 'youtube' && youtubeUrl) {
         console.log('YouTube URL:', youtubeUrl);
      }
   };

   const handlePdfUpload = async () => {
      console.log('Starting PDF upload process');
      
      if (!pdfFile) {
          setError('No PDF file selected');
          return;
      }
  
      if (!userId) {
          setError('User not authenticated. Please log in again.');
          return;
      }
  
      setIsUploading(true);
      setError(null);
      setUploadSuccess(false);
  
      try {
          const token = localStorage.getItem('access_token');
          if (!token) {
              throw new Error('No authentication token found');
          }
  
          const formData = new FormData();
          formData.append('file', pdfFile);
          formData.append('user_id', userId);
  
          console.log('Sending request to server...');
          
          // Log the actual token being sent (for debugging)
          console.log('Token being sent:', token);
          console.log('Token:', localStorage.getItem('access_token'));


          const response = await axiosClient.post('/pdf-extract', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
                  // Authorization header will be added by the interceptor
              },
          });
  
          console.log('Server response:', response.data);
          if (response.data) {
              setPdfFile(null);
              setFileName('');
              setUploadSuccess(true);
          }
      } catch (error: any) {
          console.error('Upload error details:', error.response || error);
          if (error.response?.status === 403) {
              setError('Session expired. Please log in again.');
          } else {
              setError(error.response?.data?.detail || 'Upload failed. Please try again.');
          }
      } finally {
          setIsUploading(false);
      }
  };
  
   const handleTypeChange = async (type: 'pdf' | 'youtube') => {
      setUploadType(type);
      if (type === 'pdf' && pdfFile) {
         await handleSubmit();
      }
   };

   // Add this debug display for development
   console.log('Current state:', { userId, pdfFile: pdfFile?.name, error });

   return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
         {/* Add debug info during development */}
         {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-2 bg-gray-100 text-xs">
               <div>User ID: {userId || 'Not set'}</div>
               <div>File: {fileName || 'No file'}</div>
               <div>Token: {localStorage.getItem('access_token') ? 'Present' : 'Missing'}</div>
            </div>
         )}

         {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
               {error}
            </div>
         )}
         
         {uploadSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
               File uploaded successfully!
            </div>
         )}

         <div className="flex space-x-4 mb-6">
            <button
               type="button"
               className={`flex items-center px-4 py-2 rounded-md ${
                  uploadType === 'pdf'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-200 text-gray-700'
               }`}
               onClick={() => handleTypeChange('pdf')}
            >
               <Upload className="w-4 h-4 mr-2" />
               PDF Upload
            </button>
            <button
               type="button"
               className={`flex items-center px-4 py-2 rounded-md ${
                  uploadType === 'youtube'
                     ? 'bg-blue-500 text-white'
                     : 'bg-gray-200 text-gray-700'
               }`}
               onClick={() => handleTypeChange('youtube')}
            >
               <Link className="w-4 h-4 mr-2" />
               YouTube URL
            </button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            {uploadType === 'pdf' ? (
               <div className="space-y-2">
                  <div className="flex items-center justify-center w-full">
                     <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           <Upload className="w-8 h-8 mb-2 text-gray-500" />
                           <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                           </p>
                           <p className="text-xs text-gray-500">PDF files only</p>
                        </div>
                        <input
                           type="file"
                           className="hidden"
                           accept=".pdf"
                           onChange={handleFileChange}
                        />
                     </label>
                  </div>
                  {fileName && (
                     <p className="text-sm text-gray-600">Selected file: {fileName}</p>
                  )}
               </div>
            ) : (
               <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                     YouTube URL
                  </label>
                  <input
                     type="url"
                     value={youtubeUrl}
                     onChange={handleUrlChange}
                     placeholder="https://youtube.com/watch?v=..."
                     className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                     pattern="^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$"
                  />
               </div>
            )}

            <button
               type="submit"
               disabled={isUploading || !userId}
               className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isUploading || !userId
                     ? 'bg-blue-300 cursor-not-allowed' 
                     : 'bg-blue-500 hover:bg-blue-600'
               }`}
            >
               {isUploading 
                  ? 'Uploading...' 
                  : !userId 
                     ? 'Please login first'
                     : (uploadType === 'pdf' ? 'Upload PDF' : 'Add YouTube Link')
               }
            </button>
         </form>
      </div>
   );
};

export default UploadForm;