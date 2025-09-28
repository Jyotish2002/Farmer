module.exports = (req, res) => {
  try {
    const vars = {
      GOOGLE_CLIENT_ID_set: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CALLBACK_URL_set: !!process.env.GOOGLE_CALLBACK_URL,
      MONGODB_URI_set: !!process.env.MONGODB_URI,
      JWT_SECRET_set: !!process.env.JWT_SECRET,
      FRONTEND_URL_set: !!process.env.FRONTEND_URL,
      GEMINI_API_KEY_set: !!process.env.GEMINI_API_KEY
    };
    res.setHeader('Cache-Control', 'no-store');
    res.json(vars);
  } catch (err) {
    res.status(500).json({ error: 'debug error', details: String(err) });
  }
};
