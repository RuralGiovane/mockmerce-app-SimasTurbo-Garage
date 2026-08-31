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
import { colors } from '@/theme/colors';

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

  if (isLoading) { return <Loading label="Carregando especificações da peça…" />; }
  if (isError || !product) { return <ErrorState message={(error as ApiError)?.message ?? 'Falha ao buscar produto'} onRetry={() => refetch()} />; }

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
          Alert.alert('Peça Adicionada!', 'O item foi enviado para o seu carrinho.', [
            { text: 'Continuar no Catálogo' },
            { text: 'Ver Carrinho', onPress: () => navigation.navigate('Cart') },
          ]);
        },
        onError: (err) => {
          Alert.alert('Atenção', (err as ApiError)?.message ?? 'Não foi possível adicionar o item ao carrinho.');
        },
      },
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Imagem Principal da Peça */}
      <View style={styles.imageContainer}>
        {product.images[0] ? (
          <Image source={{ uri: product.images[0].url }} style={styles.hero} resizeMode="contain" />
        ) : (
          <View style={[styles.hero, styles.heroEmpty]}>
            <Text style={styles.heroEmptyIcon}>🏎️</Text>
          </View>
        )}
      </View>

      {/* Caixa de Informações Principais */}
      <View style={styles.infoCard}>
        {product.brand ? (
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>{product.brand.name.toUpperCase()}</Text>
          </View>
        ) : null}

        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Preço Unitário</Text>
            {selected && <Text style={styles.price}>{money(selected.price)}</Text>}
          </View>

          <View style={[styles.stockBadge, outOfStock ? styles.stockOut : styles.stockIn]}>
            <Text style={[styles.stockText, outOfStock ? styles.stockOutText : styles.stockInText]}>
              {outOfStock ? 'ESGOTADO' : `${selected?.stock} EM ESTOQUE`}
            </Text>
          </View>
        </View>
      </View>

      {/* Descrição e Especificações */}
      {product.description ? (
        <View style={styles.descCard}>
          <Text style={styles.sectionTitle}>DESCRIÇÃO TÉCNICA</Text>
          <Text style={styles.desc}>{product.description}</Text>
        </View>
      ) : null}

      {/* Seletor de Opções e Variantes */}
      {product.type === 'VARIABLE' && (
        <View style={styles.variantsCard}>
          <Text style={styles.sectionTitle}>CONFIGURAÇÃO / VARIAÇÃO</Text>
          <View style={styles.variantRow}>
            {product.variants.map((v) => {
              const active = v.id === selected?.id;
              const empty = v.stock <= 0;
              return (
                <Text
                  key={v.id}
                  onPress={() => setVariantId(v.id)}
                  style={[
                    styles.chip,
                    active && styles.chipActive,
                    empty && styles.chipDisabled,
                  ]}
                >
                  {v.label ?? v.sku} {empty ? '(Esgotado)' : ''}
                </Text>
              );
            })}
          </View>
        </View>
      )}

      {/* Ações de Compra e Favoritar */}
      <View style={styles.actions}>
        <Button
          label={favorited ? '❤️ Peça Favoritada' : '🤍 Adicionar aos Favoritos'}
          variant="ghost"
          disabled={!selected || isFavPending}
          onPress={() => selected && toggleFavorite(selected.id)}
        />

        <Button
          label={addItem.isPending ? 'Adicionando…' : 'Adicionar ao Carrinho'}
          onPress={handleAddToCart}
          disabled={outOfStock || addItem.isPending || !selected}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 16,
    gap: 14,
    paddingBottom: 36,
  },
  imageContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  heroEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmptyIcon: {
    fontSize: 64,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 26,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stockIn: {
    backgroundColor: colors.successMuted,
    borderColor: colors.success,
  },
  stockInText: {
    color: colors.success,
  },
  stockOut: {
    backgroundColor: colors.dangerMuted,
    borderColor: colors.danger,
  },
  stockOutText: {
    color: colors.danger,
  },
  descCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSilver,
    letterSpacing: 0.8,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  variantsCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
    color: colors.textSilver,
    fontSize: 13,
    fontWeight: '700',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
    color: colors.textPrimary,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});