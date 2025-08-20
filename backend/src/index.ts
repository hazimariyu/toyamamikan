import express from 'express';
import cors from 'cors';
import { customerRoutes } from './routes/customerRoutes';
import { conversationRoutes } from './routes/conversationRoutes';

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mikan-Assist AI Backend is running' });
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/conversations', conversationRoutes);

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🍊 Mikan-Assist AI Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
