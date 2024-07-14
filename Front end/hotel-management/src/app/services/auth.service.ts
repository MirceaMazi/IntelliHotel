import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACK_URL } from '../const';

import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authURL = `${BACK_URL}/api/users`;

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authURL}/login`, { username, password });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.authURL}/`, {
      username,
      email,
      password,
    });
  }

  getUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.authURL}/`, { headers });
  }

  createUser(token: string, user: User): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.authURL}/create`, user, { headers });
  }
}
