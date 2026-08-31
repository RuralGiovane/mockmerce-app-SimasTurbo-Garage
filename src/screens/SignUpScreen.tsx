import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

const logoSource = require('../../assets/IMG_3357.png');

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
        <View style={styles.header}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>NOVO PILOTO</Text>
          <Text style={styles.subtitle}>Cadastre-se na Simas Turbo Garage</Text>
        </View>

        <View style={styles.form}>
          <TextField
            placeholder="Nome completo do piloto"
            autoCapitalize="words"
            value={name}
            onChangeText={setName}
          />
          <TextField
            placeholder="Seu melhor e-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            placeholder="Senha de acesso (mín. 6 caracteres)"
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
            label={busy ? 'Registrando…' : 'Criar Conta de Piloto'}
            onPress={handle}
            disabled={busy || !name || !email || password.length < 6}
          />
          <Button
            label="Já possuo uma conta"
            variant="ghost"
            onPress={() => navigation.navigate('SignIn')}
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
    width: 90,
    height: 90,
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