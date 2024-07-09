import { Component } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, ButtonModule],
  template: `<p-menubar [model]="categories">
    <ng-template pTemplate="start"
      ><img src="../../../assets/IntelliHotel logo.png" />
    </ng-template>

    <ng-template pTemplate="item" let-item>
      <a [routerLink]="item.route" class="p-menuitem-link">
        <span [class]="item.icon"></span>
        <span>{{ item.label }}</span>
      </a>
    </ng-template>
    <ng-template pTemplate="end">
      <div>
        <a routerLink="/login" class="p-menuitem-link">
          <p-button
            icon="pi pi-sign-out"
            iconPos="right"
            (click)="logOut()"
            styleClass="blended-btn"
          ></p-button>
        </a>
      </div>
    </ng-template>
  </p-menubar> `,
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  categories: MenuItem[] | undefined;

  ngOnInit() {
    this.categories = [
      {
        label: 'Camere',
        icon: 'pi pi-objects-column',
        route: '/rooms',
      },
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        route: '/dashboard',
      },
      {
        label: 'Calendar',
        icon: 'pi pi-calendar',
        route: '/scheduler',
      },
    ];
  }

  logOut() {
    localStorage.removeItem('token');
  }
}
