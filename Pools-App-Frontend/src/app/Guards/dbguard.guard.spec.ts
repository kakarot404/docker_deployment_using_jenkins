import { TestBed } from '@angular/core/testing';

import { DbguardGuard } from './dbguard.guard';

describe('DbguardGuard', () => {
  let guard: DbguardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(DbguardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
