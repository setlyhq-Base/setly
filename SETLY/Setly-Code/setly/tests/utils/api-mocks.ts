import type { Page, Route } from '@playwright/test';

const configured = new WeakSet<Page>();

type JsonValue = null | boolean | number | string | undefined | JsonValue[] | { [k: string]: JsonValue };

type MockApiOptions = {
  userId?: string;
  authUid?: string;
  email?: string;
  displayName?: string;
};

function json(route: Route, status: number, body: JsonValue) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function makeMe(opts: Required<MockApiOptions>) {
  return {
    id: opts.userId,
    authUid: opts.authUid,
    email: opts.email,
    displayName: opts.displayName,
    photoUrl: 'https://i.pravatar.cc/200?img=12',
    bio: 'E2E mock user bio',
    phone: '(555) 555-5555',
    city: 'New Haven',
    state: 'CT',
    universityId: 'unh',
    languages: ['English'],
    interests: ['Coffee', 'Travel'],
    socials: {},
    headline: 'Student',
    coverImageUrl: undefined,
    profileVisibility: {
      about: true,
      travelHistory: true,
      reviews: true,
      interests: true,
      connections: true,
      verification: true,
    },
    isProfileComplete: true,
    connectionsCount: 0,
  };
}

export async function enableMockApi(page: Page, options?: MockApiOptions) {
  if (configured.has(page)) return;
  configured.add(page);

  const opts: Required<MockApiOptions> = {
    userId: options?.userId ?? 'e2e-user-1',
    authUid: options?.authUid ?? 'e2e-mock-uid',
    email: options?.email ?? 'mock.user@setly.test',
    displayName: options?.displayName ?? 'E2E Mock User',
  };

  let me = makeMe(opts);

  const mockRooms = Array.from({ length: 30 }).map((_, idx) => {
    const i = idx + 1;
    return {
      id: String(i),
      title: `Mock Room ${i}`,
      address: `${100 + i} Main St`,
      city: i % 3 === 0 ? 'New Haven' : (i % 3 === 1 ? 'Boston' : 'Cambridge'),
      state: i % 3 === 0 ? 'CT' : 'MA',
      price: 800 + (i % 10) * 75,
      roomType: i % 4 === 0 ? 'shared' : 'private',
      amenities: ['WiFi', 'Laundry', 'Kitchen'],
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      photos: [],
    };
  });

  const mockRides = Array.from({ length: 30 }).map((_, idx) => {
    const i = idx + 1;
    return {
      rideId: `ride-${i}`,
      userId: opts.userId,
      pickupAddress: i % 2 === 0 ? 'Boston Downtown' : 'New Haven Campus',
      pickupLat: 42.3601,
      pickupLng: -71.0589,
      dropoffAddress: i % 2 === 0 ? 'Boston Airport' : 'NYC Downtown',
      dropoffLat: 42.3656,
      dropoffLng: -71.0096,
      rideDate: '2025-01-15',
      rideTime: i % 2 === 0 ? '09:00' : '16:30',
      seatsAvailable: 1 + (i % 4),
      pricePerSeat: (i % 5) * 5,
      images: [],
      status: 'active',
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      userName: opts.displayName,
      userPhoto: 'https://i.pravatar.cc/200?img=12',
      userVerified: true,
    };
  });

  const mockMarketplace = Array.from({ length: 20 }).map((_, idx) => {
    const i = idx + 1;
    return {
      itemId: `item-${i}`,
      userId: opts.userId,
      category: i % 3 === 0 ? 'Furniture' : (i % 3 === 1 ? 'Electronics' : 'Kitchen'),
      title: `Mock Item ${i}`,
      description: 'E2E mock item description',
      price: 10 + i * 3,
      condition: i % 4 === 0 ? 'fair' : (i % 4 === 1 ? 'good' : (i % 4 === 2 ? 'like-new' : 'new')),
      images: [],
      location: 'New Haven, CT',
      tags: ['e2e'],
      status: 'available',
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      userName: opts.displayName,
      userPhoto: 'https://i.pravatar.cc/200?img=12',
      userVerified: true,
    };
  });

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const path = url.pathname;

    // Auth sync
    if (path === '/api/auth/sync' && method === 'POST') {
      return json(route, 200, { ok: true });
    }

    // Current user
    if (path === '/api/users/me') {
      if (method === 'GET') return json(route, 200, me);

      if (method === 'PUT') {
        let patch: any = {};
        try {
          patch = req.postDataJSON();
        } catch {
          patch = {};
        }
        me = { ...me, ...patch };
        return json(route, 200, me);
      }

      return json(route, 405, { message: 'Method not allowed' });
    }

    // Saved items
    if (path === '/api/users/me/saved' && method === 'GET') {
      return json(route, 200, { rooms: [], rides: [], marketplace: [] });
    }

    if (/^\/api\/users\/me\/saved\/(rooms|rides|marketplace)(\/[^/]+)?$/.test(path)) {
      if (method === 'POST' || method === 'DELETE') return json(route, 200, { ok: true });
    }

    // Public user profile
    const userMatch = path.match(/^\/api\/users\/([^/]+)$/);
    if (userMatch && method === 'GET') {
      const id = decodeURIComponent(userMatch[1]);
      return json(route, 200, {
        id,
        displayName: id === opts.userId ? opts.displayName : `User ${id}`,
        photoUrl: 'https://i.pravatar.cc/200?img=12',
        createdAt: new Date().toISOString(),
        city: 'New Haven',
        state: 'CT',
        universityId: 'unh',
        email: undefined,
        phone: undefined,
        country: 'USA',
        organization: 'University of New Haven',
        company: undefined,
        role: 'student',
        bio: 'Public profile bio',
        interests: ['Coffee', 'Travel'],
        languages: ['English'],
        socials: {},
        preferences: {},
        travelHistory: [],
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isProfileComplete: true,
        connectionsCount: 0,
      });
    }

    // Universities lookup
    if (path === '/api/universities' && method === 'GET') {
      const query = (url.searchParams.get('query') || '').toLowerCase();
      const city = (url.searchParams.get('city') || '').toLowerCase();
      const all = [
        { id: 'unh', name: 'University of New Haven', city: 'West Haven', state: 'CT' },
        { id: 'yale', name: 'Yale University', city: 'New Haven', state: 'CT' },
        { id: 'nyu', name: 'New York University', city: 'New York', state: 'NY' },
      ];
      const list = all.filter((u) => {
        const matchesQuery = !query || u.name.toLowerCase().includes(query);
        const matchesCity = !city || u.city.toLowerCase().includes(city);
        return matchesQuery && matchesCity;
      });
      return json(route, 200, { list });
    }

    // Rooms
    if (path === '/api/rooms' && method === 'GET') {
      return json(route, 200, { count: mockRooms.length, rooms: mockRooms });
    }
    if (path === '/api/rooms' && method === 'POST') {
      let body: any = {};
      try {
        body = req.postDataJSON();
      } catch {
        body = {};
      }
      return json(route, 200, { id: 'room-1', ...body, createdAt: new Date().toISOString() });
    }
    if (/^\/api\/rooms\/.+\/publish$/.test(path) && method === 'POST') {
      const roomId = path.split('/')[3];
      let body: any = {};
      try {
        body = req.postDataJSON();
      } catch {
        body = {};
      }
      return json(route, 200, { id: roomId, ...body, createdAt: new Date().toISOString() });
    }
    if (path === '/api/rooms/init' && method === 'POST') {
      return json(route, 200, {
        roomId: 'room-1',
        uploads: [
          {
            key: 'uploads/room-1/photo-1.jpg',
            url: 'https://example.invalid/upload',
            fields: {},
            contentType: 'image/jpeg',
            publicUrl: 'https://example.invalid/public/photo-1.jpg',
          },
        ],
      });
    }
    if (/^\/api\/rooms\/.+$/.test(path) && method === 'GET') {
      const roomId = path.split('/')[3];
      const found = mockRooms.find((r) => r.id === roomId);
      return json(route, 200, found || {
        id: roomId,
        title: 'Mock Room',
        city: 'New Haven',
        state: 'CT',
        price: 900,
        roomType: 'private',
        createdAt: new Date().toISOString(),
        photos: [],
      });
    }

    // Rides
    if (path === '/api/rides' && method === 'GET') {
      return json(route, 200, { count: mockRides.length, rides: mockRides });
    }

    // Marketplace
    if (path === '/api/marketplace' && method === 'GET') {
      return json(route, 200, { count: mockMarketplace.length, items: mockMarketplace });
    }

    // Profile patch endpoint (used by ProfileStore.patch)
    if (path === '/api/profile' && method === 'PATCH') {
      let patch: any = {};
      try {
        patch = req.postDataJSON();
      } catch {
        patch = {};
      }
      return json(route, 200, {
        profile: { ...patch },
        verifications: { emailVerified: true, phoneVerified: true, eduVerified: true, idVerified: true },
        completion: 100,
      });
    }

    // Default: keep tests moving (avoid hard failures due to missing backend).
    return json(route, 200, {});
  });
}
