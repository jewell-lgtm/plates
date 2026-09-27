import * as Location from 'expo-location';
import { SavedLocation } from './locationModel';
export async function getPosition(): Promise<SavedLocation> {
 const permission = await Location.requestForegroundPermissionsAsync();
 if (permission.status !== 'granted') throw new Error('Location permission denied. You can still collect plates without it.');
 const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
 return { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy, capturedAt: new Date(position.timestamp).toISOString() };
}
