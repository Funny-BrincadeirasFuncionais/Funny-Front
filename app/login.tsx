import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { FontAwesome } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput } from 'react-native';

export default function LoginScreen() {
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Image style={styles.image}
        source={require('../assets/images/funny.png')}
        resizeMode="contain"
      />
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>Login</ThemedText>

        <ThemedView style={styles.centeredRow}>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Não tem uma conta?{' '}
          </ThemedText>
          <Pressable onPress={() => router.push('/cadastro')}>
            <ThemedText type="subtitle" style={styles.hiperlink}>Cadastre-se</ThemedText>
          </Pressable>
        </ThemedView>

        <TextInput
          placeholder="E-mail"
          style={[styles.input, emailFocused && styles.inputFocused]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Senha"
          style={[styles.input, passwordFocused && styles.inputFocused]}
          onFocus={() => setPasswordFocused(true)}
          onBlur={() => setPasswordFocused(false)}
          secureTextEntry
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

        <Pressable style={styles.loginButton}>
          <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 34,
    marginBottom:32
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
