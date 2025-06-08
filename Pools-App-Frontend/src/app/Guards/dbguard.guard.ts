import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { ManageService } from '../Services/manage.service';

@Injectable({
  providedIn: 'root'
})
// guard to access the DB page and profile page
export class DbguardGuard implements CanActivate, CanLoad {
  constructor(private manageService: ManageService, private authService: AuthService, private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.loggedIn) {
      // if user is already logged in
      return true
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
            return true
          }, (err) => {
            this.router.navigate(['/auth'])
            return false
          })
        }
        else {
          return true
        }
      }, (err) => {
        this.router.navigate(['/auth'])
        return false
      })
    }
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return false
  }
}
