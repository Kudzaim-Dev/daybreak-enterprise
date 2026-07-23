import { DAYBREAK_LOGO, DAYBREAK_BRAND } from "@/lib/brand.ts";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-8", md: "h-10", lg: "h-14" };

export default function DayBreakLogo({ className = "", size = "md" }: LogoProps) {
  return (
    <img src={DAYBREAK_LOGO} alt={DAYBREAK_BRAND}
      className={`${sizes[size]} w-auto object-contain ${className}`} />
  );
}
