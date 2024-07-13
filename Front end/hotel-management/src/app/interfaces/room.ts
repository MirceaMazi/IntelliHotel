import { Reservation } from './reservation';

export enum States {
  Free = 'Cameră liberă',
  Occupied = 'Cameră ocupată',
  NeedsCleaning = 'Necesită igienizare',
  IsBeingCleaned = 'În curs de igienizare',
  ClientRequest = 'Cerere client',
}

export interface Room {
  _id?: string;
  name: string;
  type: string;
  details?: string;
  state: States;
  currentReservation?: Reservation | null;
}
