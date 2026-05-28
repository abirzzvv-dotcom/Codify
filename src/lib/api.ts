export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface Project {
  id: string;
  name: string;
  type: string;
  entrypoint: string;
  isRunning: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectInput {
  name: string;
  type: 'discord' | 'nodejs' | 'python';
  entrypoint: string;
}

class APIClient {
  private apiUrl: string = '';
  private token: string = '';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    this.apiUrl = localStorage.getItem('codify_api_url') || '';
    this.token = localStorage.getItem('codify_token') || '';
  }

  private saveToStorage(): void {
    if (this.apiUrl) {
      localStorage.setItem('codify_api_url', this.apiUrl);
    }
    if (this.token) {
      localStorage.setItem('codify_token', this.token);
    }
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async login(email: string, password: string, apiUrl: string): Promise<LoginResponse> {
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash if present
    const url = `${this.apiUrl}/auth/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Login failed with status ${response.status}`);
      }

      const data: LoginResponse = await response.json();
      this.token = data.token;
      this.saveToStorage();

      return data;
    } catch (error) {
      throw new Error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  logout(): void {
    this.token = '';
    localStorage.removeItem('codify_token');
    localStorage.removeItem('codify_api_url');
    this.apiUrl = '';
  }

  async getProjects(): Promise<Project[]> {
    if (!this.apiUrl || !this.token) {
      throw new Error('Not authenticated');
    }

    const url = `${this.apiUrl}/projects`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch projects with status ${response.status}`);
      }

      const data: Project[] = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch projects: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async createProject(projectData: ProjectInput): Promise<Project> {
    if (!this.apiUrl || !this.token) {
      throw new Error('Not authenticated');
    }

    const url = `${this.apiUrl}/projects`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Failed to create project with status ${response.status}`);
      }

      const data: Project = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to create project: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async toggleProjectState(id: string, action: 'start' | 'stop'): Promise<Project> {
    if (!this.apiUrl || !this.token) {
      throw new Error('Not authenticated');
    }

    const url = `${this.apiUrl}/projects/${id}/${action}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(true),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || `Failed to ${action} project with status ${response.status}`
        );
      }

      const data: Project = await response.json();
      return data;
    } catch (error) {
      throw new Error(
        `Failed to ${action} project: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}

export const apiClient = new APIClient();
