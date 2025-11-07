require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middleware FIRST - Allow all your Vercel deployments
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Allow any Vercel deployment under your account
    const allowedPattern = /^https:\/\/.*\.tatvajains-projects\.vercel\.app$/;
    
    if (allowedPattern.test(origin) || origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// 2. Test Route SECOND
app.get('/test-db', async (req, res) => {
  res.json({ 
    message: "Server is running!",
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 3. Database Connection THIRD - Better error handling
mongoose
  .connect(process.env.MONGO_URI) // or MONGODB_URI - check your .env file
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('Check your .env file has MONGO_URI set correctly');
  });

// 4. Other Routes LAST
app.get('/', (req, res) => res.json({ message: 'CulturoQuest API Running' }));

// Check if routes file exists
try {
  app.use('/api/users', require('./routes/userRoutes'));
} catch (error) {
  console.error('❌ Error loading userRoutes:', error.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});