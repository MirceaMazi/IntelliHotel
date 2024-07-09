import { Reservation } from './reservation';

export interface Client {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  cnp: string;
  reservations: Reservation[];
}
