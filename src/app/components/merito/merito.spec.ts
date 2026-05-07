import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Merito } from './merito';

describe('Merito', () => {
  let component: Merito;
  let fixture: ComponentFixture<Merito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Merito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Merito);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
