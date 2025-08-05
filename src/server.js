import express from 'express';
import dotenv from 'dotenv';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import cors from 'cors';


import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pathFinder from './utils/pathFinder.js';
import { testRedisConnection } from './models/redis.js';
// import { startScheduler } from './services/schedular.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
dotenv.config();
pathFinder();

// swagger setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: "Copers Drive API",
            version: '1.0.0',
        },
        servers: [{ url: 'http://localhost:3000' }],
    },
    apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);


const port = process.env.PORT;

// mount middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true} ));
app.use(cookieParser());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api', router)

app.get('/api/ticket/:token', (req, res) => {
  const { token } = req.params;
  const pdfPath = path.join(process.cwd(), 'tickets', `${token}.pdf`);

  if (!fs.existsSync(pdfPath)) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  fs.createReadStream(pdfPath).pipe(res);
});

// app.use((req, res) => {
//   res.status(404).json({
//     status: 'error',
//     message: `Oops... try when it's available`,
//   });
// });


app.listen(port, () => {
    console.log(`🚀Server running at port ${port}`);
    console.log('Swagger docs at http://localhost:3000/api-docs');
    // startScheduler();
    // testRedisConnection();
})