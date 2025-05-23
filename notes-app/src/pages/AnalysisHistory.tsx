//@ts-nocheck
import { useState, useEffect } from "react";
import {
  Text,
  Loader,
  Center,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  IconHistory,
  IconFileText,
  IconAlertCircle,
  IconChevronRight,} from "@tabler/icons-react";
import { jwtDecode } from "jwt-decode";
import { fetchUserAnalysisHistory } from "../services/analysisService";
import { ToastContainer, toast } from "react-toastify";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import "../styles/analysisHistory.css";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import FloatingShapes from "../components/FloatingShapes";

export function AnalysisHistoryPage() {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.sub);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const historyData = await fetchUserAnalysisHistory(userId);
      setAnalysisHistory(historyData);
    } catch (error) {
      toast("Upload PDFs to fetch analysis history", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "dark",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (docId) => {
    setExpandedItems(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const MarkdownComponents = {
    h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-lg font-semibold mb-2" {...props} />,
    h4: ({node, ...props}) => <h4 className="text-lg font-semibold mb-2" {...props} />,
    
    p: ({node, ...props}) => <p className="mb-3" {...props} />,
    
    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 ml-2" {...props} />,
    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 ml-2" {...props} />,
    li: ({node, ...props}) => <li className="mb-1" {...props} />,
    
    em: ({node, ...props}) => <em className="italic" {...props} />,
    strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
    
    code: ({node, inline, ...props}) => 
      inline 
        ? <code className="font-mono bg-slate-100 px-1 rounded" {...props} />
        : <code className="font-mono block bg-slate-100 p-3 rounded my-4 text-sm overflow-x-auto" {...props} />,
  };

  return (
    <div className="light-gradient-bg min-h-screen overflow-y-auto">
      <FloatingShapes />
      <div className="container px-4 max-w-7xl mx-auto overflow-y-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-between items-center page-header">
            <div> 
              <h1 className="page-title">
                Analysis History
              </h1>
              <p className="page-description">
                Your previous document analysis and insights
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchHistory}
              className="refresh-button"
            >
              <IconHistory size={16} className="mr-2" />
              Refresh
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-container"
          >
            {loading ? (
              <Center py="xl" className="loading-container">
                <Loader color="blue" size="lg" />
              </Center>
            ) : analysisHistory.length === 0 ? (
              <div className="empty-state">
                <IconAlertCircle size={48} className="empty-state-icon mx-auto mb-4" />
                <Text className="empty-state-title">
                  No analysis history found
                </Text>
                <Text className="empty-state-text">
                  Upload and analyze documents to see your history here
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {analysisHistory.map((item, index) => (
                  <Card 
                    key={index} 
                    className="history-card"
                  >
                    <div className="card-header">
                      <div className="icon-container">
                        <IconFileText size={24} className="icon-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="card-title">
                          {item.file_name}
                        </h3>
                        <p className="card-subtitle">
                          {new Date(item.timestamp).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <Badge className="status-badge mr-2">
                        Document
                      </Badge>
                      <button 
                        className="toggle-button" 
                        onClick={() => toggleExpand(item.doc_id)}
                      >
                        <IconChevronRight 
                          size={20} 
                          className={`transition-transform duration-300 ${expandedItems[item.doc_id] ? 'rotate-90' : ''}`} 
                        />
                      </button>
                    </div>
                    
                    {expandedItems[item.doc_id] && (
                      <CardContent className="px-5 pt-0 pb-5">
                        <div className="content-wrapper markdown-content">
                          <ReactMarkdown 
                            rehypePlugins={[rehypeRaw]} 
                            components={MarkdownComponents}
                          >
                            {item.analysis}
                          </ReactMarkdown>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      <ToastContainer />
    </div>
  );
}