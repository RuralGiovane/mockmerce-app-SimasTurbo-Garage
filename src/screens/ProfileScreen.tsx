import { Linking, ScrollView, Text, View } from 'react-native';
import { useSession } from '@/session/session';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui';
import { cp5 as s } from '@/components/cp5Styles';
import { flushNotificationNavigation, queueNotificationProduct } from '@/lib/notificationNavigation';
export function ProfileScreen() {
  const { customer } = useSession();
  const notices = useNotifications();
  const descriptions = {
    checking: 'Verificando notificações…',
    undetermined: 'Ative os avisos para receber novidades da garagem. O histórico continua disponível sem permissão.',
    granted: 'Notificações permitidas. Buscamos os avisos da loja ao abrir o app e ao voltar para ele.',
    denied: 'Notificações negadas. Você pode continuar comprando e consultar o histórico aqui. Para reativar, abra os ajustes do aparelho.',
    unavailable: 'Notificações indisponíveis nesta plataforma. Consulte o histórico abaixo.',
  };
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text style={s.title}>{customer?.name}</Text><Text style={s.text}>{customer?.email}</Text>
    <View style={s.card}>
      <Text style={s.title}>Avisos da garagem</Text><Text style={s.text}>{descriptions[notices.status]}</Text>
      <Button label="Ativar notificações" disabled={notices.busy || notices.status === 'granted' || notices.status === 'unavailable'} onPress={() => { void notices.enable(); }} />
      {notices.status === 'denied' && <Button label="Abrir ajustes do aparelho" variant="ghost" onPress={() => { void Linking.openSettings().catch(() => undefined); }} />}
      <Button label={notices.busy ? 'Atualizando…' : 'Atualizar histórico'} disabled={notices.busy} variant="ghost" onPress={() => { void notices.refresh(); }} />
      {!!notices.error && <Text style={s.error}>{notices.error}</Text>}
    </View>
    {!notices.busy && !notices.error && notices.messages.length === 0 && <Text style={s.text}>Nenhum aviso publicado ainda.</Text>}
    {notices.messages.map(message => <View key={message.id} style={s.card}>
      <Text style={s.title}>{message.title}</Text><Text style={s.text}>{message.body}</Text>
      {typeof message.data.produtoId === 'string' && <Button label="Ver peça" onPress={() => { queueNotificationProduct(message.data); flushNotificationNavigation(); }} />}
    </View>)}
  </ScrollView>;
}
