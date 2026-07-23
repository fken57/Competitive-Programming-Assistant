import React, { useId } from 'react';
import './ToggleSwitch.css';

type Props = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({
  label,
  checked,
  onChange,
  disabled = false,
}: Props) {
  const id = useId();

  return (
    <label className={`toggle-switch ${disabled ? 'disabled' : ''}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="toggle-switch-track" aria-hidden="true">
        <span className="toggle-switch-thumb" />
      </span>
      <span className="toggle-switch-label">{label}</span>
    </label>
  );
}
