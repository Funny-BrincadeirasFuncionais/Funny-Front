import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const [userName, setUserName] = useState('NOME'); // Estado para conectar ao backend
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>BEM-VINDO, {userName}!</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
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
        <TouchableOpacity style={styles.mainActivityCard}>
          <View style={styles.cardContent}>
            <View style={styles.cardTextSection}>
              <Text style={styles.mainActivityTitle}>MINHAS ATIVIDADES</Text>
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
              <Text style={styles.cardTitle}>PORTUGUÊS</Text>
            </TouchableOpacity>

            {/* Lógica */}
            <TouchableOpacity style={[styles.activityCard, styles.logicCard]}>
              <Text style={styles.cardTitle}>LÓGICA</Text>
            </TouchableOpacity>
          </View>

          {/* Coluna Direita - Cotidiano */}
          <TouchableOpacity style={[styles.activityCard, styles.cotidianoCard]}>
            <Text style={styles.cardTitle}>COTIDIANO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30, // Aumentado para mais espaço no topo
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
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    marginHorizontal: 20,
    marginBottom: 20,
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
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    aspectRatio: 2.8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    width: '100%', // Ocupa toda a largura disponível do container pai
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Lexend_700Bold',
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
  },
  cardTextSection: {
    flex: 1,
    alignItems: 'flex-start', // Alinha à esquerda
    marginTop: 10,
  },
  cardImageSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: {
    width: 160,
    height: 120,
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
    borderRadius: 15,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
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
    marginBottom: 10,
    fontFamily: 'Lexend_700Bold',
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
}); 