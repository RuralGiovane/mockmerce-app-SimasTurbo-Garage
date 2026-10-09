import { Text } from 'react-native';
import type { Coordenada, PontoRetirada } from '@/types/localizacao';
import { cp5 } from './cp5Styles';
export function PickupMap(_: { points: PontoRetirada[]; store: Coordenada | null; position: Coordenada | null }) {
  return <Text style={cp5.notice}>O mapa está disponível no aplicativo Android/iOS. Consulte os endereços abaixo.</Text>;
}
