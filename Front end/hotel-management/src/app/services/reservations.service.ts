import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BACK_URL } from '../const';

import { Reservation } from '../interfaces/reservation';
import { States } from '../interfaces/room';

@Injectable({
  providedIn: 'root',
})
export class ReservationsService {
  private reservationURL = `${BACK_URL}/api/reservations`;
  private reservationSubject = new Subject<void>();
  reservationChanges$ = this.reservationSubject.asObservable();
  isFormOpen: boolean = false;
  reservations: Reservation[] = [];

  constructor(private http: HttpClient) {}

  toggleReservationForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  getAllReservations(token: string): Observable<Reservation[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.reservationURL}/`, { headers });
  }

  getReservationById(
    token: string,
    id: string
  ): Observable<Reservation | undefined> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.reservationURL}/${id}`, { headers });
  }

  addReservation(
    token: string,
    reservation: Reservation
  ): Observable<Reservation> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Reservation>(this.reservationURL, reservation, {
      headers,
    });
  }

  deleteReservation(token: string, id: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.reservationURL}/${id}`, { headers });
  }
}
