require('dotenv').config(); // Load the secret .env variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// 2. Define a Simple Schema (Temporary)
const ResourceSchema = new mongoose.Schema({
  name: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [Longitude, Latitude]
  }
});
const Resource = mongoose.model('Resource', ResourceSchema);

// 3. Routes
app.get('/', (req, res) => {
  res.send('API is Running!');
});

// Test Route to Add Data
app.post('/api/test', async (req, res) => {
  try {
    const newResource = new Resource({
      name: "UNSW Main Library Toilet",
      location: { type: "Point", coordinates: [151.23, -33.91] }
    });
    await newResource.save();
    res.json(newResource);
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});