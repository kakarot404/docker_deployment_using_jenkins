import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { ManageService } from 'src/app/Services/manage.service';
import { StatusMessageService } from 'src/app/Services/status-message.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  constructor(public authService: AuthService, private statusMessageService: StatusMessageService, public manageService: ManageService, private router: Router) { }

  logoutUser() {
    try {
      this.authService.logoutAll().subscribe(logoutResponse => {
        this.statusMessageService.displayStatus("User logged out!!!", 1)
        this.authService.resetUser()
        this.router.navigate(['/auth'])
      }, err => {
        this.statusMessageService.displayStatus("User logged out!!!", 1)
        this.router.navigate(['/auth'])
      })
    }
    catch (error) {
      this.router.navigate(['/auth'])
      this.statusMessageService.displayStatus("User logged out!!! 12", 1)
      this.authService.getUser()
      this.router.navigate(['/auth'])
    }

  }
  deleteUser() {
    this.authService.deleteUser().subscribe(deleteResponse => {
      this.statusMessageService.displayStatus(deleteResponse.message, 1)
    }, err => {
      this.statusMessageService.displayStatus(err.statusText, 0)
    })
    this.authService.resetUser()
    this.router.navigate(['/auth'])
  }

  ngOnInit(): void {
  }

}
