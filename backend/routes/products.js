const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create a new product
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('Creating product with request body:', req.body);
    const { name, description } = req.body;
    
    // Validation
    if (!name) {
      console.log('Validation failed: Name is required');
      return res.status(400).json({ error: 'Name is required' });
    }
    
    console.log('Attempting to create product with data:', { name, description });
    const product = await prisma.product.create({
      data: {
        name,
        description,
      },
    });
    
    console.log('Product created successfully:', product);
    res.status(201).json(product);
  } catch (error) {
    console.error('Detailed error creating product:', error);
    res.status(500).json({ error: 'Failed to create product: ' + error.message });
  }
});

// Update a product
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    // Validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
      },
    });
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id: Number(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router; 