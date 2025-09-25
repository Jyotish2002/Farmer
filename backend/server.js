const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const notificationRoutes = require('./routes/notifications');
const cropRoutes = require('./routes/crop');
const yieldRoutes = require('./routes/yield');
const pestRoutes = require('./routes/pest');
const chatbotRoutes = require('./routes/chatbot');
const adminRoutes = require('./routes/admin');

// Import passport configuration
require('./config/passport');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmer-assistant', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/crop-recommendation', cropRoutes);
app.use('/api/yield-prediction', yieldRoutes);
app.use('/api/pest-detection', pestRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Farmer Assistant API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;