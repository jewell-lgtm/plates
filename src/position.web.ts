import { SavedLocation } from './locationModel';
export function getPosition(): Promise<SavedLocation> {
 return new Promise((resolve, reject) => {
  if (!navigator.geolocation) { reject(new Error('Location is not supported on this device.')); return; }
  navigator.geolocation.getCurrentPosition(
   position => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, capturedAt: new Date(position.timestamp).toISOString() }),
   error => reject(new Error(error.code === 1 ? 'Location permission denied. You can still collect plates without it.' : error.code === 3 ? 'Location timed out. Try again outdoors.' : 'Your location is unavailable. Please try again.')),
   { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
  );
 });
}
