import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer = ({ className }: FooterProps) => {
  return (
    <footer className={cn("border-t border-white/10 bg-[#0d253f] py-10 text-white", className)}>
      <div className="container mx-auto grid gap-10 px-6 text-slate-200 sm:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <span className="text-lg font-black bg-linear-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">CineTube</span>
          <p className="max-w-sm text-sm leading-7 text-slate-300">
            Discover movies and series with confidence. CineTube combines curated recommendations, strong contrast, and a polished user experience for every film fan.
          </p>
          <div className="space-y-2 text-sm text-slate-300">
            <p>
              <span className="font-semibold text-slate-100">Email:</span> <a href="mailto:support@cinetube.com" className="transition hover:text-white">support@cinetube.com</a>
            </p>
            <p>
              <span className="font-semibold text-slate-100">Phone:</span> <a href="tel:+15551234567" className="transition hover:text-white">+1 (555) 123-4567</a>
            </p>
            <p>
              <span className="font-semibold text-slate-100">Address:</span> 712 Film Street, Los Angeles, CA
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Explore</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/about" className="transition hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/help" className="transition hover:text-white">
                Help / FAQ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Legal</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/privacy-policy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="transition hover:text-white">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Follow CineTube</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="https://twitter.com/CineTubeApp" target="_blank" rel="noreferrer" className="transition hover:text-white">
                Twitter
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/CineTubeApp" target="_blank" rel="noreferrer" className="transition hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com/CineTubeApp" target="_blank" rel="noreferrer" className="transition hover:text-white">
                Facebook
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/company/cinetube" target="_blank" rel="noreferrer" className="transition hover:text-white">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-white/10 py-6 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} CineTube. All rights reserved.
      </div>
    </footer>
  );
};

export { Footer };
