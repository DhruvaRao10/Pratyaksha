//@ts-nocheck

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axiosClient from "../services/axiosInstance";
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';
import '../styles/graphView.css';

interface Paper {
  id: string;
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
  related_papers?: Paper[];
}

interface NodeData {
  id: string;
  label: string;
  group: string;
  title: string;
  color: {
    background: string;
    border: string;
    highlight: {
      background: string;
      border: string;
    };
  };
  url?: string; 
}

export function GraphViewPage() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const networkRef = React.useRef<HTMLDivElement>(null);
  const networkInstance = React.useRef<Network | null>(null);

  let navigate = useNavigate();

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

  useEffect(() => {
    if (!loading && pdfs.length > 0 && networkRef.current) {
      createNetwork();
    }
  }, [loading, pdfs]);

  const createNetwork = () => {
    // Create nodes with explicit typing
    const nodes = new DataSet<NodeData>();
    const edges = new DataSet<any>();

    // Add main PDF nodes
    pdfs.forEach((pdf) => {
      nodes.add({
        id: `pdf_${pdf.id}`,
        label: pdf.file_name,
        group: 'pdf',
        title: pdf.file_name,
        color: {
          background: '#4a90e2',
          border: '#2171c7',
          highlight: {
            background: '#2171c7',
            border: '#1a5aa3'
          }
        }
      });

      // Add related papers nodes and edges
      if (pdf.related_papers) {
        pdf.related_papers.forEach((paper, paperIndex) => {
          const paperId = `paper_${pdf.id}_${paperIndex}`;
          nodes.add({
            id: paperId,
            label: paper.title.substring(0, 30) + '...',
            group: 'paper',
            title: paper.title,
            url: paper.url,
            color: {
              background: '#50c878',
              border: '#3da066',
              highlight: {
                background: '#3da066',
                border: '#2d7a4d'
              }
            }
          });

          edges.add({
            from: `pdf_${pdf.id}`,
            to: paperId,
            arrows: 'to',
            smooth: {
              type: 'curvedCW',
              roundness: 0.2
            }
          });
        });
      }
    });

    // Network configuration
    const options = {
      nodes: {
        shape: 'dot',
        size: 16,
        font: {
          size: 12,
          face: 'Tahoma'
        },
        borderWidth: 2,
        shadow: true
      },
      edges: {
        width: 2,
        shadow: true,
        font: {
          size: 10,
          face: 'Tahoma'
        }
      },
      groups: {
        pdf: {
          shape: 'dot',
          size: 20
        },
        paper: {
          shape: 'dot',
          size: 16
        }
      },
      physics: {
        stabilization: false,
        barnesHut: {
          gravitationalConstant: -80000,
          springConstant: 0.001,
          springLength: 200
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 200
      }
    };

    // Create network
    if (networkRef.current) {
      networkInstance.current = new Network(
        networkRef.current,
        { nodes, edges },
        options
      );

      // Add click event handler
      networkInstance.current.on('click', (params) => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.get(nodeId);
          if (node && node.url) {
            window.open(node.url, '_blank');
          }
        }
      });
    }
  };

  if (loading) {
    return <div>Loading graph view...</div>;
  }

  return (
    <div className="graph-view-page">
      <h1>Research Paper Connections</h1>
      <div className="graph-container" ref={networkRef}></div>
    </div>
  );
}

export default GraphViewPage;