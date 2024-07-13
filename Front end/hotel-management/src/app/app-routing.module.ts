import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './components/auth/auth.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { RoomDetailsComponent } from './components/room-details/room-details.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RatingFormComponent } from './components/rating-form/rating-form.component';

import { authGuard } from './guards/auth.guard';
import { userRoleGuard } from './guards/user-role.guard';

const routes: Routes = [
  { path: 'login', component: AuthComponent },
  {
    path: 'rooms',
    component: MainPageComponent,
    canActivate: [authGuard, userRoleGuard],
  },
  {
    path: 'rooms/:id',
    component: RoomDetailsComponent,
    canActivate: [authGuard, userRoleGuard],
  },
  {
    path: 'scheduler',
    component: SchedulerComponent,
    canActivate: [authGuard, userRoleGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, userRoleGuard],
  },
  {
    path: 'rating',
    component: RatingFormComponent,
    canActivate: [authGuard, userRoleGuard],
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
