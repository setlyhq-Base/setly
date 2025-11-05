import { Injectable, signal } from '@angular/core';
import { Organization } from '../models/user.model';

export type { Organization };

@Injectable({
  providedIn: 'root'
})
export class OrgsService {
  private organizations = signal<Organization[]>([
    // Universities
    { id: '1', name: 'Harvard University', domain: 'harvard.edu', type: 'university' },
    { id: '2', name: 'Stanford University', domain: 'stanford.edu', type: 'university' },
    { id: '3', name: 'Massachusetts Institute of Technology', domain: 'mit.edu', type: 'university' },
    { id: '4', name: 'University of California, Berkeley', domain: 'berkeley.edu', type: 'university' },
    { id: '5', name: 'Yale University', domain: 'yale.edu', type: 'university' },
    { id: '6', name: 'University of New Haven', domain: 'newhaven.edu', type: 'university' },
    { id: '7', name: 'Princeton University', domain: 'princeton.edu', type: 'university' },
    { id: '8', name: 'Columbia University', domain: 'columbia.edu', type: 'university' },
    { id: '9', name: 'University of Chicago', domain: 'uchicago.edu', type: 'university' },
    { id: '10', name: 'University of Pennsylvania', domain: 'upenn.edu', type: 'university' },
    // Companies
    { id: '101', name: 'Google', domain: 'google.com', type: 'company' },
    { id: '102', name: 'Microsoft', domain: 'microsoft.com', type: 'company' },
    { id: '103', name: 'Apple', domain: 'apple.com', type: 'company' },
    { id: '104', name: 'Amazon', domain: 'amazon.com', type: 'company' },
    { id: '105', name: 'Meta', domain: 'meta.com', type: 'company' },
    { id: '106', name: 'Netflix', domain: 'netflix.com', type: 'company' },
    { id: '107', name: 'Tesla', domain: 'tesla.com', type: 'company' },
    { id: '108', name: 'Uber', domain: 'uber.com', type: 'company' },
  ]);

  search(query: string): Organization[] {
    const q = (query || '').trim().toLowerCase();
    if (q.length < 2) return [];
    return this.organizations().filter(org =>
      (org.name || '').toLowerCase().includes(q) ||
      (org.domain || '').toLowerCase().includes(q)
    ).slice(0, 8); // Limit to 8 suggestions
  }

  getAll(): Organization[] {
    return this.organizations();
  }

  getById(id: string): Organization | undefined {
    return this.organizations().find(org => org.id === id);
  }

  validateDomain(email: string): { isValid: boolean; organization?: Organization } {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return { isValid: false };

    const org = this.organizations().find(o => o.domain === domain);
    return { isValid: !!org, organization: org };
  }

  getUniversities(): Organization[] {
    return this.organizations().filter(org => org.type === 'university');
  }

  getCompanies(): Organization[] {
    return this.organizations().filter(org => org.type === 'company');
  }
}
