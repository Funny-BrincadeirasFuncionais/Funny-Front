import { Lexend_400Regular, useFonts } from '@expo-google-fonts/lexend';
import { Ionicons } from '@expo/vector-icons';
import * as NavigationBar from 'expo-navigation-bar';
import { Tabs } from 'expo-router';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
export default function TabsLayout() {
  const [fontsLoaded] = useFonts({
    Lexend_400Regular,
  });

  if (Platform.OS === 'android') {
    NavigationBar.setBackgroundColorAsync('#000000');
    NavigationBar.setButtonStyleAsync('dark');
  }

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.light.background,
            borderTopWidth: 0, //  remove a linha/sombra
            elevation: 0,       //  remove sombra no Android
            shadowOpacity: 0,   //  remove sombra no iOS
            height: Platform.OS === 'android' ? 70 : 60,
            paddingBottom: Platform.OS === 'android' ? 15 : 8,
            paddingTop: 6,
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
            title: '',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="CriancaProfileScreen"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="school" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="TeacherProfileScreen"
          options={{
            title: '',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />

        {/* Outras telas ocultas */}
        <Tabs.Screen name="configuracoes" options={{ href: null }} />
        <Tabs.Screen name="sobre" options={{ href: null }} />
        <Tabs.Screen name="acessibilidade" options={{ href: null }} />
        <Tabs.Screen name="matematica" options={{ href: null }} />
        <Tabs.Screen name="portugues" options={{ href: null }} />
        <Tabs.Screen name="logica" options={{ href: null }} />
        <Tabs.Screen name="cotidiano" options={{ href: null }} />
        <Tabs.Screen name="jogoContagem" options={{ href: null }} />
        <Tabs.Screen name="jogoPalavra" options={{ href: null }} />
        <Tabs.Screen name="minhasAtividades" options={{ href: null }} />
        <Tabs.Screen name="cadastro" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
