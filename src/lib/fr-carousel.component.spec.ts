import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FrCarousel } from './fr-carousel.component';

describe('FrCarousel', () => {
  let component: FrCarousel;
  let fixture: ComponentFixture<FrCarousel>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FrCarousel ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
