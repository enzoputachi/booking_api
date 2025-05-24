import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index.js';
const app = express();
dotenv.config();

const port = process.env.PORT;

app.use(express.json());
app.use('/api', router)


app.listen(port, () => console.log(`🚀Server running at port ${port}`))