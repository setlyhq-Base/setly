import { Injectable, signal } from '@angular/core';

export interface University {
  id: string;
  name: string;
  city: string;
  state: string;
  coords?: { lat: number; lng: number };
}

@Injectable({
  providedIn: 'root'
})
export class UniversityService {
  private universities = signal<University[]>([
    { id: '1', name: 'Harvard University', city: 'Cambridge', state: 'MA', coords: { lat: 42.3770, lng: -71.1167 } },
    { id: '2', name: 'Stanford University', city: 'Stanford', state: 'CA', coords: { lat: 37.4275, lng: -122.1697 } },
    { id: '3', name: 'Massachusetts Institute of Technology', city: 'Cambridge', state: 'MA', coords: { lat: 42.3601, lng: -71.0942 } },
    { id: '4', name: 'University of California, Berkeley', city: 'Berkeley', state: 'CA', coords: { lat: 37.8715, lng: -122.2730 } },
    { id: '5', name: 'Yale University', city: 'New Haven', state: 'CT', coords: { lat: 41.3163, lng: -72.9223 } },
    { id: '6', name: 'University of New Haven', city: 'West Haven', state: 'CT', coords: { lat: 41.2909, lng: -72.9570 } },
    { id: '7', name: 'Princeton University', city: 'Princeton', state: 'NJ', coords: { lat: 40.3430, lng: -74.6514 } },
    { id: '8', name: 'Columbia University', city: 'New York', state: 'NY', coords: { lat: 40.8075, lng: -73.9626 } },
    { id: '9', name: 'University of Chicago', city: 'Chicago', state: 'IL', coords: { lat: 41.7886, lng: -87.5987 } },
    { id: '10', name: 'University of Pennsylvania', city: 'Philadelphia', state: 'PA', coords: { lat: 39.9522, lng: -75.1932 } },
    { id: '11', name: 'Northwestern University', city: 'Evanston', state: 'IL', coords: { lat: 42.0565, lng: -87.6753 } },
    { id: '12', name: 'Duke University', city: 'Durham', state: 'NC', coords: { lat: 36.0014, lng: -78.9382 } },
    { id: '13', name: 'Johns Hopkins University', city: 'Baltimore', state: 'MD', coords: { lat: 39.3299, lng: -76.6205 } },
    { id: '14', name: 'University of Michigan', city: 'Ann Arbor', state: 'MI', coords: { lat: 42.2780, lng: -83.7382 } },
    { id: '15', name: 'Carnegie Mellon University', city: 'Pittsburgh', state: 'PA', coords: { lat: 40.4430, lng: -79.9430 } },
    { id: '16', name: 'University of Virginia', city: 'Charlottesville', state: 'VA', coords: { lat: 38.0336, lng: -78.5080 } },
    { id: '17', name: 'University of Southern California', city: 'Los Angeles', state: 'CA', coords: { lat: 34.0224, lng: -118.2851 } },
    { id: '18', name: 'Georgetown University', city: 'Washington', state: 'DC', coords: { lat: 38.9076, lng: -77.0723 } },
    { id: '19', name: 'University of Notre Dame', city: 'Notre Dame', state: 'IN', coords: { lat: 41.7056, lng: -86.2353 } },
    { id: '20', name: 'Vanderbilt University', city: 'Nashville', state: 'TN', coords: { lat: 36.1447, lng: -86.8027 } },
    { id: '21', name: 'Rice University', city: 'Houston', state: 'TX', coords: { lat: 29.7174, lng: -95.4018 } },
    { id: '22', name: 'Washington University in St. Louis', city: 'St. Louis', state: 'MO', coords: { lat: 38.6488, lng: -90.3108 } },
    { id: '23', name: 'University of North Carolina at Chapel Hill', city: 'Chapel Hill', state: 'NC', coords: { lat: 35.9049, lng: -79.0469 } },
    { id: '24', name: 'University of California, Los Angeles', city: 'Los Angeles', state: 'CA', coords: { lat: 34.0689, lng: -118.4452 } },
    { id: '25', name: 'Brown University', city: 'Providence', state: 'RI', coords: { lat: 41.8268, lng: -71.4025 } },
    { id: '26', name: 'Dartmouth College', city: 'Hanover', state: 'NH', coords: { lat: 43.7044, lng: -72.2887 } },
    { id: '27', name: 'Cornell University', city: 'Ithaca', state: 'NY', coords: { lat: 42.4534, lng: -76.4735 } },
    { id: '28', name: 'University of Wisconsin-Madison', city: 'Madison', state: 'WI', coords: { lat: 43.0766, lng: -89.4125 } },
    { id: '29', name: 'University of Texas at Austin', city: 'Austin', state: 'TX', coords: { lat: 30.2849, lng: -97.7341 } },
    { id: '30', name: 'California Institute of Technology', city: 'Pasadena', state: 'CA', coords: { lat: 34.1377, lng: -118.1253 } },
    { id: '31', name: 'University of Washington', city: 'Seattle', state: 'WA', coords: { lat: 47.6553, lng: -122.3035 } },
    { id: '32', name: 'University of Illinois at Urbana-Champaign', city: 'Urbana', state: 'IL', coords: { lat: 40.1019, lng: -88.2272 } },
    { id: '33', name: 'Boston University', city: 'Boston', state: 'MA', coords: { lat: 42.3505, lng: -71.1054 } },
    { id: '34', name: 'George Washington University', city: 'Washington', state: 'DC', coords: { lat: 38.8997, lng: -77.0413 } },
    { id: '35', name: 'Emory University', city: 'Atlanta', state: 'GA', coords: { lat: 33.7970, lng: -84.3218 } },
    { id: '36', name: 'University of Minnesota', city: 'Minneapolis', state: 'MN', coords: { lat: 44.9740, lng: -93.2277 } },
    { id: '37', name: 'University of Maryland, College Park', city: 'College Park', state: 'MD', coords: { lat: 38.9869, lng: -76.9426 } },
    { id: '38', name: 'University of Pittsburgh', city: 'Pittsburgh', state: 'PA', coords: { lat: 40.4444, lng: -79.9608 } },
    { id: '39', name: 'University of Iowa', city: 'Iowa City', state: 'IA', coords: { lat: 41.6611, lng: -91.5302 } },
    { id: '40', name: 'University of Florida', city: 'Gainesville', state: 'FL', coords: { lat: 29.6436, lng: -82.3549 } },
    { id: '41', name: 'University of Arizona', city: 'Tucson', state: 'AZ', coords: { lat: 32.2319, lng: -110.9501 } },
    { id: '42', name: 'University of Colorado Boulder', city: 'Boulder', state: 'CO', coords: { lat: 40.0076, lng: -105.2659 } },
    { id: '43', name: 'University of Miami', city: 'Coral Gables', state: 'FL', coords: { lat: 25.7179, lng: -80.2740 } },
    { id: '44', name: 'Tulane University', city: 'New Orleans', state: 'LA', coords: { lat: 29.9405, lng: -90.1203 } },
    { id: '45', name: 'Southern Methodist University', city: 'Dallas', state: 'TX', coords: { lat: 32.8412, lng: -96.7845 } },
    { id: '46', name: 'University of Alabama', city: 'Tuscaloosa', state: 'AL', coords: { lat: 33.2140, lng: -87.5391 } },
    { id: '47', name: 'University of Utah', city: 'Salt Lake City', state: 'UT', coords: { lat: 40.7649, lng: -111.8421 } },
    { id: '48', name: 'University of Kansas', city: 'Lawrence', state: 'KS', coords: { lat: 38.9543, lng: -95.2558 } },
    { id: '49', name: 'University of Nebraska-Lincoln', city: 'Lincoln', state: 'NE', coords: { lat: 40.8202, lng: -96.7005 } },
    { id: '50', name: 'University of Cincinnati', city: 'Cincinnati', state: 'OH', coords: { lat: 39.1329, lng: -84.5144 } }
  ]);

  search(query: string): University[] {
    const q = (query || '').trim().toLowerCase();
    if (q.length < 2) return [];
    return this.universities().filter(uni =>
      (uni.name || '').toLowerCase().includes(q) ||
      (uni.city || '').toLowerCase().includes(q) ||
      (uni.state || '').toLowerCase().includes(q)
    ).slice(0, 8); // Limit to 8 suggestions
  }

  getAll(): University[] {
    return this.universities();
  }

  getById(id: string): University | undefined {
    return this.universities().find(uni => uni.id === id);
  }
}
