import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT =
  (allowedRoles?: string[]) => (req: any, res: any, next: NextFunction) => {
    const authHeader = req.headers.authorization;



    if (authHeader) {
      const token = authHeader.split(" ")[1];

      jwt.verify(token, process.env.JWT_SECRET! , (err: any, user: any) => {
        if (err) {
          return res.status(403).json({ error: 'Access denied' });
        }

        if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
          return res.status(403).json({
            message: "Insufficient permissions.",
          });
        }

        req.user = user;
        next();
      });
    } else {
      res.status(401).json({ error: 'No token provided' });
    }
  };