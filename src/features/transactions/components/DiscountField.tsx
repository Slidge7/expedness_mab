import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { DiscountType } from '../api/transactionService';
import { useTheme } from '../../../theme/ThemeContext';
import type { AppTheme } from '../../../theme';

interface Props {
  discountType?: DiscountType | null;
  discountValue: string;
  onChange: (type: DiscountType | null, value: string) => void;
}

export const DiscountField: React.FC<Props> = ({
  discountType,
  discountValue,
  onChange,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const active = discountType != null;

  if (!active) {
    return (
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onChange('PERCENT', '')}
      >
        <Text style={styles.addBtnText}>{t('transaction.discount_add')}</Text>
      </TouchableOpacity>
    );
  }

  const type = discountType ?? 'PERCENT';

  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={discountValue}
        onChangeText={v => onChange(type, v)}
        placeholder={
          type === 'PERCENT'
            ? t('transaction.discount_percent_placeholder')
            : t('transaction.discount_fixed_placeholder')
        }
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="decimal-pad"
      />

      <TouchableOpacity
        style={styles.typeToggle}
        onPress={() =>
          onChange(type === 'PERCENT' ? 'FIXED' : 'PERCENT', discountValue)
        }
      >
        <Text style={styles.typeToggleText}>
          {type === 'PERCENT' ? '%' : '$'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onChange(null, '')}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  addBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.radius.m,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.inputBg,
    borderRadius: theme.radius.m,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  typeToggle: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  typeToggleText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.m,
    backgroundColor: theme.colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.danger,
  },
});
