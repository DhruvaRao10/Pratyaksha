import axiosClient from './axiosInstance';

export const fetchUserAnalysisHistory = async (userId: number) => {
  try {
    const response = await axiosClient.get(`/user/${userId}/analysis-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    throw error;
  }
};

export const fetchDocumentAnalysis = async (docId: string) => {
  try {
    const response = await axiosClient.get(`/analysis-history/${docId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document analysis:', error);
    throw error;
  }
}; 