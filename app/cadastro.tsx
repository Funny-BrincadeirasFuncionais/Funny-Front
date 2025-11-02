import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import apiFetch from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [telFocused, setTelFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    setIsLoading(true);
    const payload = {
      nome,
      email,
      senha,
      telefone,
    };

    try {
      // 1. Registrar usuário
      const res1 = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res1.ok) {
        console.error('Erro no registro:', await res1.text());
        Alert.alert('Erro', 'Falha no cadastro. Verifique os dados e tente novamente.');
        setIsLoading(false);
        return;
      }

      // 2. Fazer login para obter token
      console.log('Tentando fazer login com:', { email });
      const loginRes = await apiFetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha }),
      });

      const responseText = await loginRes.text();
      console.log('Login response text:', responseText);

      if (!loginRes.ok) {
        console.error('Erro no login. Status:', loginRes.status, 'Resposta:', responseText);
        Alert.alert('Erro', 'Cadastro realizado, mas falha ao fazer login automático.');
        setIsLoading(false);
        router.push('/login');
        return;
      }

      // Tenta converter a resposta em JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log('Login response:', responseData);
      } catch (jsonError) {
        console.error('Erro ao processar resposta do login:', jsonError);
        Alert.alert('Erro', 'Resposta inválida do servidor.');
        setIsLoading(false);
        router.push('/login');
        return;
      }

      if (!responseData?.access_token) {
        console.error('Token não encontrado na resposta:', responseData);
        Alert.alert('Erro', 'Erro ao obter token de autenticação.');
        setIsLoading(false);
        router.push('/login');
        return;
      }

      try {
        await AsyncStorage.setItem('token', responseData.access_token);
        console.log('Token salvo com sucesso');
      } catch (storageError) {
        console.error('Erro ao salvar token:', storageError);
        Alert.alert('Erro', 'Erro ao salvar dados de autenticação.');
        setIsLoading(false);
        router.push('/login');
        return;
      }

      // 3. Criar responsável (com token de autenticação)
      const res2 = await apiFetch('/responsaveis', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res2.ok) {
        setIsLoading(false);
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        router.push('/login');
      } else {
        setIsLoading(false);
        Alert.alert('Erro', 'Falha ao criar perfil de responsável. Por favor, tente fazer login.');
        console.error('Erro:', await res2.text());
        router.push('/login');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Erro ao cadastrar:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.card}>
        <Pressable onPress={() => router.back()} style={styles.backArrow}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>

        <ThemedText type="title" style={styles.title}>Cadastre-se</ThemedText>

        <ThemedView style={styles.centeredRow}>
          <ThemedText type="subtitle" style={styles.subtitle}>Já tem uma conta? </ThemedText>
          <Pressable onPress={() => router.push('/login')}>
            <ThemedText type="subtitle" style={styles.hiperlink}>Login</ThemedText>
          </Pressable>
        </ThemedView>

        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={[styles.input, nomeFocused && styles.inputFocused]}
          onFocus={() => setNomeFocused(true)}
          onBlur={() => setNomeFocused(false)}
        />

        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, emailFocused && styles.inputFocused]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />

        <TextInput
          placeholder="(00) 0 0000-0000"
          value={telefone}
          onChangeText={setTelefone}
          style={[styles.input, telFocused && styles.inputFocused]}
          onFocus={() => setTelFocused(true)}
          onBlur={() => setTelFocused(false)}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={[styles.input, senhaFocused && styles.inputFocused]}
          onFocus={() => setSenhaFocused(true)}
          onBlur={() => setSenhaFocused(false)}
        />

        <Pressable style={styles.registerButton} onPress={handleRegister}>
          <ThemedText style={styles.registerButtonText}>Registre-se</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E07612',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        width: '100%',
        borderRadius: 12,
        padding: 24,
    },
    backArrow: {
        fontSize: 20,
        color: 'black',
        marginBottom: 24
    },
    centeredRow: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 24,
    },

    title: {
        color: '#111827',
        fontSize: 32,
        fontFamily: 'Inter_700Bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#59626E',
    },
    hiperlink: {
        fontWeight: 'thin',
        fontSize: 16,
        color: '#4D81E7',
        textDecorationLine: 'underline',
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
    registerButton: {
        backgroundColor: '#E07612',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    registerButtonText: {
        color: 'white',
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
    },
    googleButton: {
        borderColor: '#E07612',
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    googleButtonText: {
        color: '#E07612',
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
    },
});
