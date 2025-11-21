import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, Image, Pressable, StyleSheet, TextInput, Modal, View } from 'react-native';
import { WebView } from 'react-native-webview';
import apiFetch, { BASE_URL } from '@/services/api';
import Constants from 'expo-constants';
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

  // No social login: removed Expo Google auth flow.

  const handleLogin = async () => {
  console.log('🔐 Iniciando processo de login...');
  // Validação cliente: não permitir login com campos vazios
  if (!email?.trim() || !senha?.trim()) {
    console.warn('⚠️ Tentativa de login com campos vazios');
    Alert.alert(transformText('Aviso'), transformText('Por favor preencha e-mail e senha antes de entrar.'));
    return;
  }

  // Show reCAPTCHA modal; the modal will post a token back to the WebView on success
  setIsLoading(true);
  setRecaptchaVisible(true);
};

  // UI state for recaptcha flow
  const [recaptchaVisible, setRecaptchaVisible] = useState(false);
  // Read site key from Expo config (app.json extra). Prefer this over hardcoding.
  const RECAPTCHA_SITE_KEY = (Constants.expoConfig as any)?.extra?.RECAPTCHA_SITE_KEY || '';
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('RECAPTCHA_SITE_KEY not set in expo config (app.json extra). Set extra.RECAPTCHA_SITE_KEY or replace the placeholder in login.tsx');
  }

  // No social login: removed Expo Google auth flow.
  const recaptchaHtml = (siteKey: string) => `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          function onSuccess(token) {
            window.ReactNativeWebView.postMessage(token);
          }
  `;


  const onRecaptchaMessage = async (event: any) => {
    const token = event.nativeEvent.data;
    setRecaptchaVisible(false);
    setIsLoading(true);
    if (!token || token.startsWith('ERROR:')) {
      setIsLoading(false);
      Alert.alert('Erro', 'Falha na verificação reCAPTCHA. Tente novamente.');
      return;
    }

    // perform the original login now including recaptcha_token
    const payload = { email, senha, recaptcha_token: token };
    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        if (data.access_token) await AsyncStorage.setItem('token', data.access_token);
        if (data.responsavel_id) {
          await AsyncStorage.setItem('userId', data.responsavel_id.toString());
        } else {
          // fallback behavior unchanged
          const resp = await apiFetch('/responsaveis');
          let lista;
          try { lista = await resp.json(); } catch { lista = []; }
          if (Array.isArray(lista)) {
            const responsavel = lista.find((item: any) => item.email === email);
            if (responsavel?.id) await AsyncStorage.setItem('userId', responsavel.id.toString());
          }
        }
        Alert.alert('Sucesso', 'Login realizado com sucesso!');
        router.replace('/(tabs)/home');
      } else {
        // Show detailed error if backend returned detail (FastAPI uses `detail`)
        Alert.alert('Erro', data.detail || data.message || 'Falha no login.');
      }
    } catch (e) {
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

        {/* <ThemedView style={styles.checkboxContainer}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            color={rememberMe ? '#E07612' : undefined}
          />
          <ThemedText style={styles.checkboxLabel}>Lembre-me</ThemedText>

          <Pressable style={{ marginLeft: 'auto' }}>
            <ThemedText style={styles.forgotPassword}>Esqueceu a senha?</ThemedText>
          </Pressable>
        </ThemedView> */}

        {/* Botão de login real: chama o handler que valida/efetua autenticação */}
        <Pressable style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
        </Pressable>

        </ThemedView>
        {/* reCAPTCHA modal (invisible widget runs and posts token back) */}
        <Modal visible={recaptchaVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' }}>
            <View style={{ height: 400, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                  {/* Close button so user can always cancel/retry */}
                  <Pressable
                    onPress={() => { setRecaptchaVisible(false); setIsLoading(false); }}
                    style={{ position: 'absolute', right: 8, top: 8, zIndex: 10, padding: 6 }}
                  >
                    <ThemedText style={{ color: '#6B7280' }}>Cancelar</ThemedText>
                  </Pressable>
                  <WebView
                    originWhitelist={["*"]}
                    // Prefer using a hosted page on the backend domain to avoid "Invalid domain" errors.
                    source={ BASE_URL ? { uri: `${BASE_URL}/recaptcha` } : { html: recaptchaHtml(RECAPTCHA_SITE_KEY) } }
                    onMessage={onRecaptchaMessage}
                    javaScriptEnabled
                    domStorageEnabled
                    onError={(syntheticEvent) => {
                      const { nativeEvent } = syntheticEvent;
                      setRecaptchaVisible(false);
                      setIsLoading(false);
                      Alert.alert('Erro', 'Falha ao carregar reCAPTCHA. Tente novamente.');
                    }}
                    onLoadEnd={() => {
                      // hide loading spinner only when the WebView has finished loading
                      // keep recaptchaVisible true; user will wait for token or cancel
                    }}
                  />
            </View>
          </View>
        </Modal>

        {/* Social login removed */}
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
  
});

