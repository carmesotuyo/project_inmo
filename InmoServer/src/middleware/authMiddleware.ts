import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const checkRole = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

      if (decoded.role !== requiredRole) {
        return res.status(403).json({ error: 'Access denied' });
      }

      req.user = decoded;
      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
};