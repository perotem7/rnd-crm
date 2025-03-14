const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, address, notes } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email is already in use
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });
    
    if (existingCustomer) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes,
      },
    });
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, address, notes } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    // Check if email is already in use by another customer
    const existingCustomer = await prisma.customer.findUnique({
      where: { email },
    });
    
    if (existingCustomer && existingCustomer.id !== Number(id)) {
      return res.status(400).json({ error: 'Email already in use by another customer' });
    }
    
    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        company,
        address,
        notes,
      },
    });
    
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.customer.delete({
      where: { id: Number(id) },
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get a customer's products
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = Number(id);

    // Get all customer-product relationships for this customer
    const customerProducts = await prisma.customerProduct.findMany({
      where: { customerId: customerId },
      include: { product: true }
    });

    // Extract only the product data
    const products = customerProducts.map(cp => cp.product);
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching customer products:', error);
    res.status(500).json({ error: 'Failed to fetch customer products' });
  }
});

// Associate products with a customer
router.post('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    const customerId = Number(id);
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array of product IDs' });
    }
    
    console.log(`Associating ${productIds.length} products with customer ${customerId}`);
    
    // Create an array of new records to create
    const customerProductData = productIds.map(productId => ({
      customerId,
      productId: Number(productId)
    }));
    
    // Create the associations in a transaction
    const result = await prisma.$transaction(
      customerProductData.map(data => 
        prisma.customerProduct.upsert({
          where: {
            customerId_productId: {
              customerId: data.customerId,
              productId: data.productId
            }
          },
          update: {}, // No updates needed if it exists
          create: data
        })
      )
    );
    
    // Get the updated list of products for this customer
    const customerProducts = await prisma.customerProduct.findMany({
      where: { customerId },
      include: { product: true }
    });
    
    const products = customerProducts.map(cp => cp.product);
    
    res.json(products);
  } catch (error) {
    console.error('Error associating products with customer:', error);
    res.status(500).json({ error: 'Failed to associate products with customer' });
  }
});

// Remove product associations from a customer
router.post('/:id/products/remove', async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    const customerId = Number(id);
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array of product IDs' });
    }
    
    console.log(`Removing ${productIds.length} product associations from customer ${customerId}`);
    
    // Delete the associations
    await prisma.customerProduct.deleteMany({
      where: {
        customerId,
        productId: { in: productIds.map(id => Number(id)) }
      }
    });
    
    // Get the updated list of products for this customer
    const customerProducts = await prisma.customerProduct.findMany({
      where: { customerId },
      include: { product: true }
    });
    
    const products = customerProducts.map(cp => cp.product);
    
    res.json(products);
  } catch (error) {
    console.error('Error removing product associations from customer:', error);
    res.status(500).json({ error: 'Failed to remove product associations from customer' });
  }
});

// Update all product associations for a customer
router.post('/:id/products/update', async (req, res) => {
  try {
    const { id } = req.params;
    const { productIds } = req.body;
    const customerId = Number(id);
    
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ error: 'productIds must be an array of product IDs' });
    }
    
    console.log(`Updating product associations for customer ${customerId} with ${productIds.length} products`);
    
    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // First, delete all existing associations for this customer
      await tx.customerProduct.deleteMany({
        where: { customerId }
      });
      
      // Then, create the new associations
      if (productIds.length > 0) {
        await tx.customerProduct.createMany({
          data: productIds.map(productId => ({
            customerId,
            productId: Number(productId)
          }))
        });
      }
    });
    
    // Get the updated list of products for this customer
    const customerProducts = await prisma.customerProduct.findMany({
      where: { customerId },
      include: { product: true }
    });
    
    const products = customerProducts.map(cp => cp.product);
    
    res.json(products);
  } catch (error) {
    console.error('Error updating product associations for customer:', error);
    res.status(500).json({ error: 'Failed to update product associations for customer' });
  }
});

module.exports = router; 