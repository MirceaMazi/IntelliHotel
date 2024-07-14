import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { MessageService } from 'primeng/api';
import { RatingService } from '../../services/rating.service';
import { AuthService } from '../../services/auth.service';

import { Client } from '../../interfaces/client';
import { Rating } from '../../interfaces/rating';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-rating-form',
  standalone: true,
  imports: [
    CardModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
    InputTextareaModule,
    InputTextModule,
    RatingModule,
    ToastModule,
  ],
  template: ` <div class="body-wrapper">
    <p-toast [life]="1000" position="bottom-right"></p-toast>

    <p-card>
      <ng-template pTemplate="header">
        <p class="header-text">Cum a fost experința ta?</p>
      </ng-template>

      <form
        [formGroup]="addRatingForm"
        (ngSubmit)="onSubmitAddRating()"
        class="form-body"
      >
        <div class="rating-container">
          <label for="rating">Numarul de stele</label>
          <p-rating id="rating" formControlName="rating" [cancel]="false" />
        </div>

        <p-floatLabel>
          <textarea
            id="details"
            rows="5"
            cols="25"
            pInputTextarea
            formControlName="details"
          >
          </textarea>
          <label for="details">Descrie-ne experiența ta(opțional)</label>
        </p-floatLabel>

        <p-button
          label="Adaugă recenzie"
          [raised]="true"
          type="submit"
          [disabled]="!addRatingForm.valid"
        ></p-button>
      </form>
    </p-card>
  </div>`,
  styleUrl: './rating-form.component.css',
})
export class RatingFormComponent {
  client: Client | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private messageService: MessageService,
    private ratingService: RatingService,
    private authService: AuthService,
    private router: Router
  ) {}

  addRatingForm = this.formBuilder.group({
    rating: ['', Validators.required],
    details: [''],
  });

  onSubmitAddRating() {
    const token = localStorage.getItem('token')!;

    this.authService.getUserProfile(token).subscribe({
      next: (user) => {
        const email = user.email;

        this.clientService.getAllClients(token).subscribe({
          next: (clients) => {
            const client = clients.find((c) => c.email === email)!;

            const newRating: Rating = {
              numOfStars: Number.parseInt(this.addRatingForm.value.rating!),
              details: this.addRatingForm.value.details!,
              client: client,
            };

            this.ratingService.createRating(token, newRating).subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'info',
                  summary: 'Success',
                  detail: 'Rating-ul a fost adaugat',
                });
              },
              error: () => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Eroare, rating-ul nu a fost trimis',
                });
              },
            });
          },
        });
      },
    });

    setTimeout(() => {
      this.router.navigate(['/login']);
      localStorage.removeItem('token');
    }, 1000);
  }
}
