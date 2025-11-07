require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// CORS - Allow all Vercel deployments
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow all Vercel deployments and Render
    if (
      origin.includes('vercel.app') ||
      origin.includes('tatvajains-projects.vercel.app') ||
      origin.includes('onrender.com')
    ) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// Test Route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date() });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err.message));

// Routes
app.get('/', (req, res) => res.json({ message: 'CulturoQuest API' }));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));