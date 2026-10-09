import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { getPickupPoints } from '@/services/pickup';
import type { Coordenada } from '@/types/localizacao';
type Status = 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable';
export function usePickupPoints(maxKm?: number) {
  const [position, setPosition] = useState<Coordenada | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);
  const locate = useCallback(async () => {
    const current = ++request.current;
    setPosition(null); setStatus('loading');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (current !== request.current) return;
      if (!permission.granted) { setStatus('denied'); return; }
      const result = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('GPS indisponível')), 10000); }),
      ]);
      if (current !== request.current) return;
      setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude }); setStatus('granted');
    } catch { if (current === request.current) setStatus('unavailable'); }
    finally { if (timer) clearTimeout(timer); }
  }, []);
  const query = useQuery({ queryKey: ['pickup-points', position, maxKm ?? null], queryFn: () => getPickupPoints(position, maxKm) });
  return { ...query, position, status, locate };
}
