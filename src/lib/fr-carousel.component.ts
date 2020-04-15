import { Component,Input, TemplateRef, Directive, ContentChildren, QueryList, AfterContentInit,AfterViewChecked, AfterViewInit,NgZone, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { BehaviorSubject, combineLatest, NEVER, Subject, timer } from 'rxjs';
import { map, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
let slideId = 0;

@Directive({selector: 'ng-template[Slide]'})
export class Slide{
  @Input() id = `fr-slide-${slideId++}`;
  
  constructor(public templateRef:TemplateRef<any>){}
}


@Component({
  selector: 'fr-carousel',
  changeDetection:ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'carousel',
    '[style.display]': "'block'",
    '[style.position]':"'relative'",
    '[style.overflow]':"'hidden'",
    '[style.outline]':"'none'",
    '[style.-webkit-tap-highlight-color]':"'rgba(0, 0, 0, 0)'",
    'tabIndex': '0',
    '(touchstart.out-zone)':"touchStart($event)",
    '(touchmove.out-zone)':"touchMove($event)",
    '(touchend)':"touchEnd($event)",
    '(mouseenter.out-zone)':"mouseEnter()",
    '(mouseleave.out-zone)':"mouseLeave()",
    '(keydown.arrowLeft)': "keyboard && arrowEvent('left')",
    '(keydown.arrowRight)': "keyboard && arrowEvent('right')"
  },
  template: `
    <div class="carousel-inner">
      <ng-container *ngFor="let slide of slides">
        <div class="carousel-item"
        [id]="slide.id"
        [ngClass]="handleSlides(slide.id)">
          <ng-template [ngTemplateOutlet]="slide.templateRef"></ng-template>
        </div>
      </ng-container>
    </div>
    <a class="carousel-control-prev" (click)="arrowEvent('left')" role="button" *ngIf="showNavigationArrows">
      <i class="arrow left"></i>
    </a>
    <a class="carousel-control-next" (click)="arrowEvent('right')" role="button" *ngIf="showNavigationArrows">
      <i class="arrow right"></i>
    </a>
    <ol class="carousel-indicators" *ngIf="showNavigationIndicators">
      <li *ngFor="let slide of slides"
      [ngClass]="handleIndicators(slide.id)"
      (click)="indicatorEvent(slide.id)"></li>
    </ol>
  `,
  styleUrls: ['./fr-carousel.component.css']
})
export class FrCarousel implements AfterContentInit,AfterViewInit,AfterViewChecked,OnDestroy{
  @ContentChildren(Slide) slides: QueryList<Slide>;
  @Input() showNavigationArrows:boolean = true;
  @Input() showNavigationIndicators:boolean = true;
  @Input() keyboard:boolean = true;
  constructor(private ngZone:NgZone,
  private cd:ChangeDetectorRef) {
  }
  private _destroy$ = new Subject<void>();
  private _pause$ = new BehaviorSubject(false);
  private _pauseOnHover$ = new BehaviorSubject(true);
  private _interval$ = new BehaviorSubject(5000);
  private _mouseHover$ = new BehaviorSubject(false);
  private _isEventLegal$ = new BehaviorSubject(false);
  private _slidesChanged$ = new BehaviorSubject(false);
  private _animating$ = new BehaviorSubject(false);
  private _slides:Slide[];
  private _transition:string = "left .3s";
  private _active$:Element = null;
  private _prev$:Element;
  private _next$:Element;
  private _activeId:string;
  private _prevId:string;
  private _nextId:string;
  private _touchStart$:boolean = false;
  private _startX:number;
  private _moveX:number;
  ngAfterContentInit(){
    this.initEssentialInfo();
    this.slides.changes.subscribe(()=>{
      this.initEssentialInfo();
      this._slidesChanged$.next(true);
    });
  }
  ngAfterViewInit(){
    this.ngZone.runOutsideAngular(()=>{
      combineLatest([this._isEventLegal$,this._pause$, this._pauseOnHover$, this._mouseHover$, this._slidesChanged$, this._interval$])
      .pipe(map(([isEventLegal, pause, pauseOnHover, mouseHover, slidesChanged, interval]) =>
      ((!isEventLegal || pause || (pauseOnHover && mouseHover) || slidesChanged) ? 0 : interval))
      ,distinctUntilChanged()
      ,switchMap(interval => interval > 0 ? timer(interval,interval):NEVER)
      ,takeUntil(this._destroy$))
      .subscribe(()=>{
        this.ngZone.run(()=>{
          this.next();
        })
      });
    });
  }
  ngAfterViewChecked(): void {
    if(this._active$ === null || this._slidesChanged$.value == true){
      this._slidesChanged$.next(false);
      this.initSlideElements();
    }
  }
  ngOnDestroy(): void {
    this._destroy$.next();
  }

  pause(){
    this._pause$.next(true);
  }

  cycle(){
    this._pause$.next(false);
  }

  @Input()
  set pauseOnHover(value:boolean){
    this._pauseOnHover$.next(value);
  }
  get pauseOnHover(){
    return this._pauseOnHover$.value;
  }

  @Input()
  set interval(value:number){
    if(value < 500){
      value = 500; // minium is 500ms
    }
    this._interval$.next(value);
  }
  get interval(){
    return this._interval$.value;
  }

  private initEssentialInfo(){
    this._slides = this.slides.toArray();
    let value = false;
    if(this._slides.length > 0){
      if(this._active$ != null){
        this._active$.removeAttribute("style"); // when the length of slides changes then the style of active need to be removed
      }
      this.setSlideIds(this.slides.first.id);
    }
    if(this._slides.length > 1){
      value = true;
    }
    if(value != this._isEventLegal$.value){
      this._isEventLegal$.next(value);
    }
  }
  private initSlideElements(){
    this._active$ = document.getElementById(this._activeId);
    this._prev$ = document.getElementById(this._prevId);
    this._next$ = document.getElementById(this._nextId);
    this.cd.markForCheck();
  }
  handleSlides(slideId:string):string{
    if(slideId == this._activeId){
      return "active";
    }
    if(slideId == this._prevId && slideId == this._nextId){
      return "prev-next";
    }
    if(slideId == this._prevId){
      return "prev";
    }
    if(slideId == this._nextId){
      return "next";
    }
    return null;
  }
  handleIndicators(slideId:string){
    if(slideId == this._activeId){
      return "active";
    }
    return null;
  }
  private removeStyleSlides(){
    this._active$.removeAttribute("style");
    this._prev$.removeAttribute("style");
    this._next$.removeAttribute("style");
  }
  private removeStyleSlide(slide:Element){
    if(slide != null){
      slide.removeAttribute("style");
    }
  }
  private findPosition(id:string):number{
    let length = this._slides.length;
    for(let i = 0; i < length; i++){
      if(this._slides[i].id == id){
        return i;
      }
    }
  }
  //activeId, prevId and nextId
  private setSlideIds(newActiveId:string){
    this._activeId = newActiveId;
    let length = this._slides.length;
    let positionCurrent = this.findPosition(this._activeId);
    let positionPrev:number = 0;
    let positionNext:number = 0;
    if(positionCurrent == 0 || positionCurrent == length - 1){
      if(positionCurrent == 0)
      {
        positionPrev = length - 1;
        if(length > 1){
          positionNext = 1;
        }
      }
      else{
        if(length > 1){
          positionPrev = positionCurrent - 1;
        }
        positionNext = 0;
      }
    }
    else{
      positionPrev = positionCurrent - 1;
      positionNext = positionCurrent + 1;
    }
    if(length > 1){
      this._prevId = this._slides[positionPrev].id;
      this._nextId = this._slides[positionNext].id;
    }
    if(this._active$ !== null){
      this.initSlideElements();
    }
  }
  touchStart(event:TouchEvent){
    this._startX = event.touches[0].clientX;
    if(this._animating$.value == false){
      this._touchStart$ = true;
      this._animating$.next(true);
    }
  }
  touchMove(event:TouchEvent){
    if(this._isEventLegal$.value && this._touchStart$){
      event.preventDefault();
      this._moveX = event.touches[0].clientX;
      let change = this._startX - this._moveX;
      let width = this._active$.clientWidth;
      if(change > 0 && change <= width){
        this._active$.setAttribute("style",`left:-${change}px;`);
        this._next$.setAttribute("style",`left:${width - change}px;`);
      }
      else if(change < 0 && (width+change) >=0){
        this._active$.setAttribute("style",`left:${Math.abs(change)}px;`);
        this._prev$.setAttribute("style",`left:-${width + change}px;`);
      }
    }
  }
  touchEnd(event:TouchEvent){
    if(this._isEventLegal$.value && this._touchStart$){
      let endX = event.changedTouches[0].clientX;
      let threshold = this._active$.clientWidth / 3;
      let change = this._startX - endX;
      this.removeStyleSlides();
      if(Math.abs(change) >= threshold){ // |change| absolute
        if(change > 0){
          this._active$.setAttribute("style",`left:-100%;transition:${this._transition}`);
          this._next$.setAttribute("style",`left:0%;transition:${this._transition}`);
          this.setSlideIds(this._nextId);
        }
        else{
          this._active$.setAttribute("style",`left:100%;transition:${this._transition}`);
          this._prev$.setAttribute("style",`left:0%;transition:${this._transition}`);
          this.setSlideIds(this._prevId);
        }
      }
      else{
        this._active$.setAttribute("style",`transition:${this._transition}`);
        if(change > 0){
          this._next$.setAttribute("style",`left:100%;transition:${this._transition}`);
        }
        else{
          this._prev$.setAttribute("style",`left:-100%;transition:${this._transition}`);
        }
      }
      this._touchStart$ = false;
      this._animating$.next(false);
    }
  }
  indicatorEvent(slideId:string){
    setTimeout(()=>{
      if(slideId != this._activeId){
        this.removeStyleSlides();
        let activePosition = this.findPosition(this._activeId);
        let slidePosition = this.findPosition(slideId);
        let oldActive = document.getElementById(this._activeId);
        let newActive:Element = document.getElementById(slideId);
        if(activePosition < slidePosition){
          this.animateToLeft(oldActive,newActive);
        }
        else{
          this.animateToRight(oldActive,newActive);
        }
        this.setSlideIds(slideId);
        setTimeout(()=>{
          this.removeCenterAnimation(oldActive);
          this.removeSideAnimation(newActive);
        },500); // animation duration .5s;
      }
    },1);
  }
  arrowEvent(direction:string){
    if(this._animating$.value == false && this._isEventLegal$.value){
      this._animating$.next(true);
      let newActiveId;
      this.removeStyleSlides();
      if(direction == 'left'){
        this.animateToRight(this._active$,this._prev$);
        newActiveId = this._prevId;
      }
      else{
        this.animateToLeft(this._active$,this._next$);
        newActiveId = this._nextId;
      }
      this.setSlideIds(newActiveId);
      this.removeAnimation();
    }
  }
  next(){
    if(!this._animating$.value && this._isEventLegal$.value){
      this._animating$.next(true);
      this.removeStyleSlide(this._active$);
      this.removeStyleSlide(this._prev$);
      this.removeStyleSlide(this._next$);
      this.animateToLeft(this._active$,this._next$);
      this.setSlideIds(this._nextId);
      this.removeAnimation();
    }
  }
  prev(){
    if(!this._animating$.value && this._isEventLegal$.value){
      this._animating$.next(true);
      this.removeStyleSlide(this._active$);
      this.removeStyleSlide(this._prev$);
      this.removeStyleSlide(this._next$);
      this.animateToRight(this._active$,this._prev$);
      this.setSlideIds(this._prevId);
      this.removeAnimation();
    }
  }
  mouseEnter(){
    this._mouseHover$.next(true);
  }
  mouseLeave(){
    this._mouseHover$.next(false);
  }
  removeAnimation(){
    setTimeout(()=>{
      this.removeSideAnimation(this._active$);// because new active is the old side
      // new prev or new next is the old active
      this.removeCenterAnimation(this._prev$);
      this.removeCenterAnimation(this._next$);
      this._animating$.next(false);
    },500); // animation duration .5s;
  }
  private animateToLeft(center:Element,side:Element){
    if(center != null){
      center.classList.add("center-to-left");
    }
    if(side != null){
      side.classList.add("right-to-center");
    }
  }
  private animateToRight(center:Element,side:Element){
    if(center != null){
      center.classList.add("center-to-right");
    }
    if(side != null){
      side.classList.add("left-to-center");
    }
  }
  private removeCenterAnimation(center:Element){
    if(center != null){
      center.classList.remove("center-to-left");
      center.classList.remove("center-to-right");
    }
  }
  private removeSideAnimation(side:Element){
    if(side != null){
      side.classList.remove("left-to-center");
      side.classList.remove("right-to-center");
    }
  }
}
