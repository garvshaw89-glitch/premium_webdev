import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NOIR_NAV_ITEMS, type NoirRoute } from '../../data/noirMedia';

export interface NoirHeaderProps {
  activeRoute: NoirRoute;
  onNavigate: (route: NoirRoute) => void;
  onOpenAppointment: () => void;
  isRevealed: boolean;
  instantReveal?: boolean;
}

export function NoirHeader({
  activeRoute,
  onNavigate,
  onOpenAppointment,
  isRevealed,
  instantReveal = false,
}: NoirHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLinkClick = (route: NoirRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all ${
          instantReveal ? 'duration-0' : 'duration-700 ease-out'
        } ${
          isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'
        } ${
          scrolled
            ? 'bg-[#151112]/90 backdrop-blur-md border-b border-[#EDE4D8]/10'
            : 'bg-gradient-to-b from-[#151112]/80 via-[#151112]/35 to-transparent border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-5 sm:px-8 lg:px-12 h-16 sm:h-20">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleLinkClick('home')}
            className="font-editorial text-2xl sm:text-[1.75rem] font-light tracking-[0.26em] text-[#EDE4D8] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
            aria-label="NOIR Home"
          >
            NOIR<sup className="font-sans-noir text-[10px] text-[#B69A6A] ml-0.5 align-super">®</sup>
          </button>

          {/* Zone 2: 4 Clean Single-Line Navigation Links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-8 lg:gap-10"
          >
            {NOIR_NAV_ITEMS.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  type="button"
                  onClick={() => handleLinkClick(item.route)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-sans-noir relative py-1 text-xs font-normal uppercase tracking-[0.22em] whitespace-nowrap shrink-0 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A] ${
                    isActive
                      ? 'text-[#EDE4D8]'
                      : 'text-[#EDE4D8]/68 hover:text-[#EDE4D8]'
                  }`}
                >
                  {item.label}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 -bottom-0.5 h-px bg-[#B69A6A] transition-all duration-300 ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenAppointment}
              className="hidden sm:inline-flex items-center justify-center border border-[#B69A6A]/55 bg-[#151112]/50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#EDE4D8] whitespace-nowrap shrink-0 transition-colors duration-200 hover:border-[#B69A6A] hover:bg-[#641F2B]/55 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
            >
              Book Atelier
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="inline-flex md:hidden min-h-[44px] min-w-[44px] items-center justify-center text-[#EDE4D8] hover:text-[#B69A6A] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B69A6A]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-30 flex flex-col justify-between bg-[#151112]/98 px-6 pt-24 pb-10 md:hidden"
        >
          <nav className="flex flex-col gap-6 border-t border-[#EDE4D8]/10 pt-8">
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className={`font-editorial text-left text-3xl font-light tracking-[0.12em] transition-colors cursor-pointer ${
                activeRoute === 'home' ? 'text-[#B69A6A]' : 'text-[#EDE4D8]'
              }`}
            >
              Home
            </button>
            {NOIR_NAV_ITEMS.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => handleLinkClick(item.route)}
                className={`font-editorial text-left text-3xl font-light tracking-[0.12em] transition-colors cursor-pointer ${
                  activeRoute === item.route ? 'text-[#B69A6A]' : 'text-[#EDE4D8]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-[#EDE4D8]/10 pt-6">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAppointment();
              }}
              className="w-full border border-[#B69A6A]/65 bg-[#641F2B]/55 py-3.5 text-xs font-medium uppercase tracking-[0.24em] text-[#EDE4D8] cursor-pointer"
            >
              Book Private Appointment
            </button>
          </div>
        </div>
      )}
    </>
  );
}
