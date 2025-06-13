import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const [userName, setUserName] = useState('NOME');
  const [searchText, setSearchText] = useState('');
  const router = useRouter();


  useEffect(() => {
    const carregarNomeUsuario = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/responsaveis/${userId}`);
        const data = await res.json();

        if (res.ok && data.nome) {
          setUserName(data.nome.toUpperCase());
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      }
    };

    carregarNomeUsuario();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>BEM-VINDO, {userName}!</Text>
        </View>
        <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/TeacherProfileScreen')}
          >
            <Ionicons name="person-circle" size={40} color={Colors.light.primary} />
          </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="PESQUISAR"
          placeholderTextColor={Colors.light.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Minhas Atividades - Retângulo Principal */}
        <TouchableOpacity 
          style={styles.mainActivityCard}        >
          <View style={styles.cardContent}>
            <View style={styles.cardTextSection}>
              <Text style={styles.mainActivityTitle}>MINHAS ATIVIDADES</Text>
              <Text style={styles.mainActivitySubtitle}>Acompanhe seu progresso</Text>
            </View>
            <View style={styles.cardImageSection}>
              <Image 
                source={require('../assets/images/Card-MinhasAtividades.png')} 
                style={styles.cardImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Grid de Atividades */}
        <View style={styles.activitiesGrid}>
          {/* Coluna Esquerda */}
          <View style={styles.leftColumn}>
            {/* Português */}
            <TouchableOpacity style={[styles.activityCard, styles.portuguesCard]}>
              <View style={styles.cardInnerContent}>
                <Text style={styles.cardTitle}>PALAVRAS</Text>
                <Ionicons name="book" size={32} color="white" style={styles.cardIcon} />
              </View>
            </TouchableOpacity>

            {/* Lógica */}
            <TouchableOpacity 
              style={[styles.activityCard, styles.logicCard]}
              onPress={() => router.push('/jogoContagem')}
            >
              <View style={styles.cardInnerContent}>
                <Text style={styles.cardTitle}>NÚMEROS</Text>
                <Ionicons name="calculator" size={32} color="white" style={styles.cardIcon} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Coluna Direita - Cotidiano */}
          <TouchableOpacity
            style={[styles.activityCard, styles.cotidianoCard]}
          >
            <View style={styles.cardInnerContent}>
              <Text style={styles.cardTitle}>ATIVIDADES COTIDIANAS</Text>
              <Ionicons name="people" size={32} color="white" style={styles.cardIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontFamily: 'Lexend_700Bold',
  },
  profileButton: {
    padding: 8,
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderRadius: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.textPrimary,
    fontFamily: 'Lexend_400Regular',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
    mainActivityCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    aspectRatio: 2.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: '100%',
  },
  mainActivityCardFullWidth: {
    backgroundColor: Colors.light.primary,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20, // Mesma margem que o content (paddingHorizontal: 20)
    marginBottom: 20,
    aspectRatio: 2.8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  mainActivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainActivityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Lexend_700Bold',
    marginBottom: 4,
  },
  mainActivitySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'Lexend_400Regular',
  },
  activityIcons: {
    flexDirection: 'row',
  },
  activityIcon: {
    marginLeft: 10,
  },
  logoSpace: {
    alignSelf: 'flex-start',
  },
  logoImage: {
    width: 50,
    height: 30,
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  cardContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTextSection: {
    flex: 1,
    alignItems: 'flex-start',
    marginRight: 15,
  },
  cardImageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  activitiesGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  leftColumn: {
    flex: 1,
    gap: 15,
  },
  activityCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardInnerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portuguesCard: {
    backgroundColor: Colors.light.primaryDark,
    aspectRatio: 1, // Torna o card quadrado
  },
  logicCard: {
    backgroundColor: Colors.light.primaryDark,
    aspectRatio: 1, // Torna o card quadrado
  },
  cotidianoCard: {
    backgroundColor: Colors.light.primaryLight,
    flex: 1,
    marginLeft: 0,
    alignSelf: 'stretch', // Acompanha a altura total da coluna esquerda
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
  cardIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  foxIconSpace: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 10,
  },
  foxPlaceholder: {
    fontSize: 48,
    textAlign: 'center',
  },
  cardIcon: {
    marginTop: 10,
  },
}); 