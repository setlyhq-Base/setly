import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ProfileQuickCaptureModalComponent } from './profile-quick-capture.modal';
import { ProfileService } from '../../core/services/profile.service';
import { AuthStore } from '../../core/state/auth.store';
import { ProfileStore } from '../../core/state/profile.store';

// Minimal stubs for injected services/stores
class ProfileServiceStub {
  patchMe = jasmine.createSpy('patchMe').and.callFake(async (p: any) => ({ ...p }));
}
class AuthStoreStub {
  user() { return { userId: 'u_1', displayName: '', email: 'dev@example.com', phone: '' }; }
  setUser(_: any) {}
}
class ProfileStoreStub {
  profile() { return null as any; }
  hydrate(_: any) {}
}

describe('ProfileQuickCaptureModalComponent', () => {
  let component: ProfileQuickCaptureModalComponent;
  let fixture: ComponentFixture<ProfileQuickCaptureModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileQuickCaptureModalComponent],
      providers: [
        { provide: ProfileService, useClass: ProfileServiceStub },
        { provide: AuthStore, useClass: AuthStoreStub },
        { provide: ProfileStore, useClass: ProfileStoreStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileQuickCaptureModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should hide Save button until required fields are valid', () => {
    // Initial detect: no inputs filled → Save button should be absent
    fixture.detectChanges();
    let saveBtn = fixture.nativeElement.querySelector('button.primary');
    expect(saveBtn).toBeNull();

    // Fill required inputs for student: name, valid phone, and a university selection
    component.displayName = 'Jane Doe';
    component.role = 'student';
    component.phone = '+14155552671';
    component.universityId = 'uni_123';
    component.university = 'Test University';
    component.validate();
    component.onPhoneChanged();
    fixture.detectChanges();

    saveBtn = fixture.nativeElement.querySelector('button.primary');
    expect(saveBtn).withContext('Save should be visible when valid').not.toBeNull();
    expect(saveBtn.getAttribute('disabled')).toBeNull();
  });
});
