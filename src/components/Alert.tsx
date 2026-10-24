'use client';
import {useEffect, useRef} from 'react';

// design-system.md §5.8: 20 px icon · heading (16/600) · body (16/400) · one optional action.
// `role="alert"` for error, `role="status"` for everything else. An error states what did not happen
// and what the customer should do — it never sits above a button as a polite sentence (D-065 §5b).
export type AlertAction = {label: string; onClick: () => void};

type AlertProps = {
  variant: 'error' | 'info' | 'success' | 'warning';
  heading: string;
  body?: string;
  action?: AlertAction;
  // Where the focus goes after the alert appears. The alert itself by default; a control elsewhere on
  // the screen when the next useful thing to do is that control (the duplicate's `#f-phone`).
  focusTarget?: string;
};

export default function Alert({variant, heading, body, action, focusTarget}: AlertProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const target = focusTarget ? document.querySelector<HTMLElement>(focusTarget) : ref.current;
    target?.focus();
  }, [focusTarget, heading]);
  return <div className="alert" role={variant === 'error' ? 'alert' : 'status'} tabIndex={-1} ref={ref}>
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M10 5.5v5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10" cy="14.4" r="1.2" fill="currentColor" />
    </svg>
    <div>
      <h3>{heading}</h3>
      {body ? <p>{body}</p> : null}
      {action ? <button type="button" className="btn secondary" onClick={action.onClick}>{action.label}</button> : null}
    </div>
  </div>;
}
