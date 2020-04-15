import { TestBed } from '@angular/core/testing';

import { FrCarouselService } from './fr-carousel.service';

describe('FrCarouselService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FrCarouselService = TestBed.get(FrCarouselService);
    expect(service).toBeTruthy();
  });
});
