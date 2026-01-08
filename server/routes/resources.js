import express from 'express';
import Resource from '../models/Resource.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/resources/search
// @desc    Search resources by name, type, or location
// @access  Public
router.get('/search', async (req, res) => {
  const { q, lat, lng } = req.query;

  try {
    let query = {};

    // Filter by name or type
    if (q) {
      // Get rid of special regex characters to prevent errors
      const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeQ, $options: 'i' } }, // not case sensitive
        { type: { $regex: safeQ, $options: 'i' } }
      ];
    }

    // If have user coords, filter by nearest location using mongo's near operator
    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      // Only add location filter if coordinates are valid numbers
      if (!isNaN(latNum) && !isNaN(lngNum)) {
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lngNum, latNum]
            },
            $maxDistance: 5000 // 5km search radius
          }
        };
      }
    }

    const resources = await Resource.find(query).limit(20);
    res.json(resources);
  } catch (error) {
    console.error('Search error:', error);
    
    // Check if the error is due to missing index
    if (error.message && error.message.includes('unable to find index for $geoNear')) {
        return res.status(500).json({ error: 'Database index missing. Please restart the server to build the index.' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get('/', async (req, res) => {
  try {
    const resources = await Resource.find()
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('uploadedBy', 'username')
      .populate('ratings.user', 'username');
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/resources
// @desc    Create a new resource
// @access  Private (requires login)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, type, building, floor, description, coordinates } = req.body;

    const resource = new Resource({
      name,
      type,
      building,
      floor,
      description,
      location: {
        type: 'Point',
        coordinates: coordinates // [longitude, latitude]
      },
      uploadedBy: req.user.userId
    });

    await resource.save();
    
    const populatedResource = await Resource.findById(resource._id)
      .populate('uploadedBy', 'username');

    res.status(201).json({
      message: 'Resource created successfully',
      resource: populatedResource
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update a resource
// @access  Private (must be owner)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if user is the owner
    if (resource.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this resource' });
    }

    const { name, type, building, floor, description, coordinates } = req.body;

    resource.name = name || resource.name;
    resource.type = type || resource.type;
    resource.building = building || resource.building;
    resource.floor = floor || resource.floor;
    resource.description = description || resource.description;
    
    if (coordinates) {
      resource.location.coordinates = coordinates;
    }

    await resource.save();

    res.json({
      message: 'Resource updated successfully',
      resource
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete a resource
// @access  Private (must be owner)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if user is the owner
    if (resource.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this resource' });
    }

    await resource.deleteOne();

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/resources/:id/rate
// @desc    Rate a resource
// @access  Private
router.post('/:id/rate', verifyToken, async (req, res) => {
  try {
    const { rating } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check if user already rated
    const alreadyRated = resource.ratings.find(
      r => r.user.toString() === req.user.userId
    );

    if (alreadyRated) {
      return res.status(400).json({ error: 'You have already rated this resource' });
    }

    resource.ratings.push({
      user: req.user.userId,
      rating
    });

    // Calculate average rating
    const total = resource.ratings.reduce((acc, item) => item.rating + acc, 0);
    resource.averageRating = total / resource.ratings.length;

    await resource.save();

    res.json(resource);
  } catch (error) {
    console.error('Rate resource error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;