import { Client } from './client';

export interface Rating {
  _id?: string;
  numOfStars: number;
  details?: string;
  client: Client;
}
