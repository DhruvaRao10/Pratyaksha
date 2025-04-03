import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadForm from "./uploadForm";
import {Navigation} from '../components/Navigation';
import { FileText, Youtube, Upload as UploadIcon } from 'lucide-react';

// NOTE: The custom CSS below (for the gradient animation) should be added to your global stylesheet.
// .animate-gradient {
//   background-size: 200% 200%;
//   animation: gradientAnimation 15s ease infinite;
// }
// @keyframes gradientAnimation {
//   0%, 100% { background-position: 0% 50%; }
//   50% { background-position: 100% 50%; }
// }

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      
      <main className="lg:ml-64 min-h-screen relative">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="floating-shape bg-purple-500/5 w-96 h-96 rounded-full absolute -top-48 -right-48 blur-3xl"></div>
          <div className="floating-shape-delayed bg-blue-500/5 w-96 h-96 rounded-full absolute -bottom-48 -left-48 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Notes App
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Drop your files or paste YouTube links to get started
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100/50"
              >
                <UploadForm />
              </motion.div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Guide</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 p-4 rounded-2xl bg-purple-50/50">
                    <FileText className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-medium text-gray-800">PDF Documents</h3>
                      <p className="text-sm text-gray-600">Drag & drop or click to upload PDFs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 p-4 rounded-2xl bg-pink-50/50">
                    <Youtube className="w-6 h-6 text-pink-600" />
                    <div>
                      <h3 className="font-medium text-gray-800">YouTube Videos</h3>
                      <p className="text-sm text-gray-600">Paste any YouTube video URL</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-gray-100/50"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h2>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + item * 0.1 }}
                      className="flex items-center space-x-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <p className="text-sm text-gray-600">Recent upload {item}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;