import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Checkbox from 'expo-checkbox';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput } from 'react-native';

export default function LoginScreen() {
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <Image source={require('@/assets/images/logo.png')} style={styles.logo} />
      <ThemedView style={styles.card}>
        <ThemedText type="title" style={styles.title}>Login</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>Não tem uma conta? <ThemedText type="subtitle" style={styles.hiperlink}>Crie uma conta</ThemedText></ThemedText>

        <ThemedView style={styles.form}>
          <TextInput 
            placeholder="Email" 
            style={[styles.input, emailFocused && styles.inputFocused]}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
          <TextInput 
            placeholder="Senha" 
            style={[styles.input, passwordFocused && styles.inputFocused]}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <ThemedView style={styles.checkboxContainer}>
            <Checkbox
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? 'orange' : undefined}
            />
            <ThemedText style={styles.checkboxLabel}>Lembrar-me</ThemedText>
            <ThemedText style={styles.forgotPassword}>Esqueceu a senha?</ThemedText>
          </ThemedView>
          <ThemedView style={styles.buttonContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.basicButton,
                pressed && { opacity: 0.8 }
              ]}
            >
              <ThemedText style={styles.buttonText}>Entrar</ThemedText>
            </Pressable>
          </ThemedView>
          <ThemedView style={styles.line}>
            <ThemedText style={styles.orText}>ou</ThemedText>
          </ThemedView>
          <ThemedView style={styles.googleButtonContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.googleButton,
                pressed && { opacity: 0.8 }
              ]}
            >
              <ThemedText style={styles.googleButtonText}>Entrar com Google</ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'orange',
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    height: 450,
    width: '100%',
    padding: 24,
    borderRadius: 12,
  },
  title: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: 'gray',
    fontSize: 16,
    marginTop: 8,
    fontWeight: 'thin',
    textAlign: 'center',
  },
  hiperlink: {
    fontWeight: 'thin',
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  form: {
    marginTop: 24,
    backgroundColor: 'transparent',
  },
  input: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: 'orange',
  },
  logo: {
    width: 110,
    height: 30,
    marginBottom: 32,
  },
  checkboxContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  checkboxLabel: {
    marginLeft: 8,
    color: 'gray',
  },
  forgotPassword: {
    textAlign: 'right',
    marginLeft: 50,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  basicButton: {
    backgroundColor: 'orange',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
    backgroundColor: 'transparent'
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#d9d9d9',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: {
    textAlign: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 10,
    color: '#d9d9d9',
  },
  googleButtonContainer: {
    backgroundColor: 'transparent',
    marginTop: 24,
    width: '100%',
  },
  googleButton: {
    borderColor: 'orange',
    borderWidth: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    width: '100%',
  },
  googleButtonText: {
    color: 'orange',
    fontWeight: 'bold',
    fontSize: 16,
  }
}); 

    