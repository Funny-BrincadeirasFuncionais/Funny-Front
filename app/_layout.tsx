import { Lexend_400Regular, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { Colors } from '../constants/Colors';
import '../constants/Fonts'; // importa o patch global da fonte
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.light.background,
            borderTopColor: Colors.light.surface,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: Colors.light.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontFamily: 'Lexend_400Regular',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="crianca"
          options={{
            title: 'Crianças',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sobre"
          options={{
            title: 'Sobre',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="information-circle" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="jogoContagem"
          options={{
            title: 'Jogos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="game-controller" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

