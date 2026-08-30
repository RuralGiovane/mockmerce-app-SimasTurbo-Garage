/**
 * Tela de CADASTRO. Usa o BACKEND (session.signUp -> /auth/register). Ao cadastrar,
 * a guarda de rotas leva para o app automaticamente.
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setErro(null);
    try {
      await signUp(name.trim(), email.trim(), password);
    } catch (e) {
      setErro((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar conta</Text>

        <TextField placeholder="nome" autoCapitalize="words" value={name} onChangeText={setName} />
        <TextField
          placeholder="email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          placeholder="senha (mín. 6 caracteres)"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Button
          label={busy ? 'Criando…' : 'Cadastrar'}
          onPress={handle}
          disabled={busy || !name || !email || password.length < 6}
        />
        <Button label="Já tenho conta" variant="ghost" onPress={() => navigation.navigate('SignIn')} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 8 },
  erro: { color: '#b91c1c', fontSize: 13, textAlign: 'center' },
});