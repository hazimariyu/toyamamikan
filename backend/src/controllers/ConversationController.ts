import { Request, Response } from 'express';
import { CustomerSummaryService } from '../services/CustomerSummaryService';
import { ResponseSuggestionService } from '../services/ResponseSuggestionService';
import { Message, ResponseGenerationRequest } from '../models/types';

export class ConversationController {
  private summaryService = new CustomerSummaryService();
  private responseService = new ResponseSuggestionService();

  async analyzeConversation(req: Request, res: Response): Promise<void> {
    try {
      const { messages } = req.body;

      if (!Array.isArray(messages)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'messages array is required'
        });
        return;
      }

      // Validate and format messages
      const validMessages: Message[] = messages.map((msg: any) => ({
        id: msg.id || Date.now().toString(),
        content: msg.content,
        type: msg.type || 'inquiry',
        timestamp: new Date(msg.timestamp || Date.now()),
        sender: msg.sender || 'customer'
      }));

      // Generate analysis for demonstration
      const customerId = 'demo-customer';
      const summary = await this.summaryService.generateCustomerSummary(customerId, validMessages);

      const analysis = {
        messageCount: validMessages.length,
        customerMessages: validMessages.filter(m => m.sender === 'customer').length,
        farmerMessages: validMessages.filter(m => m.sender === 'farmer').length,
        summary,
        insights: {
          dominantSentiment: summary.sentiment,
          keyTopics: summary.keyTopics,
          preferences: summary.preferences,
          purchaseHistory: summary.purchaseHistory
        }
      };

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to analyze conversation'
      });
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;

      // This would typically fetch from database
      // For now, return mock data
      const mockConversations = [
        {
          id: '1',
          customerId,
          messages: [
            {
              id: '1',
              content: '青島みかんを5kg注文したいです',
              type: 'order',
              timestamp: new Date('2024-01-01'),
              sender: 'customer'
            },
            {
              id: '2',
              content: 'ありがとうございます。青島みかん5kgですね。梱包について何かご要望はございますか？',
              type: 'inquiry',
              timestamp: new Date('2024-01-01'),
              sender: 'farmer'
            }
          ],
          tags: ['新規注文'],
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01')
        }
      ];

      res.json({
        success: true,
        data: mockConversations
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch conversations'
      });
    }
  }

  async generateResponseSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { customerMessage, customerId, preferredTone } = req.body;

      if (!customerMessage) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'customerMessage is required'
        });
        return;
      }

      // Build request object for response generation
      const request: ResponseGenerationRequest = {
        customerMessage,
        preferredTone
      };

      // If customerId is provided, try to get customer summary and conversation history
      if (customerId) {
        // In a real implementation, you would fetch these from database
        // For now, we'll simulate with mock data
        const mockCustomerSummary = {
          id: 'summary-1',
          customerId,
          keyTopics: ['梱包への関心', 'リピート希望'],
          sentiment: 'positive' as const,
          purchaseHistory: ['青島みかん5kg'],
          preferences: ['贈答用梱包'],
          lastUpdated: new Date()
        };

        const mockConversationHistory: Message[] = [
          {
            id: '1',
            content: '前回は美味しいみかんをありがとうございました',
            type: 'feedback',
            timestamp: new Date(),
            sender: 'customer'
          }
        ];

        request.customerSummary = mockCustomerSummary;
        request.conversationHistory = mockConversationHistory;
      }

      // Generate response suggestions
      const suggestions = await this.responseService.generateResponseSuggestions(request);

      res.json({
        success: true,
        data: {
          suggestions,
          requestInfo: {
            customerMessage,
            customerId: customerId || null,
            preferredTone: preferredTone || null,
            hasCustomerContext: !!customerId
          }
        }
      });
    } catch (error) {
      console.error('Error generating response suggestions:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate response suggestions'
      });
    }
  }

  async getResponseHistory(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      const { limit = 10 } = req.query;

      // This would typically fetch from database
      // For now, return mock data
      const mockResponseHistory = [
        {
          id: '1',
          customerId,
          originalMessage: '青島みかんを注文したいです',
          suggestedResponse: 'ご注文ありがとうございます！青島みかんですね。とても美味しく仕上がっておりますよ。',
          tone: 'friendly',
          wasUsed: true,
          createdAt: new Date('2024-01-01'),
          usedAt: new Date('2024-01-01')
        },
        {
          id: '2',
          customerId,
          originalMessage: '美味しいみかんをありがとうございました',
          suggestedResponse: 'お褒めの言葉をいただき、本当に嬉しいです！また美味しいみかんをお届けしますね。',
          tone: 'friendly',
          wasUsed: false,
          createdAt: new Date('2024-01-02')
        }
      ];

      const limitedHistory = mockResponseHistory.slice(0, Number(limit));

      res.json({
        success: true,
        data: {
          history: limitedHistory,
          total: mockResponseHistory.length,
          limit: Number(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching response history:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch response history'
      });
    }
  }
}
