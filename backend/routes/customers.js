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

module.exports = router; 