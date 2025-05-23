//@ts-nocheck
import React, { useState, useEffect, useCallback } from "react";
import {
  Title,
  Text,
  Container,
  Group,
  Card,
  Grid,
  Paper,
  Anchor,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { searchArxiv } from "../services/searchService";
import { toast } from "react-toastify";
// import { Button as ShadButton } from "../../src/ui/button";

import { Input } from "../../src/ui/input";
import "../styles/searchPage.css";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { SearchIcon } from "../styles/searchIcon";
import FloatingShapes from "../components/FloatingShapes";

interface Paper {
  id: string;
  title: string;
  authors: string[];
  summary: string;
  published: string;
  updated: string;
  categories: string[];
  pdf_url: string;
  html_url?: string;
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    machineLearning: true,
    deepLearning: true,
    artificialIntelligence: true,
  });

  const getArXivCategories = useCallback(() => {
    const categories: string[] = [];
    if (filters.machineLearning) categories.push("cs.LG", "stat.ML");
    if (filters.deepLearning) categories.push("cs.NE", "cs.AI");
    if (filters.artificialIntelligence) categories.push("cs.AI", "cs.CL");
    return categories;
  }, [filters]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    console.log("Search started, loading: true");
    setLoading(true);
    try {
      const categories = getArXivCategories();
      const results = await searchArxiv(query, categories, activePage);
      setSearchResults(results.papers);
      setTotalPages(Math.ceil(results.total / 10));
    } catch (error) {
      toast("Search failed to gather relevant research papers", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    } finally {
      console.log("Search completed, loading: false");
      setLoading(false);
    }
  }, [activePage, query, getArXivCategories]);

  console.log("Rendering, loading:", loading);

  const handleFilterChange = (name: keyof typeof filters) => {
    setFilters({
      ...filters,
      [name]: !filters[name],
    });
  };

  return (
    <div className="search-page-layout">
      <FloatingShapes />
      <div className="sidebar">
        <div className="sidebar-content">
          <div className="filter-section">
            <Text size="sm" fw={600} className="filter-heading">
              Filter by:
            </Text>

            <div className="filter-options">
              {(
                [
                  "machineLearning",
                  "deepLearning",
                  "artificialIntelligence",
                ] as const
              ).map((key) => (
                <div key={key} className="filter-option">
                  <Checkbox
                    id={key}
                    checked={filters[key]}
                    onCheckedChange={() => handleFilterChange(key)}
                  />
                  <Label htmlFor={key} className="filter-label">
                    {key === "machineLearning"
                      ? "Machine Learning"
                      : key === "deepLearning"
                      ? "Deep Learning"
                      : "Artificial Intelligence"}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <Container size="xl" className="search-container">
          <Title order={1} className="page-title">
            Academic Paper Search
          </Title>

          <Paper shadow="xs" className="search-paper">
            <Grid>
              <Grid.Col span={12}>
                <div className="search-input-container">
                  <Input
                    type="search"
                    placeholder="Search for academic papers..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="search-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                  />
                  <div className="search-button" onClick={handleSearch}>
                    Search
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </Paper>

          <div className="results-container">
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
            ) : searchResults.length === 0 ? (
              <Text ta="center" c="dimmed" className="no-results">
                {query.trim()
                  ? "No results found"
                  : "Enter a search query to find papers"}
              </Text>
            ) : (
              <>
                {searchResults.map((paper) => (
                  <Card key={paper.id} className="paper-card">
                    <Card.Section withBorder p="md" className="card-header">
                      <Group justify="apart">
                        <Title order={4} className="paper-title">
                          {paper.title}
                        </Title>
                        <Anchor
                          href={paper.pdf_url}
                          target="_blank"
                          className="pdf-link"
                        >
                          <IconExternalLink size={20} />
                        </Anchor>
                      </Group>
                    </Card.Section>

                    <div className="paper-details">
                      <Text size="sm" className="authors">
                        <b>Authors:</b> {paper.authors.join(", ")}
                      </Text>

                      <Text size="sm" className="published-date">
                        <b>Published:</b>{" "}
                        {new Date(paper.published).toLocaleDateString()}
                        {paper.updated &&
                          ` (Updated: ${new Date(
                            paper.updated
                          ).toLocaleDateString()})`}
                      </Text>

                      <Text size="sm" lineClamp={3} className="summary">
                        {paper.summary}
                      </Text>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </Container>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          width: 100%;
        }

        .loader-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loading-text {
          color: #555;
          font-size: 16px;
        }

        .paper-loader {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .loader-circle {
          position: absolute;
          width: 70px;
          height: 70px;
          border: 3px solid #e9ecef;
          border-top: 3px solid #228be6;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: spin 1.5s linear infinite;
        }

        .paper-sheets {
          position: absolute;
          width: 60px;
          height: 80px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .paper-sheet {
          position: absolute;
          width: 45px;
          height: 60px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 3px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .sheet1 {
          transform: rotate(-5deg) translateX(-5px);
          animation: pulse 2s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        .sheet2 {
          transform: rotate(3deg);
          animation: pulse 2s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .sheet3 {
          transform: rotate(7deg) translateX(5px);
          animation: pulse 2s ease-in-out infinite;
          animation-delay: 0.6s;
        }

        @keyframes spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
            transform: translateY(0) rotate(var(--rotation, 0deg));
          }
          50% {
            opacity: 1;
            transform: translateY(-5px) rotate(var(--rotation, 0deg));
          }
        }

        .search-input-container {
          display: flex;
          gap: 8px;
          width: 50%;
          max-width: 600px;

          margin: 0 auto;
          align-items: center;
        }

        .search-input {
          flex: 1;
          height: 32px;
          padding: 2px 8px;
          font-size: 12px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #228be6;
          box-shadow: 0 0 0 2px rgba(34, 139, 230, 0.1);
        }

        .search-button {
          flex-shrink: 0;
          height: 32px;
          padding: 4px;
        }

        .search-icon-svg {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </div>
  );
}
