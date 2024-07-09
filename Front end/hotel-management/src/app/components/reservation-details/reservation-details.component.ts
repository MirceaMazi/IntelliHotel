import { Component, Input } from '@angular/core';

import { Reservation } from '../../interfaces/reservation';
import { Room } from '../../interfaces/room';

import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CardModule, RippleModule, DividerModule],
  template: `
    <!-- This extra div is needed for the ripple effect-->

    <div pRipple class="card-wrapper">
      <p-card
        header="{{ reservation.name }}"
        subheader="{{ startDate }} - {{ endDate }}"
      >
        <p>Camerele ce au fost rezervate sunt următoarele:</p>
        <div class="room-wrapper">
          @for (room of rooms; track room._id) {
          <p>
            <b>{{ room.name }}</b
            >,&nbsp;
          </p>
          }
        </div>
      </p-card>
    </div>
  `,
  styleUrl: './reservation-details.component.css',
})
export class ReservationDetailsComponent {
  @Input() reservation!: Reservation;
  rooms!: Room[];
  startDate!: String;
  endDate!: String;

  ngOnInit() {
    this.rooms = this.reservation.rooms;
    this.startDate = new Date(this.reservation.startDate).toLocaleDateString();
    this.endDate = new Date(this.reservation.endDate).toLocaleDateString();
  }
}
