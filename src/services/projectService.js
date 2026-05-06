import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

class ProjectService {
  async createProject(projectName) {
    try {
      const response = await api.post('/api/projects/create', { projectName });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Tạo dự án thất bại' };
    }
  }

  async deleteProject(projectName) {
    try {
      const response = await api.post('/api/projects/delete', { projectName });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Xóa dự án thất bại' };
    }
  }

  async listProjects() {
    try {
      const response = await api.get('/api/projects/list');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Lấy danh sách dự án thất bại' };
    }
  }
}

export const projectService = new ProjectService();
