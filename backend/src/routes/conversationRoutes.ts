import { Router } from 'express';
import { ConversationController } from '../controllers/ConversationController';

const router = Router();
const conversationController = new ConversationController();

// POST /api/conversations/analyze - Analyze conversation messages
router.post('/analyze', conversationController.analyzeConversation.bind(conversationController));

// POST /api/conversations/response-suggestions - Generate AI response suggestions
router.post('/response-suggestions', conversationController.generateResponseSuggestions.bind(conversationController));

// GET /api/conversations/:customerId/response-history - Get response suggestion history for customer
router.get('/:customerId/response-history', conversationController.getResponseHistory.bind(conversationController));

// GET /api/conversations/:customerId - Get conversation history for customer
router.get('/:customerId', conversationController.getConversations.bind(conversationController));

export { router as conversationRoutes };
