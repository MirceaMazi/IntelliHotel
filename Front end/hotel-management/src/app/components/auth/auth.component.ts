import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { User } from '../../interfaces/user';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    FloatLabelModule,
    ReactiveFormsModule,
    InputTextModule,
  ],
  template: `
    <body>
      <div *ngIf="existingUser; then formLogin; else formSignUp"></div>

      <!-- This is the login form  -->
      <ng-template #formLogin>
        <p-card>
          <p class="form-header">IntelliHotel</p>
          <form
            [formGroup]="loginForm"
            (ngSubmit)="onSubmitLogin()"
            class="form-body"
          >
            <p-floatLabel>
              <input
                id="username"
                type="text"
                pInputText
                formControlName="username"
              />
              <label for="username">Nume utilizator</label>
            </p-floatLabel>

            <p-floatLabel>
              <input
                id="password"
                type="password"
                pInputText
                formControlName="password"
              />
              <label for="password">Parolă</label>
            </p-floatLabel>

            <p-button
              [raised]="true"
              type="submit"
              [disabled]="!loginForm.valid"
              >Loghează-te</p-button
            >
          </form>

          <p class="status-btn" (click)="changeUserStatus()">
            Creează cont nou
          </p>
        </p-card>
      </ng-template>

      <!-- This is the signup form  -->
      <ng-template #formSignUp>
        <p-card>
          <p class="form-header">IntelliHotel</p>
          <form
            [formGroup]="signUpForm"
            (ngSubmit)="onSubmitSignUp()"
            class="form-body"
          >
            <p-floatLabel>
              <input
                id="username"
                type="text"
                pInputText
                formControlName="username"
              />
              <label for="username">Nume utilizator</label>
            </p-floatLabel>

            <p-floatLabel>
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
              />
              <label for="email">Email</label>
            </p-floatLabel>

            <p-floatLabel>
              <input
                id="password"
                type="password"
                pInputText
                formControlName="password"
              />
              <label for="password">Parolă</label>
            </p-floatLabel>

            <p-button
              [raised]="true"
              type="submit"
              [disabled]="!signUpForm.valid"
              >Înregistrează-te</p-button
            >
          </form>
          <p class="status-btn" (click)="changeUserStatus()">Am deja cont</p>
        </p-card>
      </ng-template>
    </body>
  `,
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent {
  existingUser: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  //Generating both forms
  signUpForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loginForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(8)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  onSubmitLogin() {
    if (this.loginForm.valid) {
      const observer = {
        next: (response: any) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/rooms']);
        },
        error: (error: any) => {
          console.error(error);
        },
      };

      this.authService
        .login(this.loginForm.value.username!, this.loginForm.value.password!)
        .subscribe(observer);
    }
  }

  onSubmitSignUp() {
    if (this.signUpForm.valid) {
      const observer = {
        next: (response: any) => {},
        error: (error: any) => {
          console.error(error);
        },
      };

      this.authService
        .register(
          this.signUpForm.value.username!,
          this.signUpForm.value.email!,
          this.signUpForm.value.password!
        )
        .subscribe(observer);
    }
  }

  changeUserStatus() {
    this.existingUser = !this.existingUser;
  }
}
