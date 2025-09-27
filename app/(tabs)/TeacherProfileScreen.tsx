import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function ProfessorScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.light.background}
      />

      {/* Header igual Configurações */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professor</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Perfil */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/300' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>Nome e Sobrenome</Text>
        <Text style={styles.email}>email@gmail.com</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push('/EditarPerfilScreen')}
          >
            <Text style={styles.editText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton}>
            <Text style={styles.reportText}>Gerar relatório</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Painel de controle */}
      <View style={styles.panelContainer}>
        <Text style={styles.sectionTitle}>Painel de controle:</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Alunos Cadastrados</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>0%</Text>
            <Text style={styles.statLabel}>Média de Progresso</Text>
          </View>
        </View>
      </View>

      {/* Minhas Turmas */}
      <View style={styles.classesContainer}>
        <Text style={styles.sectionTitle}>Minhas Turmas:</Text>
        {['Turma 1', 'Turma 2', 'Turma 3'].map((turma, index) => (
          <TouchableOpacity key={index} style={styles.classItem}>
            <Text style={styles.classText}>{turma}</Text>
            <Ionicons name="chevron-forward" size={20} color="#000" />
          </TouchableOpacity>
        ))}
      </View>
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
    paddingHorizontal: 24,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
  },
  headerSpacer: {
    width: 40,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    fontFamily: 'Lexend_700Bold',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    fontFamily: 'Lexend_400Regular',
  },
  panelContainer: {
    marginTop: 24,
    marginHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Lexend_700Bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 10,
    padding: 16,
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    fontFamily: 'Lexend_700Bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
    textAlign: 'left',
    fontFamily: 'Lexend_400Regular',
  },
  classesContainer: {
    marginTop: 20,
    marginHorizontal: 24,
  },

  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  classText: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginHorizontal: 24, // 👈 garante alinhamento com o resto
  },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E07612',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editText: {
    color: '#E07612',
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
  },
  reportButton: {
    flex: 1,
    backgroundColor: '#E07612',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  reportText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Lexend_700Bold',
  },

});