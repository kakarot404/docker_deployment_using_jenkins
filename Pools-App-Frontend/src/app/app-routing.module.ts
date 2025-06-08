import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DBComponent } from './Components/db/db.component';
import { HomeComponent } from './Components/home/home.component';
import { ManageComponent } from './Components/manage/manage.component';
import { LoginComponent } from './Components/user/login/login.component';
import { ProfileComponent } from './Components/user/profile/profile.component';
import { DbguardGuard } from './Guards/dbguard.guard';
import { LoginguardGuard } from './Guards/loginguard.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'db',
    component: DBComponent,
    canActivate: [DbguardGuard]
  },
  {
    path: 'auth',
    component: LoginComponent,
    canActivate: [LoginguardGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [DbguardGuard]
  },
  {
    path: 'manage',
    component: ManageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
