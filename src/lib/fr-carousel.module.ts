import { NgModule } from '@angular/core';
import {CommonModule} from '@angular/common';
import { FrCarousel,Slide} from './fr-carousel.component';
import {CustomEventManager} from './custom-events-manager';
import { EventManager } from '@angular/platform-browser';

@NgModule({
  declarations: [FrCarousel,Slide],
  imports: [CommonModule
  ],
  exports: [FrCarousel,Slide],
  providers:[{provide: EventManager,useClass:CustomEventManager}]
})
export class FrCarouselModule { }
