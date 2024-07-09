import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { RoomDetailsComponent } from './components/room-details/room-details.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'rooms', component: MainPageComponent, canActivate: [authGuard] },
  {
    path: 'rooms/:id',
    component: RoomDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'scheduler',
    component: SchedulerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
