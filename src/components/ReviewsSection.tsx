import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Image, Text, View } from 'react-native';
import { useCanReview, useReviews } from '@/hooks/useReviews';
import { Button, Loading } from './ui';
import { cp5 as s } from './cp5Styles';
import { ResumoAvaliacoes } from './ResumoAvaliacoes';
import { Estrelas } from './Estrelas';
export function reviewReason(reason: string | null) {
  if (reason === 'ALREADY_REVIEWED') return 'Você já avaliou esta peça. Obrigado por compartilhar sua experiência!';
  if (reason === 'NOT_PURCHASED') return 'A avaliação fica disponível depois de comprar e pagar esta peça.';
  return 'A avaliação não está disponível para esta conta agora.';
}
export function ReviewsSection({ id, onReview }: { id: string; onReview: () => void }) {
  const reviews = useReviews(id);
  const permission = useCanReview(id);
  const { refetch: refreshReviews } = reviews;
  const { refetch: refreshPermission } = permission;
  useFocusEffect(useCallback(() => { void refreshReviews(); void refreshPermission(); }, [refreshReviews, refreshPermission]));
  const items = reviews.data?.pages.flatMap(page => page.data) ?? [];
  return <View style={s.card}>
    <Text style={s.title}>Opinião de quem equipou a garagem</Text>
    {reviews.data && <ResumoAvaliacoes resumo={reviews.data.pages[0].summary} />}
    {permission.isPending ? <Text style={s.text}>Verificando se você pode avaliar…</Text> : permission.isError ?
      <><Text style={s.error}>{permission.error.message}</Text><Button label="Verificar novamente" onPress={() => { void permission.refetch(); }} /></> :
      permission.data?.canReview ? <Button label="Avaliar esta peça" onPress={onReview} /> : <Text style={s.text}>{reviewReason(permission.data?.reason ?? null)}</Text>}
    {reviews.isPending ? <Loading label="Carregando avaliações…" /> : reviews.isError ?
      <><Text style={s.error}>{reviews.error.message}</Text><Button label="Recarregar avaliações" onPress={() => { void reviews.refetch(); }} /></> :
      items.length === 0 ? <Text style={s.text}>Nenhuma avaliação publicada ainda.</Text> : items.map(review =>
        <View key={review.id} style={s.card}>
          <Estrelas nota={review.rating} />
          <Text style={s.text}>{review.author.name}{review.verifiedPurchase ? ' · Compra verificada' : ''}</Text>
          <Text style={s.text}>{new Date(review.createdAt).toLocaleDateString('pt-BR')}</Text>
          {review.isMine && <Text style={s.notice}>Sua avaliação</Text>}
          {!!review.title && <Text style={s.title}>{review.title}</Text>}
          <Text style={s.text}>{review.comment}</Text>
          <View style={s.row}>{review.images.map(photo => <Image key={photo.id} source={{ uri: photo.url }} style={s.photo} accessibilityLabel="Foto da avaliação" />)}</View>
        </View>)}
    {reviews.hasNextPage && <Button label={reviews.isFetchingNextPage ? 'Carregando…' : 'Mais avaliações'} disabled={reviews.isFetchingNextPage} onPress={() => { void reviews.fetchNextPage(); }} />}
  </View>;
}
