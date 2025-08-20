export interface Reservation {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  contactInfo: string;
  status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  totalOrders: number;
  lastOrderDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  type: 'order' | 'inquiry' | 'review' | 'request' | 'feedback' | 'complaint';
  timestamp: Date;
  sender: 'customer' | 'farmer';
}

export interface CustomerSummary {
  id: string;
  customerId: string;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  purchaseHistory: string[];
  preferences: string[];
  lastUpdated: Date;
}

export interface ResponseSuggestion {
  id: string;
  content: string;
  tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic';
  confidence: number;
  reasoning: string;
}

export interface ResponseGenerationRequest {
  customerMessage: string;
  customerSummary?: CustomerSummary;
  conversationHistory?: Message[];
  preferredTone?: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic';
}
