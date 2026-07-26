import React from 'react';
import { StaticArrayAlgorithms } from './Algorithm/Static/StaticArrayAlgorithms';
import { ArrayQueryAlgorithms } from './Algorithm/Query/ArrayQueryAlgorithms';

type ArrayAlgorithmFormOutlineProps = {
  category: 'static' | 'query';
  values: number[];
};

export function ArrayAlgorithmFormOutline({ category, values }: ArrayAlgorithmFormOutlineProps) {
  if (category === 'static') {
    return <StaticArrayAlgorithms values={values} />;
  }
  return <ArrayQueryAlgorithms values={values} />;
}
