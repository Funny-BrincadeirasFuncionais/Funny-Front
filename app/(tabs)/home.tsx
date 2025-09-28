import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

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
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomeTextBlack}>Bem-vindo ao </Text>
            <Text style={styles.welcomeTextOrange}>Funny</Text>
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push('/configuracoes')}
          >
            <Ionicons name="settings" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar..."
          placeholderTextColor={Colors.light.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.content}>
        {/* Grid Principal 2x2 */}
        <View style={styles.mainGrid}>
          {/* Primeira linha */}
          <View style={styles.gridRow}>
            <TouchableOpacity style={[styles.mainCard, styles.mathematicsCard]}>
              <Image 
                source={require('../../assets/images/math.png')}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>Matemática</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainCard, styles.portugueseCard]}>
              <Image 
                source={require('../../assets/images/port.png')} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>Português</Text>
            </TouchableOpacity>
          </View>

          {/* Segunda linha */}
          <View style={styles.gridRow}>
            <TouchableOpacity style={[styles.mainCard, styles.logicCard]}>
              <Image 
                source={require('../../assets/images/logic.png')} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>Lógica</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainCard, styles.dailyLifeCard]}>
              <Image 
                source={require('../../assets/images/daily.png')} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>Cotidiano</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
  },
  welcomeTextBlack: {
    color: '#000',
  },
  welcomeTextOrange: {
    color: Colors.light.primary,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 35,
    height: 35,
    borderRadius: 16,
    backgroundColor: 'rgba(255,165,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 24,
    marginVertical: 12,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: '#E07612',
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
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mainGrid: {
    marginTop: 15,
    marginBottom: 30,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  mainCard: {
    flex: 1,
    height: 210,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardTitle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  // Cores específicas para cada card baseadas na imagem
  mathematicsCard: {
    backgroundColor: '#8B9A8B', // Verde acinzentado
  },
  portugueseCard: {
    backgroundColor: '#87CEEB', // Azul claro
  },
  logicCard: {
    backgroundColor: '#4682B4', // Azul aço
  },
  dailyLifeCard: {
    backgroundColor: '#9ACD32', // Verde amarelado
  },
  seeAllGamesButton: {
    backgroundColor: Colors.light.primary,
    width: '100%',  
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  seeAllGamesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
});