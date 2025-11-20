import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, Modal, View } from 'react-native';
import apiFetch, { BASE_URL } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingOverlay from '@/components/LoadingOverlay';
import KeyboardSafeView from '@/components/KeyboardSafeView';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

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
  // reCAPTCHA modal state
  const [recaptchaVisible, setRecaptchaVisible] = useState(false);
  const RECAPTCHA_SITE_KEY = (Constants.expoConfig as any)?.extra?.RECAPTCHA_SITE_KEY || '';
  if (!RECAPTCHA_SITE_KEY) {
    console.warn('RECAPTCHA_SITE_KEY not set in expo config (app.json extra).');
  }

  const recaptchaHtml = (siteKey: string) => `
    <!doctype html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script>
          function onSuccess(token) {
            window.ReactNativeWebView.postMessage(token);
          }
          function onLoadCallback() {
            try {
              var widgetId = grecaptcha.render('recaptcha', { 'sitekey': '${siteKey}', 'size': 'invisible', 'callback': onSuccess });
              grecaptcha.execute(widgetId);
            } catch (e) {
              try { grecaptcha.execute(); } catch (ee) { window.ReactNativeWebView.postMessage('ERROR:'+ee.message); }
            }
          }
        </script>
      </head>
      <body>
        <div id="recaptcha"></div>
        <script src="https://www.google.com/recaptcha/api.js?onload=onLoadCallback&render=explicit" async defer></script>
      </body>
    </html>
  `;

  const onRecaptchaMessage = async (event: any) => {
    const token = event?.nativeEvent?.data;
    setRecaptchaVisible(false);
    setIsLoading(true);
    if (!token || token.startsWith('ERROR:')) {
      setIsLoading(false);
      Alert.alert('Erro', 'Falha na verificação reCAPTCHA. Tente novamente.');
      return;
    }

    console.log('➡️ login payload will be sent:', JSON.stringify({ email, senha, recaptcha_token: token }));

    try {
      // Efetuar login com token reCAPTCHA
      const loginRes = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha, recaptcha_token: token }),
      });

      const ct = loginRes.headers.get?.('content-type') || '';
      let loginData: any = undefined;
      if (ct.includes('application/json')) {
        loginData = await loginRes.json().catch(() => undefined);
      } else {
        const text = await loginRes.text().catch(() => '');
        try { loginData = JSON.parse(text); } catch { loginData = { message: text }; }
      }

      if (!loginRes.ok) {
        const detail = loginData?.detail || loginData?.message || 'Falha no login automático.';
        setIsLoading(false);
        Alert.alert('Erro', detail.toString());
        return;
      }

      // Salvar token
      if (loginData?.access_token) {
        await AsyncStorage.setItem('token', loginData.access_token);
      }

      // Criar responsável (agora autenticado)
      const res2 = await apiFetch('/responsaveis', {
        method: 'POST',
        body: JSON.stringify({ nome, email, telefone }),
      });

      if (res2.ok) {
        let created: any = undefined;
        try { created = await res2.json(); } catch { created = undefined; }
        // Save responsavel id to AsyncStorage so the app loads the correct account
        try {
          if (created?.id) {
            await AsyncStorage.setItem('userId', created.id.toString());
          }
        } catch (e) {
          console.warn('Failed to save userId in AsyncStorage', e);
        }
        setIsLoading(false);
        Alert.alert('Sucesso', 'Cadastro e login realizados com sucesso!');
        // Ir para a home
        router.replace('/(tabs)/home');
      } else {
        const text = await res2.text().catch(() => '');
        setIsLoading(false);
        Alert.alert('Atenção', 'Login realizado, mas falha ao criar perfil de responsável: ' + (text || res2.status));
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Erro', 'Erro ao autenticar. Tente novamente.');
    }
  };

  const router = useRouter();

  const handleRegister = async () => {
    console.log('📝 Iniciando processo de cadastro...');
    setIsLoading(true);
    const payload = {
      nome,
      email,
      senha,
      telefone,
    };
    console.log('📋 Dados do formulário preparados');
    console.log('📋 Payload (registro):', JSON.stringify(payload));

    try {
      console.log('1️⃣ Registrando novo usuário...');
      const res1 = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!res1.ok) {
        const errorText = await res1.text();
        console.error('❌ Erro no registro:', errorText);
        console.error('Status:', res1.status);
        Alert.alert('Erro', 'Falha no cadastro. Verifique os dados e tente novamente.');
        setIsLoading(false);
        return;
      }
      console.log('✅ Usuário registrado com sucesso!');

      // Após registro, abrir o modal reCAPTCHA para permitir login automático.
      setIsLoading(true);
      setRecaptchaVisible(true);
    } catch (error) {
      console.error('❌ Erro inesperado durante o cadastro:', error);
      setIsLoading(false);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <KeyboardSafeView>
      <ThemedView style={styles.container}>
        <LoadingOverlay visible={isLoading} message={isLoading ? 'Enviando...' : undefined} />
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
        {/* reCAPTCHA modal (runs invisible widget and posts token back) */}
        <Modal visible={recaptchaVisible} animationType="slide" transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center' }}>
            <View style={{ height: 400, marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' }}>
              <Pressable
                onPress={() => { setRecaptchaVisible(false); setIsLoading(false); }}
                style={{ position: 'absolute', right: 8, top: 8, zIndex: 10, padding: 6 }}
              >
                <ThemedText style={{ color: '#6B7280' }}>Cancelar</ThemedText>
              </Pressable>
              <WebView
                originWhitelist={["*"]}
                source={ BASE_URL ? { uri: `${BASE_URL}/recaptcha` } : { html: recaptchaHtml(RECAPTCHA_SITE_KEY) } }
                onMessage={onRecaptchaMessage}
                javaScriptEnabled
                domStorageEnabled
                onError={() => {
                  setRecaptchaVisible(false);
                  setIsLoading(false);
                  Alert.alert('Erro', 'Falha ao carregar reCAPTCHA. Tente novamente.');
                }}
              />
            </View>
          </View>
        </Modal>
        </ThemedView>
      </ThemedView>
    </KeyboardSafeView>
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
});


