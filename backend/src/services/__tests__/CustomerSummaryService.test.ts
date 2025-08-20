import { CustomerSummaryService } from '../CustomerSummaryService';
import { Message, CustomerSummary } from '../../models/types';

describe('CustomerSummaryService', () => {
  let summaryService: CustomerSummaryService;

  beforeEach(() => {
    summaryService = new CustomerSummaryService();
  });

  describe('generateCustomerSummary', () => {
    it('should generate summary from conversation history', async () => {
      const mockHistory: Message[] = [
        {
          id: '1',
          content: '青島みかんを5kg注文したい',
          type: 'order',
          timestamp: new Date('2024-01-01'),
          sender: 'customer'
        },
        {
          id: '2',
          content: '梱包について気になります',
          type: 'inquiry',
          timestamp: new Date('2024-01-02'),
          sender: 'customer'
        },
        {
          id: '3',
          content: 'とても美味しかった！',
          type: 'review',
          timestamp: new Date('2024-01-03'),
          sender: 'customer'
        }
      ];
      
      const summary = await summaryService.generateCustomerSummary('customer123', mockHistory);
      
      expect(summary.keyTopics).toContain('梱包への関心');
      expect(summary.sentiment).toBe('positive');
      expect(summary.purchaseHistory.length).toBeGreaterThan(0);
    });

    it('should handle empty conversation history', async () => {
      const emptyHistory: Message[] = [];
      
      const summary = await summaryService.generateCustomerSummary('customer123', emptyHistory);
      
      expect(summary.keyTopics).toHaveLength(0);
      expect(summary.sentiment).toBe('neutral');
      expect(summary.purchaseHistory).toHaveLength(0);
    });
  });

  describe('updateCustomerSummary', () => {
    it('should update existing summary with new information', async () => {
      const existingSummary: CustomerSummary = {
        id: 'summary123',
        customerId: 'customer123',
        keyTopics: ['梱包への関心'],
        sentiment: 'positive',
        purchaseHistory: ['青島みかん 5kg'],
        preferences: ['贈答用梱包'],
        lastUpdated: new Date('2024-01-01')
      };
      
      const newMessage: Message = {
        id: '4',
        content: '新しい商品について質問があります',
        type: 'inquiry',
        timestamp: new Date('2024-01-04'),
        sender: 'customer'
      };
      
      const updatedSummary = await summaryService.updateCustomerSummary(
        'customer123', 
        existingSummary, 
        newMessage
      );
      
      expect(updatedSummary.keyTopics).toContain('新商品への関心');
      expect(updatedSummary.lastUpdated.getTime()).toBeGreaterThan(
        existingSummary.lastUpdated.getTime()
      );
    });
  });
});
