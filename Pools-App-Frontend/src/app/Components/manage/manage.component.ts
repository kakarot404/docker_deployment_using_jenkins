import { Component, OnInit } from '@angular/core';
import { ManageService } from 'src/app/Services/manage.service';
import { StatusMessageService } from 'src/app/Services/status-message.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  constructor(public manageService: ManageService, private statusMessageService: StatusMessageService) {
  }

  updateDBconfig(event) {
    this.manageService.upateConfig({
      dbEnabled: event.checked,
      authEnabled: this.manageService.authEnabled
    }).subscribe((response) => {
      if (response.status == 200) {
        this.manageService.dbEnabled = event.checked
        event.checked ? this.statusMessageService.displayStatus("Database Enabled !!!", 1) : this.statusMessageService.displayStatus("Database Disabled !!!", 1);
      }
      else {
        this.statusMessageService.displayStatus("Something went wrong !!!", 0)
      }
    })
  }

  updateAuthConfig(event) {
    this.manageService.upateConfig({
      dbEnabled: this.manageService.dbEnabled,
      authEnabled: event.checked
    }).subscribe((response) => {
      if (response.status == 200) {
        this.manageService.authEnabled = event.checked
        event.checked ? this.statusMessageService.displayStatus("Authentication Enabled !!!", 1) : this.statusMessageService.displayStatus("Authentication Disabled !!!", 1);
      }
      else {
        this.statusMessageService.displayStatus("Something went wrong !!!", 0)
      }
    })
  }

  ngOnInit(): void {
  }

}
