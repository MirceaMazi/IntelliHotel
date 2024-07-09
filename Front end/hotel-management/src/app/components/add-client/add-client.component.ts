import { Component, Input } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { ClientService } from '../../services/client.service';
import { RoomService } from '../../services/room.service';

import { Client } from '../../interfaces/client';
import { Reservation } from '../../interfaces/reservation';
import { Room, States } from '../../interfaces/room';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-add-client',
  standalone: true,
  imports: [
    CardModule,
    ReactiveFormsModule,
    FloatLabelModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
  ],
  template: `<p-card>
    <ng-template pTemplate="header">
      <p class="header-text">Adaugă client</p>
      <p-button
        [raised]="true"
        label="X"
        styleClass="exit-button"
        (click)="exitForm()"
      ></p-button>
    </ng-template>

    <form
      [formGroup]="addClientForm"
      (ngSubmit)="onSubmitAddClient()"
      class="form-body"
    >
      <p-floatLabel>
        <input id="name" type="text" pInputText formControlName="name" />
        <label for="name">Numele clientului</label>
      </p-floatLabel>

      <p-floatLabel>
        <input id="type" type="text" pInputText formControlName="email" />
        <label for="type">Email-ul clientului</label>
      </p-floatLabel>

      <p-floatLabel>
        <input id="type" type="text" pInputText formControlName="phone" />
        <label for="type">Telefonul clientului</label>
      </p-floatLabel>

      <p-floatLabel>
        <input id="type" type="text" pInputText formControlName="cnp" />
        <label for="type">CNP-ul clientului</label>
      </p-floatLabel>

      <p-button
        label="Adaugă client"
        [raised]="true"
        type="submit"
        [disabled]="!addClientForm.valid"
      ></p-button>
    </form>
  </p-card>`,
  styleUrl: './add-client.component.css',
})
export class AddClientComponent {
  @Input() reservations!: Reservation[];
  client: Client | null = null;
  editMode = false;

  constructor(
    private formBuilder: FormBuilder,
    private clientService: ClientService,
    private messageService: MessageService,
    private roomService: RoomService
  ) {}

  addClientForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
    ],
    cnp: ['', Validators.required],
  });

  ngOnInit() {
    this.client = this.clientService.getClientToEdit();
    if (this.client) {
      this.editMode = true;
      this.addClientForm.patchValue({
        name: this.client.name,
        email: this.client.email,
        phone: this.client.phone,
        cnp: this.client.cnp,
      });
    }
  }

  onSubmitAddClient() {
    const token = localStorage.getItem('token')!;

    if (this.editMode) {
      const updatedClient: Client = {
        ...this.client!,
        name: this.addClientForm.value.name!,
        email: this.addClientForm.value.email!,
        phone: this.addClientForm.value.phone!,
        cnp: this.addClientForm.value.cnp!,
      };

      this.clientService
        .editClient(token, this.client!._id!, updatedClient)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: 'Clientul a fost modificat',
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Modificarea clientului a eșuat',
            });
          },
        });
    } else {
      const newClient: Client = {
        name: this.addClientForm.value.name!,
        email: this.addClientForm.value.email!,
        phone: this.addClientForm.value.phone!,
        cnp: this.addClientForm.value.cnp!,
        reservations: this.reservations,
      };

      let reservedRooms = this.reservations[0].rooms;

      for (let room of reservedRooms) {
        room.state = States.Occupied;
        this.roomService.editRoom(token, room._id!, room).subscribe();
      }

      this.clientService.createClient(token, newClient).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Success',
            detail: 'Clientul a fost adaugat',
          });
          this.roomService.notifyRoomsChanged();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Adăugarea clientului a eșuat',
          });
        },
      });
    }

    this.clientService.clearClientToEdit();
    this.clientService.toggleClientForm();
  }

  exitForm() {
    let client = this.clientService.getClientToEdit();

    if (client) {
      this.clientService.clearClientToEdit();
    }

    this.clientService.toggleClientForm();
  }
}
