export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

