import { Component, ViewChild } from '@angular/core';
import { combineLatest } from 'rxjs';

import { ReservationsService } from '../../services/reservations.service';
import { RoomService } from '../../services/room.service';
import { MessageService } from 'primeng/api';

import { Reservation } from '../../interfaces/reservation';
import { Room } from '../../interfaces/room';
import { MenuItem } from 'primeng/api';

import { ReservationDetailsComponent } from '../reservation-details/reservation-details.component';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { NavbarComponent } from '../navbar/navbar.component';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { ContextMenuModule, ContextMenu } from 'primeng/contextmenu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ReservationDetailsComponent,
    ScrollPanelModule,
    NavbarComponent,
    CardModule,
    ChartModule,
    DividerModule,
    ContextMenuModule,
    ToastModule,
  ],
  template: `
    <app-navbar></app-navbar>

    <p-toast [life]="1000" position="bottom-right" />

    <div class="charts-wrapper">
      <p-card styleClass="chart-wrapper doughnut-chart">
        <p class="form-header">Starea camerelor</p>
        <p-chart
          type="pie"
          [data]="doughnutData"
          [options]="doughnutOptions"
          [style]="{ width: '400px', height: '100%' }"
        />
      </p-card>

      <p-card styleClass="chart-wrapper">
        <p class="form-header">Total camere ocupate în următoarele 7 zile</p>
        <p-chart type="line" [data]="lineData" [options]="lineOptions" />
      </p-card>
    </div>

    <p-scrollPanel [style]="{ width: '100%', height: '18.5rem' }">
      @for (reservation of reservations; track reservation._id) {
      <app-reservation-details
        [reservation]="reservation"
        (contextmenu)="onContextMenu($event, reservation)"
      ></app-reservation-details>
      }
    </p-scrollPanel>

    <p-contextMenu #cm [model]="items" (onHide)="onHide()" />
  `,
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  reservations: Reservation[] = [];
  rooms: Room[] = [];

  items: MenuItem[] | undefined;
  selectedReservation!: Reservation | null;
  @ViewChild('cm') cm!: ContextMenu;

  doughnutData: any;
  doughnutOptions: any;

  lineData: any;
  lineOptions: any;

  constructor(
    private reservationService: ReservationsService,
    private roomService: RoomService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      combineLatest([
        this.roomService.getAllRooms(token),
        this.reservationService.getAllReservations(token),
      ]).subscribe(([rooms, reservations]) => {
        this.rooms = rooms;
        this.reservations = reservations.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        this.initializeCharts();
      });
    }

    this.items = [
      {
        label: 'Șterge',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteReservation();
        },
      },
    ];
  }

  onContextMenu(event: any, reservation: Reservation) {
    this.selectedReservation = reservation;
    this.cm.show(event);
  }

  onHide() {
    this.selectedReservation = null;
  }

  deleteReservation() {
    if (this.selectedReservation) {
      const token = localStorage.getItem('token');
      if (token) {
        const reservationToDelete = this.selectedReservation; // Store in a local variable
        this.reservationService
          .deleteReservation(token, reservationToDelete._id!)
          .subscribe({
            next: () => {
              const index = this.reservations.findIndex(
                (r) => r._id === reservationToDelete._id
              );
              if (index !== -1) {
                this.reservations.splice(index, 1);
                this.messageService.add({
                  severity: 'info',
                  summary: 'Success',
                  detail: 'Rezervarea a fost eliminată',
                });
                // Reinitialize the charts with the updated reservations
                this.initializeCharts();
              }
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'A apărut o eroare la ștergerea rezervării',
              });
            },
          });
      }
    }
  }

  getNext7Days(): Date[] {
    const daysArray = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);
      daysArray.push(nextDay);
    }

    return daysArray;
  }

  getOccupiedRoomsCountPerDay(reservations: Reservation[]): number[] {
    const next7Days = this.getNext7Days();
    const occupiedCounts = Array(7).fill(0);

    reservations.forEach((reservation) => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);

      for (let i = 0; i < 7; i++) {
        const day = next7Days[i];
        if (day >= startDate && day <= endDate) {
          occupiedCounts[i] += reservation.rooms.length;
        }
      }
    });

    return occupiedCounts;
  }

  initializeCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue(
      '--text-color-secondary'
    );
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    // Doughnut Chart Configuration
    const doughnutChartData = this.rooms.map((room) => room.state);

    const doughnutChartLabels = [
      'Cameră liberă',
      'Cameră ocupată',
      'În curs de igienizare',
      'Cerere client',
      'Necesită igienizare',
    ];

    const stateCounts = doughnutChartLabels.map((label) => ({
      label: label,
      count: 0,
    }));

    doughnutChartData.forEach((state) => {
      const index = doughnutChartLabels.indexOf(state);
      if (index !== -1) {
        stateCounts[index].count++;
      }
    });

    const countsArray = stateCounts.map((state) => state.count);

    this.doughnutData = {
      labels: doughnutChartLabels,
      datasets: [
        {
          data: countsArray,
          backgroundColor: [
            documentStyle.getPropertyValue('--green-500'),
            documentStyle.getPropertyValue('--blue-500'),
            documentStyle.getPropertyValue('--yellow-500'),
            documentStyle.getPropertyValue('--red-500'),
            documentStyle.getPropertyValue('--orange-500'),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue('--green-400'),
            documentStyle.getPropertyValue('--blue-400'),
            documentStyle.getPropertyValue('--yellow-400'),
            documentStyle.getPropertyValue('--red-400'),
            documentStyle.getPropertyValue('--orange-400'),
          ],
        },
      ],
    };

    this.doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
      },
    };

    // Line Chart Configuration
    this.lineData = {
      labels: this.getNext7Days().map((day) => day.toLocaleDateString()),
      datasets: [
        {
          label: 'Camere ocupate',
          data: this.getOccupiedRoomsCountPerDay(this.reservations),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4,
        },
      ],
    };

    this.lineOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
            stepSize: 1,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
          max: this.rooms.length,
        },
      },
    };
  }
}
