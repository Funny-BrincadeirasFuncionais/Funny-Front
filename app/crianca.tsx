import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function CriancaScreen() {
  const [criancas, setCriancas] = useState<any[]>([]);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [nome, setNome] = useState('');
  const [idade, setIdade] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const router = useRouter();

  const carregarCriancas = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const res = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas');
      const lista = await res.json();

      const doUsuario = lista.filter((c: any) => c.responsavelId?.toString() === userId);
      setCriancas(doUsuario);
    } catch (e) {
      console.error('Erro ao carregar crianças', e);
    }
  };

  useEffect(() => {
    carregarCriancas();
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

  const selecionarCrianca = async (id: number, nome: string) => {
    try {
      await AsyncStorage.setItem('criancaSelecionada', id.toString());
      await AsyncStorage.setItem('criancaSelecionadaNome', nome);
      Alert.alert('Selecionado', `Criança "${nome}" selecionada`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar a criança.');
    }
  };

  const abrirModalEditar = (crianca: any) => {
    setNome(crianca.nome);
    setIdade(crianca.idade.toString());
    setEditandoId(crianca.id);
    setModalEdicao(true);
  };

  const editarCrianca = async () => {
    const userId = await AsyncStorage.getItem('userId');
    if (!editandoId || !nome || !idade || !userId) return;

    const payload = {
      nome,
      idade: parseInt(idade),
      responsavelId: parseInt(userId),
      diagnosticoId: 1
    };

    try {
      const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas/${editandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Criança atualizada!');
        setModalEdicao(false);
        setEditandoId(null);
        setNome('');
        setIdade('');
        carregarCriancas();
      } else {
        Alert.alert('Erro', 'Erro ao atualizar.');
      }
    } catch (e) {
      console.error('Erro ao editar criança', e);
    }
  };

  const deletarCrianca = async (id: number) => {
    try {
      const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Criança deletada!');
        carregarCriancas();
      } else {
        Alert.alert('Erro', 'Não foi possível deletar.');
      }
    } catch (e) {
      console.error('Erro ao deletar criança', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Minhas Crianças</Text>

      {criancas.map((c, index) => (
        <View key={index} style={styles.criancaItem}>
          <Text style={styles.nome}>{c.nome} ({c.idade} anos)</Text>
          <View style={styles.botoesLinha}>
            <TouchableOpacity style={styles.botao} onPress={() => selecionarCrianca(c.id, c.nome)}>
              <Text style={styles.botaoTexto}>Selecionar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#2196F3' }]} onPress={() => abrirModalEditar(c)}>
              <Text style={styles.botaoTexto}>Alterar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.botao, { backgroundColor: '#D32F2F' }]} onPress={() => deletarCrianca(c.id)}>
              <Text style={styles.botaoTexto}>Deletar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={() => setModalCadastro(true)}>
        <Text style={styles.buttonText}>Cadastrar Criança</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>Voltar para Home</Text>
      </TouchableOpacity>

      {/* Modal Cadastro */}
      <Modal visible={modalCadastro} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cadastrar Criança</Text>
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
            <TouchableOpacity style={styles.modalButton} onPress={cadastrarCrianca}>
              <Text style={styles.modalButtonText}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalCadastro(false)}>
              <Text style={{ marginTop: 10, color: 'red' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Edição */}
      <Modal visible={modalEdicao} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Criança</Text>
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
            <TouchableOpacity style={styles.modalButton} onPress={editarCrianca}>
              <Text style={styles.modalButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalEdicao(false)}>
              <Text style={{ marginTop: 10, color: 'red' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  nome: {
    fontSize: 18,
    marginVertical: 5
  },
  criancaItem: {
    width: '100%',
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  botoesLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  botao: {
    backgroundColor: '#E07612',
    padding: 8,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 3
  },
  botaoTexto: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%',
    borderRadius: 5
  },
  modalButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center'
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
