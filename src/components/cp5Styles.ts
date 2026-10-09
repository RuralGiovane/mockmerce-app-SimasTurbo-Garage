import { StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
export const cp5 = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 14, paddingBottom: 36 },
  card: { padding: 16, gap: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  text: { color: colors.textSilver, fontSize: 14, lineHeight: 21 },
  notice: { color: colors.warning, fontSize: 14, lineHeight: 21 },
  error: { color: colors.danger, fontSize: 14 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  photo: { width: 100, height: 100, borderRadius: 10 },
});
