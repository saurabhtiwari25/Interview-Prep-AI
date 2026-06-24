import api from './api';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/resume/upload', formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Upload failed');
    }
  },

  chat: async (query) => {
    try {
      const response = await api.post('/resume/chat', { query });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Chat request failed');
    }
  },
};
