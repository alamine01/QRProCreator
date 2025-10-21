import { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  name: string;
  description: string;
  date: Timestamp;
  location: string;
  type: 'with_preregistration' | 'without_preregistration';
  ownerId: string;
  collaborators: string[];
  formConfig: EventFormConfig;
  qrCode: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface EventFormConfig {
  fields: FormField[];
  colors: EventColors;
  logo?: string;
  welcomeMessage?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select';
  required: boolean;
  placeholder?: string;
  options?: string[]; // Pour les champs select
}

export interface EventColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface EventCheckin {
  id: string;
  eventId: string;
  guestInfo: Record<string, any>;
  checkedInAt: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}

export interface EventStats {
  totalCheckins: number;
  checkinsByHour: Record<string, number>;
  checkinsByDate: Record<string, number>;
  averageCheckinTime: number;
  averageCheckinsPerHour: number;
  peakHour: string;
}

export interface EventGuest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  company?: string;
  checkedInAt: Timestamp;
  customFields?: Record<string, any>;
}

export interface CreateEventData {
  name: string;
  description: string;
  date: Date;
  location: string;
  type: 'with_preregistration' | 'without_preregistration';
  ownerId: string;
  collaborators?: string[];
  formConfig: EventFormConfig;
}

export interface UpdateEventData {
  name?: string;
  description?: string;
  date?: Date;
  location?: string;
  type?: 'with_preregistration' | 'without_preregistration';
  collaborators?: string[];
  formConfig?: EventFormConfig;
  isActive?: boolean;
}

export interface CheckinData {
  eventId: string;
  guestInfo: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
