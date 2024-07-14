import { Component, Input } from '@angular/core';

import { ClientService } from '../../services/client.service';
import { RatingService } from '../../services/rating.service';

import { Reservation } from '../../interfaces/reservation';
import { Room } from '../../interfaces/room';
import { Client } from '../../interfaces/client';
import { Rating } from '../../interfaces/rating';

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

        @if(rating){
        <p>Clientul a oferit un rating:</p>
        <div class="rating-field-wrapper">
          <p><b>Numărul de stele oferit:</b>&nbsp;</p>
          <p>{{ rating.numOfStars }}</p>
        </div>
        <div class="rating-field-wrapper">
          <p><b>Mesajul lăsat de client:</b>&nbsp;</p>
          <p>{{ rating.details }}</p>
        </div>

        }
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
  client!: Client;
  rating: Rating | null = null;

  constructor(
    private clientService: ClientService,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token')!;

    this.rooms = this.reservation.rooms;
    this.startDate = new Date(this.reservation.startDate).toLocaleDateString();
    this.endDate = new Date(this.reservation.endDate).toLocaleDateString();

    this.clientService.getAllClients(token).subscribe({
      next: (clients) => {
        for (let client of clients) {
          if (
            client.reservations.some((res) => res._id === this.reservation._id)
          ) {
            this.client = client;
            break;
          }
        }

        this.ratingService.getAllRatings(token).subscribe({
          next: (ratings) => {
            for (let rating of ratings) {
              if (rating.client._id === this.client._id) {
                this.rating = rating;
                break;
              } else {
                this.rating = null;
              }
            }
          },
        });
      },
    });
  }
}
