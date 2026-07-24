import React from 'react';
import { NavLink } from 'react-router-dom';
import './SegmentedControl.css';

type NavigationOption = {
  to: string;
  label: string;
  end?: boolean;
};

type Props = {
  label: string;
  options: NavigationOption[];
  className?: string;
};

export function SegmentedNavigation({
  label,
  options,
  className = '',
}: Props) {
  return (
    <nav
      className={`segmented-navigation ${className}`.trim()}
      aria-label={label}
    >
      {options.map((option) => (
        <NavLink
          key={option.to}
          to={option.to}
          end={option.end}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          {option.label}
        </NavLink>
      ))}
    </nav>
  );
}
