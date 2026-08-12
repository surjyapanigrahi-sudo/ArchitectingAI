interface PasswordFieldProps { id: string; label: string; value: string; visible: boolean; autocomplete: "new-password" | "current-password"; error?: string; helper?: string; onChange: (value: string) => void; onToggle: () => void; }

export function PasswordField({ id, label, value, visible, autocomplete, error, helper, onChange, onToggle }: PasswordFieldProps) {
  const descriptionIds = [helper ? `${id}-helper` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined;
  return <div className="form-field"><label htmlFor={id}>{label}</label><div className="password-control"><input id={id} name={id} type={visible ? "text" : "password"} value={value} autoComplete={autocomplete} aria-invalid={Boolean(error)} aria-describedby={descriptionIds} onChange={(event) => onChange(event.target.value)} /><button type="button" className="password-toggle" aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={onToggle}>{visible ? "Hide" : "Show"}</button></div>{helper && <p className="field-helper" id={`${id}-helper`}>{helper}</p>}{error && <p className="field-error" id={`${id}-error`}>{error}</p>}</div>;
}
