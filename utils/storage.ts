import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERS: 'users',
  BOOKINGS: 'bookings',
  CURRENT_USER: 'current_user',
  CLASSES: 'classes',
} as const;

// Generic storage helpers
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key}:`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

// User storage
export const userStorage = {
  async getAllUsers() {
    return (await storage.get<any[]>(STORAGE_KEYS.USERS)) || [];
  },

  async getUserById(id: string) {
    const users = await userStorage.getAllUsers();
    return users.find((u) => u.id === id) || null;
  },

  async getUserByEmail(email: string) {
    const users = await userStorage.getAllUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async createUser(user: any) {
    const users = await userStorage.getAllUsers();
    users.push(user);
    await storage.set(STORAGE_KEYS.USERS, users);
    return user;
  },

  async updateUser(id: string, updates: Partial<any>) {
    const users = await userStorage.getAllUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await storage.set(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    return null;
  },
};

// Booking storage
export const bookingStorage = {
  async getAllBookings() {
    return (await storage.get<any[]>(STORAGE_KEYS.BOOKINGS)) || [];
  },

  async getBookingsByUserId(userId: string) {
    const bookings = await bookingStorage.getAllBookings();
    return bookings.filter((b) => b.userId === userId);
  },

  async getBookingById(id: string) {
    const bookings = await bookingStorage.getAllBookings();
    return bookings.find((b) => b.id === id) || null;
  },

  async createBooking(booking: any) {
    const bookings = await bookingStorage.getAllBookings();
    bookings.push(booking);
    await storage.set(STORAGE_KEYS.BOOKINGS, bookings);
    return booking;
  },

  async updateBooking(id: string, updates: Partial<any>) {
    const bookings = await bookingStorage.getAllBookings();
    const index = bookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      await storage.set(STORAGE_KEYS.BOOKINGS, bookings);
      return bookings[index];
    }
    return null;
  },

  async cancelBooking(id: string) {
    return bookingStorage.updateBooking(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });
  },
};

// Session storage
export const sessionStorage = {
  async getCurrentUser() {
    return await storage.get<any>(STORAGE_KEYS.CURRENT_USER);
  },

  async setCurrentUser(user: any) {
    await storage.set(STORAGE_KEYS.CURRENT_USER, user);
  },

  async clearCurrentUser() {
    await storage.remove(STORAGE_KEYS.CURRENT_USER);
  },
};

// Class storage
export const classStorage = {
  async getClasses() {
    return (await storage.get<any[]>(STORAGE_KEYS.CLASSES)) || [];
  },

  async getClassById(id: string) {
    const classes = await classStorage.getClasses();
    return classes.find((c) => c.id === id) || null;
  },

  async setClasses(classes: any[]) {
    await storage.set(STORAGE_KEYS.CLASSES, classes);
  },
};

