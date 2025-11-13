import { computeProfileCompletion, UserProfile } from './profile.model';

describe('computeProfileCompletion', () => {
  it('returns 0 for empty profile', () => {
    const empty = { id: '1', firstName: '', lastName: '', stats: { roomsPosted:0, ridesShared:0, reviewsCount:0, connectionsCount:0 }, verifications: { identity:false, university:false, phone:false, email:false } } as UserProfile;
    expect(computeProfileCompletion(empty)).toBe(0);
  });

  it('increases with fields populated', () => {
    const profile: UserProfile = {
      id: 'p1', firstName: 'Jane', lastName: 'Doe', avatarUrl: 'x', headline: 'Student', location: 'Boston, MA',
      about: 'A'.repeat(50), profession: 'CS Student', languages: ['English'], interests: ['gaming','coffee','music'],
      socials: { linkedin: 'https://linkedin.com/in/jane' }, stats: { roomsPosted:1, ridesShared:0, reviewsCount:0, connectionsCount:0 },
      verifications: { identity:true, university:true, phone:false, email:true }
    };
    const pct = computeProfileCompletion(profile);
    expect(pct).toBeGreaterThan(50);
    expect(pct).toBeLessThanOrEqual(100);
  });
});