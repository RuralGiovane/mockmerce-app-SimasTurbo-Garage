import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '@/session/session';
import { forgotPassword, resetPassword } from '@/services/auth';
import { Button, TextField } from '@/components/ui';
import type { AuthStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

const logoSource = require('../../assets/IMG_3357.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { signIn } = useSession();
  const [fase, setFase] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function pedirCodigo() {
    setBusy(true);
    setErro(null);
    try {
      await forgotPassword(email.trim());
      setAviso('Código de recuperação enviado! Confira seu e-mail e insira abaixo.');
      setFase('code');
    } catch (e) {
      setErro((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  }

  async function redefinir() {
    setBusy(true);
    setErro(null);
    try {
      await resetPassword(email.trim(), code.trim(), novaSenha);
      await signIn(email.trim(), novaSenha);
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
          <Text style={styles.title}>RECUPERAR ACESSO</Text>
          <Text style={styles.subtitle}>Redefinição de Senha</Text>
        </View>

        <View style={styles.form}>
          {fase === 'email' ? (
            <>
              <Text style={styles.infoText}>
                Informe o e-mail da sua conta para receber um código de 6 dígitos de redefinição.
              </Text>
              <TextField
                placeholder="Seu e-mail cadastrado"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              {erro && (
                <View style={styles.errorBox}>
                  <Text style={styles.erro}>{erro}</Text>
                </View>
              )}
              <Button
                label={busy ? 'Enviando…' : 'Solicitar Código de Resgate'}
                onPress={pedirCodigo}
                disabled={busy || !email}
              />
            </>
          ) : (
            <>
              {aviso && (
                <View style={styles.successBox}>
                  <Text style={styles.aviso}>{aviso}</Text>
                </View>
              )}
              <TextField
                placeholder="Código de 6 dígitos"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
              />
              <TextField
                placeholder="Nova senha secreta (mín. 6 dígitos)"
                secureTextEntry
                value={novaSenha}
                onChangeText={setNovaSenha}
              />
              {erro && (
                <View style={styles.errorBox}>
                  <Text style={styles.erro}>{erro}</Text>
                </View>
              )}
              <Button
                label={busy ? 'Redefinindo…' : 'Redefinir Senha & Acessar'}
                onPress={redefinir}
                disabled={busy || !code || novaSenha.length < 6}
              />
              <Button
                label="Reenviar novo código"
                variant="ghost"
                onPress={pedirCodigo}
                disabled={busy}
              />
            </>
          )}

          <Button
            label="Voltar para o Login"
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
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  successBox: {
    backgroundColor: colors.successMuted,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.success,
  },
  aviso: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
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