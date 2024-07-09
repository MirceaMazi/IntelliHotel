export enum userRoles {
  Admin = 'Admin',
  Maid = 'Personal menajer',
  Client = 'Client',
}

export interface User {
  id?: string;
  username: string;
  email?: string;
  password: string;
}
