import { useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError, ProductVariant } from '@/types/api';
import { useProduct } from '@/hooks/useProduct';
import { useFavoriteMutations } from '@/hooks/useFavorites';
import { useCartMutations } from '@/hooks/useCartMutations';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const { data: product, isLoading, isError, error, refetch } = useProduct(id);
  const [variantId, setVariantId] = useState<string | null>(null); 
  const { isFavorited, toggleFavorite, isPending: isFavPending } = useFavoriteMutations();
  const { addItem } = useCartMutations();

  const selected: ProductVariant | undefined = useMemo(() => {
    if (!product) return undefined;
    return (
      product.variants.find((v) => v.id === variantId) ??
      product.variants.find((v) => v.isDefault) ??
      product.variants[0]
    );
  }, [product, variantId]);

  if (isLoading) { return <Loading label="Carregando produto…" />; }
  if (isError || !product) { return <ErrorState message={(error as ApiError)?.message ?? 'Falha'} onRetry={() => refetch()} />; }

  const outOfStock = !selected || selected.stock <= 0;
  const favorited = selected ? isFavorited(selected.id) : false;

  function handleAddToCart() {
    if (!selected || !product) return;
    addItem.mutate(
      {
        variantId: selected.id,
        quantity: 1,
        name: product.name + (selected.label ? ` (${selected.label})` : ''),
        unitPrice: selected.price,
      },
      {
        onSuccess: () => {
          Alert.alert('Adicionado!', 'Produto adicionado ao carrinho.', [
            { text: 'Continuar comprando' },
            { text: 'Ir para o carrinho', onPress: () => navigation.navigate('Cart') },
          ]);
        },
        onError: (err) => {
          Alert.alert('Atenção', (err as ApiError)?.message ?? 'Não foi possível adicionar o item ao carrinho.');
        },
      },
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.images[0] && <Image source={{ uri: product.images[0].url }} style={styles.hero} />}
      <Text style={styles.name}>{product.name}</Text>
      {selected && <Text style={styles.price}>{money(selected.price)}</Text>}
      {product.description && <Text style={styles.desc}>{product.description}</Text>}

      {product.type === 'VARIABLE' && (
        <View style={styles.variants}>
          <Text style={styles.label}>Opções</Text>
          <View style={styles.variantRow}>
            {product.variants.map((v) => {
              const active = v.id === selected?.id;
              return (
                <Text
                  key={v.id}
                  onPress={() => setVariantId(v.id)}
                  style={[styles.chip, active && styles.chipActive, v.stock <= 0 && styles.chipDisabled]}
                >
                  {v.label ?? v.sku}
                </Text>
              );
            })}
          </View>
        </View>
      )}

      <Text style={styles.stock}>{outOfStock ? 'Sem estoque' : `${selected?.stock} em estoque`}</Text>

      <View style={styles.actions}>
        <Button
          label={favorited ? '♥ Favoritado' : '♡ Adicionar aos Favoritos'}
          variant="ghost"
          disabled={!selected || isFavPending}
          onPress={() => selected && toggleFavorite(selected.id)}
        />

        <Button
          label={addItem.isPending ? 'Adicionando…' : 'Adicionar ao carrinho'}
          onPress={handleAddToCart}
          disabled={outOfStock || addItem.isPending || !selected}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  hero: { width: '100%', height: 260, borderRadius: 14, backgroundColor: '#e5e7eb' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  price: { fontSize: 20, fontWeight: '800', color: '#111827' },
  desc: { fontSize: 14, color: '#374151', lineHeight: 20 },
  variants: { gap: 6, marginTop: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
    color: '#111827',
  },
  chipActive: { borderColor: '#111827', backgroundColor: '#111827', color: '#fff' },
  chipDisabled: { opacity: 0.4 },
  stock: { fontSize: 13, color: '#6b7280' },
  actions: { gap: 10, marginTop: 8 },
});