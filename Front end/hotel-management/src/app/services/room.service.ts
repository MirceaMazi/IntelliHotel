import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { BACK_URL } from '../const';
import { Subject } from 'rxjs';
import { map, of } from 'rxjs';

import { ReservationsService } from './reservations.service';

import { Room } from '../interfaces/room';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private roomURL = `${BACK_URL}/api/rooms`;
  rooms: Room[] = [];
  private roomsChangedSubject = new Subject<void>();
  roomsChanged$ = this.roomsChangedSubject.asObservable();

  isFormOpen: boolean = false;
  roomToEdit: Room | null = null;

  constructor(
    private reservationsService: ReservationsService,
    private http: HttpClient
  ) {}

  toggleRoomForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  getAllRooms(token: string): Observable<Room[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.roomURL}/`, { headers });
  }

  getRoomById(token: string, id: string): Observable<Room> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.roomURL}/${id}`, { headers });
  }

  createRoom(token: string, roomData: Room): Observable<Room> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Room>(`${this.roomURL}/`, roomData, { headers });
  }

  editRoom(token: string, id: string, roomData: Room): Observable<Room> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<Room>(`${this.roomURL}/${id}`, roomData, { headers });
  }

  deleteRoom(token: string, id: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.roomURL}/${id}`, { headers });
  }

  loadAllRooms(token: string): void {
    const observer = {
      next: (rooms: Room[]) => {
        this.rooms = rooms;
      },
      error: (err: any) => {
        console.error('Failed to load rooms:', err);
      },
    };

    this.getAllRooms(token).subscribe(observer);
  }

  //Returns all the rooms that are currently reserved
  //Based on time and date of browser
  getCurrentlyReservedRooms(): Observable<Room[]> {
    const token = localStorage.getItem('token')!;
    this.loadAllRooms(token);
    const rooms = this.rooms;

    return this.reservationsService.getAllReservations(token).pipe(
      map((reservations) => {
        const currentReservations = reservations;
        const currentDate = new Date();
        let reservedRoomIds = new Set<string>();

        currentReservations?.forEach((reservation) => {
          if (
            new Date(reservation.startDate) <= currentDate &&
            new Date(reservation.endDate) >= currentDate
          ) {
            reservation.rooms.forEach((room) => {
              reservedRoomIds.add(room._id!);
            });
          }
        });

        return rooms.filter((room) => reservedRoomIds.has(room._id!));
      })
    );
  }

  //Returns the available rooms inside a given range
  getAvailableRooms(startDate: Date, endDate: Date): Observable<Room[]> {
    const token = localStorage.getItem('token')!;
    this.loadAllRooms(token);

    if (startDate !== null && endDate !== null) {
      const rooms = this.rooms;

      return this.reservationsService.getAllReservations(token).pipe(
        map((reservations) => {
          const reservedRoomIds = new Set<string>();

          reservations.forEach((reservation) => {
            if (
              new Date(reservation.startDate) <= endDate &&
              new Date(reservation.endDate) >= startDate
            ) {
              reservation.rooms.forEach((room) =>
                reservedRoomIds.add(room._id!)
              );
            }
          });

          return rooms.filter((room) => !reservedRoomIds.has(room._id!));
        })
      );
    } else {
      return of([]); // Return an empty observable array if dates are invalid
    }
  }

  notifyRoomsChanged() {
    this.roomsChangedSubject.next();
  }

  //This logic manages the modify option of a room
  //(changing the data of an already existing room)
  setRoomToEdit(room: Room) {
    this.roomToEdit = room;
  }

  getRoomToEdit(): Room | null {
    return this.roomToEdit;
  }

  clearRoomToEdit() {
    this.roomToEdit = null;
  }
}
