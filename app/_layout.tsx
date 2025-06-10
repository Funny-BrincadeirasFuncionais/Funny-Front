import { Lexend_400Regular, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import '../constants/Fonts'; // importa o patch global da fonte

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        gestureEnabled: false,
        freezeOnBlur: true
      }}
    />
  );

}
