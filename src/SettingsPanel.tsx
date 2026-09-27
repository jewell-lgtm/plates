import React, { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LanguageChoice, useLanguage } from './i18n';
import { createBackup, parseBackup } from './backup';
import { importCollection, loadCollection } from './storage';
import { Sightings } from './collection';
export function LanguageSwitch() {
 const { t, choice, setChoice } = useLanguage();
 return <View style={styles.languages}><Text style={styles.label}>{t('Language')}</Text>{(['auto','de','en'] as LanguageChoice[]).map(value => <Pressable accessibilityRole="button" accessibilityState={{ selected: choice === value }} onPress={() => setChoice(value)} key={value} style={[styles.language, choice === value && { backgroundColor: '#25392E' }]}><Text style={[styles.label, choice === value && { color: '#fff' }]}>{value === 'auto' ? t('Automatic') : value === 'de' ? 'Deutsch' : 'English'}</Text></Pressable>)}</View>;
}
export function SettingsPanel({ onImported }: { onImported: (value: Sightings) => void }) {
 const { t } = useLanguage();
 const [backup, setBackup] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
 async function show() { try { setBackup(createBackup(await loadCollection())); setMessage(''); } catch { setMessage('Your collection could not be loaded. Tap to retry.'); } }
 async function restore() {
  let parsed: Sightings;
  try { parsed = parseBackup(backup); } catch { setMessage('Invalid backup. Your collection has not changed.'); return; }
  setBusy(true);
  try { onImported(await importCollection(parsed)); setMessage('Backup imported.'); }
  catch { setMessage('Couldn’t import the backup. Please try again.'); }
  finally { setBusy(false); }
 }
 return <View style={styles.panel}><LanguageSwitch/><Text style={styles.title}>{t('Move or back up your collection')}</Text><Text style={styles.body}>{t('Copy this backup, open schildersafari.de on the other device or browser, and paste it here. Import merges sightings without deleting existing finds.')}</Text><Text style={styles.body}>{t('Backups contain plate codes and dates only, never GPS locations.')}</Text><Pressable accessibilityRole="button" onPress={() => void show()} style={styles.button}><Text style={styles.label}>{t('Show backup')}</Text></Pressable><TextInput accessibilityLabel={t('Collection backup')} multiline value={backup} onChangeText={setBackup} placeholder={t('Paste a backup here')} style={styles.input} autoCapitalize="none" autoCorrect={false}/><Pressable accessibilityRole="button" disabled={busy || !backup} onPress={() => void restore()} style={[styles.button, (busy || !backup) && { opacity: .5 }]}><Text style={styles.label}>{t(busy ? 'Saving…' : 'Import backup')}</Text></Pressable>{!!message && <Text accessibilityRole="alert" style={styles.body}>{t(message)}</Text>}<Pressable accessibilityRole="link" onPress={() => void Linking.openURL('https://schildersafari.de')} style={styles.button}><Text style={styles.label}>{t('Move to schildersafari.de ↗')}</Text></Pressable></View>;
}
const styles = StyleSheet.create({ languages:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:6,paddingVertical:12},language:{padding:10,borderRadius:7,backgroundColor:'#ECEEE5'},label:{fontFamily:'DMSans_500Medium',fontSize:11,color:'#25392E'},panel:{gap:10,marginTop:15},title:{fontFamily:'DMSans_700Bold',fontSize:18,color:'#25392E'},body:{fontFamily:'DMSans_400Regular',fontSize:12,lineHeight:19,color:'#596653'},button:{padding:12,backgroundColor:'#EAEDE1',borderRadius:7},input:{minHeight:100,maxHeight:180,padding:12,borderWidth:1,borderColor:'#BACBB2',borderRadius:7,fontSize:12,color:'#25392E'} });
