import api from './api';

export const healthService = {
  checkStatus: async () => {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      throw new Error('Backend not reachable');
    }
  },
};
