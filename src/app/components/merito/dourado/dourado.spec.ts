import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dourado } from './dourado';

describe('Dourado', () => {
  let component: Dourado;
  let fixture: ComponentFixture<Dourado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dourado]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dourado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
