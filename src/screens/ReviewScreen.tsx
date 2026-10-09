import { useRef, useState } from 'react';
import { Image, Linking, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation';
import { useCanReview, useCreateReview } from '@/hooks/useReviews';
import { uploadPhoto } from '@/services/reviews';
import { Button, ErrorState, Loading, TextField } from '@/components/ui';
import { reviewReason } from '@/components/ReviewsSection';
import { cp5 as s } from '@/components/cp5Styles';

const MAX_PHOTOS = 5;
type UploadedPhoto = { mediaId: string; uri: string };

export function ReviewScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Review'>) {
  const { id } = route.params;
  const permission = useCanReview(id);
  const save = useCreateReview(id);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  // Bloqueio imediato: dois toques podem ocorrer antes do próximo render.
  const operation = useRef(false);
  const busy = uploading || save.isPending;

  async function pick() {
    if (operation.current || photos.length >= MAX_PHOTOS) return;
    operation.current = true;
    setUploading(true); setError('');
    try {
      const access = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!access.granted) {
        setNotice('Galeria negada: você pode avaliar sem foto. Para anexar, permita o acesso nos ajustes.');
        return;
      }
      setNotice('');
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
      const photo = result.canceled ? null : result.assets[0];
      if (!photo) return;
      // Como na referência, o upload acontece antes de publicar a avaliação.
      const mediaId = await uploadPhoto(photo);
      setPhotos(current => [...current, { mediaId, uri: photo.uri }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível anexar a foto. Tente novamente ou envie sem ela.');
    } finally {
      operation.current = false; setUploading(false);
    }
  }

  async function submit() {
    if (operation.current) return;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment.trim()) {
      setError('Escolha de 1 a 5 estrelas e escreva um comentário.'); return;
    }
    operation.current = true; setError('');
    try {
      await save.mutateAsync({ rating, title: title.trim() || null, comment: comment.trim(), mediaIds: photos.map(photo => photo.mediaId) });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível enviar. Tente novamente.');
    } finally { operation.current = false; }
  }

  if (permission.isPending) return <Loading label="Verificando compra…" />;
  if (permission.isError) return <ErrorState message={permission.error.message} onRetry={() => { void permission.refetch(); }} />;
  if (!permission.data?.canReview) return <View style={[s.screen, s.content]}><Text style={s.text}>{reviewReason(permission.data?.reason ?? null)}</Text></View>;
  return <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
    <Text style={s.title}>Como ficou sua máquina?</Text>
    <View style={s.row}>{[1,2,3,4,5].map(value => <Button key={value} label={`${value <= rating ? '★' : '☆'} ${value}`} disabled={busy} onPress={() => setRating(value)} />)}</View>
    <TextField accessibilityLabel="Título da avaliação (opcional)" placeholder="Resuma sua experiência (opcional)" value={title} onChangeText={setTitle} maxLength={120} editable={!busy} />
    <TextField accessibilityLabel="Comentário da avaliação" placeholder="Conte sua experiência com a peça" multiline value={comment} onChangeText={setComment} maxLength={2000} editable={!busy} />
    <Text style={s.text}>Fotos ({photos.length}/{MAX_PHOTOS})</Text>
    <Button label="Anexar foto da galeria" onPress={() => { void pick(); }} disabled={busy || photos.length >= MAX_PHOTOS} variant="ghost" />
    {uploading && <Loading label="Preparando e enviando foto…" />}
    {!!notice && <><Text style={s.notice}>{notice}</Text><Button label="Abrir ajustes" variant="ghost" onPress={() => { void Linking.openSettings().catch(() => setError('Abra os ajustes do aparelho para alterar a permissão.')); }} /></>}
    <View style={s.row}>{photos.map((photo, index) => <View key={photo.mediaId}>
      <Image source={{ uri: photo.uri }} style={s.photo} accessibilityLabel={`Foto ${index + 1} da avaliação`} />
      <Button label={`Remover foto ${index + 1}`} disabled={busy} variant="ghost" onPress={() => setPhotos(current => current.filter(item => item.mediaId !== photo.mediaId))} />
    </View>)}</View>
    {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Button label={save.isPending ? 'Enviando avaliação…' : 'Publicar avaliação'} disabled={busy} onPress={() => { void submit(); }} />
  </ScrollView>;
}
