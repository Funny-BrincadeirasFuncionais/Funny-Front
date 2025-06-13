import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TeacherProfileScreen = () => {
  const router = useRouter();
  const [criancas, setCriancas] = useState<any[]>([]);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [professorNome, setProfessorNome] = useState('PROFESSOR');
  const [professorUsuario, setProfessorUsuario] = useState('usuario');
  const [turmaId, setTurmaId] = useState('');
  const [totalAlunos, setTotalAlunos] = useState(0);
  const [totalAtividades, setTotalAtividades] = useState(0);
  const [mediaProgresso, setMediaProgresso] = useState(0);

  const carregarAtividadesDosAlunos = async (alunos: any[]) => {
    let total = 0;
    for (const aluno of alunos) {
      try {
        const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/progresso/crianca/${aluno.id}`);
        const atividades = await res.json();
        total += Array.isArray(atividades) ? atividades.length : 0;
      } catch (error) {
        console.error('Erro ao carregar atividades do aluno:', error);
      }
    }
    setTotalAtividades(total);
  };

  const calcularMediaProgresso = async (alunos: any[]) => {
    if (alunos.length === 0) {
      setMediaProgresso(0);
      return;
    }

    try {
      // Buscar todas as atividades disponíveis
      const atividadesRes = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/atividades');
      const atividades = await atividadesRes.json();
      const totalAtividades = atividades.length;

      if (totalAtividades === 0) {
        setMediaProgresso(0);
        return;
      }

      let totalProgresso = 0;

      for (const aluno of alunos) {
        try {
          const progressoRes = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/progresso/crianca/${aluno.id}`);
          const progresso = await progressoRes.json();
          const concluidas = Array.isArray(progresso) ? progresso.length : 0;
          
          // Calcular porcentagem de progresso para cada aluno
          const progressoAluno = (concluidas / totalAtividades) * 100;
          totalProgresso += progressoAluno;
        } catch (error) {
          console.error('Erro ao calcular progresso do aluno:', error);
        }
      }

      // Calcular média geral
      const media = totalProgresso / alunos.length;
      setMediaProgresso(Math.round(media));
    } catch (error) {
      console.error('Erro ao calcular média de progresso:', error);
      setMediaProgresso(0);
    }
  };

  const carregarCriancas = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const res = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas');
      const lista = await res.json();

      const doUsuario = lista.filter((c: any) => c.responsavelId?.toString() === userId);
      setCriancas(doUsuario);
      setTotalAlunos(doUsuario.length);
      
      // Carregar atividades e calcular progresso
      await carregarAtividadesDosAlunos(doUsuario);
      await calcularMediaProgresso(doUsuario);
    } catch (e) {
      console.error('Erro ao carregar crianças', e);
    }
  };

  useEffect(() => {
    carregarCriancas();
  }, []);

  useEffect(() => {
    const carregarProfessor = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
        const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/responsaveis/${userId}`);
        const data = await res.json();
        if (res.ok && data.nome) {
          setProfessorNome(data.nome.toUpperCase());
          setProfessorUsuario(data.usuario ? `@${data.usuario}` : `@${data.nome.toLowerCase()}`);
        }
      } catch (error) {
        console.error('Erro ao carregar professor:', error);
      }
    };
    carregarProfessor();
  }, []);

  const cadastrarCrianca = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId || !nome || !idade) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }
    const payload = {
      nome,
      idade: parseInt(idade),
      responsavelId: parseInt(userId),
      diagnosticoId: 1
    };
    try {
      const res = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        Alert.alert('Sucesso', 'Criança cadastrada!');
        setModalCadastro(false);
        setNome('');
        setIdade('');
        carregarCriancas();
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar.');
      }
    } catch (e) {
      console.error('Erro ao cadastrar criança', e);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#ffd700', '#ffa500', '#ff8c00']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/home')}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{professorNome}</Text>
          <Text style={styles.username}>{professorUsuario}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Painel de Controle</Text>
        <View style={styles.dashboardGrid}>
          <View style={styles.dashboardItem}>
            <Ionicons name="people" size={24} color="#ff8c00" />
            <Text style={styles.dashboardNumber}>{totalAlunos}</Text>
            <Text style={styles.dashboardLabel}>Alunos Ativos</Text>
          </View>
          <View style={styles.dashboardItem}>
            <Ionicons name="book" size={24} color="#ff8c00" />
            <Text style={styles.dashboardNumber}>{totalAtividades}</Text>
            <Text style={styles.dashboardLabel}>Atividades</Text>
          </View>
          <View style={styles.dashboardItem}>
            <Ionicons name="trending-up" size={24} color="#ff8c00" />
            <Text style={styles.dashboardNumber}>{mediaProgresso}%</Text>
            <Text style={styles.dashboardLabel}>Média de Progresso</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meus Alunos</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setModalCadastro(true)}
          >
            <Ionicons name="add-circle" size={24} color="#ff8c00" />
          </TouchableOpacity>
        </View>
        <View style={styles.studentsList}>
          {criancas.map((crianca, index) => (
            <View key={index} style={styles.studentCard}>
              <Image
                source={{ uri: 'https://via.placeholder.com/50' }}
                style={styles.studentAvatar}
              />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{crianca.nome}</Text>
                <Text style={styles.studentLevel}>Idade: {crianca.idade} anos</Text>
                <Text style={styles.studentDiagnosis}>
                  Diagnóstico: {crianca.diagnostico?.nome || 'Não especificado'}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '75%' }]} />
                </View>
              </View>
              <TouchableOpacity
                style={styles.studentButton}
                onPress={async () => {
                  await AsyncStorage.setItem('criancaSelecionada', crianca.id.toString());
                  await AsyncStorage.setItem('criancaSelecionadaNome', crianca.nome);
                  router.push('/CriancaProfileScreen');
                }}
              >
                <Ionicons name="chevron-forward" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
        <View style={styles.activitiesList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="create" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Nova Atividade Criada</Text>
              <Text style={styles.activityDate}>Reconhecimento de Vogais</Text>
              <Text style={styles.activityStatus}>5 alunos completaram</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Atividade Avaliada</Text>
              <Text style={styles.activityDate}>Formação de Palavras</Text>
              <Text style={styles.activityStatus}>Média: 85% de acerto</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas Ações</Text>
        <View style={styles.tasksList}>
          <View style={styles.taskItem}>
            <Ionicons name="alert-circle" size={24} color="#ff8c00" />
            <Text style={styles.taskText}>Avaliar progresso de 3 alunos</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="calendar" size={24} color="#ff8c00" />
            <Text style={styles.taskText}>Planejar atividades da próxima semana</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="mail" size={24} color="#ff8c00" />
            <Text style={styles.taskText}>Enviar relatórios aos responsáveis</Text>
          </View>
        </View>
      </View>

      {/* Modal de Cadastro de Criança */}
      <Modal visible={modalCadastro} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cadastrar Aluno</Text>
            <TextInput
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
            />
            <TextInput
              placeholder="Idade"
              value={idade}
              onChangeText={setIdade}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity 
              style={[
                styles.modalButton,
                (!nome.trim() || !idade.trim()) && styles.modalButtonDisabled
              ]} 
              onPress={cadastrarCrianca}
              disabled={!nome.trim() || !idade.trim()}
            >
              <Text style={styles.modalButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalCadastro(false)}>
              <Text style={{ marginTop: 10, color: 'red' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Fim do conteúdo principal */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('criancaSelecionada');
            await AsyncStorage.removeItem('criancaSelecionadaNome');
            await AsyncStorage.clear(); // Garantia extra
            Alert.alert('Logout', 'Logout realizado com sucesso!');
            router.push('/login');
          } catch (e) {
            Alert.alert('Erro', 'Erro ao realizar logout. Tente novamente.');
          }
        }}
      >
        <Ionicons name="log-out" size={22} color="#fff" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
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
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff8c00',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  username: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: '#ff8c00',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  section: {
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
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  dashboardItem: {
    alignItems: 'center',
  },
  dashboardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginTop: 5,
  },
  dashboardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    padding: 5,
  },
  studentsList: {
    gap: 15,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  studentLevel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff8c00',
    borderRadius: 2,
  },
  studentButton: {
    padding: 5,
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
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  tasksList: {
    gap: 15,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#ff8c00',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
  },
  studentDiagnosis: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E07612',
    padding: 14,
    borderRadius: 8,
    margin: 24,
    marginTop: 0,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default TeacherProfileScreen; 