"use client";
// @ts-nocheck

import {
  useState,
  useContext,
  useEffect,
  createContext,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import {
  Title,
  Text,
  useMantineColorScheme,
  Badge,
  Group,
  Button as MantineButton,
  Modal,
  Tabs,
  Loader,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  IconSearch,
  IconNotebook,
  IconSchool,
  IconBrain,
  IconChevronRight,
  IconFileText,
  IconDatabase,
  IconCode,
  IconDownload,
  IconExternalLink,
} from "@tabler/icons-react";
import {
  Card as ShadcnCard,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge as ShadcnBadge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import FloatingShapes from "../components/FloatingShapes";
import { TrendingPapers } from "../components/TrendingPapers";
import { SearchIcon } from "../styles/searchIcon";
import "../styles/homePage.css";



const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';


interface Paper {
  id: string;
  arxiv_id: string;
  title: string;
  abstract: string;
  published_date: string;
  url_pdf?: string;
  url_abs?: string;
  repositories?: string[];
  datasets?: string[];
  categories?: string[];
}

interface SearchContextType {
  papers: Paper[];
  loading: boolean;
  error: string | null;
  query: string;
  setQuery: (query: string) => void;
  handleSearch: () => void;
}

export const SearchContext = createContext<SearchContextType>(
  {} as SearchContextType
);

export function HomePage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  // Search-related state moved here
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const fetchPapers = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_URL}/openalex-search${
        q ? `?query=${encodeURIComponent(q)}` : ""
      }`;
      const res = await fetch(url);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || res.statusText);
      }
      const data = await res.json();
      const mappedPapers: Paper[] = data.results.map((item: any) => ({
        id: item.id,
        arxiv_id: item.ids?.arxiv,
        title: item.display_name,
        abstract:
          item.abstract ||
          (item.abstract_inverted_index
            ? Object.keys(item.abstract_inverted_index).join(" ")
            : ""),
        published_date: item.publication_date,
        url_pdf: item.open_access?.url,
        url_abs: item.primary_location?.landing_page_url,
        repositories: [],
        datasets: [],
        categories:
          item.categories?.map((category: any) => category.display_name) || [],
      }));
      setPapers(mappedPapers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers(); 
  }, [fetchPapers]); 
  const handleSearch = () => {
    fetchPapers(query.trim() || "machine learning");
  };

  // Preview state remains in home.tsx
  const [previewPaper, setPreviewPaper] = useState<any | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);

  const formatDate = (d: string) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const handleOpenPreview = (paper: any) => {
    setPreviewPaper(paper);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewPaper(null);
  };

  const getThumbnailUrl = (paper: any) => {
    if (paper.arxiv_id) {
      return `https://arxiv.org/html/${paper.arxiv_id}v1/thumb`;
    }
    return null;
  };

  return (
    <SearchContext.Provider
      value={{ papers, loading, error, query, setQuery, handleSearch }}
    >
      <div className="light-gradient-bg home-container">
        <FloatingShapes />
        <div className="container px-4 max-w-7xl mx-auto py-8">
          <header className="home-header">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <h1 className="home-title">PRATYAKSHA</h1>
              <p className="home-subtitle">
                Your intelligent research companion for academic papers and document analysis
              </p>
            </motion.div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="search-section"
          >
            <div className="home-search-container">
              <Input
                type="search"
                placeholder="Search for academic papers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="home-search-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button className="home-search-button" onClick={handleSearch}>
                <IconSearch size={18} />
                Search
              </button>
            </div>
          </motion.div>

          {/* Search Results Section */}
          <div className="papers-section">
            {loading ? (
              <div className="loading-container py-12">
                <Loader color="indigo" size="lg" />
                <Text className="mt-4 text-slate-600">Finding papers...</Text>
              </div>
            ) : error ? (
              <div className="empty-state">
                <Text className="empty-state-title">Error</Text>
                <Text className="empty-state-text">{error}</Text>
              </div>
            ) : papers.length > 0 ? (
              <>
                <h2 className="section-title">Recent Papers</h2>
                <div className="papers-grid">
                  {papers.map((paper) => (
                    <div key={paper.id} className="paper-card">
                      <div className="paper-card-header">
                        <h3 className="paper-title">{paper.title}</h3>
                      </div>
                      <div className="paper-card-content">
                        <p className="paper-abstract">{paper.abstract}</p>
                      </div>
                      <div className="paper-card-footer">
                        <span className="paper-date">
                          {formatDate(paper.published_date)}
                        </span>
                        <a
                          href="#"
                          className="paper-link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenPreview(paper);
                          }}
                        >
                          View Details
                          <IconChevronRight size={16} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Text className="empty-state-title">No papers found</Text>
                <Text className="empty-state-text">
                  Try searching for a topic or check out our trending papers below
                </Text>
              </div>
            )}
          </div>

          {/* Features Section */}
          <div className="features-section">
            <h2 className="section-title">Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-card-header">
                  <h3 className="feature-card-title">
                    <IconFileText size={20} />
                    Upload PDF
                  </h3>
                </div>
                <div className="feature-card-content">
                  <p className="feature-card-description">
                    Upload and analyze research papers, articles, and other academic documents.
                  </p>
                </div>
                <div className="feature-card-footer">
                  <Link to="/upload">
                    <Button variant="outline" className="secondary-button">
                      Upload
                      <IconChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-header">
                  <h3 className="feature-card-title">
                    <IconBrain size={20} />
                    Analysis History
                  </h3>
                </div>
                <div className="feature-card-content">
                  <p className="feature-card-description">
                    Review your past research analyses and track your academic progress over time.
                  </p>
                </div>
                <div className="feature-card-footer">
                  <Link to="/history">
                    <Button variant="outline" className="secondary-button">
                      View History
                      <IconChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="feature-card">
                <div className="feature-card-header">
                  <h3 className="feature-card-title">
                    <IconSearch size={20} />
                    Advanced Search
                  </h3>
                </div>
                <div className="feature-card-content">
                  <p className="feature-card-description">
                    Perform complex searches across your research materials and external databases.
                  </p>
                </div>
                <div className="feature-card-footer">
                  <Link to="/search">
                    <Button variant="outline" className="secondary-button">
                      Search
                      <IconChevronRight size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Paper Preview Modal */}
        <Modal
          opened={previewOpen}
          onClose={handleClosePreview}
          title=""
          size="lg"
          centered
          classNames={{
            root: "preview-modal",
            header: "preview-header",
            title: "preview-title",
            body: "preview-content",
          }}
        >
          {previewPaper && (
            <>
              <div className="preview-header">
                <h2 className="preview-title">{previewPaper.title}</h2>
              </div>
              <div className="preview-content">
                <p className="preview-abstract">{previewPaper.abstract}</p>
                <div>
                  <Text size="sm" mb={2}>
                    <b>Published:</b> {formatDate(previewPaper.published_date)}
                  </Text>
                  {previewPaper.categories && previewPaper.categories.length > 0 && (
                    <div className="mt-3">
                      <Text size="sm" mb={1}>
                        <b>Categories:</b>
                      </Text>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {previewPaper.categories.map((cat: string, i: number) => (
                          <ShadcnBadge key={i} variant="outline" className="status-badge">
                            {cat}
                          </ShadcnBadge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="preview-footer">
                <button className="preview-close-button" onClick={handleClosePreview}>
                  Close
                </button>
                {previewPaper.url_pdf && (
                  <a
                    href={previewPaper.url_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="preview-download-button"
                  >
                    <IconDownload size={16} />
                    Download PDF
                  </a>
                )}
              </div>
            </>
          )}
        </Modal>
      </div>
    </SearchContext.Provider>
  );
}
