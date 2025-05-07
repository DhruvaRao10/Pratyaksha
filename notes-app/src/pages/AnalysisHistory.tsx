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
import "../styles/analysisHistory.css";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";
import FloatingShapes from "../components/FloatingShapes";

export function AnalysisHistoryPage() {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

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

  const toggleExpand = (docId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const formatAnalysis = (analysis: string) => {
    if (!analysis) return '';
    
    // Split the analysis into sections
    const sections = analysis.split('\n\n');
    
    return sections.map((section, index) => {
      if (section.startsWith('SUMMARY:') || section.startsWith('KEY CONCEPTS:')) {
        return (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">{section.split(':')[0]}</h4>
            <p className="text-white/90">{section.split(':')[1]?.trim()}</p>
          </div>
        );
      }
      
      if (/^\d+\./.test(section)) {
        const [number, ...content] = section.split('.');
        return (
          <div key={index} className="mb-3">
            <p className="text-white/90">
              <span className="font-semibold">{number}.</span>
              {content.join('.').trim()}
            </p>
          </div>
        );
      }
      
      return (
        <p key={index} className="text-white/90 mb-3">
          {section.trim()}
        </p>
      );
    });
  };

  return (
    <div className="main-gradient-bg min-h-screen overflow-y-auto">
      <FloatingShapes />
      <div className="content-overlay container px-4 max-w-7xl mx-auto overflow-y-auto py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="flex justify-between items-center mb-12">
            <div> 
              <h1 className="text-4xl font-bold mb-2 text-white glow-text">
                Analysis History
              </h1>
              <p className="text-xl text-white/80">
                Your previous document analysis and insights
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchHistory}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <IconHistory size={16} className="mr-2" />
              Refresh
            </Button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-glass rounded-xl overflow-hidden p-6"
          >
            {loading ? (
              <Center py="xl" className="loading-container">
                <Loader color="blue" size="lg" />
              </Center>
            ) : analysisHistory.length === 0 ? (
              <div className="text-center py-12">
                <IconAlertCircle size={48} className="text-white/50 mx-auto mb-4" />
                <Text className="text-white font-semibold text-xl mb-2">
                  No analysis history found
                </Text>
                <Text className="text-white/70">
                  Upload and analyze documents to see your history here
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {analysisHistory.map((item, index) => (
                  <Card 
                    key={index} 
                    className="bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader className="p-5 flex flex-row items-center space-y-0 gap-4">
                      <div className="bg-primary/20 p-3 rounded-lg">
                        <IconFileText size={24} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">
                          {item.file_name}
                        </h3>
                        <p className="text-sm text-white/60">
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
                      <Badge variant="secondary" className="bg-primary/20 text-white mr-2">
                        Document
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:bg-white/10" 
                        onClick={() => toggleExpand(item.doc_id)}
                      >
                        <IconChevronRight 
                          size={20} 
                          className={`transition-transform duration-300 ${expandedItems[item.doc_id] ? 'rotate-90' : ''}`} 
                        />
                      </Button>
                    </CardHeader>
                    
                    {expandedItems[item.doc_id] && (
                      <CardContent className="px-5 pt-0 pb-5">
                        <div className="bg-white/5 p-6 mt-2 rounded-lg backdrop-blur-sm border border-white/10 shadow-inner">
                          {formatAnalysis(item.analysis)}
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
