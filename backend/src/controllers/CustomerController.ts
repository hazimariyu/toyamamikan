import { Request, Response } from 'express';
import { CustomerSummaryService } from '../services/CustomerSummaryService';
import { Message } from '../models/types';

export class CustomerController {
  private summaryService = new CustomerSummaryService();

  async generateSummary(req: Request, res: Response): Promise<void> {
    try {
      const { customerId, messages } = req.body;

      if (!customerId || !Array.isArray(messages)) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'customerId and messages array are required'
        });
        return;
      }

      // Validate message format
      const validMessages: Message[] = messages.map((msg: any) => ({
        id: msg.id || Date.now().toString(),
        content: msg.content,
        type: msg.type || 'inquiry',
        timestamp: new Date(msg.timestamp || Date.now()),
        sender: msg.sender || 'customer'
      }));

      const summary = await this.summaryService.generateCustomerSummary(customerId, validMessages);

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error generating customer summary:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to generate customer summary'
      });
    }
  }

  async updateSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id: customerId } = req.params;
      const { existingSummary, newMessage } = req.body;

      if (!customerId || !existingSummary || !newMessage) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'customerId, existingSummary, and newMessage are required'
        });
        return;
      }

      const validMessage: Message = {
        id: newMessage.id || Date.now().toString(),
        content: newMessage.content,
        type: newMessage.type || 'inquiry',
        timestamp: new Date(newMessage.timestamp || Date.now()),
        sender: newMessage.sender || 'customer'
      };

      const updatedSummary = await this.summaryService.updateCustomerSummary(
        customerId,
        existingSummary,
        validMessage
      );

      res.json({
        success: true,
        data: updatedSummary
      });
    } catch (error) {
      console.error('Error updating customer summary:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update customer summary'
      });
    }
  }

  async getCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // This would typically fetch from database
      // For now, return mock data
      res.json({
        success: true,
        data: {
          id,
          name: `顧客${id}`,
          email: `customer${id}@example.com`,
          tags: [],
          totalOrders: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch customer'
      });
    }
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone } = req.body;

      if (!name || !email) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'name and email are required'
        });
        return;
      }

      // This would typically save to database
      const customer = {
        id: Date.now().toString(),
        name,
        email,
        phone: phone || undefined,
        tags: [],
        totalOrders: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create customer'
      });
    }
  }
}
