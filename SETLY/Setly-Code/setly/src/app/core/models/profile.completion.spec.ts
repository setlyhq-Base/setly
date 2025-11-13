import { computeCompletion, ProfileSpec, VerificationsSpec } from './profile.model';

describe('computeCompletion (spec-aligned)', () => {
  it('returns 0 when nothing is set', () => {
    const p: ProfileSpec = { userId: 'u1' } as any;
    const v: VerificationsSpec = { emailVerified: false, phoneVerified: false, eduVerified: false, idVerified: false };
    expect(computeCompletion(p, v)).toBe(0);
  });

  it('awards identity and contact verification', () => {
    const p: ProfileSpec = { userId: 'u1', displayName: 'Ada Lovelace', avatarUrl: 'x' } as any;
    const v: VerificationsSpec = { emailVerified: true, phoneVerified: false, eduVerified: false, idVerified: false };
    expect(computeCompletion(p, v)).toBe(40); // 20 avatar+name + 20 email/phone
  });

  it('caps at 100 and counts safety prefs', () => {
    const p: ProfileSpec = {
      userId: 'u1', displayName: 'Ada', avatarUrl: 'x',
      about: 'A'.repeat(60), interests: ['a','b','c'], location: 'Boston', university: 'NEU',
      visibility: { publicProfile: true, showCity: true }
    };
    const v: VerificationsSpec = { emailVerified: true, phoneVerified: false, eduVerified: true, idVerified: false };
    expect(computeCompletion(p, v)).toBe(100);
  });

  it('partial data yields intermediate score', () => {
    const p: ProfileSpec = { userId: 'u2', displayName: 'Max', avatarUrl: 'a', about: 'Short', interests: ['x','y','z'] } as any;
    const v: VerificationsSpec = { emailVerified: false, phoneVerified: true, eduVerified: false, idVerified: false };
    // avatar+name (20) + about+interests (15) + phone/email (20) = 55
    expect(computeCompletion(p, v)).toBe(55);
  });
});
