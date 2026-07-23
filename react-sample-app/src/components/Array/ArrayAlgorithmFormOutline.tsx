import React from 'react';
import { StaticArrayAlgorithms } from './Algorithm/Static/StaticArrayAlgorithms';

type ArrayAlgorithmFormOutlineProps = {
  category: 'static';
  values: number[];
};

export function ArrayAlgorithmFormOutline({ category, values }: ArrayAlgorithmFormOutlineProps) {
  if (category !== 'static') return null;
  return <StaticArrayAlgorithms values={values} />;
}
