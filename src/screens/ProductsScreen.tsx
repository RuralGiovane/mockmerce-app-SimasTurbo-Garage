import { useRef, useState } from 'react';
import { Animated, FlatList, Image, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { money } from '@/lib/format';
import { Button, ErrorState, Loading } from '@/components/ui';
import type { RootStackParamList } from '@/navigation';
import type { ApiError } from '@/types/api';
import { useProducts } from '@/hooks/useProducts';
import { useSession } from '@/session/session';
import { colors } from '@/theme/colors';

const logoSource = require('../../assets/IMG_3357.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

export function ProductsScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const { data, isLoading, isError, error, refetch, isFetching } = useProducts({ search });
  const { customer, signOut } = useSession();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-340)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  function openMenu() {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function closeMenu(callback?: () => void) {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -340,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuOpen(false);
      if (callback) callback();
    });
  }

  function navigateTo(screen: 'Products' | 'Cart' | 'Favorites' | 'Checkout' | 'Orders'): void;
  function navigateTo( screen: 'ProductDetail', params: { id: string; name: string }): void;
  function navigateTo( screen: 'Order', params: { id: string }): void;
  function navigateTo( screen: keyof RootStackParamList, params?: { id: string; name?: string }) {
    closeMenu(() => {
      if (screen === 'ProductDetail' && params && params.name) {
        navigation.navigate('ProductDetail', { id: params.id, name: params.name });
      } else if (screen === 'Order' && params) {
        navigation.navigate('Order', { id: params.id });
      } else if (screen !== 'ProductDetail' && screen !== 'Order') {
        navigation.navigate(screen);
      }
    });
  }

  return (
    <View style={styles.container}>
      {/* Barra Superior com Botão Hambúrguer e Busca */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.menuBtn, pressed && styles.btnPressed]}
          onPress={openMenu}
          hitSlop={10}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </Pressable>

        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.search}
            placeholder="Buscar peças, turbos, kits…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={styles.clearSearch}>
              <Text style={styles.clearSearchText}>✕</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.cartShortcut, pressed && styles.btnPressed]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartShortcutIcon}>🛒</Text>
        </Pressable>
      </View>

      {/* Menu Hambúrguer Lateral (Drawer Modal com Slide-in) */}
      <Modal
        visible={menuOpen}
        transparent
        animationType="none"
        onRequestClose={() => closeMenu()}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => closeMenu()} />
          </Animated.View>

          <Animated.View
            style={[
              styles.drawerContainer,
              {
                paddingTop: Math.max(insets.top, 16) + 10,
                paddingBottom: Math.max(insets.bottom, 16) + 12,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            {/* Topo do Menu com Logo e Fechar */}
            <View style={styles.drawerHeader}>
              <View style={styles.brandRow}>
                <Image source={logoSource} style={styles.drawerLogo} />
                <View>
                  <Text style={styles.drawerTitle}>SIMAS TURBO</Text>
                  <Text style={styles.drawerSubtitle}>GARAGE PERFORMANCE</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.closeBtn, pressed && styles.btnPressed]}
                onPress={() => closeMenu()}
                hitSlop={10}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </Pressable>
            </View>

            {/* Perfil do Comprador */}
            <View style={styles.profileBox}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {customer?.name ? customer.name.slice(0, 1).toUpperCase() : '🏎️'}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileGreeting}>Piloto / Comprador</Text>
                <Text style={styles.profileName} numberOfLines={1}>
                  {customer?.name ?? 'Cliente Garage'}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {customer?.email ?? ''}
                </Text>
              </View>
            </View>

            {/* Itens de Navegação */}
            <View style={styles.menuList}>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => closeMenu()}
              >
                <Text style={styles.menuItemIcon}>🏁</Text>
                <Text style={[styles.menuItemText, styles.menuItemActiveText]}>Catálogo de Peças</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => navigateTo('Favorites')}
              >
                <Text style={styles.menuItemIcon}>❤️</Text>
                <Text style={styles.menuItemText}>Meus Favoritos</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => navigateTo('Cart')}
              >
                <Text style={styles.menuItemIcon}>🛒</Text>
                <Text style={styles.menuItemText}>Meu Carrinho</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => navigateTo('Orders')}
              >
                <Text style={styles.menuItemIcon}>📦</Text>
                <Text style={styles.menuItemText}>Histórico de Pedidos</Text>
              </Pressable>
            </View>

            {/* Rodapé do Menu - Logout */}
            <View style={styles.drawerFooter}>
              <Button
                label="Sair da Conta (Logout)"
                variant="ghost"
                onPress={() => {
                  closeMenu(() => signOut());
                }}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Conteúdo Principal - Listagem de Peças */}
      {isLoading ? (
        <Loading label="Carregando peças de alta performance…" />
      ) : isError ? (
        <ErrorState
          message={(error as ApiError)?.message ?? 'Falha ao buscar catálogo'}
          onRetry={() => refetch()}
        />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(p) => p.id}
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
              <Text style={styles.emptyIcon}>🔧</Text>
              <Text style={styles.emptyTitle}>Nenhuma peça encontrada</Text>
              <Text style={styles.emptySubtitle}>
                Tente buscar por outro termo ou limpe os filtros de pesquisa.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => navigation.navigate('ProductDetail', { id: item.id, name: item.name })}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbEmpty]}>
                  <Text style={styles.thumbEmptyIcon}>🏎️</Text>
                </View>
              )}

              <View style={styles.cardBody}>
                {item.brand ? (
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandText}>{item.brand.toUpperCase()}</Text>
                  </View>
                ) : null}

                <Text style={styles.name} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Valor</Text>
                    <Text style={styles.price}>
                      {item.priceFrom === item.priceTo
                        ? money(item.priceFrom)
                        : `${money(item.priceFrom)} – ${money(item.priceTo)}`}
                    </Text>
                  </View>

                  <View style={styles.detailsTag}>
                    <Text style={styles.detailsTagText}>Ver Peça →</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
    color: colors.primaryLight,
    fontWeight: '900',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  search: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearSearch: {
    padding: 4,
  },
  clearSearchText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  cartShortcut: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartShortcutIcon: {
    fontSize: 18,
  },
  btnPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '82%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  drawerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 1,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeIcon: {
    fontSize: 16,
    color: colors.textSilver,
    fontWeight: '800',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 16,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
    textTransform: 'uppercase',
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },
  menuList: {
    flex: 1,
    gap: 6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  menuItemPressed: {
    backgroundColor: colors.background,
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSilver,
  },
  menuItemActiveText: {
    color: colors.primaryLight,
  },
  drawerFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  list: {
    padding: 14,
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
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
    width: 90,
    height: 90,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmptyIcon: {
    fontSize: 32,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  brandBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  brandText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primaryLight,
    letterSpacing: 0.5,
  },
  detailsTag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  detailsTagText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
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
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});