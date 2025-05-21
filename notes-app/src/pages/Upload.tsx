// @ts-nocheck
import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import axiosClient from '../services/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { UploadSvgIcon } from '../styles/uploadSvg';
import FloatingShapes from '../components/FloatingShapes';

import '../styles/upload.css';

export function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
  
    try {
      const decoded = jwtDecode(token);
      const id = decoded.sub ?? decoded.user_id ?? decoded.id;
      if (id) {
        setUserId(String(id));
      }
    } catch (err) {
      console.error('Error decoding token:', err);
    }
  }, []);
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      toast.success('File selected: ' + e.dataTransfer.files[0].name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success('File selected: ' + e.target.files[0].name);
    }
  };

  // Handle the file upload process
  const handleSubmit = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please try logging in again.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const response = await axiosClient.post('/pdf-extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      toast.success('File uploaded successfully!');
      setFile(null);
      setProgress(0);
    } catch (error) {
      toast.error('Only PDF file format is allowed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="light-gradient-bg min-h-screen">
      <FloatingShapes />
      <div className="container px-4 max-w-7xl mx-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-container"
        >
          <div className="upload-header">
            <h2 className="upload-title">Upload Content</h2>
            <p className="upload-description">Upload your PDF documents for analysis and insights</p>
          </div>
          
          <div className="file-upload">
            <div 
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="upload-icon">
                <IconUpload size={48} stroke={1.5} />
              </div>
              <p>Drop your file here or click to browse</p>
              <input type="file" onChange={handleFileChange} />
              {file && <p className="selected-file">Selected: {file.name}</p>}
              <p className="note">Max file size: 5MB | Supported formats: PDF</p>
            </div>
          </div>
          
          <button 
            className="submit-button" 
            onClick={handleSubmit} 
            disabled={uploading || !file}
          >
            {uploading ? 'Processing...' : 'Upload Document'}
          </button>
          
          {uploading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-center text-sm mt-2 text-slate-500">{progress}% Complete</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}