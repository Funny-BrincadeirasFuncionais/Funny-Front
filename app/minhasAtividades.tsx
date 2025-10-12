import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import React, { useState, useEffect } from 'react';

export default function MinhasAtividades() {
  const [criancaNome, setCriancaNome] = useState('');
  const [popup, setPopup] = useState<'contar' | 'palavras' | null>(null);
  const [notaContar, setNotaContar] = useState<string>('...');
  const [notaPalavras, setNotaPalavras] = useState<string>('...');
  const router = useRouter();
  const navigation = useNavigation();

  const carregarDados = async () => {
    try {
      const id = await AsyncStorage.getItem('criancaSelecionada');
      if (!id) {
        Alert.alert('Erro', 'Nenhuma criança selecionada.');
        router.replace('/CriancaProfileScreen');
        return;
      }

      const res = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/criancas/${id}`);
      const data = await res.json();
      setCriancaNome(data.nome);

      const resProgresso = await fetch(`https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/progresso/crianca/${id}`);
      const progresso = await resProgresso.json();

      const contar = progresso.find((p: any) => p.atividadeId === 9);
      const palavras = progresso.find((p: any) => p.atividadeId === 8);

      setNotaContar(contar?.pontuacao?.toString() ?? 'Ainda não fez');
      setNotaPalavras(palavras?.pontuacao?.toString() ?? 'Ainda não fez');
    } catch (e) {
      console.error('Erro ao carregar dados da criança', e);
      setNotaContar('Erro');
      setNotaPalavras('Erro');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarDados);
    return unsubscribe;
  }, [navigation]);

  const acessarJogo = (tipo: 'contar' | 'palavras') => {
    setPopup(null);
    router.push(tipo === 'contar' ? '/jogoContagem' : '/jogoPalavra');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atividades de {criancaNome}</Text>

      <TouchableOpacity style={styles.button} onPress={() => setPopup('contar')}>
        <Text style={styles.buttonText}>Jogo de Contar</Text>
      </TouchableOpacity>
      <Text style={styles.notaText}>Nota: {notaContar}</Text>

      <TouchableOpacity style={styles.button} onPress={() => setPopup('palavras')}>
        <Text style={styles.buttonText}>Jogo das Palavras</Text>
      </TouchableOpacity>
      <Text style={styles.notaText}>Nota: {notaPalavras}</Text>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#aaa' }]} onPress={() => router.push('/home')}>
        <Text style={styles.buttonText}>Voltar para Home</Text>
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#E07612',
    padding: 12,
    borderRadius: 8,
    marginTop: 10
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  notaText: {
    marginTop: 5,
    fontStyle: 'italic'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '85%'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalText: {
    fontSize: 14,
    marginBottom: 15
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});