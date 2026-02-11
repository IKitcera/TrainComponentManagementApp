import { Component, signal } from '@angular/core';
import { TrainAnimationComponent } from './train-animation-component/train-animation.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [TrainAnimationComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true
})
export class AppComponent {
  public hasInitialAnimationPlayed = signal(false);
}
