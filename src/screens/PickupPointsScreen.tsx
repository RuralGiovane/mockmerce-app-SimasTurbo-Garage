import { Linking, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { usePickupPoints } from '@/hooks/usePickupPoints';
import { storeCoordinate } from '@/services/pickup';
import { PickupMap } from '@/components/PickupMap';
import { Button, Loading } from '@/components/ui';
import { cp5 as s } from '@/components/cp5Styles';
export function PickupPointsScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'PickupPoints'>) {
  const query = usePickupPoints();
  const points = query.data?.data.filter(point => point.active) ?? [];
  const messages = {
    idle: 'Use sua localização para ordenar os pontos por distância. Sem ela, mostramos a ordem de cadastro.',
    loading: 'Obtendo localização. A lista continua disponível sem ordenar enquanto aguardamos.',
    granted: 'Pontos ordenados pela distância da sua localização.',
    denied: 'Localização negada. A lista continua disponível, sem ordenar por proximidade. Você pode permitir nos ajustes e tentar novamente.',
    unavailable: 'A permissão foi concedida, mas não conseguimos obter a posição. A lista continua sem ordenar por distância.',
  };
  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <Text style={s.title}>Retire suas peças perto de você</Text>
    <Text style={s.notice}>{messages[query.status]}</Text>
    <Button label={query.status === 'loading' ? 'Obtendo localização…' : 'Usar localização / tentar novamente'} disabled={query.status === 'loading'} onPress={() => { void query.locate(); }} />
    {query.status === 'denied' && <Button label="Abrir ajustes" variant="ghost" onPress={() => { void Linking.openSettings().catch(() => undefined); }} />}
    {query.isPending ? <Loading label="Buscando pontos…" /> : query.isError ? <View style={s.card}>
      <Text style={s.error}>{query.error.message}</Text><Button label="Tentar buscar novamente" onPress={() => { void query.refetch(); }} />
    </View> : <>
      <PickupMap points={points} store={storeCoordinate} position={query.position} />
      {!storeCoordinate && <Text style={s.notice}>A localização da loja ainda não foi configurada para o mapa.</Text>}
      {points.length === 0 && <Text style={s.text}>Nenhum ponto de retirada cadastrado.</Text>}
      {points.map(point => <View style={s.card} key={point.id}>
        <Text style={s.title}>{point.name}</Text>
        <Text style={s.text}>{Object.values(point.address).filter(Boolean).join(' · ')}</Text>
        {!!point.hours && <Text style={s.text}>{point.hours}</Text>}
        {query.position && point.distanceKm != null && <Text style={s.notice}>{point.distanceKm.toFixed(1)} km de você</Text>}
        {route.params?.select && <Button label="Retirar neste ponto" onPress={() => navigation.popTo('Checkout', { pickupPointId: point.id, pickupPointName: point.name })} />}
      </View>)}
    </>}
  </ScrollView>;
}
