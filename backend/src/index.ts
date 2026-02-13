import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import expenseRoutes from './routes/expenseRoutes';
import consultantRoutes from './routes/consultantRoutes';
import personnelRoutes from './routes/personnelRoutes';
import vendorRoutes from './routes/vendorRoutes';
import systemLogRoutes from './routes/systemLogRoutes';
import salaryPaymentRoutes from './routes/salaryPaymentRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/logs', systemLogRoutes);
app.use('/api/salary-payments', salaryPaymentRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
