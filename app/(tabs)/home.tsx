import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAccessibility } from '../../context/AccessibilityContext';
import { getJson } from '../../services/api';

export default function HomeScreen() {
  const { transformText } = useAccessibility();
  const [userName, setUserName] = useState('NOME');
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const [turmas, setTurmas] = useState<any[]>([]);
  const [criancas, setCriancas] = useState<any[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<any | null>(null);
  const [criancaSelecionada, setCriancaSelecionada] = useState<any | null>(null);
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [showCriancaModal, setShowCriancaModal] = useState(false);


  useEffect(() => {
    const carregarDados = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const data = await getJson(`/responsaveis/${userId}`);
        if (data && data.nome) {
          setUserName(data.nome.toUpperCase());
        }

        // Carregar turmas e crianças
        const [allTurmas, allCriancas] = await Promise.all([
          getJson('/turmas'),
          getJson('/criancas'),
        ]);

        const listaTurmas: any[] = Array.isArray(allTurmas) ? allTurmas : [];
        const listaCriancas: any[] = Array.isArray(allCriancas) ? allCriancas : [];

        const minhasTurmas = listaTurmas.filter(
          (t: any) =>
            Number(t.responsavel_id) === Number(userId) ||
            (t.responsavel && Number(t.responsavel.id) === Number(userId))
        );

        setTurmas(minhasTurmas);
        setCriancas(listaCriancas);

        // Carregar seleção salva
        const turmaIdSalva = await AsyncStorage.getItem('turmaSelecionada');
        const criancaIdSalva = await AsyncStorage.getItem('criancaSelecionada');

        if (turmaIdSalva) {
          const turma = minhasTurmas.find((t: any) => t.id === Number(turmaIdSalva));
          if (turma) setTurmaSelecionada(turma);
        }

        if (criancaIdSalva) {
          const crianca = listaCriancas.find((c: any) => c.id === Number(criancaIdSalva));
          if (crianca) setCriancaSelecionada(crianca);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  const selecionarTurma = async (turma: any) => {
    setTurmaSelecionada(turma);
    await AsyncStorage.setItem('turmaSelecionada', String(turma.id));
    setShowTurmaModal(false);

    // Filtrar crianças desta turma
    const criancasDaTurma = criancas.filter((c: any) => Number(c.turma_id) === Number(turma.id));
    if (criancasDaTurma.length === 0) {
      Alert.alert('Aviso', 'Esta turma não possui crianças cadastradas.');
      setCriancaSelecionada(null);
      await AsyncStorage.removeItem('criancaSelecionada');
    } else if (criancaSelecionada && Number(criancaSelecionada.turma_id) !== Number(turma.id)) {
      // Se a criança selecionada não pertence à nova turma, limpar
      setCriancaSelecionada(null);
      await AsyncStorage.removeItem('criancaSelecionada');
    }
  };

  const selecionarCrianca = async (crianca: any) => {
    // Verificar se a criança pertence à turma selecionada
    if (turmaSelecionada && Number(crianca.turma_id) !== Number(turmaSelecionada.id)) {
      Alert.alert('Aviso', 'Esta criança não pertence à turma selecionada.');
      return;
    }

    setCriancaSelecionada(crianca);
    await AsyncStorage.setItem('criancaSelecionada', String(crianca.id));
    setShowCriancaModal(false);
  };

  const criancasDaTurma = turmaSelecionada
    ? criancas.filter((c: any) => Number(c.turma_id) === Number(turmaSelecionada.id))
    : criancas;

  const isSelectionDisabled = !turmaSelecionada || !criancaSelecionada;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>
            <Text style={styles.welcomeTextBlack}>{transformText('Bem-vindo ao ')}</Text>
            <Text style={styles.welcomeTextOrange}>{transformText('Funny')}</Text>
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

      {/* Seleção de Turma e Criança */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionTitle}>{transformText('Selecione para atividades:')}</Text>
        <View style={styles.selectionRow}>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => setShowTurmaModal(true)}
          >
            <Ionicons name="school" size={20} color={Colors.light.primary} />
            <Text style={styles.selectionButtonText} numberOfLines={1}>
              {turmaSelecionada ? turmaSelecionada.nome : transformText('Escolher Turma')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectionButton, !turmaSelecionada && styles.selectionButtonDisabled]}
            onPress={() => {
              if (!turmaSelecionada) {
                Alert.alert(transformText('Aviso'), transformText('Selecione uma turma primeiro.'));
                return;
              }
              setShowCriancaModal(true);
            }}
            disabled={!turmaSelecionada}
          >
            <Ionicons name="person" size={20} color={turmaSelecionada ? Colors.light.primary : '#ccc'} />
            <Text style={[styles.selectionButtonText, !turmaSelecionada && { color: '#ccc' }]} numberOfLines={1}>
              {criancaSelecionada ? criancaSelecionada.nome : transformText('Escolher Criança')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Grid Principal 2x2 */}
        <View style={styles.mainGrid}>
          {/* Primeira linha */}
          <View style={styles.gridRow}>
            <TouchableOpacity style={[styles.mainCard, styles.mathematicsCard, isSelectionDisabled && styles.disabledCard]} onPress={() => router.push('/jogosMatematica')} disabled={isSelectionDisabled}>
            <Image
                source={isSelectionDisabled ? require('../../assets/images/mathdisabled.png') : require('../../assets/images/math.png')}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>{transformText('Matemática')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainCard, styles.portugueseCard, isSelectionDisabled && styles.disabledCard]} onPress={() => router.push('/jogosPortugues')} disabled={isSelectionDisabled}>
              <Image 
                source={isSelectionDisabled ? require('../../assets/images/portdisabled.png') : require('../../assets/images/port.png')} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>{transformText('Português')}</Text>
            </TouchableOpacity>
          </View>

          {/* Segunda linha */}
          <View style={styles.gridRow}>
            <TouchableOpacity style={[styles.mainCard, styles.logicCard, isSelectionDisabled && styles.disabledCard]} onPress={() => router.push('/jogosLogica')} disabled={isSelectionDisabled}>
              <Image 
                source={isSelectionDisabled ? require('../../assets/images/logicdisabled.png') : require('../../assets/images/logic.png')} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>{transformText('Lógica')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.mainCard, styles.dailyLifeCard, isSelectionDisabled && styles.disabledCard]} onPress={() => router.push('/jogosCotidiano')} disabled={isSelectionDisabled}>
              <Image 
                source={isSelectionDisabled ? require('../../assets/images/dailydisabled.png') : require('../../assets/images/daily.png')} 
                style={styles.cardImage}
                resizeMode="cover"
              />
              <Text style={styles.cardTitle}>{transformText('Cotidiano')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal Selecionar Turma */}
      <Modal visible={showTurmaModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{transformText('Selecione a Turma')}</Text>
            <FlatList
              data={turmas}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.modalItem,
                    turmaSelecionada?.id === item.id && { backgroundColor: '#FBE8D4' },
                  ]}
                  onPress={() => selecionarTurma(item)}
                >
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                </Pressable>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTurmaModal(false)}
            >
              <Text style={styles.modalCloseText}>{transformText('Fechar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Selecionar Criança */}
      <Modal visible={showCriancaModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{transformText('Selecione a Criança')}</Text>
            {criancasDaTurma.length === 0 ? (
              <Text style={{ textAlign: 'center', padding: 20, color: '#777' }}>
                {transformText('Nenhuma criança nesta turma')}
              </Text>
            ) : (
              <FlatList
                data={criancasDaTurma}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.modalItem,
                      criancaSelecionada?.id === item.id && { backgroundColor: '#FBE8D4' },
                    ]}
                    onPress={() => selecionarCrianca(item)}
                  >
                    <Text style={styles.modalItemText}>
                      {item.nome} ({item.idade} {transformText('anos')})
                    </Text>
                  </Pressable>
                )}
              />
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCriancaModal(false)}
            >
              <Text style={styles.modalCloseText}>{transformText('Fechar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  disabledCard: {
    backgroundColor: '#E0E0E0',
    opacity: 0.35,
    backgroundImage: 'url(../../assets/images/disabled.png)',
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
  selectionContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  selectionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: 8,
  },
  selectionButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  selectionButtonText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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