import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-train-animation',
  templateUrl: './train-animation.component.html',
  styleUrls: ['./train-animation.component.scss']
})
export class TrainAnimationComponent implements OnInit {
  @Output() animationFinished = new EventEmitter<void>();

  public animationDuration: number = 9000; // default to 9000ms

  ngOnInit() {
    setTimeout(() => {
      this.animationFinished.emit();
    }, this.animationDuration);
  }
}
