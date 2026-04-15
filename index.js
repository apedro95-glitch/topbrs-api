import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors({ origin: true }));

app.get('/', (req, res) => {
  res.send('API TopBRS funcionando 🚀');
});

function normalizeTag(raw=''){
  const normalized = String(raw || '').trim().toUpperCase();
  return normalized.startsWith('%23') ? normalized : normalized.replace('#', '%23');
}

async function clashFetch(path){
  const response = await fetch(`https://api.clashroyale.com/v1${path}`, {
    headers: { Authorization: `Bearer ${process.env.CLASH_API_KEY}` }
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

app.get('/player/:tag', async (req, res) => {
  try {
    const { response, data } = await clashFetch(`/players/${normalizeTag(req.params.tag)}`);
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno na API' });
  }
});

app.get('/clan/:tag/currentriverrace', async (req, res) => {
  try {
    const { response, data } = await clashFetch(`/clans/${normalizeTag(req.params.tag)}/currentriverrace`);
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno na API' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
