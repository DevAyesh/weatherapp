const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function getDb() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('weather_app');
}

// Save a search
app.post('/api/search', async (req, res) => {
  const { visitorId, city, lat, lon, weather, time } = req.body;
  if (!visitorId || !city || !weather || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const db = await getDb();
    await db.collection('searches').insertOne({ visitorId, city, lat, lon, weather, time });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get recent searches for a visitor
app.get('/api/searches/:visitorId', async (req, res) => {
  const { visitorId } = req.params;
  try {
    const db = await getDb();
    const recent = await db.collection('searches')
      .find({ visitorId })
      .sort({ time: -1 })
      .limit(5)
      .toArray();
    res.json(recent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
