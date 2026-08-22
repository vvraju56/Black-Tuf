import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../config/index';
import { JwtPayload, UserRole } from '../types/index';

interface SignTokensArgs {
  id: string;
  role: UserRole;
  sellerId?: string;
}

export const signAccessToken = (payload: SignTokensArgs): string => {
  const signPayload: JwtPayload = {
    id: payload.id,
    role: payload.role,
    ...(payload.sellerId ? { sellerId: payload.sellerId } : {}),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  };
  return jwt.sign(signPayload, config.jwtSecret);
};

export const signRefreshToken = (payload: SignTokensArgs): string => {
  const signPayload: JwtPayload = {
    id: payload.id,
    role: payload.role,
    ...(payload.sellerId ? { sellerId: payload.sellerId } : {}),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
  };
  return jwt.sign(signPayload, config.jwtRefreshSecret);
};

export const signTokens = (payload: SignTokensArgs): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (candidate: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(candidate, hash);
};

export const tokenCookieOptions = (httpOnly = true) => ({
  httpOnly,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000
});

export const refreshTokenCookieOptions = (httpOnly = true) => ({
  httpOnly,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000
});


