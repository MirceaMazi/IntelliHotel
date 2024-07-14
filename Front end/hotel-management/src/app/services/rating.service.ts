import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACK_URL } from '../const';

import { Rating } from '../interfaces/rating';

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private ratingURL = `${BACK_URL}/api/ratings`;

  constructor(private http: HttpClient) {}

  createRating(token: string, newRating: Rating): Observable<Rating> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Rating>(`${this.ratingURL}/`, newRating, { headers });
  }

  getRatingById(token: string, id: string): Observable<Rating> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Rating>(`${this.ratingURL}/${id}`, { headers });
  }

  getAllRatings(token: string): Observable<Rating[]> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Rating[]>(`${this.ratingURL}/`, { headers });
  }
}
