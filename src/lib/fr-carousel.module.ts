import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import { FrCarousel,FrSlide} from './fr-carousel.component';
import {CustomEventManager} from './custom-events-manager';
import { EventManager } from '@angular/platform-browser';
export { FrCarouselConfig} from './fr-carousel-config';
@NgModule({
  declarations: [FrCarousel,FrSlide],
  imports: [CommonModule
  ],
  exports: [FrCarousel,FrSlide],
  providers:[{provide: EventManager,useClass:CustomEventManager}]
})
export class FrCarouselModule { }
