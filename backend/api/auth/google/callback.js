const axios = require('axios');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const User = require('../../../models/User');
const connectMongo = require('../../../utils/mongo');

module.exports = async (req, res) => {
  try {
    await connectMongo();

    const { code, state } = req.query;

    // Validate state cookie
    const cookies = (req.headers.cookie || '').split(';').map(c => c.trim());
    const stateCookie = cookies.find(c => c.startsWith('oauth_state='));
    const cookieState = stateCookie ? stateCookie.split('=')[1] : null;

    if (!code || !state || state !== cookieState) {
      console.error('Invalid OAuth state or missing code', { code, state, cookieState });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.writeHead(302, { Location: `${frontendUrl}/login?error=oauth_state` }).end();
    }

    // Exchange code for tokens
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', querystring.stringify({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      grant_type: 'authorization_code'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token } = tokenRes.data;

    // Fetch user profile
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const profile = profileRes.data;

    // Upsert user into MongoDB
    const user = await User.findOneAndUpdate(
      { googleId: profile.id },
      {
        googleId: profile.id,
        name: profile.name || profile.email,
        email: profile.email,
        avatar: profile.picture
      },
      { upsert: true, new: true }
    );

    // Issue JWT
    const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Redirect to frontend with token
    res.writeHead(302, { Location: `${frontendUrl}/auth/callback?token=${token}`, 'Set-Cookie': 'oauth_state=; Max-Age=0; Path=/' });
    res.end();
  } catch (err) {
    console.error('Error in /api/auth/google/callback:', err?.response?.data || err.message || err);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.writeHead(302, { Location: `${frontendUrl}/login?error=auth_failed` });
    res.end();
  }
};
