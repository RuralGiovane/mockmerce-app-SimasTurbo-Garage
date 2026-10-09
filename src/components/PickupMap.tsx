import Constants from 'expo-constants';
import { Platform, Text } from 'react-native';
import { cp5 } from './cp5Styles';
import MapView, { Marker } from 'react-native-maps';
import type { Coordenada, PontoRetirada } from '@/types/localizacao';
import { colors } from '@/theme/colors';
export function PickupMap({ points, store, position }: { points: PontoRetirada[]; store: Coordenada | null; position: Coordenada | null }) {
  // Expo Go já contém a configuração nativa do mapa. Builds próprios precisam
  // da chave do Maps aplicada por prebuild; sem ela o Android pode encerrar o app.
  if (Platform.OS === 'android' && Constants.executionEnvironment !== 'storeClient'
      && !Constants.expoConfig?.android?.config?.googleMaps?.apiKey) {
    return <Text style={cp5.notice}>Mapa indisponível neste build. Configure o Google Maps ou use Expo Go. A lista de endereços continua disponível.</Text>;
  }
  const coordinates = [...points.map(point => point.coordinate), ...(store ? [store] : []), ...(position ? [position] : [])];
  if (!coordinates.length) return null;
  const latitudes = coordinates.map(point => point.latitude);
  const longitudes = coordinates.map(point => point.longitude);
  const region = {
    latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
    longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    latitudeDelta: Math.max(0.03, (Math.max(...latitudes) - Math.min(...latitudes)) * 1.4),
    longitudeDelta: Math.max(0.03, (Math.max(...longitudes) - Math.min(...longitudes)) * 1.4),
  };
  return <MapView style={{ height: 260, width: '100%' }} region={region} showsUserLocation={!!position}>
    {points.map(point => <Marker key={point.id} coordinate={point.coordinate} title={point.name} pinColor={colors.primary} />)}
    {store && <Marker coordinate={store} title="Simas Turbo Garage · Loja" pinColor={colors.warning} />}
  </MapView>;
}
