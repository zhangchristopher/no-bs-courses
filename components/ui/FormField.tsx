import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const LABEL_CLASSES = "block text-[11px] font-semibold uppercase tracking-eyebrow text-black dark:text-cream";
const CONTROL_CLASSES =
  "mt-2 w-full border border-black/20 bg-transparent px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-black focus:outline-none dark:border-cream/25 dark:text-cream dark:placeholder:text-cream/35 dark:focus:border-cream";
const HELPER_CLASSES = "mt-1.5 block text-[11.5px] font-normal normal-case tracking-normal text-black/50 dark:text-cream/50";

type FormFieldProps = {
  label: string;
  name: string;
  helperText?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "className">;

export function FormField({ label, name, helperText, ...rest }: FormFieldProps) {
  return (
    <label className={LABEL_CLASSES}>
      {label}
      <input name={name} className={CONTROL_CLASSES} {...rest} />
      {helperText && <span className={HELPER_CLASSES}>{helperText}</span>}
    </label>
  );
}

type FormTextareaProps = {
  label: string;
  name: string;
  helperText?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "className">;

export function FormTextarea({ label, name, helperText, ...rest }: FormTextareaProps) {
  return (
    <label className={LABEL_CLASSES}>
      {label}
      <textarea name={name} className={`${CONTROL_CLASSES} leading-relaxed`} {...rest} />
      {helperText && <span className={HELPER_CLASSES}>{helperText}</span>}
    </label>
  );
}
