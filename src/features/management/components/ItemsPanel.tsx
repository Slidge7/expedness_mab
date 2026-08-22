import React from 'react';
import { ItemListScreen } from '../../items/screens/ItemListScreen';

interface Props {
  isActive: boolean;
}

export const ItemsPanel: React.FC<Props> = ({ isActive }) => {
  return <ItemListScreen isActive={isActive} showMarqueCategoryFilters />;
};
