import { ResponseSuggestionService } from '../ResponseSuggestionService';
import { ResponseGenerationRequest, CustomerSummary, Message } from '../../models/types';

describe('ResponseSuggestionService', () => {
  let service: ResponseSuggestionService;

  beforeEach(() => {
    service = new ResponseSuggestionService();
  });

  describe('generateResponseSuggestions', () => {
    it('should generate response suggestions for a simple order message', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: '青島みかんを5kg注文したいです'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions).toHaveLength(2); // friendly and professional tones
      expect(suggestions[0]).toHaveProperty('id');
      expect(suggestions[0]).toHaveProperty('content');
      expect(suggestions[0]).toHaveProperty('tone');
      expect(suggestions[0]).toHaveProperty('confidence');
      expect(suggestions[0]).toHaveProperty('reasoning');
      expect(suggestions[0].confidence).toBeGreaterThan(0);
      expect(suggestions[0].content).toContain('青島みかん');
    });

    it('should generate response suggestions for feedback message', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: '前回のみかんがとても美味しかったです。ありがとうございました。'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].content).toMatch(/(嬉しい|ありがとう|喜び)/);
    });

    it('should generate response suggestions for complaint message', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: '配送に問題がありました。箱が破れていました。'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].content).toMatch(/(申し訳|すみません|改善)/);
    });

    it('should handle preferred tone parameter', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: 'みかんを注文したいです',
        preferredTone: 'enthusiastic'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].tone).toBe('enthusiastic');
    });

    it('should incorporate customer summary when provided', async () => {
      const customerSummary: CustomerSummary = {
        id: 'summary-1',
        customerId: 'customer-1',
        keyTopics: ['贈答用梱包'],
        sentiment: 'positive',
        purchaseHistory: ['青島みかん3kg'],
        preferences: ['贈答用梱包'],
        lastUpdated: new Date()
      };

      const request: ResponseGenerationRequest = {
        customerMessage: 'みかんを注文したいです',
        customerSummary
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions[0].confidence).toBeGreaterThan(0.8); // Higher confidence with context
      expect(suggestions[0].reasoning).toContain('顧客コンテキストを考慮');
    });

    it('should handle conversation history', async () => {
      const conversationHistory: Message[] = [
        {
          id: '1',
          content: '前回は美味しいみかんをありがとうございました',
          type: 'feedback',
          timestamp: new Date(),
          sender: 'customer'
        }
      ];

      const request: ResponseGenerationRequest = {
        customerMessage: 'また注文したいです',
        conversationHistory
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0].confidence).toBeGreaterThan(0.8);
    });

    it('should handle urgent messages', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: '急ぎでみかんを注文したいです'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions[0].reasoning).toContain('緊急性が高いため');
    });

    it('should return suggestions sorted by confidence', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: 'みかんについて質問があります'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      // Verify suggestions are sorted by confidence (descending)
      for (let i = 0; i < suggestions.length - 1; i++) {
        expect(suggestions[i].confidence).toBeGreaterThanOrEqual(suggestions[i + 1].confidence);
      }
    });

    it('should handle empty message gracefully', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: ''
      };

      const suggestions = await service.generateResponseSuggestions(request);

      expect(suggestions).toHaveLength(2);
      expect(suggestions[0]).toHaveProperty('content');
    });

    it('should extract relevant keywords from message', async () => {
      const request: ResponseGenerationRequest = {
        customerMessage: '青島みかん5kgを梱包してギフト用で注文したいです'
      };

      const suggestions = await service.generateResponseSuggestions(request);

      // Should recognize order type and include appropriate response
      expect(suggestions[0].content).toMatch(/(注文|ありがとう)/);
      expect(suggestions[0].reasoning).toContain('order');
    });
  });

  describe('message analysis', () => {
    it('should correctly identify order messages', async () => {
      const orderMessages = [
        '青島みかんを5kg注文したいです',
        'みかんを購入したいのですが',
        '3kg注文お願いします'
      ];

      for (const message of orderMessages) {
        const request: ResponseGenerationRequest = { customerMessage: message };
        const suggestions = await service.generateResponseSuggestions(request);
        
        expect(suggestions[0].reasoning).toContain('order');
      }
    });

    it('should correctly identify feedback messages', async () => {
      const feedbackMessages = [
        'ありがとうございました。とても美味しかったです',
        '美味しいみかんでした'
      ];

      for (const message of feedbackMessages) {
        const request: ResponseGenerationRequest = { customerMessage: message };
        const suggestions = await service.generateResponseSuggestions(request);
        
        expect(suggestions[0].reasoning).toContain('feedback');
      }
    });

    it('should correctly identify complaint messages', async () => {
      const complaintMessages = [
        '配送に問題がありました',
        '不満があります',
        'クレームです'
      ];

      for (const message of complaintMessages) {
        const request: ResponseGenerationRequest = { customerMessage: message };
        const suggestions = await service.generateResponseSuggestions(request);
        
        expect(suggestions[0].reasoning).toContain('complaint');
        expect(suggestions[0].content).toMatch(/(申し訳|すみません)/);
      }
    });
  });

  describe('tone variations', () => {
    it('should generate different content for different tones', async () => {
      const message = 'みかんを注文したいです';
      
      const friendlyRequest: ResponseGenerationRequest = {
        customerMessage: message,
        preferredTone: 'friendly'
      };
      
      const professionalRequest: ResponseGenerationRequest = {
        customerMessage: message,
        preferredTone: 'professional'
      };

      const friendlyResponse = await service.generateResponseSuggestions(friendlyRequest);
      const professionalResponse = await service.generateResponseSuggestions(professionalRequest);

      expect(friendlyResponse[0].tone).toBe('friendly');
      expect(professionalResponse[0].tone).toBe('professional');
      
      // Content should be different for different tones
      expect(friendlyResponse[0].content).not.toBe(professionalResponse[0].content);
    });
  });
});