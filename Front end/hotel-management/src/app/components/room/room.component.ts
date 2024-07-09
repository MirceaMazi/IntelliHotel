import { Component, Input, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { RoomService } from '../../services/room.service';

import { Room, States } from '../../interfaces/room';

import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ReservationsService } from '../../services/reservations.service';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CardModule, RouterLink, RouterOutlet, RippleModule, BadgeModule],
  template: `
    @if(room){
    <!-- This extra div is needed for the ripple effect, and the badge -->
    <div pRipple [routerLink]="['/rooms', room._id]">
      @if(room.state === states.ClientRequest){
      <p-badge [value]="'!'" badgeSize="large" styleClass="danger" />
      }@else if (room.state === states.NeedsCleaning) {
      <p-badge [value]="'!'" badgeSize="large" styleClass="warning" />
      }
      <p-card>
        <i class="pi pi-building" style="font-size: 2rem"></i>
        <p>{{ room.name }}</p>
      </p-card>
    </div>

    }
  `,
  styleUrl: './room.component.css',
})
export class RoomComponent {
  private reservationSubscription!: Subscription;
  @Input() room!: Room;
  states = States;

  constructor(
    private roomService: RoomService,
    private reservationsService: ReservationsService
  ) {}

  ngOnInit() {
    this.updateRoomState();

    this.reservationSubscription =
      this.reservationsService.reservationChanges$.subscribe(() => {
        this.updateRoomState();
      });
  }

  ngOnDestroy() {
    if (this.reservationSubscription) {
      this.reservationSubscription.unsubscribe();
    }
  }

  private updateRoomState() {
    this.roomService.getCurrentlyReservedRooms().subscribe({
      next: (reservedRooms) => {
        if (
          this.room.state !== States.ClientRequest &&
          this.room.state !== States.NeedsCleaning &&
          this.room.state !== States.IsBeingCleaned
        ) {
          if (reservedRooms.includes(this.room)) {
            this.room.state = States.Occupied;
          } else {
            this.room.state = States.Free;
          }
        }
      },
      error: (error) => {
        console.error('Error fetching reserved rooms:', error);
      },
    });
  }
}
