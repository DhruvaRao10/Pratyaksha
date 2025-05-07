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
      const url = `http://localhost:8000/openalex-search${
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
        abstract: item.abstract || (item.abstract_inverted_index ? Object.keys(item.abstract_inverted_index).join(" ") : ""),
        published_date: item.publication_date,
        url_pdf: item.open_access?.url,
        url_abs: item.primary_location?.landing_page_url,
        repositories: [],
        datasets: [],
        categories: item.categories?.map((category: any) => category.display_name) || [],
      }));
      setPapers(mappedPapers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers(); // Default query "machine learning"
  }, [fetchPapers]); // Only depends on fetchPapers
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

  const featurePages = [
    {
      title: "Upload PDF",
      description:
        "Upload and analyze research papers, articles, and other academic documents.",
      path: "/upload",
      icon: <IconFileText className="h-5 w-5 mr-2" />,
    },
    {
      title: "YouTube Import",
      description:
        "Import educational content from YouTube videos and convert them into interactive notes.",
      path: "/youtube-import",
      icon: <IconBrain className="h-5 w-5 mr-2" />,
    },
    {
      title: "Research Collection",
      description:
        "Browse, organize and manage your growing library of research materials.",
      path: "/research-collection",
      icon: <IconNotebook className="h-5 w-5 mr-2" />,
    },
    {
      title: "Analysis History",
      description:
        "Review your past research analyses and track your academic progress over time.",
      path: "/history",
      icon: <IconSearch className="h-5 w-5 mr-2" />,
    },
    {
      title: "Advanced Search",
      description:
        "Perform complex searches across your research materials and external databases.",
      path: "/search",
      icon: <IconDatabase className="h-5 w-5 mr-2" />,
    },
    {
      title: "Settings",
      description:
        "Customize your research environment and manage your account preferences.",
      path: "/settings",
      icon: <IconCode className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <SearchContext.Provider
      value={{ papers, loading, error, query, setQuery, handleSearch }}
    >
      <div className="main-gradient-bg min-h-screen overflow-y-auto">
        <FloatingShapes />
        <div className="content-overlay container px-4 max-w-7xl mx-auto">
          {/* Header Section with Search Bar */}
          <header className="pt-6 pb-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="search-container premium-glass p-4 rounded-lg flex items-center shadow-md border border-white/10 backdrop-blur-sm"
            >
              <IconSearch className="h-5 w-5 mr-2 text-white/70" />
              <Input
                type="search"
                placeholder="Search for relevant and popular research papers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-grow bg-transparent text-white placeholder:text-white/50"
              />
              {query && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-8 w-8 text-white/70 hover:text-white"
                  onClick={() => setQuery("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              )}
              <Button className="ml-2 rounded-full" onClick={handleSearch}>
                Search
              </Button>
            </motion.div>
          </header>

          {/* Search Results Section */}
          <div className="search-results-section mt-6">
            {loading ? (
              <div className="loading-container py-12">
                <div className="loader-wrapper">
                  <div className="paper-loader">
                    <div className="loader-circle"></div>
                    <div className="paper-sheets">
                      <div className="paper-sheet sheet1"></div>
                      <div className="paper-sheet sheet2"></div>
                      <div className="paper-sheet sheet3"></div>
                    </div>
                  </div>
                  <Text className="loading-text">Finding papers...</Text>
                </div>
              </div>
            ) : error ? (
              <Text c="red" ta="center" className="error-message">
                {error}
              </Text>
            ) : papers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {papers.map((paper) => (
                  <ShadcnCard key={paper.id} className="paper-card hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {paper.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Text size="sm" className="text-muted-foreground mb-2">
                        {paper.abstract || "No abstract available"}
                      </Text>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {paper.categories?.map((category, index) => (
                          <ShadcnBadge key={index} variant="secondary">
                            {category}
                          </ShadcnBadge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Text size="sm" className="text-muted-foreground">
                        {formatDate(paper.published_date)}
                      </Text>
                      <div className="flex gap-2">
                        {paper.url_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(paper.url_pdf, '_blank')}
                          >
                            <IconDownload className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        {paper.url_abs && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(paper.url_abs, '_blank')}
                          >
                            <IconExternalLink className="h-4 w-4 mr-1" />
                            Abstract
                          </Button>
                        )}
                      </div>
                    </CardFooter>
                  </ShadcnCard>
                ))}
              </div>
            ) : (
              <Text ta="center" c="dimmed" className="no-results">
                {query ? `No results found for "${query}"` : "No papers available"}
              </Text>
            )}
          </div>

          {/* Main Content with Feature Cards */}
          <main className="pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featurePages.map((page, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <ShadcnCard className="premium-glass border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/30 group">
                      <CardHeader>
                        <div className="flex justify-between gap-4">
                          <div>
                            <CardTitle className="text-xl mb-2 text-white group-hover:text-primary/90 transition-colors">
                              {page.title}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2">
                              <ShadcnBadge
                                variant="outline"
                                className="text-white/80 border-white/20"
                              >
                                Feature
                              </ShadcnBadge>
                            </div>
                          </div>
                          <div className="shrink-0 w-10 h-10 flex items-center justify-center relative bg-white/5 rounded-md overflow-hidden border border-white/10">
                            {page.icon}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/70 line-clamp-3 text-sm">
                          {page.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10"
                          asChild
                        >
                          <Link to={page.path}>
                            {page.title}
                          </Link>
                        </Button>
                      </CardFooter>
                    </ShadcnCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </main>

          {/* Modal */}
          <Modal
            opened={previewOpen}
            onClose={handleClosePreview}
            title={
              <Title order={4} className="pr-8 text-white">
                {previewPaper?.title}
              </Title>
            }
            size="lg"
            centered
            radius="lg"
            classNames={{
              header: "p-4 border-b border-white/10 bg-card",
              title: "font-medium",
              body: "bg-card",
            }}
            styles={{
              content: {
                background: "rgba(30, 41, 59, 0.95)",
                backdropFilter: "blur(16px)",
              },
            }}
          >
            {previewPaper && (
              <div>
                <Tabs defaultValue="abstract">
                  <Tabs.List className="bg-white/5 px-4">
                    <Tabs.Tab value="abstract">Abstract</Tabs.Tab>
                    {previewPaper.url_pdf && (
                      <Tabs.Tab value="pdf">PDF Preview</Tabs.Tab>
                    )}
                  </Tabs.List>

                  <Tabs.Panel value="abstract" pt="xs">
                    <div className="p-4">
                      <Text size="sm" className="text-white/80">
                        {previewPaper.abstract}
                      </Text>
                      {previewPaper.arxiv_id && (
                        <Group mt="sm">
                          <Badge radius="md" color="blue">
                            arXiv: {previewPaper.arxiv_id}
                          </Badge>
                          <Badge color="gray" radius="md">
                            Published: {formatDate(previewPaper.published_date)}
                          </Badge>
                        </Group>
                      )}
                      <Group mt="lg" justify="flex-end">
                        {previewPaper.url_pdf && (
                          <MantineButton
                            component="a"
                            href={previewPaper.url_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftSection={<IconDownload size={16} />}
                            color="blue"
                            radius="md"
                          >
                            Download PDF
                          </MantineButton>
                        )}
                      </Group>
                    </div>
                  </Tabs.Panel>

                  {previewPaper.url_pdf && (
                    <Tabs.Panel value="pdf" pt="xs">
                      <iframe
                        src={previewPaper.url_pdf}
                        width="100%"
                        height="500px"
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "4px",
                        }}
                        title={`PDF Preview of ${previewPaper.title}`}
                      />
                    </Tabs.Panel>
                  )}
                </Tabs>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </SearchContext.Provider>
  );
}