import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  Validators,
  FormBuilder,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';

import { ReservationsService } from '../../services/reservations.service';
import { RoomService } from '../../services/room.service';
import { MessageService } from 'primeng/api';

import { Reservation } from '../../interfaces/reservation';
import { Room } from '../../interfaces/room';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';


@Component({
  selector: 'app-add-reservation',
  standalone: true,
  imports: [
    ButtonModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    ReactiveFormsModule,
    CalendarModule,
    MultiSelectModule,
  ],
  template: ` <p-card>
    <ng-template pTemplate="header">
      <p class="header-text">
        Adaugă<br />
        rezervare
      </p>
      <p-button
        [raised]="true"
        label="X"
        styleClass="exit-button"
        (click)="this.reservationService.toggleReservationForm()"
      ></p-button>
    </ng-template>

    <form
      [formGroup]="addReservationForm"
      (ngSubmit)="onSubmitAddReservation()"
      class="form-body"
    >
      <p-floatLabel>
        <input id="name" type="text" pInputText formControlName="name" />
        <label for="name">Numele persoanei</label>
      </p-floatLabel>

      <p-floatLabel>
        <p-calendar
          id="calendar"
          formControlName="rangeDates"
          selectionMode="range"
          [readonlyInput]="true"
          dateFormat="dd.mm.yy"
        />
        <label for="calendar">Durata sejurului</label>
      </p-floatLabel>

      <p-floatLabel>
        <p-multiSelect
          id="rooms"
          [options]="availableRooms"
          formControlName="rooms"
          optionLabel="name"
          [virtualScroll]="true"
          [virtualScrollItemSize]="50"
        />
        <label for="rooms">Selectați camerele</label></p-floatLabel
      >

      <p-button
        label="Adaugă rezervare"
        [raised]="true"
        type="submit"
        [disabled]="!addReservationForm.valid"
      ></p-button>
    </form>
  </p-card>`,
  styleUrl: './add-reservation.component.css',
})
export class AddReservationComponent {
  reservation: Reservation | null = null;
  availableRooms: Room[] = [];

  constructor(
    protected reservationService: ReservationsService,
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private messageService: MessageService
  ) {}

  addReservationForm = this.formBuilder.group({
    name: ['', Validators.required],
    rooms: [[], [Validators.required, this.noNullInArrayValidator()]],
    rangeDates: [[], [Validators.required, this.rangeDatesValidator()]],
  });

  ngOnInit() {
    this.addReservationForm
      .get('rangeDates')!
      .valueChanges.subscribe((dates) => {
        const dateArray = dates as Date[] | null;

        if (dateArray && dateArray.length === 2) {
          const startDate: Date = dateArray[0];
          let endDate: Date = dateArray[1];

          if (endDate.getTime() === startDate.getTime()) {
            const start = startDate.getDate();
            startDate.setHours(12);
            endDate.setDate(start + 1);
            endDate.setHours(11);
          } else {
            endDate.setHours(11);
            startDate.setHours(12);
          }

          this.roomService
            .getAvailableRooms(startDate, endDate)
            .subscribe((availableRooms) => {
              this.availableRooms = availableRooms;
            });
        } else {
          this.availableRooms = [];
        }
      });

    //setTimeout postpones the change to the next change detection cycle
    //Removing results in ngChangeAfterViewChecked
    setTimeout(() => {
      if (this.roomService.isFormOpen) {
        this.roomService.toggleRoomForm();
      }
    }, 0);
  }

  onSubmitAddReservation() {
    let startDate: Date = this.addReservationForm.value.rangeDates![0];
    let endDate: Date = this.addReservationForm.value.rangeDates![1];

    const selectedRooms: Room[] = this.addReservationForm.value.rooms || [];
    const token = localStorage.getItem('token')!;

    this.roomService.getAvailableRooms(startDate, endDate).subscribe({
      next: (availableRooms) => {
        const unavailableRooms: Room[] = selectedRooms.filter(
          (room) =>
            !availableRooms.some(
              (availableRoom) => availableRoom._id === room._id
            )
        );

        if (unavailableRooms.length > 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Camerele nu sunt disponibile in perioada selectată',
          });
        } else {
          this.reservation = {
            name: this.addReservationForm.value.name!,
            rooms: this.addReservationForm.value.rooms!,
            startDate: startDate,
            endDate: endDate,
          };

          this.reservationService
            .addReservation(token, this.reservation)
            .subscribe({
              next: () => {
                this.reservationService.toggleReservationForm();
                this.messageService.add({
                  severity: 'info',
                  summary: 'Success',
                  detail: 'Rezervare adăugată',
                });
              },
              error: (error) => {
                console.error('Error adding reservation:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'A apărut o eroare la adăugarea rezervării',
                });
              },
            });
        }
      },
      error: (error) => {
        console.error('Error fetching available rooms:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'A apărut o eroare la verificarea disponibilității camerelor',
        });
      },
    });
  }

  //This validator ensures that the returned array from the calendar
  //has no null elements inside of it
  rangeDatesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (
        !Array.isArray(value) ||
        value.length !== 2 ||
        value.includes(null) ||
        value.includes(undefined)
      ) {
        return { rangeDatesInvalid: true };
      }

      return null;
    };
  }

  //This validator makes sure that the rooms are not null
  noNullInArrayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (Array.isArray(value)) {
        const hasNull = value.some((item) => item === null);
        return hasNull ? { noNullInArray: true } : null;
      }
      return null;
    };
  }
}
