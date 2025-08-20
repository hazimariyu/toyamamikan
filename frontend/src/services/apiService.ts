import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export interface ResponseSuggestion {
  id: string;
  content: string;
  tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic';
  confidence: number;
  reasoning: string;
}

export interface ResponseGenerationRequest {
  customerMessage: string;
  customerId?: string;
  preferredTone?: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic';
}

export interface ResponseSuggestionResponse {
  success: boolean;
  data: {
    suggestions: ResponseSuggestion[];
    requestInfo: {
      customerMessage: string;
      customerId: string | null;
      preferredTone: string | null;
      hasCustomerContext: boolean;
    };
  };
}

class ApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  async generateResponseSuggestions(
    request: ResponseGenerationRequest
  ): Promise<ResponseSuggestionResponse> {
    try {
      const response = await this.axiosInstance.post<ResponseSuggestionResponse>(
        '/conversations/response-suggestions',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate response suggestions:', error);
      throw new Error('返信文の提案生成に失敗しました');
    }
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.axiosInstance.get('/../../health');
      return response.data;
    } catch (error) {
      console.error('Failed to test connection:', error);
      throw new Error('バックエンドとの接続に失敗しました');
    }
  }
}

export const apiService = new ApiService();
export default apiService;