import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';
import { UnauthorizedError, ForbiddenError } from '../utils/ApiError';
import type { UserRole, JwtPayload } from '../types/index';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    sellerId?: string;
  };
}

export const protect = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

  if (!token) {
    return next(new UnauthorizedError('Not authorized. Please log in.'));
  }

  try {
    const decoded = verifyAccessToken(token) as JwtPayload;
    req.user = {
      id: decoded.id,
      role: decoded.role,
      sellerId: decoded.sellerId
    };
    next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token.'));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action.'));
    }
    next();
  };
};

export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = verifyAccessToken(token) as JwtPayload;
      req.user = {
        id: decoded.id,
        role: decoded.role,
        sellerId: decoded.sellerId
      };
    } catch {
      // ignore - keep user undefined for guests
    }
  }
  next();
};


