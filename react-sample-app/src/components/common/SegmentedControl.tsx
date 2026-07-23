import React, { useId } from 'react';
import './SegmentedControl.css';

export type SegmentedControlOption<Value extends string> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

type Props<Value extends string> = {
  legend: string;
  value: Value;
  options: Array<SegmentedControlOption<Value>>;
  onChange: (value: Value) => void;
  name?: string;
  className?: string;
};

export function SegmentedControl<Value extends string>({
  legend,
  value,
  options,
  onChange,
  name,
  className = '',
}: Props<Value>) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <fieldset className={`segmented-control ${className}`.trim()}>
      <legend>{legend}</legend>
      {options.map((option) => (
        <label className={option.disabled ? 'disabled' : ''} key={option.value}>
          <input
            type="radio"
            name={groupName}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
