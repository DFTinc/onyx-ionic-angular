import { TestBed } from '@angular/core/testing';

import { OnyxService } from './onyx.service';

describe('OnyxService', () => {
  let service: OnyxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnyxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
