import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiUrl: string = environment.apiUrl;
  httpOptions: any = {}

  constructor(private http: HttpClient, private apiService: ApiService, private router: Router) { }

  login(jsonData: any) {
    this.httpOptions = {
      Headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    }
    let path = this.apiUrl + `/User/Login`;
    return this.http.post(path, jsonData, this.httpOptions);
  }

  getUserPayload() {
    var token = this.getToken();
    if (token) {
      var userPayload = atob(token.split('.')[1]);
      return JSON.parse(userPayload);
    } else {
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('zonetoken') ?? '';
  }

  setToken(token: string) {
    localStorage.setItem('zonetoken', token);
  }

  isLoggedIn() {
    var userPayload = this.getUserPayload();
    if (userPayload) return userPayload
  }

  deleteToken() {
    localStorage.removeItem('zonetoken');
    this.clearAppStorage()
  }

  clearAppStorage() {
    const keysToRemove = [
      'BillingActiveTab',
      'lastActivityTimestamp',
      'logout',
      'ConfigTab',
      'HETab'
    ];

    keysToRemove.forEach(k => localStorage.removeItem(k));
  }

  getTokenExpiration(token: string): Date | null {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      const decodedPayload = JSON.parse(atob(payloadBase64));

      if (!decodedPayload.exp) return null;
      const date = new Date(0);
      date.setUTCSeconds(decodedPayload.exp);
      return date;
    } catch (err) {
      return null;
    }
  }

  isTokenExpired(token?: string): boolean {
    if (!token) token = this.getToken();
    if (!token) return true;

    const expiry = this.getTokenExpiration(token);
    if (expiry === null) return false;

    return expiry.valueOf() < new Date().valueOf();
  }
}
