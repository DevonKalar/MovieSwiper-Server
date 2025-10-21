import express from 'express';
import dotenv from 'dotenv';
import { config } from './config/env.js';
import serverRouter from './routes/index.js';

dotenv.config();

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', serverRouter);


app.get('/', (req, res) => {
    res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});