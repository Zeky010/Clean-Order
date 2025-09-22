import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogoutButton } from './logout-button/logout-button';
@Component({
  selector: 'app-side-menu',
  imports: [ RouterModule, LogoutButton ],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent {}
