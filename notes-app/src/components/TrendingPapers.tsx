import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IconStar, IconExternalLink, IconRefresh } from "@tabler/icons-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

interface TrendingPaper {
  id: string;
  title: string;
  abstract: string;
  url_pdf?: string;
  url_abs?: string;
  published: string;
  github_stars: number;
}

export function TrendingPapers() {
  const [papers, setPapers] = useState<TrendingPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchTrendingPapers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost:8000/papers-with-code", {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch trending papers");
      }
      const data = await response.json();
      setPapers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trending papers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPapers();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70 mb-4">{error}</p>
        <Button 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          onClick={handleRetry}
        >
          <IconRefresh size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70 mb-4">No trending papers available at the moment</p>
        <Button 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          onClick={handleRetry}
        >
          <IconRefresh size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6 mt-8"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Trending Papers</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-white">
            Updated Daily
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/10" 
            onClick={handleRetry}
          >
            <IconRefresh size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((paper) => (
          <Card
            key={paper.id}
            className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white line-clamp-2">
                {paper.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/70 text-sm line-clamp-3 mb-4">
                {paper.abstract}
              </p>
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <div className="flex items-center">
                  <IconStar size={16} className="mr-1" />
                  <span>{paper.github_stars}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              {paper.url_abs && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  asChild
                >
                  <a href={paper.url_abs} target="_blank" rel="noopener noreferrer">
                    <IconExternalLink size={16} className="mr-2" />
                    View Paper
                  </a>
                </Button>
              )}
              {paper.url_pdf && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  asChild
                >
                  <a href={paper.url_pdf} target="_blank" rel="noopener noreferrer">
                    PDF
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </motion.div>
  );
} 