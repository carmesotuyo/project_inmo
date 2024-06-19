import { NextFunction } from 'express';
import logger from '../config/logger';
import jwt from 'jsonwebtoken';

export const authMiddleware = (allowedRoles?: string[]) => (req: any, res: any, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Login is required' });
      }
      if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
        logger.error(`User ${user.email} with role ${user.role} tried to access a forbidden route`);
        return res.status(403).json({
          message: 'Insufficient permissions.',
        });
      }
      req.user = user;
      next();
    });
  } else {
    logger.error('No token provided: An attempt was made to access a forbidden route');
    res.status(401).json({ error: 'No token provided' });
  }
};
