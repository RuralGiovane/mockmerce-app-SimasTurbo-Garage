import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

const logoSource = require('../../assets/IMG_3357.png');

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
    } catch (e) {
      setErro((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>SIMAS TURBO GARAGE</Text>
          <Text style={styles.subtitle}>Acesso de Piloto & Preparador</Text>
        </View>

        <View style={styles.form}>
          <TextField
            placeholder="Seu e-mail cadastrado"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            placeholder="Sua senha secreta"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {erro && (
            <View style={styles.errorBox}>
              <Text style={styles.erro}>{erro}</Text>
            </View>
          )}

          <Button
            label={busy ? 'Acelerando…' : 'Entrar na Garagem'}
            onPress={handle}
            disabled={busy || !email || !password}
          />
          <Button
            label="Esqueci minha senha"
            variant="ghost"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
          <Button
            label="Criar nova conta de piloto"
            variant="ghost"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  form: {
    gap: 12,
  },
  errorBox: {
    backgroundColor: colors.dangerMuted,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  erro: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});