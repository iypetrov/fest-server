import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import router from './routers';
import { paymentsController } from './controllers/payments';

dotenv.config();
const PORT = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/festdb";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Authorization'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true
}));
app.options('*', cors());

app.post('/payments/webhook', express.raw({ type: "application/json" }), paymentsController.handleWebhook);

app.use(compression());
app.use(bodyParser.json());

app.use('/api/v0', router());

app.listen(PORT, () => {
    console.log(`Server started on port :${PORT}`);
});

mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) => console.error(error));

