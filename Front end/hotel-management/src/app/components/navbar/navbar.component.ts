import { Component } from '@angular/core';

import { AuthService } from '../../services/auth.service';

import { User, userRoles } from '../../interfaces/user';

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
  user!: User;
  categories: MenuItem[] | undefined;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getUserProfile(localStorage.getItem('token')!).subscribe({
      next: (user: User) => {
        this.user = user;

        if (this.user && this.user.role === userRoles.Admin) {
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
        } else {
          this.categories = [];
        }
      },
    });
  }

  logOut() {
    localStorage.removeItem('token');
  }
}
