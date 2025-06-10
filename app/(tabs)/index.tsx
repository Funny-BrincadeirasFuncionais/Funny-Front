import { Link } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Página Inicial</Text>

    <Link href={"/(tabs)/pagina-teste" as any} asChild>
      <Button title="Ir para Página Teste" />
    </Link>
    <Link href={"/(tabs)/login" as any} asChild>
      <Button title="Ir para pagina de login" />
    </Link>
    <Link href={"/(tabs)/jogo3" as any} asChild>
      <Button title="Ir para pagina jogo3" />
    </Link>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 }
});
