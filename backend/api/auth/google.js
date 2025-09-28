const crypto = require('crypto');

// Vercel serverless handler for initiating Google OAuth
module.exports = (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString('hex');

    // Set a short-lived httpOnly cookie to validate state on callback
    const cookieOptions = [
      `oauth_state=${state}`,
      'HttpOnly',
      `Path=/`,
      'SameSite=Lax'
    ];
    if (process.env.NODE_ENV === 'production') cookieOptions.push('Secure');

    // Cookie expiry ~5 minutes
    cookieOptions.push(`Max-Age=${60 * 5}`);

    res.setHeader('Set-Cookie', cookieOptions.join('; '));

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: 'profile email',
      access_type: 'offline',
      include_granted_scopes: 'true',
      state
    });

    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.writeHead(302, { Location: redirectUrl });
    res.end();
  } catch (err) {
    console.error('Error in /api/auth/google:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
