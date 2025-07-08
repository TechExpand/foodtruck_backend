import NodeGeocoder from 'node-geocoder';

const options: NodeGeocoder.Options = {
  provider: 'google',
  apiKey: 'AIzaSyCmNU-SKcFdq_4PdDBqtdqRDm8xOpptV5Q',
  formatter: null
};

const geocoder = NodeGeocoder(options);

export class GeocodingService {
  static async getCityFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      console.log('[Geocoding] Requesting city for:', lat, lng);
      const results = await geocoder.reverse({ lat, lon: lng });
      console.log('[Geocoding] Raw result:', JSON.stringify(results, null, 2));
      if (results && results.length > 0) {
        const result = results[0];
        // Try to get city from various possible fields
        const city = result.city || 
                    (result as any).locality || 
                    (result as any).administrativeLevels?.level2long ||
                    (result as any).administrativeLevels?.level1long ||
                    'Unknown city';
        console.log('[Geocoding] Parsed city:', city);
        return city;
      }
      
      return 'Unknown city';
    } catch (err) {
      console.error('[Geocoding] Error object:', err);
      if (err && typeof err === 'object') {
        if ('response' in err) {
          console.error('[Geocoding] Error response:', (err as any).response);
        }
        if ('status' in err) {
          console.error('[Geocoding] Error status:', (err as any).status);
        }
        if ('message' in err) {
          console.error('[Geocoding] Error message:', (err as any).message);
        }
      }
      return 'Unknown city';
    }
  }

  static async getCityFromLanLog(lan: string | number, log: string | number): Promise<string> {
    const lat = Number(lan);
    const lng = Number(log);
    
    if (isNaN(lat) || isNaN(lng)) {
      return 'Invalid coordinates';
    }
    
    return this.getCityFromCoordinates(lat, lng);
  }
} 