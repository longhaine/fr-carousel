import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class FrCarouselConfig {
  interval = 5000;
  keyboard = true;
  pauseOnHover = true;
  showNavigationArrows = true;
  showNavigationIndicators = true;
  animationDuration = 500;
}