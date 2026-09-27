import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from './i18n';
import { SavedLocation } from './locationModel';
import { loadLocations, setLocation } from './storage';
import { getPosition } from './position';
export function SightingLocation({ code }: { code: string }) {
 const { t, locale } = useLanguage();
 const [location, setSaved] = useState<SavedLocation | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
 const mounted = useRef(true); const pending = useRef(false);
 useEffect(() => { mounted.current = true; void loadLocations().then(data => { if (mounted.current) setSaved(data[code] ?? null); }).catch(() => { if (mounted.current) setError('Saved location could not be loaded.'); }); return () => { mounted.current = false; }; }, [code]);
 async function save(remove = false) {
  if (pending.current) return;
  pending.current = true; setBusy(true); setError('');
  try {
   const value = remove ? null : await getPosition();
   if (!mounted.current) return; // Closing the fact cancels an in-flight GPS request.
   const saved = await setLocation(code, value);
   if (mounted.current) setSaved(saved[code] ?? null);
  } catch (cause) { if (mounted.current) setError(cause instanceof Error && /permission|timed out|unavailable|not supported/.test(cause.message) ? cause.message : 'Couldn’t save the location. Please try again.'); }
  finally { pending.current = false; if (mounted.current) setBusy(false); }
 }
 return <View style={styles.panel}><Text style={styles.title}>{t('Last seen here · optional')}</Text><Text style={styles.body}>{t('Save your current GPS position for this plate. Only when you tap; stored on this device. No background tracking.')}</Text>{location && <View><Text selectable style={styles.coordinates}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</Text><Text style={styles.body}>{new Date(location.capturedAt).toLocaleString(locale)}{location.accuracy !== null ? ` · ±${Math.round(location.accuracy)} m` : ''}</Text></View>}<Pressable accessibilityRole="button" disabled={busy} onPress={() => void save()} style={[styles.button,busy && {opacity:.5}]}><Text style={styles.buttonText}>{t(busy ? 'Finding your location…' : location ? 'Update to my current location' : 'Save my location')}</Text></Pressable>{location && <Pressable accessibilityRole="button" disabled={busy} onPress={() => void save(true)} style={styles.remove}><Text style={styles.body}>{t('Remove saved location')}</Text></Pressable>}{!!error && <Text accessibilityRole="alert" style={styles.error}>{t(error)}</Text>}</View>;
}
const styles=StyleSheet.create({panel:{marginTop:18,gap:9,padding:14,borderWidth:1,borderColor:'#DDE0D4',borderRadius:10},title:{fontFamily:'DMSans_700Bold',fontSize:13,color:'#25392E'},body:{fontFamily:'DMSans_400Regular',fontSize:11,lineHeight:17,color:'#596653'},coordinates:{fontFamily:'SpaceMono_700Bold',fontSize:13,color:'#25392E',marginBottom:5},button:{backgroundColor:'#E6EADF',borderRadius:7,padding:12},buttonText:{fontFamily:'DMSans_700Bold',fontSize:12,color:'#25392E'},remove:{paddingVertical:8},error:{fontFamily:'DMSans_400Regular',fontSize:12,color:'#A44727'}});
