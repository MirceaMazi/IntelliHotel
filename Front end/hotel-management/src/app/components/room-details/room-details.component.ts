import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { RoomService } from '../../services/room.service';
import { ReservationsService } from '../../services/reservations.service';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

import { Room, States } from '../../interfaces/room';
import { Reservation } from '../../interfaces/reservation';
import { Client } from '../../interfaces/client';
import { Observable, combineLatest } from 'rxjs';
import { User, userRoles } from '../../interfaces/user';

import { FieldsetModule } from 'primeng/fieldset';
import { NavbarComponent } from '../navbar/navbar.component';
import { ButtonModule } from 'primeng/button';
import { AddClientComponent } from '../add-client/add-client.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [
    FieldsetModule,
    CommonModule,
    NavbarComponent,
    ButtonModule,
    AddClientComponent,
    ToastModule,
  ],
  template: `
    <app-navbar></app-navbar>

    <p-toast [life]="1000" position="bottom-right"></p-toast>

    <div *ngIf="room$ | async as room">
      <p-fieldset legend="Detalii cameră">
        <div class="field-element">
          <p class="field-title">Nume cameră:&nbsp;</p>
          <p>{{ room.name }}</p>
        </div>
        <div class="field-element">
          <p class="field-title">Tip cameră:&nbsp;</p>
          <p>{{ room.type }}</p>
        </div>
        <div class="field-element">
          <p class="field-title">Stare cameră:&nbsp;</p>
          <p>{{ room.state }}</p>
        </div>
        <div *ngIf="room.details" class="field-element">
          <p class="field-title">Detalii cameră:&nbsp;</p>
          <p>{{ room.details }}</p>
        </div>

        <p-button
          *ngIf="
            room.state === states.ClientRequest ||
            room.state === states.NeedsCleaning
          "
          label="Marchează începutul curățienie"
          [raised]="true"
          styleClass="state-btn"
          (click)="changeRoomCleaningState(room)"
        ></p-button>

        <p-button
          *ngIf="room.state === states.IsBeingCleaned"
          label="Marchează terminarea curățienie"
          [raised]="true"
          styleClass="state-btn"
          (click)="changeRoomCleaningState(room)"
        ></p-button>
      </p-fieldset>

      <p-fieldset legend="Detalii cazare">
        <div *ngIf="room.currentReservation; else noReservation">
          @if(this.clientService.isFormOpen){
          <app-add-client
            [reservations]="[room.currentReservation]"
          ></app-add-client>
          }

          <div class="field-element">
            <p class="field-title">Nume persoană:&nbsp;</p>
            <p>{{ room.currentReservation.name }}</p>
          </div>
          <div class="field-element">
            <p class="field-title">Durată sejur:&nbsp;</p>
            <p>
              {{ room.currentReservation.startDate | date : 'shortDate' }} -
              {{ room.currentReservation.endDate | date : 'shortDate' }}
            </p>
          </div>

          @if(user.role === userRoles.Admin){
          <p-button
            *ngIf="room.state === states.Free"
            label="Check-in"
            [raised]="true"
            styleClass="state-btn"
            (click)="clientService.toggleClientForm()"
          ></p-button>

          <p-button
            *ngIf="room.state === states.Occupied"
            label="Check-out"
            [raised]="true"
            styleClass="state-btn"
            (click)="doCheckOut(room)"
          ></p-button>
          }
        </div>
        <ng-template #noReservation>
          <div class="field-element">
            <p class="field-title">Stare cameră:&nbsp;</p>
            <p>Nu există o cazare activă</p>
          </div>
        </ng-template>
      </p-fieldset>
    </div>
  `,
  styleUrls: ['./room-details.component.css'],
})
export class RoomDetailsComponent {
  user!: User;
  userRoles = userRoles;
  room$!: Observable<Room>;
  reservations!: Reservation[];
  states = States;
  client: Client | null = null;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private reservationsService: ReservationsService,
    protected clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getUserProfile(localStorage.getItem('token')!).subscribe({
      next: (user: User) => {
        this.user = user;
      },
    });

    this.loadRoomDetails();

    this.roomService.roomsChanged$.subscribe(() => {
      setTimeout(() => {
        this.loadRoomDetails();
      }, 500);
    });
  }

  loadRoomDetails() {
    const roomId = this.route.snapshot.params['id'];
    const token = localStorage.getItem('token');

    if (token) {
      this.room$ = this.roomService.getRoomById(token, roomId);

      combineLatest([
        this.room$,
        this.reservationsService.getAllReservations(token),
      ]).subscribe(([room, reservations]) => {
        this.reservations = reservations.filter((reservation) =>
          reservation.rooms.some((r) => r._id === room._id)
        );

        room.currentReservation = this.findClosestReservation(room);
      });
    }
  }

  findClosestReservation(room: Room) {
    if (
      this.reservations &&
      this.reservations.length > 0 &&
      !room.currentReservation
    ) {
      const token = localStorage.getItem('token')!;

      const currentDate = new Date();
      let closestReservation: Reservation | null = null;
      let closestDifference = Infinity;

      for (let reservation of this.reservations) {
        let startDate = new Date(reservation.startDate);
        let endDate = new Date(reservation.endDate);

        if (currentDate > startDate && currentDate < endDate) {
          room.currentReservation = reservation;
          this.roomService.editRoom(token, room._id!, room).subscribe();
          return reservation;
        }

        if (startDate > currentDate) {
          let dateDifference = Math.abs(
            currentDate.getTime() - startDate.getTime()
          );

          if (dateDifference < closestDifference) {
            closestDifference = dateDifference;
            closestReservation = reservation;
          }
        }
      }

      room.currentReservation = closestReservation!;
      this.roomService.editRoom(token, room._id!, room).subscribe();
      return closestReservation;
    }
    return null;
  }

  changeRoomCleaningState(room: Room) {
    if (
      room.state === this.states.ClientRequest ||
      room.state === this.states.NeedsCleaning
    ) {
      room.state = this.states.IsBeingCleaned;
    } else if (room.state === this.states.IsBeingCleaned) {
      const currentDate = new Date();
      console.log(room.currentReservation);
      if (
        room.currentReservation &&
        new Date(room.currentReservation.startDate) <= currentDate &&
        new Date(room.currentReservation.endDate) >= currentDate
      ) {
        room.state = this.states.Occupied;
      } else {
        room.state = this.states.Free;
      }
    }

    const token = localStorage.getItem('token');
    if (token) {
      this.roomService.editRoom(token, room._id!, room).subscribe();
    }
  }

  doCheckOut(room: Room) {
    const token = localStorage.getItem('token')!;

    if (room.currentReservation) {
      this.reservations = this.reservations
        .sort((a, b) => {
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        })
        .filter((reservation) =>
          reservation.rooms.some((r) => r._id === room._id)
        );

      room.currentReservation.rooms.forEach((reservedRoom) => {
        // @ts-ignore
        this.roomService.getRoomById(token, reservedRoom).subscribe({
          next: (updatedRoom) => {
            const currentIndex = this.reservations.findIndex(
              (reservation) => reservation._id === room.currentReservation?._id
            );

            if (
              currentIndex !== -1 &&
              currentIndex < this.reservations.length - 1
            ) {
              const nextReservation = this.reservations[currentIndex + 1];

              updatedRoom.state = States.NeedsCleaning;
              updatedRoom.currentReservation = nextReservation;
              this.roomService
                .editRoom(token, updatedRoom._id!, updatedRoom)
                .subscribe();
            } else {
              updatedRoom.state = States.NeedsCleaning;
              updatedRoom.currentReservation = null;
              this.roomService
                .editRoom(token, updatedRoom._id!, updatedRoom)
                .subscribe();
            }
          },
        });
      });

      this.roomService.notifyRoomsChanged();
    }
  }
}
