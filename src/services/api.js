const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Something went wrong');
    }

    return response.json();
  }

  async getActiveTasks(page = 1, limit = 10) {
    return this.request(`/tasks/active?page=${page}&limit=${limit}`);
  }

  async getArchivedTasks(page = 1, limit = 10) {
    return this.request(`/tasks/archived?page=${page}&limit=${limit}`);
  }

  async getTaskTree(archived = false) {
    return this.request(`/tasks/tree?archived=${archived}`);
  }

  async getTaskById(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(data) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id, data) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  //move task to different parent
  async moveTask(id, parentTask) {
    return this.request(`/tasks/${id}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ parentTask }),
    });
  }

  async deleteTask(id) {
    await this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();