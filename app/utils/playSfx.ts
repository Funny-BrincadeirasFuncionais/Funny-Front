import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Play the small correct-ding sound located at ../assets/sfx/correct ding.opus
// Keep this helper minimal and resilient if the file is missing.
export async function playCorrect() {
  try {
    // Respect user's accessibility preference: if "muteSfx" is enabled, skip playback.
    try {
      const raw = await AsyncStorage.getItem('accessibility_settings_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as any;
        if (parsed?.muteSfx) return;
      }
    } catch (e) {
      // ignore storage errors and proceed to attempt playback
    }
    // Configure audio mode so sounds play even if device is in silent mode (iOS)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    });

    const sound = new Audio.Sound();
    // Try the canonical short mp3, then the long mp3 name, then the original .opus
    let asset: any = null;
    try {
      asset = require('../../assets/sfx/correct_ding.mp3');
      console.log('playCorrect: using asset correct_ding.mp3');
    } catch (e) {
      try {
        asset = require('../../assets/sfx/Correct Ding - Sound effect (HD) [boaUpTtZUgA].mp3');
        console.log('playCorrect: using asset Correct Ding - Sound effect (HD) [boaUpTtZUgA].mp3');
      } catch (e2) {
        try {
          asset = require('../../assets/sfx/correct ding.opus');
          console.log('playCorrect: using asset correct ding.opus');
        } catch (e3) {
          console.warn('playCorrect: no audio asset found in assets/sfx', e3);
          return;
        }
      }
    }
    await sound.loadAsync(asset, { shouldPlay: true });

    // If loadAsync didn't auto-play for any reason, ensure playback
    // start and wait briefly for it to start.
    try {
      const status = await sound.getStatusAsync();
      if (!(status as any).isPlaying) {
        await sound.playAsync();
      }
      // Log playback status for debugging
      const after = await sound.getStatusAsync();
      console.log('playCorrect: playback status', after);
    } catch (e) {
      console.warn('playCorrect: playback error', e);
    }

    // Unload when finished
    sound.setOnPlaybackStatusUpdate((status) => {
      try {
        if ((status as any)?.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      } catch (e) {
        // ignore
      }
    });
  } catch (e) {
    // Don't crash the app if audio is missing or playback fails
    // eslint-disable-next-line no-console
    console.warn('playCorrect failed', e);
  }
}
