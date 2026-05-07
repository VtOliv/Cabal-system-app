import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Platina } from './platina';

describe('Platina', () => {
  let component: Platina;
  let fixture: ComponentFixture<Platina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Platina]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Platina);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
