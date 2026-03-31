import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../header/header';
import { AppSidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, AppHeaderComponent, AppSidebarComponent],
})
export class ShellComponent {
  protected readonly sidenavOpen = signal(true);

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }
}
