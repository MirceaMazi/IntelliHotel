import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RoomService } from '../../services/room.service';
import { ReservationsService } from '../../services/reservations.service';

import { Room } from '../../interfaces/room';
import { Reservation } from '../../interfaces/reservation';

import { NavbarComponent } from '../navbar/navbar.component';
import { CalendarOptions } from '@fullcalendar/core';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { FullCalendarModule } from '@fullcalendar/angular';
import roLocale from '@fullcalendar/core/locales/ro';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [NavbarComponent, FullCalendarModule],
  template: `
    <app-navbar></app-navbar>

    <div class="calendar-wrapper">
      <full-calendar [options]="calendarOptions"></full-calendar>
    </div>
  `,
  styleUrls: ['./scheduler.component.css'],
})
export class SchedulerComponent implements OnInit {
  rooms: Room[] = [];
  reservations: Reservation[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [resourceTimelinePlugin],
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    headerToolbar: {
      left: 'today prev,next',
      center: 'title',
      right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
    },
    height: 600,
    initialView: 'resourceTimelineMonth',
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: false,
    },
    locale: roLocale,
    resourceAreaWidth: '10rem',
    expandRows: true,
    nowIndicator: true,
    scrollTime: '00:00:00',
    resources: [],
    events: [],
    eventDidMount: (info) => {
      if (info.event._def.resourceIds!.length > 0) {
        info.el.setAttribute(
          'data-resource-ids',
          info.event._def.resourceIds!.join(',')
        );
      }
    },
    eventClick: (info) => {
      const resourceIds = info.el.getAttribute('data-resource-ids');
      if (resourceIds) {
        const resourceIdArray = resourceIds.split(',');
        const clickedResourceId = this.getClickedResourceId(
          resourceIdArray,
          info.jsEvent
        );

        if (clickedResourceId) {
          this.router.navigate([`/rooms/${clickedResourceId}`]);
        } else {
          console.error('Clicked resource ID not found');
        }
      } else {
        console.error('Resource IDs not found');
      }
    },
    eventClassNames: ({ event }) => {
      const now = new Date();
      const startDate = new Date(event.start!);
      const endDate = new Date(event.end!);
      return this.getEventClassNames(startDate, endDate, now);
    },
  };

  constructor(
    private roomService: RoomService,
    private reservationsService: ReservationsService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      this.roomService.getAllRooms(token).subscribe((rooms) => {
        this.rooms = rooms;
        this.calendarOptions.resourceGroupField = 'type';
        this.calendarOptions.resources = this.rooms.map((room) => ({
          id: room._id,
          title: room.name,
          type: room.type,
        }));

        this.reservationsService
          .getAllReservations(token)
          .subscribe((reservations) => {
            this.reservations = reservations;
            this.calendarOptions.events = this.reservations.map(
              (reservation) => ({
                id: reservation._id,
                title: reservation.name,
                start: new Date(reservation.startDate),
                end: new Date(reservation.endDate),
                resourceIds: reservation.rooms.map((room) => room._id!),
              })
            );
          });
      });
    }
  }

  getClickedResourceId(
    resourceIds: string[],
    jsEvent: MouseEvent
  ): string | null {
    let target = jsEvent.target as HTMLElement;

    // Traverse up the DOM tree to find the resource element
    while (target && !target.classList.contains('fc-resource')) {
      target = target.parentElement!;
    }

    if (target && target.classList.contains('fc-resource')) {
      const resourceId = target.getAttribute('data-resource-id');
      if (resourceId && resourceIds.includes(resourceId)) {
        return resourceId;
      }
    }

    return null;
  }

  getEventClassNames(startDate: Date, endDate: Date, now: Date): string[] {
    if (endDate < now) {
      return ['past-event'];
    } else if (startDate <= now && now <= endDate) {
      return ['current-event'];
    } else {
      return ['future-event'];
    }
  }
}
