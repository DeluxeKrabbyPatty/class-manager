import { userStorage, sessionStorage } from './storage';
import type { User, UserSession } from '@/types/user';

// Simple password hashing (for MVP - in production use proper bcrypt)
function hashPassword(password: string): string {
  // Simple hash for MVP - replace with proper bcrypt in production
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await userStorage.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      name,
      phone,
      createdAt: new Date().toISOString(),
    };

    await userStorage.createUser(newUser);

    // Create session
    const session: UserSession = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };
    await sessionStorage.setCurrentUser(session);

    return { success: true, user: newUser };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to register user' };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserSession; error?: string }> {
  try {
    const user = await userStorage.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid email or password' };
    }

    const session: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    await sessionStorage.setCurrentUser(session);

    return { success: true, user: session };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to login' };
  }
}

export async function logoutUser(): Promise<void> {
  await sessionStorage.clearCurrentUser();
}

export async function getCurrentUser(): Promise<UserSession | null> {
  return await sessionStorage.getCurrentUser();
}

