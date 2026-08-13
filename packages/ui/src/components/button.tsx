import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={`jobfinder-button ${className}`.trim()}
      type={type}
      {...props}
    />
  );
}
