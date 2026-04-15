import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
  res.send('API TopBRS funcionando 🚀');
});

app.get('/player/:tag', async (req, res) => {
  try {
    const tag = String(req.params.tag || '').replace('#', '%23');
    const response = await fetch(`https://api.clashroyale.com/v1/players/${tag}`, {
      headers: { Authorization: `Bearer ${process.env.CLASH_API_KEY}` }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro /player:', error);
    return res.status(500).json({ error: 'Erro ao buscar player' });
  }
});

app.get('/clan/:tag/currentriverrace', async (req, res) => {
  try {
    const tag = String(req.params.tag || '').replace('#', '%23');
    const response = await fetch(`https://api.clashroyale.com/v1/clans/${tag}/currentriverrace`, {
      headers: { Authorization: `Bearer ${process.env.CLASH_API_KEY}` }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro /clan currentriverrace:', error);
    return res.status(500).json({ error: 'Erro ao buscar guerra' });
  }
});

app.get('/clan/:tag', async (req, res) => {
  try {
    const tag = String(req.params.tag || '').replace('#', '%23');
    const response = await fetch(`https://api.clashroyale.com/v1/clans/${tag}`, {
      headers: { Authorization: `Bearer ${process.env.CLASH_API_KEY}` }
    });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Erro /clan:', error);
    return res.status(500).json({ error: 'Erro ao buscar clã' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Servidor rodando na porta', PORT);
});
