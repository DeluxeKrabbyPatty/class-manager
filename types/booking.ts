export interface Booking {
  id: string;
  userId: string;
  classId: string;
  classDate: string; // ISO date string
  status: 'pending' | 'confirmed' | 'cancelled';
  waiverSigned: boolean;
  waiverSignature?: string; // base64 or data URL
  waiverSignedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'free' | 'refunded';
  isFirstClass: boolean;
  createdAt: string;
  cancelledAt?: string;
}

export interface WaiverSignature {
  userId: string;
  classId: string;
  signatureData: string; // base64 or data URL
  timestamp: string;
}

