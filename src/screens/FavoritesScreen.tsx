import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFavorites, useFavoriteMutations } from '@/hooks/useFavorites';
import { money } from '@/lib/format';
import { ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { data: favorites, isLoading, isError, error, refetch, isFetching, isOfflineCache } = useFavorites();
  const { removeFavorite } = useFavoriteMutations();

  if (isLoading) {
    return <Loading label="Carregando seus favoritos…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={(error as ApiError)?.message ?? 'Erro ao carregar favoritos'}
        onRetry={() => refetch()}
      />
    );
  }

  const items = favorites ?? [];

  return (
    <View style={styles.container}>
      {isOfflineCache && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineIcon}>✈️</Text>
          <Text style={styles.offlineText}>
            Modo avião / offline ativo: exibindo favoritos salvos em cache local.
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item, index) => item.variantId || item.id || String(index)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>❤️</Text>
            <Text style={styles.emptyTitle}>Sua garagem de favoritos está vazia</Text>
            <Text style={styles.emptySubtitle}>
              Navegue pelo catálogo e clique no coração para salvar suas peças favoritas aqui!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const name = item.productName ?? item.name ?? 'Peça sem identificação';
          const price = item.price ?? 0;
          const imageUrl = item.image;

          return (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                if (item.productId) {
                  navigation.navigate('ProductDetail', { id: item.productId, name });
                }
              }}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Text style={styles.thumbEmptyText}>🏎️</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={2}>
                  {name}
                </Text>
                {item.variantName ? (
                  <View style={styles.variantBadge}>
                    <Text style={styles.variant}>{item.variantName}</Text>
                  </View>
                ) : null}
                <Text style={styles.price}>{money(price)}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.removeBtn, pressed && styles.btnPressed]}
                onPress={() => removeFavorite.mutate(item.variantId)}
                hitSlop={10}
              >
                <Text style={styles.removeText}>🗑️</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningMuted,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offlineIcon: {
    fontSize: 16,
  },
  offlineText: {
    flex: 1,
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  list: {
    padding: 14,
    paddingBottom: 30,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    borderColor: colors.primary,
    transform: [{ scale: 0.99 }],
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmptyText: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  variantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  variant: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryLight,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  removeBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    opacity: 0.7,
  },
  removeText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});