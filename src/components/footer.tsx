import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("border-t border-white/10 bg-[#0d253f] py-4", className)}>
      <div className="container flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-semibold text-white tracking-wide">CineTube</span>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} CineTube. All rights reserved.</p>
      </div>
    </footer>
  );
};

export { Footer };
