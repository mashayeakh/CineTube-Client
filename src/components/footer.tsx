import { Logo, LogoImage, LogoText } from "@/components/logo";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  className?: string;
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer = ({
  logo = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
    alt: "blocks for shadcn/ui",
    title: "CinTube",
    url: "http://localhost:3000/",
  },
  className,
  tagline = "Your streaming portal to cinematic excellence.",
  menuItems = [
    {
      title: "Product",
      links: [
        { text: "Overview", url: "#" },
        { text: "Pricing", url: "#" },
        { text: "Marketplace", url: "#" },
        { text: "Features", url: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", url: "#" },
        { text: "Team", url: "#" },
        { text: "Blog", url: "#" },
        { text: "Careers", url: "#" },
      ],
    },
    {
      title: "Connect",
      links: [
        { text: "Twitter", url: "#" },
        { text: "Instagram", url: "#" },
        { text: "LinkedIn", url: "#" },
      ],
    },
  ],
  copyright = "© 2024 CineTube. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "#" },
    { text: "Privacy Policy", url: "#" },
  ],
}: FooterProps) => {
  return (
    <section className={cn("relative bg-linear-to-b from-[#0d253f] to-[#1a3a5f] py-8 lg:py-12", className)}>
      <div className="container">
        <footer className="space-y-6">
          {/* Top Section: Logo & Tagline */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
                <Logo url="https://shadcnblocks.com">
                  <LogoImage
                    src={logo.src}
                    alt={logo.alt}
                    title={logo.title}
                    className="h-8 brightness-0 invert"
                  />
                  <LogoText className="text-xl font-bold text-white">{logo.title}</LogoText>
                </Logo>
              </div>
              <p className="mt-2 text-xs text-white/90 leading-relaxed">{tagline}</p>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-3 gap-6 lg:gap-10">
              {menuItems.map((section, sectionIdx) => (
                <div key={sectionIdx}>
                  <h3 className="mb-2 font-bold text-white text-xs uppercase tracking-wider">{section.title}</h3>
                  <ul className="space-y-1.5">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <a
                          href={link.url}
                          className="text-white/80 hover:text-white transition-colors duration-200 text-xs font-medium"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Section: Copyright & Links */}
          <div className="border-t border-white/20 pt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-white/70 text-xs font-medium">{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx}>
                  <a
                    href={link.url}
                    className="text-white/70 hover:text-white transition-colors duration-200 text-xs font-medium"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
      </div>
    </section>
  );
};

export { Footer };
