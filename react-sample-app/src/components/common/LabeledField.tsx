import React, { cloneElement, useId } from 'react';
import './LabeledField.css';

type Props = {
  label: string;
  children: React.ReactElement<{
    id?: string;
    'aria-describedby'?: string;
  }>;
  hint?: string;
  className?: string;
};

export function LabeledField({
  label,
  children,
  hint,
  className = '',
}: Props) {
  const generatedId = useId();
  const controlId = children.props.id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const control = cloneElement(children, {
    id: controlId,
    'aria-describedby': hint ? hintId : children.props['aria-describedby'],
  });

  return (
    <div className={`labeled-field ${className}`.trim()}>
      <label className="labeled-field-label" htmlFor={controlId}>{label}</label>
      {control}
      {hint && <small className="labeled-field-hint" id={hintId}>{hint}</small>}
    </div>
  );
}
