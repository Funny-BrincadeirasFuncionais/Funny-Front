import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');

  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [telFocused, setTelFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const router = useRouter();

  const handleRegister = async () => {
    const payload = {
      nome,
      email,
      senha,
      telefone,
    };

    try {
      const res1 = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res2 = await fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/responsaveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res1.ok && res2.ok) {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        router.push('/login');
      } else {
        Alert.alert('Erro', 'Falha no cadastro. Verifique os dados e tente novamente.');
        console.error('Erro:', await res1.text(), await res2.text());
      }
    } catch (error) {
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

        <ThemedView style={styles.lineContainer}>
          <ThemedView style={styles.line} />
          <ThemedText style={styles.orText}>Ou</ThemedText>
        </ThemedView>

        <Pressable style={styles.googleButton}>
          <FontAwesome name="google" size={24} color="#E07612" />
          <ThemedText style={styles.googleButtonText}>Continue com Google</ThemedText>
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
