import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { ManageService } from '../Services/manage.service';

@Injectable({
  providedIn: 'root'
})
// guard to access the login page
export class LoginguardGuard implements CanActivate {
  constructor(private authService: AuthService, private manageService: ManageService, private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.loggedIn) {
      // check if user is logged in and send to profile section
      this.router.navigate(['/profile'])
      return false
    }
    else {
      // check if user is logged in with the backend
      return this.manageService.getConfig().toPromise().then((data) => {
        this.manageService.authEnabled = data.authEnabled
        this.manageService.dbEnabled = data.dbEnabled
        if (this.manageService.authEnabled == true) {
          // check if auth is enabled
          return this.authService.getUser().toPromise().then((userDetails) => {
            // check if user is authenticated
            this.authService.email = userDetails.email
            this.authService.name = userDetails.name
            this.authService.loggedIn = true
            this.router.navigate(['/profile'])
            return false
          }, (err) => {
            return true
          })
        }
        else {
          return true
        }
      }, (err) => {
        return true
      })
    }
  }

}
