import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Diamante } from './diamante';

describe('Diamante', () => {
  let component: Diamante;
  let fixture: ComponentFixture<Diamante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Diamante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Diamante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
