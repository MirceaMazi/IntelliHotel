import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';

import { ClientService } from '../../services/client.service';
import { MessageService } from 'primeng/api';

import { Client } from '../../interfaces/client';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { RatingModule } from 'primeng/rating';

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
  ],
  template: ` <div class="body-wrapper">
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
    private messageService: MessageService
  ) {}

  addRatingForm = this.formBuilder.group({
    rating: ['', Validators.required],
    details: [''],
  });

  onSubmitAddRating() {
    const token = localStorage.getItem('token')!;

    const newRating: any = {
      name: this.addRatingForm.value.rating!,
      details: this.addRatingForm.value.details!,
    };

    console.log(newRating);
  }
}
