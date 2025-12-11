import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User';
import { AppError } from '../middleware/errorHandler';
import { authRateLimit } from '../middleware/rateLimiter';

const router = Router();
router.use(authRateLimit);

const JWT_SECRET = process.env.JWT_SECRET || 'setly-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d';

/**
 * POST /api/auth/register
 * Register new user with email/password
 */
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { email, password, name, photoUrl } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      throw new AppError(400, 'Email, password, and name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new AppError(400, 'Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Generate userId
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Detect domain type
    const isEduEmail = email.endsWith('.edu');
    const domainVerified = isEduEmail;
    const domainType = isEduEmail ? 'university' : null;

    // Create user
    const user = new User({
      userId,
      email,
      password, // Will be hashed by pre-save hook
      name,
      photoUrl: photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=6366f1&color=fff`,
      verified: false,
      emailVerified: false,
      phoneVerified: false,
      domainVerified,
      domainType,
      savedRooms: [],
      savedRides: [],
      savedMarketplace: [],
      profileVisibility: {
        about: true,
        travelHistory: true,
        reviews: true,
        interests: true,
        connections: true,
        verification: true
      },
      isProfileComplete: false,
      lastLoginAt: new Date()
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({
      user: userObject,
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check if user has a password (OAuth users might not)
    if (!user.password) {
      throw new AppError(401, 'This account uses social login. Please sign in with Google, Microsoft, or Facebook.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    res.json({
      user: userObject,
      token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/verify-token
 * Verify JWT token and return user
 */
router.post('/verify-token', async (req: Request, res: Response, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError(400, 'Token is required');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    // Find user
    const user = await User.findOne({ userId: decoded.userId });
    if (!user) {
      throw new AppError(401, 'Invalid token - user not found');
    }

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    res.json({
      user: userObject,
      valid: true
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
});

/**
 * POST /api/auth/change-password
 * Change user password (requires valid token)
 */
router.post('/change-password', async (req: Request, res: Response, next) => {
  try {
    const { token, currentPassword, newPassword } = req.body;

    if (!token || !currentPassword || !newPassword) {
      throw new AppError(400, 'Token, current password, and new password are required');
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      throw new AppError(400, 'New password must be at least 8 characters');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Find user with password
    const user = await User.findOne({ userId: decoded.userId }).select('+password');
    if (!user || !user.password) {
      throw new AppError(404, 'User not found or does not have a password');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
});

export default router;
