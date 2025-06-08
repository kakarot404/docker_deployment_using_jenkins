import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})

// Class to manage user auth operations
export class AuthService {
  email = ''
  name = ''
  loggedIn = false
  constructor(private httpClient: HttpClient, private cookieService: CookieService) {
    this.getUser().subscribe(userDetails => {
      this.email = userDetails.email
      this.name = userDetails.name
      this.loggedIn = true
    }, (err) => {
      this.email = ''
      this.name = ''
      this.loggedIn = false
    })
  }

  // register new user
  // userObject {email: string, name: string, age: integer}
  registerUser(userObject) {
    return this.httpClient.post<any>('/api/auth/addUser', userObject)
  }

  // login a user
  // userObject {email: string, password: string}
  loginUser(userObject) {
    return this.httpClient.post<any>('/api/auth/login', userObject)
  }

  // gets details of current user
  getUser() {
    return this.httpClient.get<any>('/api/auth/getUser', { headers: { 'Authorization': this.cookieService.get('token') } })
  }

  // logout the current session of the user in case of multiple sessions
  logout() {

  }

  // logout user from all sessions
  logoutAll() {
    return this.httpClient.get<any>('/api/auth/logoutAll', { headers: { 'Authorization': this.cookieService.get('token') } })
  }

  // delete current user
  deleteUser() {
    return this.httpClient.post<any>('/api/auth/deleteUser', "", { headers: { 'Authorization': this.cookieService.get('token') } })
  }

  // resets the current user details
  resetUser() {
    this.email = ''
    this.name = ''
    this.loggedIn = false
  }

}
