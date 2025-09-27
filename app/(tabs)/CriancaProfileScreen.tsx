import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CriancaProfileScreen() {
  const [crianca, setCrianca] = useState<any>(null);
  const [diagnostico, setDiagnostico] = useState<string>('Não especificado');
  const [notaContar, setNotaContar] = useState<string>('...');
  const [notaPalavras, setNotaPalavras] = useState<string>('...');
  const [popup, setPopup] = useState<'contar' | 'palavras' | null>(null);
  const [totalAtividades, setTotalAtividades] = useState<number>(0);
  const [modalDiagnostico, setModalDiagnostico] = useState(false);
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  const [diagnosticoSelecionado, setDiagnosticoSelecionado] = useState<number | null>(null);
  const [deletada, setDeletada] = useState(false);
  const router = useRouter();

  const carregarDiagnosticos = async () => {
    try {
      const res = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/diagnosticos');
      const data = await res.json();
      setDiagnosticos(data);
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    }
  };

  const atualizarDiagnostico = async () => {
    if (!diagnosticoSelecionado || !crianca?.id) return;

    try {
      const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas/${crianca.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnosticoId: diagnosticoSelecionado
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnostico(data.Diagnostico?.tipo || 'Não especificado');
        setModalDiagnostico(false);
        Alert.alert('Sucesso', 'Diagnóstico atualizado com sucesso!');
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar o diagnóstico.');
      }
    } catch (error) {
      console.error('Erro ao atualizar diagnóstico:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao atualizar o diagnóstico.');
    }
  };

  const carregarDados = async () => {
    try {
      const id = await AsyncStorage.getItem('criancaSelecionada');
      if (!id) {
        Alert.alert('Erro', 'Nenhuma criança selecionada.');
        router.replace('/TeacherProfileScreen');
        return;
      }
      // Buscar dados da criança
      const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas/${id}`);
      const data = await res.json();
      setCrianca(data);
      setDiagnostico(data.Diagnostico?.tipo || 'Não especificado');
      
      // Buscar progresso da criança
      const resProgresso = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/progresso/crianca/${id}`);
      const progresso = await resProgresso.json();
      
      // Atualizar notas dos jogos
      const contar = progresso.find((p: any) => p.atividadeId === 9);
      const palavras = progresso.find((p: any) => p.atividadeId === 8);
      setNotaContar(contar?.pontuacao?.toString() ?? 'Ainda não fez');
      setNotaPalavras(palavras?.pontuacao?.toString() ?? 'Ainda não fez');
      
      // Calcular total de atividades concluídas
      setTotalAtividades(progresso.length);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os dados da criança.');
    }
  };

  // Usar useFocusEffect para recarregar os dados quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      carregarDados();
      carregarDiagnosticos();
    }, [])
  );

  const acessarJogo = (tipo: 'contar' | 'palavras') => {
    setPopup(null);
    router.push(tipo === 'contar' ? '/jogoContagem' : '/jogoPalavra');
  };

  return (
    deletada ? null : (
      <>
        <ScrollView style={styles.container}>
          <LinearGradient
            colors={['#ffd700', '#ffa500', '#ff8c00']}
            style={styles.header}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/TeacherProfileScreen')}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/150' }}
                  style={styles.profileImage}
                />
              </View>
              <Text style={styles.name}>{crianca?.nome || 'Nome da Criança'}</Text>
              <Text style={styles.age}>Idade: {crianca?.idade ? crianca.idade + ' anos' : '--'}</Text>
            </View>
          </LinearGradient>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informações</Text>
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="medical-outline" size={24} color="#ff8c00" />
                <TouchableOpacity onPress={() => setModalDiagnostico(true)}>
                  <Text style={styles.infoText}>Diagnóstico: {diagnostico} {' '}
                    <Text style={{color: '#E07612', textDecorationLine: 'underline'}}>Adicionar ou alterar</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.sectionsContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progresso</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressItem}>
                  <Text style={styles.progressNumber}>{totalAtividades}</Text>
                  <Text style={styles.progressLabel}>Atividades Concluídas</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Atividades</Text>
              <View style={styles.activitiesList}>
                <View style={styles.activityItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Jogo de Contar</Text>
                    <Text style={styles.activityDate}>Nota: {notaContar}</Text>
                  </View>
                  <TouchableOpacity style={styles.activityButton} onPress={() => setPopup('contar')}>
                    <Ionicons name="play" size={24} color="#E07612" />
                  </TouchableOpacity>
                </View>
                <View style={styles.activityItem}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>Jogo das Palavras</Text>
                    <Text style={styles.activityDate}>Nota: {notaPalavras}</Text>
                  </View>
                  <TouchableOpacity style={styles.activityButton} onPress={() => setPopup('palavras')}>
                    <Ionicons name="play" size={24} color="#E07612" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <Modal
            visible={modalDiagnostico}
            transparent
            animationType="fade"
            onRequestClose={() => setModalDiagnostico(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecione o Diagnóstico</Text>
                <ScrollView style={styles.diagnosticosList}>
                  {diagnosticos.map((diag) => (
                    <TouchableOpacity
                      key={diag.id}
                      style={[
                        styles.diagnosticoItem,
                        diagnosticoSelecionado === diag.id && styles.diagnosticoSelecionado
                      ]}
                      onPress={() => setDiagnosticoSelecionado(diag.id)}
                    >
                      <Text style={styles.diagnosticoText}>{diag.tipo}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setModalDiagnostico(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={atualizarDiagnostico}
                  >
                    <Text style={styles.modalButtonText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={popup !== null} transparent animationType="fade">
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {popup === 'contar' ? 'Jogo de Contar' : 'Jogo das Palavras'}
                </Text>
                <Text style={styles.modalText}>
                  {popup === 'contar'
                    ? 'Nesse jogo a criança deverá contar os elementos na tela e escolher a resposta correta.'
                    : 'Nesse jogo a criança deverá adivinhar palavras com base em dicas visuais.'}
                </Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => acessarJogo(popup!)}>
                  <Text style={styles.modalButtonText}>Acessar o jogo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setPopup(null)}>
                  <Text style={{ marginTop: 10, color: 'red' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={async () => {
            if (!crianca?.id) return;
            try {
              const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas/${crianca.id}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                setDeletada(true);
                Alert.alert('Sucesso', 'Criança deletada com sucesso!');
                router.push('/TeacherProfileScreen');
              } else {
                Alert.alert('Erro', 'Não foi possível deletar a criança.');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro ao tentar deletar a criança.');
            }
          }}
        >
          <Ionicons name="trash" size={22} color="#fff" />
          <Text style={styles.deleteButtonText}>Deletar Criança</Text>
        </TouchableOpacity>
      </>
    )
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  age: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoList: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',
  },
  sectionsContainer: {
    padding: 15,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  activitiesList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  activityInfo: {
    marginLeft: 15,
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activityButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  diagnosticosList: {
    maxHeight: 300,
    marginVertical: 10,
  },
  diagnosticoItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  diagnosticoSelecionado: {
    backgroundColor: '#fff3e0',
  },
  diagnosticoText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4d4d',
    padding: 14,
    borderRadius: 8,
    margin: 24,
    marginTop: 0,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 