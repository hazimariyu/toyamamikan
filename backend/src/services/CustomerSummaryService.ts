import { Message, CustomerSummary } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class CustomerSummaryService {
  async generateCustomerSummary(customerId: string, history: Message[]): Promise<CustomerSummary> {
    if (history.length === 0) {
      return {
        id: uuidv4(),
        customerId,
        keyTopics: [],
        sentiment: 'neutral',
        purchaseHistory: [],
        preferences: [],
        lastUpdated: new Date()
      };
    }

    const keyTopics = this.extractKeyTopics(history);
    const sentiment = this.analyzeSentiment(history);
    const purchaseHistory = this.extractPurchaseHistory(history);
    const preferences = this.extractPreferences(history);

    return {
      id: uuidv4(),
      customerId,
      keyTopics,
      sentiment,
      purchaseHistory,
      preferences,
      lastUpdated: new Date()
    };
  }

  async updateCustomerSummary(
    customerId: string,
    existingSummary: CustomerSummary,
    newMessage: Message
  ): Promise<CustomerSummary> {
    const newTopics = this.extractKeyTopicsFromMessage(newMessage);
    const updatedKeyTopics = [...new Set([...existingSummary.keyTopics, ...newTopics])];

    const newPreferences = this.extractPreferencesFromMessage(newMessage);
    const updatedPreferences = [...new Set([...existingSummary.preferences, ...newPreferences])];

    return {
      ...existingSummary,
      keyTopics: updatedKeyTopics,
      preferences: updatedPreferences,
      lastUpdated: new Date()
    };
  }

  private extractKeyTopics(history: Message[]): string[] {
    const topics: string[] = [];
    
    for (const message of history) {
      const messageTopics = this.extractKeyTopicsFromMessage(message);
      topics.push(...messageTopics);
    }
    
    return [...new Set(topics)];
  }

  private extractKeyTopicsFromMessage(message: Message): string[] {
    const topics: string[] = [];
    const content = message.content.toLowerCase();
    
    if (content.includes('梱包')) {
      topics.push('梱包への関心');
    }
    if (content.includes('新しい商品') || content.includes('新商品')) {
      topics.push('新商品への関心');
    }
    if (content.includes('次回も') || content.includes('リピート')) {
      topics.push('リピート希望');
    }
    
    return topics;
  }

  private analyzeSentiment(history: Message[]): 'positive' | 'neutral' | 'negative' {
    const positiveKeywords = ['美味しい', '美味しかった', '楽しみ', 'ありがとう'];
    const negativeKeywords = ['破れ', '問題', 'クレーム', '不満'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    for (const message of history) {
      const content = message.content.toLowerCase();
      
      for (const keyword of positiveKeywords) {
        if (content.includes(keyword)) {
          positiveScore++;
        }
      }
      
      for (const keyword of negativeKeywords) {
        if (content.includes(keyword)) {
          negativeScore++;
        }
      }
    }
    
    if (positiveScore > negativeScore) {
      return 'positive';
    } else if (negativeScore > positiveScore) {
      return 'negative';
    }
    
    return 'neutral';
  }

  private extractPurchaseHistory(history: Message[]): string[] {
    const purchases: string[] = [];
    
    for (const message of history) {
      if (message.type === 'order') {
        const content = message.content;
        // Simple regex pattern matching for Japanese text
        if (content.includes('みかん') && content.includes('kg')) {
          purchases.push(content);
        }
      }
    }
    
    return purchases;
  }

  private extractPreferences(history: Message[]): string[] {
    const preferences: string[] = [];
    
    for (const message of history) {
      const messagePreferences = this.extractPreferencesFromMessage(message);
      preferences.push(...messagePreferences);
    }
    
    return [...new Set(preferences)];
  }

  private extractPreferencesFromMessage(message: Message): string[] {
    const preferences: string[] = [];
    const content = message.content.toLowerCase();
    
    if (content.includes('贈答用') || content.includes('ギフト')) {
      preferences.push('贈答用梱包');
    }
    if (content.includes('家族') || content.includes('みんな')) {
      preferences.push('家族向け');
    }
    
    return preferences;
  }
}
