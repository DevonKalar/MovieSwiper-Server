import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { config } from './config/env.js';
import serverRouter from './routes/index.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('Error: JWT_SECRET is not defined in environment variables.');
    process.exit(1);
}

const app = express();
const PORT = config.port;

app.use(cookieParser());

app.set('trust proxy', 1);

app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
console.log('CORS Origins:', config.corsOrigins);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', serverRouter);


app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});