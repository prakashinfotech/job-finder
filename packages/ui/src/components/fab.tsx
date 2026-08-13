import type { ButtonHTMLAttributes, ReactNode } from "react";

interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "small" | "medium" | "large";
}

const positionClasses = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left": "bottom-6 left-6",
  "top-right": "top-6 right-6",
  "top-left": "top-6 left-6",
};

const sizeClasses = {
  small: "w-12 h-12",
  medium: "w-16 h-16",
  large: "w-20 h-20",
};

export function Fab({
  icon,
  position = "bottom-right",
  size = "medium",
  className = "",
  ...props
}: FabProps) {
  return (
    <button
      className={`
        fixed
        ${positionClasses[position]}
        ${sizeClasses[size]}
        rounded-full
        bg-blue-500
        hover:bg-blue-600
        active:bg-blue-700
        text-white
        flex
        items-center
        justify-center
        shadow-lg
        hover:shadow-xl
        transition-all
        duration-200
        ease-in-out
        focus:outline-none
        focus:ring-2
        focus:ring-blue-300
        focus:ring-offset-2
        ${className}
      `.trim()}
      type="button"
      {...props}
    >
      {icon}
    </button>
  );
}
