import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StatusBar,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export default function EditarPerfilScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const [nomeFocused, setNomeFocused] = useState(false);
  const [sobrenomeFocused, setSobrenomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [telefoneFocused, setTelefoneFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Foto */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/300' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editIcon}>
            <Ionicons name="pencil" size={20} color="#E07612" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Inputs */}
      <View style={styles.form}>
        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={[styles.input, nomeFocused && styles.inputFocused]}
          onFocus={() => setNomeFocused(true)}
          onBlur={() => setNomeFocused(false)}
        />

        <TextInput
          placeholder="Sobrenome"
          value={sobrenome}
          onChangeText={setSobrenome}
          style={[styles.input, sobrenomeFocused && styles.inputFocused]}
          onFocus={() => setSobrenomeFocused(true)}
          onBlur={() => setSobrenomeFocused(false)}
        />

        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, emailFocused && styles.inputFocused]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />

        <TextInput
          placeholder="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          style={[styles.input, telefoneFocused && styles.inputFocused]}
          onFocus={() => setTelefoneFocused(true)}
          onBlur={() => setTelefoneFocused(false)}
        />
      </View>

      {/* Botão mudar senha */}
      <TouchableOpacity style={styles.passwordButton}>
        <Text style={styles.passwordText}>Mudar senha</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
  },
  headerSpacer: {
    width: 40,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E07612',
  },
  form: {
    marginTop: 24,
    paddingHorizontal: 24,
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
  passwordButton: {
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
  },
  passwordText: {
    color: '#E07612',
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
  },
});