import express from 'express';
import Resource from '../models/Resource.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

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

export default router;