import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: 'API PetResgate funcionando!', status: 'OK' });
});

app.get('/api/debug', (req, res) => {
  res.json({
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_uri_length: process.env.MONGODB_URI?.length || 0,
    mongodb_uri_preview: process.env.MONGODB_URI?.substring(0, 30) + '...',
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    status: 'Debug funcionando'
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: { total: 0, perdidos: 0, encontrados: 0 },
    message: 'Mock stats - MongoDB não conectado ainda'
  });
});

export default app;
