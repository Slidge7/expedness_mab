import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const QUICK_STATS = [
  { labelKey: 'home.stats.income', value: '12,450.00', icon: 'arrow-up-circle', color: '#10B981' },
  { labelKey: 'home.stats.expense', value: '8,320.00', icon: 'arrow-down-circle', color: '#EF4444' },
  { labelKey: 'home.stats.items', value: '248', icon: 'cube', color: '#3B82F6' },
  { labelKey: 'home.stats.clients', value: '36', icon: 'people', color: '#8B5CF6' },
];

const RECENT_ACTIVITY = [
  { titleKey: 'home.activity.sale', detailKey: 'home.activity.sale_detail', timeKey: 'home.activity.time_1' },
  { titleKey: 'home.activity.purchase', detailKey: 'home.activity.purchase_detail', timeKey: 'home.activity.time_2' },
  { titleKey: 'home.activity.stock', detailKey: 'home.activity.stock_detail', timeKey: 'home.activity.time_3' },
];

export const HomeScreen = () => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const user = useAppSelector(state => state.auth.user);
  const username = user?.username ?? t('auth.guest_user');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.demoBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#92400E" />
        <Text style={styles.demoBannerText}>{t('home.demo_banner')}</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.greeting}>{t('home.welcome', { name: username })}</Text>
        <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
      </View>

      <View style={styles.statsGrid}>
        {QUICK_STATS.map(stat => (
          <View key={stat.labelKey} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}18` }]}>
              <Ionicons name={stat.icon} size={22} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.quick_actions')}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateTransaction')}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>{t('home.new_transaction')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('CreateItem')}
          >
            <Ionicons name="cube-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>{t('home.new_item')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.recent_activity')}</Text>
        {RECENT_ACTIVITY.map(item => (
          <View key={item.titleKey} style={styles.activityRow}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{t(item.titleKey)}</Text>
              <Text style={styles.activityDetail}>{t(item.detailKey)}</Text>
            </View>
            <Text style={styles.activityTime}>{t(item.timeKey)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  demoBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  hero: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  activityTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
});
