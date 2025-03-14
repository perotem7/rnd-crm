const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Google OAuth login route
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // User successfully authenticated with Google
      const { id, emails, displayName, photos } = req.user;
      
      // Check if user exists in database
      let user = await prisma.user.findUnique({
        where: { email: emails[0].value }
      });
      
      // If user doesn't exist, create a new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: emails[0].value,
            name: displayName,
            googleId: id,
            avatar: photos && photos.length > 0 ? photos[0].value : null,
          }
        });
      } else {
        // Update user information if needed
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: id,
            name: displayName,
            avatar: photos && photos.length > 0 ? photos[0].value : null,
          }
        });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth-callback?token=${token}`);
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// Validate token and get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, avatar: true }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 