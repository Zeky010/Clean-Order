import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SideMenuComponent } from './side-menu/side-menu.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SideMenuComponent, HeaderComponent, RouterOutlet],
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  router = inject(Router);
}