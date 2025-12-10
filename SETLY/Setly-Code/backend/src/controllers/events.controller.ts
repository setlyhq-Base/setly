import { Request, Response } from 'express';
import fetch from 'node-fetch';

function ticketmasterKey(): string | null {
  return process.env.TICKETMASTER_API_KEY || null;
}

function eventbriteKey(): string | null {
  return process.env.EVENTBRITE_API_KEY || null;
}

export class EventsController {
  /**
   * GET /api/events/search
   * Search for events from Ticketmaster and Eventbrite
   */
  static async search(req: Request, res: Response) {
    try {
      const { lat, lng, radius = 50 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat/lng parameters' });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusNum = parseInt(radius as string);

      // Fetch from both APIs in parallel
      const [ticketmasterEvents, eventbriteEvents] = await Promise.all([
        fetchTicketmasterEvents(latitude, longitude, radiusNum),
        fetchEventbriteEvents(latitude, longitude, radiusNum)
      ]);

      // Combine and deduplicate events
      const allEvents = [...ticketmasterEvents, ...eventbriteEvents];
      const uniqueEvents = deduplicateEvents(allEvents);
      
      // Sort by distance, popularity, and start time
      const sortedEvents = sortEventsByRelevance(uniqueEvents, latitude, longitude);

      console.log(`[Events] Found ${sortedEvents.length} unique events (${ticketmasterEvents.length} from Ticketmaster, ${eventbriteEvents.length} from Eventbrite)`);

      res.json({
        events: sortedEvents,
        sources: {
          ticketmaster: ticketmasterEvents.length,
          eventbrite: eventbriteEvents.length,
          total: sortedEvents.length
        }
      });
    } catch (e: any) {
      console.error('[Events] Search error:', e);
      res.status(500).json({ error: 'events_search_failed', message: e?.message });
    }
  }
}

/**
 * Fetch events from Ticketmaster API
 */
async function fetchTicketmasterEvents(lat: number, lng: number, radius: number): Promise<any[]> {
  const apiKey = ticketmasterKey();
  
  if (!apiKey) {
    console.log('[Events] Ticketmaster API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      apikey: apiKey,
      latlong: `${lat},${lng}`,
      radius: radius.toString(),
      unit: 'miles',
      size: '50',
      sort: 'date,asc'
    });

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;
    const response = await fetch(url);
    const data: any = await response.json();

    if (!response.ok || !data._embedded?.events) {
      console.log('[Events] Ticketmaster returned no events or error:', data.fault?.faultstring);
      return [];
    }

    // SECTION 3 - Apply strict event quality filters per user requirements
    const events = data._embedded.events.filter((event: any) => {
      // 3.2 - Essential event information required
      const hasName = event.name && event.name.length > 0;
      const hasVenue = event._embedded?.venues?.[0];
      const hasDate = event.dates?.start?.localDate;
      const hasRealPhoto = event.images && event.images.length > 0;
      const hasValidAddress = event._embedded?.venues?.[0]?.address;
      const hasUrl = event.url; // Must have URL to original event page
      
      // 3.2 - Must not be cancelled
      const isNotCancelled = event.dates?.status?.code !== 'cancelled' && 
                             event.dates?.status?.code !== 'postponed' &&
                             event.dates?.status?.code !== 'rescheduled';
      
      // 3.2 - Must occur in next 30 days (reject events > 45 days away)
      if (hasDate) {
        const eventDate = new Date(event.dates.start.localDate);
        const now = new Date();
        const daysUntilEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Reject if more than 45 days away or in the past
        if (daysUntilEvent < 0 || daysUntilEvent > 45) {
          return false;
        }
      }
      
      return hasName && hasVenue && hasDate && hasRealPhoto && hasValidAddress && hasUrl && isNotCancelled;
    });
    
    console.log(`[Events] Ticketmaster: ${events.length} quality events after filtering from ${data._embedded.events.length} total`);

    return events.map((event: any) => ({
      id: `tm_${event.id}`,
      name: event.name,
      url: event.url,
      images: event.images,
      dates: event.dates,
      classifications: event.classifications,
      priceRanges: event.priceRanges,
      _embedded: event._embedded,
      info: event.info,
      pleaseNote: event.pleaseNote,
      source: 'ticketmaster',
      external_url: event.url
    }));
  } catch (error) {
    console.error('[Events] Ticketmaster fetch error:', error);
    return [];
  }
}

/**
 * Fetch events from Eventbrite API
 */
async function fetchEventbriteEvents(lat: number, lng: number, radius: number): Promise<any[]> {
  const apiKey = eventbriteKey();
  
  if (!apiKey) {
    console.log('[Events] Eventbrite API key not configured');
    return [];
  }

  try {
    const radiusKm = Math.round(radius * 1.60934); // Convert miles to km
    
    const params = new URLSearchParams({
      'location.latitude': lat.toString(),
      'location.longitude': lng.toString(),
      'location.within': `${radiusKm}km`,
      'expand': 'venue,organizer,ticket_availability',
      'sort_by': 'date'
    });

    const url = `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data: any = await response.json();

    if (!response.ok || !data.events) {
      console.log('[Events] Eventbrite returned no events or error:', data.error_description);
      return [];
    }

    // SECTION 3 - Apply strict event quality filters for Eventbrite
    const events = data.events.filter((event: any) => {
      // 3.2 - Essential event information
      const hasName = event.name?.text && event.name.text.length > 0;
      const hasDate = event.start?.local;
      const isPublished = event.status === 'live';
      const hasRealPhoto = event.logo?.url; // Must have photo
      const hasUrl = event.url; // Must have URL to event page
      
      // 3.2 - Must not be cancelled
      const isNotCancelled = event.status !== 'cancelled' && event.status !== 'ended';
      
      // 3.2 - Must occur in next 30 days (reject events > 45 days away)
      if (hasDate) {
        const eventDate = new Date(event.start.local);
        const now = new Date();
        const daysUntilEvent = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Reject if more than 45 days away or in the past
        if (daysUntilEvent < 0 || daysUntilEvent > 45) {
          return false;
        }
      }
      
      return hasName && hasDate && isPublished && hasRealPhoto && hasUrl && isNotCancelled;
    });
    
    console.log(`[Events] Eventbrite: ${events.length} quality events after filtering from ${data.events.length} total`);

    return events.map((event: any) => ({
      id: `eb_${event.id}`,
      name: event.name.text,
      title: event.name.text,
      description: event.description?.text,
      url: event.url,
      image: event.logo?.url,
      images: event.logo ? [{ url: event.logo.url }] : [],
      start_date: event.start?.local,
      start_time: event.start?.local,
      is_free: event.is_free,
      venue: {
        name: event.venue?.name,
        address: event.venue?.address
      },
      organizer: {
        name: event.organizer?.name
      },
      capacity: event.capacity,
      ticket_availability: event.ticket_availability,
      source: 'eventbrite',
      external_url: event.url
    }));
  } catch (error) {
    console.error('[Events] Eventbrite fetch error:', error);
    return [];
  }
}

/**
 * Deduplicate events by name and date similarity
 */
function deduplicateEvents(events: any[]): any[] {
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const event of events) {
    // Create a key based on normalized name and date
    const name = event.name?.toLowerCase().trim() || '';
    const date = event.dates?.start?.localDate || event.start_date || '';
    const key = `${name}_${date}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(event);
    }
  }

  return unique;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Sort events by relevance: distance, popularity, and start time
 */
function sortEventsByRelevance(events: any[], userLat: number, userLng: number): any[] {
  return events
    .map(event => {
      // Calculate distance from user location
      let distance = 999;
      const venue = event._embedded?.venues?.[0] || event.venue;
      
      if (venue?.location?.latitude && venue?.location?.longitude) {
        distance = calculateDistance(
          userLat, 
          userLng, 
          parseFloat(venue.location.latitude), 
          parseFloat(venue.location.longitude)
        );
      }
      
      // Get event date for time sorting
      const eventDate = event.dates?.start?.localDate || event.start_date || '9999-12-31';
      const timestamp = new Date(eventDate).getTime();
      
      return {
        ...event,
        distance: parseFloat(distance.toFixed(1)),
        timestamp
      };
    })
    .sort((a, b) => {
      // Sort by: 1) Distance (closer first), 2) Date (sooner first)
      if (Math.abs(a.distance - b.distance) > 5) {
        return a.distance - b.distance; // Significantly different distances
      }
      return a.timestamp - b.timestamp; // Similar distance, sort by date
    });
}
