import { Lexend_400Regular, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function RootLayout() {
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
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Onboarding vem primeiro */}
        <Stack.Screen name="onboarding" />

        {/* Telas sem navbar */}
        <Stack.Screen name="login" />
        <Stack.Screen name="cadastro" />

        {/* Grupo de tabs (aparece só depois do login) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* Telas de gerenciamento */}
        <Stack.Screen name="minhasTurmas" />
        <Stack.Screen name="minhasAtividades" />

        {/* Telas de jogos */}
        <Stack.Screen name="jogosMatematica" />
        <Stack.Screen name="jogosPortugues" />
        <Stack.Screen name="jogosLogica" />
        <Stack.Screen name="jogosCotidiano" />
        <Stack.Screen name="jogoContagem" />
        <Stack.Screen name="jogoPalavra" />
        <Stack.Screen name="jogoMontaPalavra" />
        <Stack.Screen name="jogoRotinaDia" />
      </Stack>
    </SafeAreaProvider>
  );
}
