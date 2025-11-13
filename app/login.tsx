import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput } from 'react-native';
import apiFetch from '@/services/api';
import { useAccessibility } from '@/context/AccessibilityContext';
import LoadingOverlay from '@/components/LoadingOverlay';
import KeyboardSafeView from '@/components/KeyboardSafeView';



export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const { transformText } = useAccessibility();

  const handleLogin = async () => {
  console.log('🔐 Iniciando processo de login...');
  setIsLoading(true);
  // Validação cliente: não permitir login com campos vazios
  if (!email?.trim() || !senha?.trim()) {
    console.warn('⚠️ Tentativa de login com campos vazios');
    Alert.alert(transformText('Aviso'), transformText('Por favor preencha e-mail e senha antes de entrar.'));
    return;
  }
  const payload = {
    email,
    senha,
  };

  try {
    console.log('📡 Enviando requisição de autenticação...');
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📥 Resposta do servidor recebida');

    if (response.ok) {
      console.log('✅ Autenticação bem-sucedida!');
      if (data.access_token) {
        console.log('💾 Salvando token de acesso no AsyncStorage...');
        await AsyncStorage.setItem('token', data.access_token);
      }

      // Se o backend já retornou o id do responsável, salvamos direto
      if (data.responsavel_id) {
        console.log('🔍 Responsável retornado no login. Salvando ID:', data.responsavel_id);
        await AsyncStorage.setItem('userId', data.responsavel_id.toString());
      } else {
        console.log('🔍 Responsável não retornado no login. Fazendo fallback para /responsaveis');
        console.log('🔍 Buscando informações do responsável...');
        const resp = await apiFetch('/responsaveis');
        let lista;
        try {
          lista = await resp.json();
          console.log('📋 Lista de responsáveis obtida:', lista.length, 'responsáveis encontrados');
        } catch (e) {
          console.error('❌ Erro ao processar resposta de /responsaveis:', e);
          lista = [];
        }

        if (Array.isArray(lista)) {
          console.log('🔍 Procurando responsável com email:', email);
          const responsavel = lista.find((item: any) => item.email === email);
          if (responsavel?.id) {
            console.log('✅ Responsável encontrado! ID:', responsavel.id);
            await AsyncStorage.setItem('userId', responsavel.id.toString());
            console.log('💾 ID do responsável salvo no AsyncStorage');
          } else {
            console.warn('⚠️ Usuário logado mas não encontrado como responsável');
            Alert.alert('Aviso', 'Usuário logado, mas não encontrado na lista de responsáveis.');
          }
        } else {
          console.error('❌ Formato inválido na resposta de responsáveis');
          Alert.alert('Erro', 'Resposta inesperada do servidor ao buscar responsáveis.');
          console.error('Resposta inesperada de /responsaveis:', lista);
        }
      }

      console.log('🎉 Login finalizado com sucesso!');
      setIsLoading(false);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      console.log('🔄 Redirecionando para a tela inicial (tabs)...');
      // usar replace para evitar voltar para a tela de login
      router.replace('/(tabs)/home');
    } else {
      console.error('❌ Falha na autenticação:', data.message);
      setIsLoading(false);
      Alert.alert('Erro', data.message || 'Falha no login.');
    }
  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    setIsLoading(false);
    Alert.alert('Erro', 'Erro ao conectar com o servidor.');
  }
};


  return (
    <KeyboardSafeView>
      <ThemedView style={styles.container}>
        <LoadingOverlay visible={isLoading} message={isLoading ? 'Conectando...' : undefined} />
        <Image style={styles.image}
          source={require('../assets/images/funny.png')}
          resizeMode="contain"
        />
        <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>Login</ThemedText>

        <ThemedView style={styles.centeredRow}>
          <ThemedText type="subtitle" style={styles.subtitle}>Não tem uma conta? </ThemedText>
          <Pressable onPress={() => router.push('/cadastro')}>
            <ThemedText type="subtitle" style={styles.hiperlink}>Cadastre-se</ThemedText>
          </Pressable>
        </ThemedView>

        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, emailFocused && styles.inputFocused]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={[styles.input, passwordFocused && styles.inputFocused]}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
        />

        <ThemedView style={styles.checkboxContainer}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? '#E07612' : undefined}
          />
          <ThemedText style={styles.checkboxLabel}>Lembre-me</ThemedText>

          <Pressable style={{ marginLeft: 'auto' }}>
            <ThemedText style={styles.forgotPassword}>Esqueceu a senha?</ThemedText>
          </Pressable>
        </ThemedView>

        {/* Botão de login real: chama o handler que valida/efetua autenticação */}
        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
        </Pressable>

        </ThemedView>
      </ThemedView>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E07612',
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 34,
    marginBottom: 32
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 12,
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  centeredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: '#59626E',

  },
  hiperlink: {
    fontSize: 16,
    color: '#4D81E7',
    textDecorationLine: 'underline',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#E07612',
    borderWidth: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'white'
  },
  checkboxLabel: {
    marginLeft: 8,
    color: '#6B7280',
  },
  forgotPassword: {
    color: '#4D81E7',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#E07612',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  lineContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 24,
    marginBottom: 24,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#EAEDF1',
  },
  orText: {
    position: 'absolute',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    color: '#59626E',
    fontSize: 14,
  },
  googleButton: {
    borderColor: '#E07612',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  googleButtonText: {
    color: '#E07612',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginLeft: 8,
  },
});
