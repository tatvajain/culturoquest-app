require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. Middleware 
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow your production domain and all Vercel preview deployments
    if (
      origin.endsWith('.vercel.app') || 
      origin === 'https://culturoquest.vercel.app'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// 2. Test Route SECOND (Must be before any protected routes)
app.get('/test-db', async (req, res) => {
  res.json({ message: "If you see this, the server is updated!" });
});

// 3. Database Connection THIRD
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

// 4. Other Routes LAST
app.get('/', (req, res) => res.json({ message: 'API Root' }));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));