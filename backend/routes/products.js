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
    const { name, description, price, sku, category, stockLevel } = req.body;
    
    // Validation
    if (!name || !price || !sku) {
      return res.status(400).json({ error: 'Name, price, and SKU are required' });
    }
    
    // Check if SKU is already in use
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });
    
    if (existingProduct) {
      return res.status(400).json({ error: 'SKU already in use' });
    }
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        sku,
        category,
        stockLevel: stockLevel ? parseInt(stockLevel) : 0,
      },
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update a product
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, sku, category, stockLevel } = req.body;
    
    // Validation
    if (!name || !price || !sku) {
      return res.status(400).json({ error: 'Name, price, and SKU are required' });
    }
    
    // Check if SKU is already in use by another product
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });
    
    if (existingProduct && existingProduct.id !== Number(id)) {
      return res.status(400).json({ error: 'SKU already in use by another product' });
    }
    
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        sku,
        category,
        stockLevel: stockLevel ? parseInt(stockLevel) : 0,
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