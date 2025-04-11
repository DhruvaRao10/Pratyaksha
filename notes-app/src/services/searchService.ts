import axiosClient from './axiosInstance';

export const fetchUserArxivSearch = async (userId: number) => {
  try {
    const response = await axiosClient.get(`/user/${userId}/search`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

export const searchArxiv = async (query: string, categories: string[] = [], page: number = 1) => {
  try {
    const response = await axiosClient.post('/search/arxiv', {
      query,
      categories,
      page,
      max_results: 10,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching ArXiv:', error);
    throw error;
  }
};

export const searchElastic = async (query: string, page: number = 1) => {
  try {
    const response = await axiosClient.post('/search/elastic', {
      query,
      page,
      size: 10,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching indexed papers:', error);
    throw error;
  }
};

export const indexArxivPaper = async (arxivId: string) => {
  try {
    const response = await axiosClient.post('/index/arxiv', {
      arxiv_id: arxivId,
    });
    return response.data;
  } catch (error) {
    console.error('Error indexing ArXiv paper:', error);
    throw error;
  }
};

