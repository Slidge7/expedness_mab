import React from 'react';

const Ionicons = ({ name, size, color, style }: any) => (
  <ion-icon name={name} style={{ fontSize: size, color, ...style }} />
);

export default Ionicons;
