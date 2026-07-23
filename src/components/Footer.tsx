import { DAYBREAK_COPYRIGHT } from "@/lib/brand.ts";
import DayBreakLogo from "@/components/DayBreakLogo.tsx";

export default function Footer() {
  return (
    <footer className="border-t bg-card py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <DayBreakLogo size="sm" />
        <p className="text-sm text-muted-foreground text-center">{DAYBREAK_COPYRIGHT}</p>
        <div className="flex gap-4 text-sm text-muted-foreground"><span>Business Suite</span></div>
      </div>
    </footer>
  );
}
