import type { ReactNode } from 'react';
import { footerLinks, socialLinks, SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants';
import { Globe } from 'lucide-react';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
  </svg>
);

const socialIcons: Record<string, ReactNode> = {
  Website: <Globe className="h-4 w-4" />,
  GitHub: <GithubIcon />,
  LinkedIn: <LinkedinIcon />,
};

export const Footer = () => {
  return (
    <footer className="border-t bg-gradient-to-br from-[#0d0d14] via-[#151024] to-[#1a1030] text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
          <div>
            <div className="text-xl font-bold text-primary">{SITE_NAME}</div>
            <p className="mt-3 text-sm text-gray-400">{SITE_DESCRIPTION}</p>
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 shadow-md backdrop-blur transition hover:border-[#3b82f6]/60 hover:text-[#3b82f6]"
                >
                  {socialIcons[s.name]}
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-medium text-white">{title}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {links.map((l) => (
                  <li key={l.name}>
                    <a href={l.href} className="text-gray-400 hover:text-[#3b82f6]">{l.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-gray-400">
          © 2026 Black Tuf. All rights reserved. Made with ❤️ by <span className="text-[#3b82f6] font-semibold">VV</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
