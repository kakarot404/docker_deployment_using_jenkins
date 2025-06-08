import { Component } from '@angular/core';
import { AuthService } from './Services/auth.service';
import { ManageService } from './Services/manage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Pools-App-Frontend';
  constructor(private authService: AuthService, private manageService: ManageService) {
  }
}
