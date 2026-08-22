import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';
import { OptionalEntityPicker } from './OptionalEntityPicker';

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
}

export const OptionalProviderPicker: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const providers = useAppSelector(state => state.providers.items);

  return (
    <OptionalEntityPicker
      title={t('transactions.provider_title')}
      value={value}
      onChange={onChange}
      items={providers
        .filter(p => p.id != null)
        .map(p => ({ id: p.id!, label: p.name }))}
    />
  );
};
