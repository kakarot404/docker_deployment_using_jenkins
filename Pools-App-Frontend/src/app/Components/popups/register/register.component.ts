import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StatusMessageService } from 'src/app/Services/status-message.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  regexpEmail = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$');

  constructor(private dialogRef: MatDialogRef<RegisterComponent>, private statusMessageService: StatusMessageService) { }

  registerUser() {
    if ((<HTMLInputElement>document.getElementById('uname_i')).value.length < 4) {
      this.statusMessageService.displayStatus("Username should be more than 4 charachters !!!", 0)
      return 0
    }
    if (!this.regexpEmail.test((<HTMLInputElement>document.getElementById('remail_i')).value)) {
      this.statusMessageService.displayStatus("Please enter a valid email !!!", 0)
      return 0
    }
    if ((<HTMLInputElement>document.getElementById('rpassword_i')).value.length < 7) {
      this.statusMessageService.displayStatus("Password should be more than 7 charachters !!!", 0)
      return 0
    }
    this.dialogRef.close({ name: (<HTMLInputElement>document.getElementById('uname_i')).value, email: (<HTMLInputElement>document.getElementById('remail_i')).value, password: (<HTMLInputElement>document.getElementById('rpassword_i')).value })
  }
  cancelRegisteration() {
    this.dialogRef.close({ name: -1 })
  }
  ngOnInit(): void {
  }

}
