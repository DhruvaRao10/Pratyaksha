import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosClient from "../services/axiosInstance";
import '../styles/collection.css';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";


interface RelatedPaper {
  title: string;
  url: string;
  authors: string[];
  publication_year: string;
  abstract: string;
  categories: string[];
  relevance_score: number;
}

interface Pdf {
  id: string;
  file_name: string;
  processing_status: string;
  upload_date: string;
  s3_url: string;
  related_papers?: RelatedPaper[];
}

interface PrerequisitePaper {
  title: string;
  authors: string[];
  publication_year: number;
  url: string;
  summary?: string;
  sources?: string[];
}

export function CollectionPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [prereqPapers, setPrereqPapers] = useState<{ [key: string]: PrerequisitePaper[] }>({});
  const [loadingPrereqs, setLoadingPrereqs] = useState<{ [key: string]: boolean }>({});
  const [prereqError, setPrereqError] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserId(decoded.sub);
      } catch (error) {
        console.error('Error decoding token:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchPdfs();
    }
  }, [userId]);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(`/user/${userId}/pdfs`);
      setPdfs(response.data);
    } catch (error) {
      
      console.error('Error fetching PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfClick = async (pdfId: string) => {
    try {
      const response = await fetch(`/api/pdf/${pdfId}/content`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
    }
  };

  const toggleRelatedPapers = (pdfId: string) => {
    const pdf = pdfs.find(p => p.id === pdfId);
    if (pdf) {
      if (selectedPdf === pdfId) {
        setSelectedPdf(null);
      } else {
        setSelectedPdf(pdfId);
        fetchPrereqPapers(pdf);
      }
    }
  };

  const fetchPrereqPapers = async (pdf: Pdf) => {
    try {
      setLoadingPrereqs(prev => ({ ...prev, [pdf.id]: true }));
      setPrereqError(prev => ({ ...prev, [pdf.id]: '' }));
      
      const title = pdf.file_name.replace('.pdf', '').trim();
      const searchQuery = `${pdf.id}_${title}`;
      
      const response = await axiosClient.post('/prerequisite-papers/exa', { 
        title: searchQuery 
      });
      
      // Ensure we have unique papers by title
      const uniquePapers = response.data.reduce((acc: PrerequisitePaper[], paper: PrerequisitePaper) => {
        const exists = acc.some(p => p.title.toLowerCase() === paper.title.toLowerCase());
        if (!exists) {
          acc.push(paper);
        }
        return acc;
      }, []);
      
      setPrereqPapers((prev) => ({ ...prev, [pdf.id]: uniquePapers }));
    } catch (error: any) {
      console.error('Error fetching prerequisite papers:', error);
      setPrereqError(prev => ({ 
        ...prev, 
        [pdf.id]: error.response?.data?.detail || 'Failed to fetch prerequisite papers' 
      }));
    } finally {
      setLoadingPrereqs(prev => ({ ...prev, [pdf.id]: false }));
    }
  };

  if (loading) {
    return <div>Loading your collection...</div>;
  }

  return (
    <div className="collection-page">
      <h1>Research Collection</h1>
      {pdfs.length === 0 ? (
        <p>No PDFs available in your collection yet.</p>
      ) : (
        <ul className="pdf-list">
          {pdfs.map((pdf) => (
            <li key={pdf.id} className="pdf-item">
              <div className="pdf-header">
                <div
                  onClick={() => (pdf.processing_status === 'completed' ? handlePdfClick(pdf.id) : null)}
                  style={{
                    cursor: pdf.processing_status === 'completed' ? 'pointer' : 'default',
                    color: pdf.processing_status === 'completed' ? '#007bff' : '#666',
                  }}
                >
                  {pdf.file_name} {pdf.processing_status !== 'completed' && '(Processing...)'}
                </div>
                {pdf.processing_status === 'completed' && (
                  <button 
                    className="related-papers-button"
                    onClick={() => toggleRelatedPapers(pdf.id)}
                  >
                    {selectedPdf === pdf.id ? 'Hide Related Papers' : 'Show Related Papers'}
                  </button>
                )}
              </div>
              
              {selectedPdf === pdf.id && pdf.related_papers && (
                <div className="related-papers-section">
                  <h3>Related Papers</h3>
                  <ul className="related-papers-list">
                    {pdf.related_papers.map((paper, index) => (
                      <li key={index} className="related-paper-item">
                        <h4>
                          <a href={paper.url} target="_blank" rel="noopener noreferrer">
                            {paper.title}
                          </a>
                        </h4>
                        <p className="paper-meta">
                          Authors: {paper.authors.join(', ')} | 
                          Year: {paper.publication_year} | 
                          Relevance: {(paper.relevance_score * 100).toFixed(1)}%
                        </p>
                        <p className="paper-abstract">{paper.abstract}</p>
                        <div className="paper-categories">
                          {paper.categories.map((category, idx) => (
                            <span key={idx} className="category-tag">{category}</span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedPdf === pdf.id && (
                <div className="prerequisite-papers-section">
                  <h3>Prerequisite Papers</h3>
                  {loadingPrereqs[pdf.id] ? (
                    <div className="loading-prereqs">Loading prerequisite papers...</div>
                  ) : prereqError[pdf.id] ? (
                    <div className="prereq-error">{prereqError[pdf.id]}</div>
                  ) : prereqPapers[pdf.id] ? (
                    <ul className="prerequisite-papers-list">
                      {prereqPapers[pdf.id].map((paper, index) => (
                        <li key={index} className="prerequisite-paper-item">
                          <h4>
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                              {paper.title}
                            </a>
                          </h4>
                          <p className="paper-meta">
                            Authors: {paper.authors.join(', ')} | 
                            Year: {paper.publication_year}
                          </p>
                          {paper.summary && (
                            <div className="paper-summary">
                              <h5>Key Concepts:</h5>
                              <p>{paper.summary}</p>
                            </div>
                          )}
                          {paper.sources && paper.sources.length > 0 && (
                            <div className="paper-sources">
                              <h5>Related Sources:</h5>
                              <ul>
                                {paper.sources.map((source, idx) => (
                                  <li key={idx}>
                                    <a href={source} target="_blank" rel="noopener noreferrer">
                                      {source}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="no-prereqs">No prerequisite papers found</div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CollectionPage;