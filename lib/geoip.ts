import { logger } from '@/lib/logger';

interface LocationData {
  country: string;
  countryCode: string;
  city: string | null;
  latitude: number;
  longitude: number;
}

const locationCache = new Map<string, { data: LocationData; expiry: number }>();

export async function getLocationFromIP(ip: string): Promise<LocationData> {
  const cached = locationCache.get(ip);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }

  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    const defaultLocation: LocationData = {
      country: 'Unknown',
      countryCode: 'XX',
      city: null,
      latitude: 0,
      longitude: 0,
    };
    return defaultLocation;
  }

  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) throw new Error('API error');

    const data = await response.json();

    const location: LocationData = {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || null,
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };

    locationCache.set(ip, {
      data: location,
      expiry: Date.now() + 60 * 60 * 1000,
    });

    return location;
  } catch (error) {
    logger.error('[GeoIP] Lookup failed', {
      ip,
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return {
      country: 'Unknown',
      countryCode: 'XX',
      city: null,
      latitude: 0,
      longitude: 0,
    };
  }
}
