import type { Class } from '@/types/class';

export const DEFAULT_CLASS: Class = {
  id: 'weekly-dance-class',
  name: 'Weekly Dance Class',
  description: 'Join us for an energizing dance class every week!',
  time: '18:00', // 6:00 PM
  dayOfWeek: 1, // Monday (0 = Sunday, 1 = Monday)
  duration: 60, // 60 minutes
  location: 'Dance Studio',
  address: '123 Main Street, City, State 12345',
  price: 25.00,
  capacity: 20,
  whatToExpect: [
    'Warm-up and stretching',
    'Dance technique instruction',
    'Choreography practice',
    'Cool-down and stretching',
    'Fun and supportive environment',
  ],
};

// Helper function to get next class date
export function getNextClassDate(): Date {
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilNext = (DEFAULT_CLASS.dayOfWeek - currentDay + 7) % 7 || 7;
  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntilNext);
  nextDate.setHours(
    parseInt(DEFAULT_CLASS.time.split(':')[0]),
    parseInt(DEFAULT_CLASS.time.split(':')[1]),
    0,
    0
  );
  return nextDate;
}

// Helper function to format class date
export function formatClassDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

