require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// UPDATED CORS - Allow all Vercel deployments
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all Vercel deployments
    if (
      origin.includes('tatvajains-projects.vercel.app') ||
      origin.includes('vercel.app') ||
      origin === 'http://localhost:3000' ||
      origin === 'http://localhost:5173'
    ) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test Route
app.get('/test-db', async (req, res) => {
  res.json({ 
    message: "Server is running!",
    mongoStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Routes
app.get('/', (req, res) => res.json({ message: 'CulturoQuest API Running' }));

try {
  app.use('/api/users', require('./routes/userRoutes'));
} catch (error) {
  console.error('❌ Error loading userRoutes:', error.message);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});