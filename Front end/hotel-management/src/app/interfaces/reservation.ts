import { Room } from './room';

export interface Reservation {
  _id?: string;
  name: string;
  rooms: Room[];
  startDate: Date;
  endDate: Date;
}
