import { Router } from 'express';
import { CustomerController } from '../controllers/CustomerController';

const router = Router();
const customerController = new CustomerController();

// POST /api/customers/summary - Generate customer summary from conversation
router.post('/summary', customerController.generateSummary.bind(customerController));

// PUT /api/customers/:id/summary - Update existing customer summary
router.put('/:id/summary', customerController.updateSummary.bind(customerController));

// GET /api/customers/:id - Get customer details
router.get('/:id', customerController.getCustomer.bind(customerController));

// POST /api/customers - Create new customer
router.post('/', customerController.createCustomer.bind(customerController));

export { router as customerRoutes };
