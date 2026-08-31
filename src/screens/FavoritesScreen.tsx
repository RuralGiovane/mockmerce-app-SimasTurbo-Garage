import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFavorites, useFavoriteMutations } from '@/hooks/useFavorites';
import { money } from '@/lib/format';
import { ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';

type Props = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export function FavoritesScreen({ navigation }: Props) {
  const { data: favorites, isLoading, isError, error, refetch, isFetching, isOfflineCache } = useFavorites();
  const { removeFavorite } = useFavoriteMutations();

  if (isLoading) {
    return <Loading label="Carregando favoritos…" />;
  }

  if (isError) {
    return <ErrorState message={(error as ApiError)?.message ?? 'Erro ao carregar favoritos'} onRetry={() => refetch()} />;
  }

  const items = favorites ?? [];

  return (
    <View style={styles.container}>
      {isOfflineCache && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            Modo avião / offline: exibindo favoritos salvos em cache (podem estar desatualizados).
          </Text>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item, index) => item.variantId || item.id || String(index)}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={() => refetch()} />}
        ListEmptyComponent={<Text style={styles.empty}>Você ainda não adicionou produtos aos favoritos.</Text>}
        renderItem={({ item }) => {
          const name = item.productName ?? item.name ?? 'Produto sem nome';
          const price = item.price ?? 0;
          const imageUrl = item.image;

          return (
            <Pressable
              style={styles.card}
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
                  <Text style={styles.thumbEmptyText}>📷</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                <Text style={styles.name} numberOfLines={2}>
                  {name}
                </Text>
                {item.variantName && <Text style={styles.variant}>{item.variantName}</Text>}
                <Text style={styles.price}>{money(price)}</Text>
              </View>

              <Pressable
                style={styles.removeBtn}
                onPress={() => removeFavorite.mutate(item.variantId)}
                hitSlop={8}
              >
                <Text style={styles.removeText}>✕</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offlineText: { color: '#92400e', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  list: { padding: 12, paddingBottom: 24, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  thumb: { width: 72, height: 72, borderRadius: 8, backgroundColor: '#e5e7eb' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  thumbEmptyText: { fontSize: 24 },
  cardBody: { flex: 1, justifyContent: 'center', gap: 2 },
  name: { fontSize: 15, fontWeight: '600', color: '#111827' },
  variant: { fontSize: 12, color: '#6b7280' },
  price: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 2 },
  removeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#ef4444', fontSize: 14, fontWeight: '800' },
  empty: { textAlign: 'center', color: '#6b7280', marginTop: 40, fontSize: 15 },
});