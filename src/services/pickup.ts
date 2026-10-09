import { http } from './http';
import type { Coordenada, RespostaPontos } from '@/types/localizacao';
export async function getPickupPoints(position: Coordenada | null, maxKm?: number) {
  return (await http.get<RespostaPontos>('/pickup-points', { params: {
    latitude: position?.latitude, longitude: position?.longitude,
    maxKm,
  } })).data;
}
// O contrato da referência não expõe a localização da loja em uma rota pública.
// Configure as mesmas coordenadas cadastradas no painel, sem inventar uma origem.
const latitude = process.env.EXPO_PUBLIC_STORE_LATITUDE;
const longitude = process.env.EXPO_PUBLIC_STORE_LONGITUDE;
export const storeCoordinate: Coordenada | null = latitude?.trim() && longitude?.trim()
  && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
  && Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180
  ? { latitude: Number(latitude), longitude: Number(longitude) } : null;
