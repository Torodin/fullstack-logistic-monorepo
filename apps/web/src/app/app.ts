import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { AppMenuBar } from './app-menu-bar/app-menu-bar';

@Component({
  imports: [AppMenuBar, RouterModule, ToastModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Logistic App';
}
