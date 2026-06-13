import React from 'react';
import { useAppSelector } from '../../../store/hooks';
import { OptionalEntityPicker } from './OptionalEntityPicker';

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
}

export const OptionalProviderPicker: React.FC<Props> = ({ value, onChange }) => {
  const providers = useAppSelector(state => state.providers.items);

  return (
    <OptionalEntityPicker
      title="Provider"
      value={value}
      onChange={onChange}
      items={providers
        .filter(p => p.id != null)
        .map(p => ({ id: p.id!, label: p.name }))}
    />
  );
};
