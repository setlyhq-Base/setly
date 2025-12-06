import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { ExploreFormCardComponent } from './explore-form-card.component';
import { UploadsService } from '../../core/services/uploads.service';
import { RoomsService } from '../../core/services/rooms.service';
import { CurrentUserService } from '../../core/user/current-user.service';
import { ToastService } from '../../core/services/toast.service';
import { RoomStore } from '../../core/state/room.store';

// Mock file for testing
class MockFile extends File {
  constructor(name: string = 'test.jpg', type: string = 'image/jpeg') {
    super(['test-content'], name, { type });
  }
}

describe('ExploreFormCardComponent - Room Posting', () => {
  let component: ExploreFormCardComponent;
  let mockUploadsService: jasmine.SpyObj<UploadsService>;
  let mockRoomsService: jasmine.SpyObj<RoomsService>;
  let mockCurrentUserService: jasmine.SpyObj<CurrentUserService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockRoomStore: jasmine.SpyObj<RoomStore>;

  beforeEach(async () => {
    const uploadsServiceSpy = jasmine.createSpyObj('UploadsService', ['uploadToS3']);
    const roomsServiceSpy = jasmine.createSpyObj('RoomsService', ['initUpload', 'publish']);
    const currentUserServiceSpy = jasmine.createSpyObj('CurrentUserService', ['currentUser']);
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['success', 'warning']);
    const roomStoreSpy = jasmine.createSpyObj('RoomStore', ['addRoom']);

    await TestBed.configureTestingModule({
      imports: [ExploreFormCardComponent, ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: UploadsService, useValue: uploadsServiceSpy },
        { provide: RoomsService, useValue: roomsServiceSpy },
        { provide: CurrentUserService, useValue: currentUserServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: RoomStore, useValue: roomStoreSpy },
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ExploreFormCardComponent);
    component = fixture.componentInstance;
    component.tab = 'rooms';

    mockUploadsService = TestBed.inject(UploadsService) as jasmine.SpyObj<UploadsService>;
    mockRoomsService = TestBed.inject(RoomsService) as jasmine.SpyObj<RoomsService>;
    mockCurrentUserService = TestBed.inject(CurrentUserService) as jasmine.SpyObj<CurrentUserService>;
    mockToastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    mockRoomStore = TestBed.inject(RoomStore) as jasmine.SpyObj<RoomStore>;

    fixture.detectChanges();
  });

  describe('Room posting validation', () => {
    it('should require at least 3 photos', async () => {
      // Setup user
      mockCurrentUserService.currentUser.and.returnValue({
        uid: 'test-user',
        displayName: 'Test User',
        email: 'test@example.com'
      } as any);

      // Setup form with insufficient photos
      const form = component.roomsPostForm;
      form.patchValue({
        city: 'Boston',
        state: 'MA',
        address: '123 Test St',
        roomType: 'private',
        price: 1000,
        description: 'Test room',
        photos: [new MockFile('test1.jpg'), new MockFile('test2.jpg')] // Only 2 photos
      });

      // Attempt to submit
      await component['postRoom']();

      // Should show error
      expect(component.error()).toBe('Please add at least 3 photos.');
      expect(component.loading()).toBe(false);
    });

    it('should require user to be signed in', async () => {
      // No user signed in
      mockCurrentUserService.currentUser.and.returnValue(null);

      // Setup form with valid data
      const form = component.roomsPostForm;
      form.patchValue({
        city: 'Boston',
        state: 'MA',
        address: '123 Test St',
        roomType: 'private',
        price: 1000,
        description: 'Test room',
        photos: [new MockFile('test1.jpg'), new MockFile('test2.jpg'), new MockFile('test3.jpg')]
      });

      // Attempt to submit
      await component['postRoom']();

      // Should show error
      expect(component.error()).toBe('Sign in required to post a room.');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Successful room posting flow', () => {
    beforeEach(() => {
      // Setup signed-in user
      mockCurrentUserService.currentUser.and.returnValue({
        uid: 'test-user',
        displayName: 'Test User',
        email: 'test@example.com'
      } as any);

      // Mock successful init response
      mockRoomsService.initUpload.and.returnValue(of({
        roomId: 'test-room-id',
        uploads: [
          { publicUrl: 'https://s3.amazonaws.com/bucket/room1.jpg', fields: {} },
          { publicUrl: 'https://s3.amazonaws.com/bucket/room2.jpg', fields: {} },
          { publicUrl: 'https://s3.amazonaws.com/bucket/room3.jpg', fields: {} }
        ]
      }));

      // Mock successful uploads
      mockUploadsService.uploadToS3.and.returnValue(Promise.resolve({ url: 'test-url' }));

      // Mock successful publish
      mockRoomsService.publish.and.returnValue(of({
        id: 'test-room-id',
        title: 'Private room in Boston',
        price: 1000,
        photos: ['https://s3.amazonaws.com/bucket/room1.jpg'],
        city: 'Boston',
        state: 'MA',
        roomType: 'private'
      }));
    });

    it('should successfully post a room with valid data', async () => {
      // Setup form with valid data
      const form = component.roomsPostForm;
      form.patchValue({
        city: 'Boston',
        state: 'MA',
        address: '123 Test St',
        addressLat: 42.3601,
        addressLon: -71.0589,
        roomType: 'private',
        price: 1000,
        description: 'Test room description',
        amenities: ['wifi', 'furnished', 'laundry'],
        photos: [new MockFile('test1.jpg'), new MockFile('test2.jpg'), new MockFile('test3.jpg')]
      });

      // Submit form
      await component['postRoom']();

      // Verify init was called with correct payload
      expect(mockRoomsService.initUpload).toHaveBeenCalledWith(jasmine.objectContaining({
        city: 'Boston',
        state: 'MA',
        address: '123 Test St',
        roomType: 'private',
        price: 1000,
        description: 'Test room description',
        amenities: ['wifi', 'furnished', 'laundry'],
        files: jasmine.any(Array)
      }));

      // Verify upload was called for each file
      expect(mockUploadsService.uploadToS3).toHaveBeenCalledTimes(3);

      // Verify publish was called with correct payload
      expect(mockRoomsService.publish).toHaveBeenCalledWith('test-room-id', jasmine.objectContaining({
        title: 'Private room in Boston',
        city: 'Boston',
        state: 'MA',
        price: 1000,
        roomType: 'private',
        furnished: true, // Should extract from amenities
        amenities: ['wifi', 'laundry'], // Should exclude 'furnished'
        photos: jasmine.any(Array)
      }));

      // Verify success actions
      expect(mockRoomStore.addRoom).toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalledWith('Room posted successfully');
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
    });

    it('should handle upload failures gracefully', async () => {
      // Mock partial upload failure
      mockUploadsService.uploadToS3.and.returnValues(
        Promise.resolve({ url: 'success1' }),
        Promise.reject(new Error('Upload failed')),
        Promise.resolve({ url: 'success2' }),
        Promise.resolve({ url: 'success3' })
      );

      // Update mock init to return 4 uploads
      mockRoomsService.initUpload.and.returnValue(of({
        roomId: 'test-room-id',
        uploads: [
          { publicUrl: 'url1', fields: {} },
          { publicUrl: 'url2', fields: {} },
          { publicUrl: 'url3', fields: {} },
          { publicUrl: 'url4', fields: {} }
        ]
      }));

      // Setup form with 4 photos
      const form = component.roomsPostForm;
      form.patchValue({
        city: 'Boston',
        state: 'MA',
        address: '123 Test St',
        roomType: 'private',
        price: 1000,
        description: 'Test room',
        photos: [
          new MockFile('test1.jpg'),
          new MockFile('test2.jpg'),
          new MockFile('test3.jpg'),
          new MockFile('test4.jpg')
        ]
      });

      // Submit form
      await component['postRoom']();

      // Should show warning about failed upload
      expect(mockToastService.warning).toHaveBeenCalledWith('1 photo failed to upload.');

      // Should still proceed with successful uploads (3 remaining)
      expect(mockRoomsService.publish).toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalledWith('Room posted successfully');
    });

    it('should handle insufficient successful uploads', async () => {
      // Mock all uploads failing except 2
      mockUploadsService.uploadToS3.and.returnValues(
        Promise.resolve({ url: 'success1' }),
        Promise.reject(new Error('Failed')),
        Promise.resolve({ url: 'success2' }),
        Promise.reject(new Error('Failed'))
      );

      // Update mock init
      mockRoomsService.initUpload.and.returnValue(of({
        roomId: 'test-room-id',
        uploads: [
          { publicUrl: 'url1', fields: {} },
          { publicUrl: 'url2', fields: {} },
          { publicUrl: 'url3', fields: {} },
          { publicUrl: 'url4', fields: {} }
        ]
      }));

      // Setup form
      const form = component.roomsPostForm;
      form.patchValue({
        city: 'Boston',
        state: 'MA',
        photos: [
          new MockFile('test1.jpg'),
          new MockFile('test2.jpg'),
          new MockFile('test3.jpg'),
          new MockFile('test4.jpg')
        ]
      });

      // Submit form
      await component['postRoom']();

      // Should show error about insufficient uploads
      expect(component.error()).toBe('Minimum 3 successful photo uploads required.');
      expect(component.loading()).toBe(false);

      // Should not call publish
      expect(mockRoomsService.publish).not.toHaveBeenCalled();
    });
  });
});