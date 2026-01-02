export interface Class {
  id: string;
  name: string;
  description: string;
  time: string; // e.g., "18:00"
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  duration: number; // in minutes
  location: string;
  address: string;
  price: number;
  capacity: number;
  whatToExpect: string[];
}

export interface WeeklyClass {
  classId: string;
  date: string; // ISO date string
  availableSpots: number;
}

