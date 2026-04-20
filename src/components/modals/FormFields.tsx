"use client";

import type { ReactNode } from "react";

export function FormGroup({ children }: { children: ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function FormLabel({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[12.5px] font-medium text-loom-text-700"
    >
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-[12px] font-medium text-red-600">{message}</p>;
}

export function FormGrid2({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

const baseField =
  "w-full rounded-md border-[1.5px] border-loom-border bg-loom-input px-3 py-2 font-sans text-[13.5px] text-loom-text-900 shadow-loom-xs outline-none transition placeholder:text-loom-text-300 focus:border-loom-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] disabled:bg-loom-bg disabled:opacity-60";

const inputClass = `${baseField} min-h-[44px] sm:min-h-[38px]`;
const textareaClass = `${baseField} min-h-[100px] resize-y`;

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }
) {
  const { error, className = "", ...rest } = props;
  return (
    <>
      <input {...rest} className={`${inputClass} ${className}`} />
      <FieldError message={error} />
    </>
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }
) {
  const { error, className = "", ...rest } = props;
  return (
    <>
      <textarea {...rest} className={`${textareaClass} ${className}`} />
      <FieldError message={error} />
    </>
  );
}

export function SelectInput(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }
) {
  const { error, className = "", children, ...rest } = props;
  return (
    <>
      <select {...rest} className={`${inputClass} cursor-pointer ${className}`}>
        {children}
      </select>
      <FieldError message={error} />
    </>
  );
}

export function AlertInfo({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex gap-2 rounded-md border border-loom-blue-100 bg-loom-blue-50 px-3 py-2.5 text-[12.5px] leading-snug text-loom-blue-700">
      <svg
        className="mt-0.5 h-[15px] w-[15px] shrink-0 stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      {children}
    </div>
  );
}

export function AlertSuccess({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-[12.5px] leading-snug text-emerald-800">
      <svg
        className="mt-0.5 h-[15px] w-[15px] shrink-0 stroke-current"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {children}
    </div>
  );
}
