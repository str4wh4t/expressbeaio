import jwt from 'jsonwebtoken';
import { Permission, Role, User, Unit } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Ambil secret dari environment

export interface JwtPayload {
  userId: number;
  roles: string[];
  selectedRole: Role | null;
  selectedUnit: Unit | null;
  permissions: string[];
}

/**
 * Fungsi untuk menghasilkan JWT token
 * @param payload - Payload yang berisi userId dan informasi lain
 * @param expiresIn - Durasi token berlaku (default: '1h')
 * @returns string - Token JWT
 */
export const generateToken = (payload: JwtPayload, expiresIn: string = '1h'): string => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn });
  return token;
};

/**
 * Fungsi untuk memverifikasi JWT token, dan memeriksa apakah token disertakan dengan Bearer
 * @param authorizationHeader - Header Authorization yang berisi Bearer token
 * @returns JwtPayload - Payload yang didekode jika token valid
 * @throws Error - Jika token tidak valid atau format salah
 */
export const verifyToken = (authorizationHeader: string): JwtPayload => {
  if (!authorizationHeader) {
    throw new Error('Authorization header missing');
  }

  let token: string;

  // Cek apakah format "Bearer <token>" dipakai atau hanya token
  if (authorizationHeader.startsWith('Bearer ')) {
    token = authorizationHeader.split(' ')[1];
  } else {
    token = authorizationHeader;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token : ' + error);
  }
};
