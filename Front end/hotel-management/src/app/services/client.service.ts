import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACK_URL } from '../const';

import { Client } from '../interfaces/client';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private clientURL = `${BACK_URL}/api/clients`;
  isFormOpen: boolean = false;
  clientToEdit: Client | null = null;

  constructor(private http: HttpClient) {}

  toggleClientForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  getAllClients(token: string): Observable<Client[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.clientURL}/`, { headers });
  }

  getClientById(token: string, id: string): Observable<Client> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.clientURL}/${id}`, { headers });
  }

  createClient(token: string, clientData: Client): Observable<Client> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Client>(`${this.clientURL}/`, clientData, {
      headers,
    });
  }

  editClient(
    token: string,
    id: string,
    clientData: Client
  ): Observable<Client> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Client>(`${this.clientURL}/${id}`, clientData, {
      headers,
    });
  }

  //This logic manages the modify option of a room
  //(changing the data of an already existing room)
  setClientToEdit(client: Client) {
    this.clientToEdit = client;
  }

  getClientToEdit(): Client | null {
    return this.clientToEdit;
  }

  clearClientToEdit() {
    this.clientToEdit = null;
  }
}
