import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})

// Snackbar to dispaly action status
export class StatusMessageService {

  constructor(private snackBar: MatSnackBar) { }

  // display action status
  // message - message to be displyed
  // status - 1 for success [green], 2 for failure [red]
  displayStatus(message, status, action = "") {
    if (status == 1) {
      this.snackBar.open(message, action, {
        panelClass: 'status-success-message',
        duration: 2000,
      });
    }
    else {
      this.snackBar.open(message, action, {
        panelClass: 'status-failure-message',
        duration: 2000,
      });
    }
  }
}
