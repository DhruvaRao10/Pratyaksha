//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  AppShell, 
  Title, 
  Text, 
  Container, 
  TextInput, 
  Button, 
  Group, 
  Card, 
  Badge, 
  Checkbox, 
  Grid, 
  LoadingOverlay, 
  Pagination,
  Select,
  Paper,
  Anchor, 
} from '@mantine/core';
import { Navigation } from '../components/Navigation';
import { IconSearch, IconExternalLink } from '@tabler/icons-react';
import { searchArxiv, searchElastic} from '../services/searchService';

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
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchSource, setSearchSource] = useState<'arxiv' | 'elastic'>('arxiv');
  const [filters, setFilters] = useState({
    machineLearning: true,
    deepLearning: true,
    artificialIntelligence: true
  });

  const getArXivCategories = () => {
    const categories = [];
    if (filters.machineLearning) categories.push('cs.LG', 'stat.ML');
    if (filters.deepLearning) categories.push('cs.NE', 'cs.AI');
    if (filters.artificialIntelligence) categories.push('cs.AI', 'cs.CL');
    return categories;
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      if (searchSource === 'arxiv') {
        const categories = getArXivCategories();
        const results = await searchArxiv(query, categories, activePage);
        setSearchResults(results.papers);
        setTotalPages(Math.ceil(results.total / 10));
      } else {
        const results = await searchElastic(query, activePage);
        setSearchResults(results.papers);
        setTotalPages(Math.ceil(results.total / 10));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim()) {
      handleSearch();
    }
  }, [activePage]);

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleFilterChange = (name: keyof typeof filters) => {
    setFilters({
      ...filters,
      [name]: !filters[name]
    });
  };

  const checkboxIconSize = '14px';


  return (
    <AppShell
      navbar={<Navigation />}
      padding="md"
    >
      <Container size="xl">
        <Title order={1} mb="lg">Academic Paper Search</Title>
        
        <Paper shadow="xs" p="md" mb="lg">
          <Grid>
            <Grid.Col span={12}>
              <Group>
                <TextInput
                  placeholder="Search for papers..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  icon={<IconSearch size={16} />}
                  style={{ flex: 1 }}
                />
                <Select
                  data={[
                    { value: 'arxiv', label: 'ArXiv' },
                    { value: 'elastic', label: 'Indexed Papers' }
                  ]}
                  value={searchSource}
                  onChange={(value) => setSearchSource(value as 'arxiv' | 'elastic')}
                  style={{ width: 120 }}
                />
                <Button onClick={handleSearch}>Search</Button>
              </Group>
            </Grid.Col>

            <Grid.Col span={12}>
              <Group position="left" spacing="xs">
                <Text size="sm" fw={500}>Filter by:</Text>
                <Checkbox
                  label="Machine Learning"
                  checked={filters.machineLearning}
                  onChange={() => handleFilterChange('machineLearning')}
                  styles={{
                    input: {
                       height: checkboxIconSize,
                       width: checkboxIconSize,
                       minHeight: checkboxIconSize, 
                       minWidth: checkboxIconSize   
                    },
                    icon: {
                       height: `calc(${checkboxIconSize} * 0.6)`, 
                       width: `calc(${checkboxIconSize} * 0.6)`,
                       minWidth: `calc(${checkboxIconSize} * 0.6)`
                    },
                  }}
                />
                <Checkbox
                  label="Deep Learning"
                  checked={filters.deepLearning}
                  onChange={() => handleFilterChange('deepLearning')}
                  styles={{
                    input: { height: checkboxIconSize, width: checkboxIconSize, minHeight: checkboxIconSize, minWidth: checkboxIconSize },
                    icon: { height: `calc(${checkboxIconSize} * 0.6)`, width: `calc(${checkboxIconSize} * 0.6)`, minWidth: `calc(${checkboxIconSize} * 0.6)` },
                  }}
                />
                <Checkbox
                  label="Artificial Intelligence"
                  checked={filters.artificialIntelligence}
                  onChange={() => handleFilterChange('artificialIntelligence')}
                  styles={{
                     input: { height: checkboxIconSize, width: checkboxIconSize, minHeight: checkboxIconSize, minWidth: checkboxIconSize },
                     icon: { height: `calc(${checkboxIconSize} * 0.6)`, width: `calc(${checkboxIconSize} * 0.6)`, minWidth: `calc(${checkboxIconSize} * 0.6)` },
                  }}
                />
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>

        <div style={{ position: 'relative', minHeight: 200 }}>
          <LoadingOverlay visible={loading} overlayBlur={2} />
          
          {searchResults.length === 0 && !loading ? (
            <Text align="center" color="dimmed" mt="xl">
              {query.trim() ? 'No results found' : 'Enter a search query to find papers'}
            </Text>
          ) : (
            <>
              {searchResults.map((paper) => (
                <Card key={paper.id} mb="md" p="md" withBorder>
                  <Card.Section withBorder p="md">
                    <Group position="apart">
                      <Title order={4}>{paper.title}</Title>
                      <Anchor href={paper.pdf_url} target="_blank">
                        <IconExternalLink size={20} />
                      </Anchor>
                    </Group>
                  </Card.Section>
                  
                  <Text size="sm" mt="md" mb="xs">
                    <b>Authors:</b> {paper.authors.join(', ')}
                  </Text>
                  
                  <Text size="sm" mb="xs">
                    <b>Published:</b> {new Date(paper.published).toLocaleDateString()}
                    {paper.updated && ` (Updated: ${new Date(paper.updated).toLocaleDateString()})`}
                  </Text>
                  
                  <Group spacing="xs" mb="md">
                    {paper.categories.map((category) => (
                      <Badge key={category}>{category}</Badge>
                    ))}
                  </Group>
                  
                  <Text size="sm" lineClamp={3}>
                    {paper.summary}
                  </Text>
                </Card>
              ))}
              
              {totalPages > 1 && (
                <Group position="center" mt="xl">
                  {/* <Pagination
                    total={totalPages}
                    page={activePage}
                    onChange={handlePageChange}
                  /> */}
                </Group>
              )}
            </>
          )}
        </div>
      </Container>
    </AppShell>
  );
} 