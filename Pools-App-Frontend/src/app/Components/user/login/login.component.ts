import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
// import { Router } from '@angular/router';
import { AuthService } from 'src/app/Services/auth.service';
import { ManageService } from 'src/app/Services/manage.service';
import { StatusMessageService } from 'src/app/Services/status-message.service';
import { RegisterComponent } from '../../popups/register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  regexpEmail = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');
  constructor(public registerDialog: MatDialog, private authService: AuthService, public statusMessageService: StatusMessageService, public manageService: ManageService, private router: Router) { }


  loginUser() {
    if (!this.regexpEmail.test((<HTMLInputElement>document.getElementById('email_i')).value)) {
      this.statusMessageService.displayStatus("Please enter a valid email !!!", 0)
      return 0
    }
    if ((<HTMLInputElement>document.getElementById('password_i')).value.length < 7) {
      this.statusMessageService.displayStatus("Password should be more than 7 charachters !!!", 0)
      return 0
    }
    this.authService.loginUser({
      email: (<HTMLInputElement>document.getElementById('email_i')).value,
      password: (<HTMLInputElement>document.getElementById('password_i')).value
    }).subscribe(response => {
      if (response.status == 200) {
        this.statusMessageService.displayStatus(response.message, 1)
        this.authService.getUser().subscribe(userDetails => {
          this.authService.email = userDetails.email
          this.authService.name = userDetails.name
          this.authService.loggedIn = true
          this.router.navigate(['/profile'])
        }, (err) => {
          this.authService.email = ''
          this.authService.name = ''
          this.authService.loggedIn = false
          this.statusMessageService.displayStatus("Something went wrong !!!", 0)
        })
      }
      else {
        this.statusMessageService.displayStatus(response.message, 0)
      }
    }, (err) => {
      this.statusMessageService.displayStatus(err.status + " : " + err.error.message, 0)
    })
  }
  openRegister() {
    this.registerDialog.open(RegisterComponent).afterClosed().subscribe(registerResult => {
      if (registerResult.name != -1) {
        try {
          this.authService.registerUser(registerResult).subscribe(registerResponse => {
            if (registerResponse.status == 200) {
              this.statusMessageService.displayStatus(registerResponse.message, 1)
            }
            else {
              this.statusMessageService.displayStatus(registerResponse.message, 0)
            }
          })
        } catch (error) {
          this.statusMessageService.displayStatus('Something went wrong !!!', 0)
        }
      }
    })

  }
  ngOnInit(): void {
  }

}
