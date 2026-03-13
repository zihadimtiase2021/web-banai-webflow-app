import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

const CLIENT_ID = process.env.WEBFLOW_CLIENT_ID;
const CLIENT_SECRET = process.env.WEBFLOW_CLIENT_SECRET;
const REDIRECT_URI = process.env.WEBFLOW_REDIRECT_URI;

// OAuth start
app.get('/auth/webflow', (req, res) => {
  const url = `https://webflow.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=sites:read+sites:write`;
  res.redirect(url);
});

// OAuth callback
app.get('/auth/webflow/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokenRes = await axios.post(`https://api.webflow.com/oauth/access_token`, null, {
      params: { client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI }
    });
    req.session.token = tokenRes.data.access_token;
    res.redirect(process.env.FRONTEND_URL + '/dashboard');
  } catch (err) {
    console.error(err);
    res.send('OAuth failed');
  }
});

// Example API
app.get('/api/sites', async (req, res) => {
  try {
    const token = req.session.token;
    if (!token) return res.status(401).send('Unauthorized');
    const response = await axios.get('https://api.webflow.com/sites', { headers: { Authorization: `Bearer ${token}` } });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));