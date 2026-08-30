import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export function SignInScreen({ navigation }: Props) {
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setErro(null);
    try {
      await signIn(email.trim(), password);
      // Não navegamos: a guarda de rotas troca o stack sozinha ao logar.
    } catch (e) {
      setErro((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.container}>
        <Text style={styles.title}>Loja da Turma</Text>
        <Text style={styles.subtitle}>Entre para continuar</Text>

        <TextField
          placeholder="email"
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextField placeholder="senha" secureTextEntry value={password} onChangeText={setPassword} />

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Button label={busy ? 'Entrando…' : 'Entrar'} onPress={handle} disabled={busy || !email || !password} />
        <Button label="Esqueci minha senha" variant="ghost" onPress={() => navigation.navigate('ForgotPassword')} />
        <Button label="Criar uma conta" variant="ghost" onPress={() => navigation.navigate('SignUp')} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 8 },
  erro: { color: '#b91c1c', fontSize: 13, textAlign: 'center' },
});