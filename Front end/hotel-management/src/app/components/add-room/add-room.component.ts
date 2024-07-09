import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';

import { RoomService } from '../../services/room.service';
import { ReservationsService } from '../../services/reservations.service';
import { MessageService } from 'primeng/api';

import { Room, States } from '../../interfaces/room';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-add-room',
  standalone: true,
  imports: [
    CardModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
    InputTextareaModule,
    InputTextModule,
  ],
  template: `<p-card>
    <ng-template pTemplate="header">
      <p class="header-text">Adaugă cameră</p>
      <p-button
        [raised]="true"
        label="X"
        styleClass="exit-button"
        (click)="exitForm()"
      ></p-button>
    </ng-template>

    <form
      [formGroup]="addRoomForm"
      (ngSubmit)="onSubmitAddRoom()"
      class="form-body"
    >
      <div class="input-textarea-container">
        <div class="input-container">
          <p-floatLabel>
            <input id="name" type="text" pInputText formControlName="name" />
            <label for="name">Numele camerei</label>
          </p-floatLabel>

          <p-floatLabel>
            <input id="type" type="text" pInputText formControlName="type" />
            <label for="type">Tipul camerei</label>
          </p-floatLabel>
        </div>

        <p-floatLabel>
          <textarea
            id="details "
            rows="5"
            cols="30"
            pInputTextarea
            formControlName="details"
          >
          </textarea>
          <label for="details">Descrierea camerei(opțional)</label>
        </p-floatLabel>
      </div>

      <p-button
        label="Adaugă camera"
        [raised]="true"
        type="submit"
        [disabled]="!addRoomForm.valid"
      ></p-button>
    </form>
  </p-card> `,
  styleUrl: './add-room.component.css',
})
export class AddRoomComponent {
  room: Room | null = null;
  editMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private roomService: RoomService,
    private reservationService: ReservationsService,
    private messageService: MessageService
  ) {}

  addRoomForm = this.formBuilder.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    details: [''],
  });

  ngOnInit() {
    this.room = this.roomService.getRoomToEdit();
    if (this.room) {
      this.editMode = true;
      this.addRoomForm.patchValue({
        name: this.room.name,
        type: this.room.type,
        details: this.room.details,
      });
    }

    //setTimeout postpones the change to the next change detection cycle
    //Removing results in ngChangeAfterViewChecked
    setTimeout(() => {
      if (this.reservationService.isFormOpen) {
        this.reservationService.toggleReservationForm();
      }
    }, 0);
  }

  onSubmitAddRoom() {
    const token = localStorage.getItem('token')!;

    if (this.editMode) {
      const updatedRoom: Room = {
        ...this.room!,
        name: this.addRoomForm.value.name!,
        type: this.addRoomForm.value.type!,
        details: this.addRoomForm.value.details!,
      };

      this.roomService.editRoom(token, this.room!._id!, updatedRoom).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Success',
            detail: 'Camera a fost modificată',
          });
          this.roomService.notifyRoomsChanged();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Modificarea camerei a eșuat',
          });
        },
      });
    } else {
      const newRoom: Room = {
        name: this.addRoomForm.value.name!,
        type: this.addRoomForm.value.type!,
        details: this.addRoomForm.value.details!,
        state: States.Free,
      };

      this.roomService.createRoom(token, newRoom).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Success',
            detail: 'Camera a fost adaugată',
          });
          this.roomService.notifyRoomsChanged();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Adăugarea camerei a eșuat',
          });
        },
      });
    }

    this.roomService.clearRoomToEdit();
    this.roomService.toggleRoomForm();
  }

  exitForm() {
    let room = this.roomService.getRoomToEdit();

    if (room) {
      this.roomService.clearRoomToEdit();
    }

    this.roomService.toggleRoomForm();
  }
}
