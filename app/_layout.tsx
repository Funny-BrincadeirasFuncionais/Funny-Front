import { Lexend_400Regular, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import '../constants/Fonts';


export default function Layout() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
    Lexend_700Bold,
  });

  const router = useRouter();
  const [deletada, setDeletada] = useState(false);

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
          height: 50,
          paddingBottom: Platform.OS === 'android' ? 8 : 6,
          paddingTop: 4,
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
        name="configuracoes"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sobre"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="acessibilidade"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="matematica"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="portugues"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="logica"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cotidiano"
        options={{
          href: null,
        }}
      />
      {/* Organização do navbar */}
      <Tabs.Screen
        name="cadastro"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="CriancaProfileScreen"
        options={{
          title: '',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="school" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jogoContagem"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="jogoPalavra"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="minhasAtividades"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="TeacherProfileScreen"
        options={{
          title: '',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    </SafeAreaProvider>
  );
}

