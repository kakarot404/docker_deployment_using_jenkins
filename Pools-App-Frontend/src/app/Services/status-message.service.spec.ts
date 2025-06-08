import { TestBed } from '@angular/core/testing';

import { StatusMessageService } from './status-message.service';

describe('StatusMessageService', () => {
  let service: StatusMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
