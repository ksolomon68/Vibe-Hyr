import Link from 'next/link'
import { Crown, Facebook, Youtube, Instagram } from 'lucide-react'

const SOCIAL = [
  { label: 'Facebook',  href: 'https://www.facebook.com/vibehyr',                          Icon: Facebook  },
  { label: 'YouTube',   href: 'https://www.youtube.com/channel/UCMiPrWX7J7uNbZD0wG80b-Q', Icon: Youtube   },
  { label: 'Instagram', href: 'https://www.instagram.com/vibe_hyr/',                       Icon: Instagram },
]

const LINKS = {
  Platform: [
    { label: 'Courses',   href: '/courses'   },
    { label: 'Journal',   href: '/journal'   },
    { label: 'Quizzes',   href: '/quizzes'   },
    { label: 'Community', href: '/community' },
  ],
  Learn: [
    { label: 'Blog',             href: '/blog'    },
    { label: 'Free SATS Guide',  href: '/blog/sats-guide' },
    { label: 'Pricing',          href: '/pricing' },
  ],
  Account: [
    { label: 'Sign Up',  href: '/auth/signup' },
    { label: 'Log In',   href: '/auth/login'  },
    { label: 'Dashboard', href: '/dashboard'  },
  ],
}

export function Footer() {
  return (
    <footer className="border-t-2 border-orange-DEFAULT bg-black-2">
      <div className="max-w-7xl mx-auto px-6 md:px-14 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-display text-3xl tracking-widest text-orange-DEFAULT">
                VIBE<span className="text-white">HYR</span>
              </span>
              <Crown size={12} className="text-orange-DEFAULT -mt-3" />
            </div>
            <p className="font-body text-sm text-grey-DEFAULT leading-relaxed mb-6">
              Master your internal state. Transform your external world. The Architecture of Reality starts here.
            </p>
            <blockquote className="font-body italic text-sm text-grey-DEFAULT border-l-2 border-orange-DEFAULT pl-4">
              "Assume the feeling of your wish fulfilled."
              <cite className="block font-mono text-[0.6rem] tracking-widest mt-2 text-orange-DEFAULT not-italic">
                — Neville Goddard
              </cite>
            </blockquote>
            <div className="flex gap-4 mt-6">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-grey-DEFAULT hover:text-orange-DEFAULT transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-orange-DEFAULT mb-5">
                {heading}
              </h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-grey-DEFAULT hover:text-orange-DEFAULT transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[0.55rem] tracking-[0.2em] text-grey-dark uppercase">
            © {new Date().getFullYear()} Vibe Hyr · All Rights Reserved
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-grey-dark hover:text-orange-DEFAULT transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
