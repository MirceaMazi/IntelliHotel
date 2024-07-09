import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs';

import { RoomService } from '../../services/room.service';
import { ReservationsService } from '../../services/reservations.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

import { Room, States } from '../../interfaces/room';

import { MenuItem } from 'primeng/api';
import { NavbarComponent } from '../navbar/navbar.component';
import { AddRoomComponent } from '../add-room/add-room.component';
import { AddReservationComponent } from '../add-reservation/add-reservation.component';
import { RoomComponent } from '../room/room.component';
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule, ContextMenu } from 'primeng/contextmenu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    RoomComponent,
    NavbarComponent,
    AddRoomComponent,
    ButtonModule,
    ContextMenuModule,
    AddReservationComponent,
    ToastModule,
  ],
  template: `
    <app-navbar></app-navbar>

    <p-toast [life]="1000" position="bottom-right"></p-toast>

    <app-add-room *ngIf="roomService.isFormOpen"></app-add-room>
    <app-add-reservation
      *ngIf="reservationService.isFormOpen"
    ></app-add-reservation>

    <p-button
      label="Adaugă cameră"
      [raised]="true"
      icon="pi pi-plus"
      iconPos="right"
      styleClass="first-btn"
      (click)="this.roomService.toggleRoomForm()"
    ></p-button>

    <p-button
      label="Adaugă rezervare"
      [raised]="true"
      icon="pi pi-plus"
      iconPos="right"
      styleClass="nth-btn"
      (click)="this.reservationService.toggleReservationForm()"
    ></p-button>

    <div class="rooms-container">
      <ng-container *ngIf="rooms$ | async as rooms; else loading">
        <app-room
          *ngFor="let room of rooms; trackBy: trackByRoomId"
          [room]="room"
          (contextmenu)="onContextMenu($event, room)"
        ></app-room>
      </ng-container>
      <ng-template #loading>
        <p>Loading rooms...</p>
      </ng-template>
    </div>

    <p-contextMenu #cm [model]="items" (onHide)="onHide()"></p-contextMenu>
  `,
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  user: any;
  rooms$!: Observable<Room[]>;
  items: MenuItem[] | undefined;
  selectedRoom: Room | null = null;
  @ViewChild('cm') cm!: ContextMenu;

  constructor(
    protected roomService: RoomService,
    protected reservationService: ReservationsService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getUserProfile(localStorage.getItem('token')!).subscribe({
      next: (user) => {
        console.log(user);
      },
    });

    this.loadRooms();

    this.items = [
      {
        label: 'Șterge',
        icon: 'pi pi-trash',
        command: () => this.deleteRoom(),
      },
      {
        label: 'Modifică',
        icon: 'pi pi-pen-to-square',
        command: () => this.editRoom(),
      },
      {
        label: 'Stare',
        icon: 'pi pi-bolt',
        items: [
          {
            label: 'Curs igienizare',
            icon: 'pi pi-spinner',
            command: () => this.changeRoomState(States.IsBeingCleaned),
          },
          {
            label: 'Cerere client',
            icon: 'pi pi-exclamation-circle',
            command: () => this.changeRoomState(States.ClientRequest),
          },
        ],
      },
    ];

    this.roomService.roomsChanged$.subscribe(() => {
      this.loadRooms();
    });
  }

  loadRooms() {
    const token = localStorage.getItem('token');
    if (token) {
      this.rooms$ = this.roomService
        .getAllRooms(token)
        .pipe(
          map((rooms) => rooms.sort((a, b) => a.name.localeCompare(b.name)))
        );
    }
  }

  trackByRoomId(index: number, room: Room): string {
    return room._id!;
  }

  onContextMenu(event: MouseEvent, room: Room) {
    this.selectedRoom = room;
    this.cm.show(event);
  }

  onHide() {
    this.selectedRoom = null;
  }

  private deleteRoom() {
    if (this.selectedRoom) {
      const token = localStorage.getItem('token');
      if (token) {
        this.roomService
          .deleteRoom(token, this.selectedRoom._id!)
          .subscribe(() => {
            this.loadRooms(); // Refresh the list after deletion
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: 'Camera a fost eliminată',
            });
            this.selectedRoom = null; // Clear the selection after deletion
          });
      }
    }
  }

  private editRoom() {
    if (this.selectedRoom) {
      this.roomService.setRoomToEdit(this.selectedRoom);
      this.roomService.toggleRoomForm();
    }
  }

  private changeRoomState(state: States) {
    if (this.selectedRoom) {
      const token = localStorage.getItem('token');
      if (token) {
        this.selectedRoom.state = state;
        this.roomService
          .editRoom(token, this.selectedRoom._id!, this.selectedRoom)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'info',
                summary: 'Success',
                detail: 'Stare modificată',
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'info',
                summary: 'Success',
                detail: 'Stare nemodificată, eroare',
              });
            },
          });
      }
    }
  }
}
