import { Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, of } from 'rxjs';
import { map, startWith } from 'rxjs';

import { RoomService } from '../../services/room.service';
import { ReservationsService } from '../../services/reservations.service';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

import { Room, States } from '../../interfaces/room';
import { User, userRoles } from '../../interfaces/user';

import { MenuItem } from 'primeng/api';
import { NavbarComponent } from '../navbar/navbar.component';
import { AddRoomComponent } from '../add-room/add-room.component';
import { AddReservationComponent } from '../add-reservation/add-reservation.component';
import { RoomComponent } from '../room/room.component';
import { ButtonModule } from 'primeng/button';
import { ContextMenuModule, ContextMenu } from 'primeng/contextmenu';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';

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
    SelectButtonModule,
    FormsModule,
  ],
  template: `
    <app-navbar></app-navbar>

    <p-toast [life]="1000" position="bottom-right"></p-toast>

    @if(user && (user.role === userRoles.Admin)){
    <app-add-room *ngIf="roomService.isFormOpen"></app-add-room>
    <app-add-reservation
      *ngIf="reservationService.isFormOpen"
    ></app-add-reservation>

    <div class="aux-container">
      <p-selectButton
        [options]="viewingOptions"
        [(ngModel)]="viewingSelection"
        [multiple]="true"
        optionLabel="name"
        optionValue="value"
        (ngModelChange)="filterRooms()"
      />

      <div class="buttons-container">
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
      </div>
    </div>
    } @else {
    <div class="spacer"></div>
    }

    <div class="rooms-container">
      <ng-container *ngIf="filteredRooms$ | async as rooms; else loading">
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

    @if(user && (user.role === userRoles.Admin)){
    <p-contextMenu #cm [model]="items" (onHide)="onHide()"></p-contextMenu>
    }
  `,
  styleUrls: ['./main-page.component.css'],
})
export class MainPageComponent implements OnInit {
  user!: User;
  rooms$!: Observable<Room[]>;
  filteredRooms$!: Observable<Room[]>;
  userRoles = userRoles;
  items: MenuItem[] | undefined;
  selectedRoom: Room | null = null;
  @ViewChild('cm') cm!: ContextMenu;
  viewingSelection: States[] = [];

  constructor(
    protected roomService: RoomService,
    protected reservationService: ReservationsService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getUserProfile(localStorage.getItem('token')!).subscribe({
      next: (user: User) => {
        this.user = user;
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

      this.filteredRooms$ = combineLatest([
        this.rooms$,
        of(this.viewingSelection).pipe(startWith(this.viewingSelection)),
      ]).pipe(
        map(([rooms, viewingSelection]) => {
          if (viewingSelection.length > 0) {
            return rooms.filter((room) =>
              viewingSelection.includes(room.state)
            );
          }
          return rooms;
        })
      );
    }
  }

  filterRooms() {
    this.filteredRooms$ = combineLatest([
      this.rooms$,
      of(this.viewingSelection).pipe(startWith(this.viewingSelection)),
    ]).pipe(
      map(([rooms, viewingSelection]) => {
        if (viewingSelection.length > 0) {
          return rooms.filter((room) => viewingSelection.includes(room.state));
        }
        return rooms;
      })
    );
  }

  trackByRoomId(index: number, room: Room): string {
    return room._id!;
  }

  onContextMenu(event: MouseEvent, room: Room) {
    if (this.user.role === userRoles.Admin) {
      this.selectedRoom = room;
      this.cm.show(event);
    }
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
                severity: 'error',
                summary: 'Error',
                detail: 'Stare nemodificată, eroare',
              });
            },
          });
      }
    }
  }

  viewingOptions: any[] = [
    { name: 'Camere ocupate', value: States.Occupied },
    { name: 'Necesită igienizare', value: States.NeedsCleaning },
    { name: 'Cerere client', value: States.ClientRequest },
  ];
}
