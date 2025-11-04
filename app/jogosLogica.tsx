import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export default function JogosLogicaScreen() {
  const router = useRouter();

  const jogos = [
    {
      id: '1',
      nome: 'Tarefas do Dia',
      descricao: 'Placeholder de lógica',
      icone: 'time-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jogos de Lógica</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Escolha um jogo para começar:</Text>

        {jogos.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.gameCard}
            onPress={() => router.push('/JogoMemoria')}
          >
            <View style={styles.gameIconContainer}>
              <Ionicons name={item.icone as any} size={48} color={Colors.light.primary} />
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{item.nome}</Text>
              <Text style={styles.gameDescription}>{item.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
    color: Colors.light.textPrimary,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Lexend_600SemiBold',
    color: Colors.light.textPrimary,
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gameIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,165,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
    fontFamily: 'Lexend_400Regular',
    color: Colors.light.textSecondary,
  },
});