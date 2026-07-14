'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';
import {
  FILTER_VALUES,
  pathForFilter,
  type FilterValue,
} from '@/sanity/lib/types';

// the text-free mark serves both locales, so no locale branch needed
export function Logo({
  className,
  priority = false,
}: {
  className: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo_no_text.jpg"
      alt="Studio Omri Meron"
      width={1653}
      height={1392}
      priority={priority}
      className={className}
    />
  );
}

// site name next to the logo — the page's only heading now that the hero
// no longer carries one, so it's an h1 in the nav rows (mobile bar / desktop
// bar are mutually exclusive via breakpoint, never both visible at once).
// The drawer repeats the same text as plain copy, not another h1, since it
// can be open at the same time as the mobile bar.
function BrandName({
  as: Tag = 'h1',
  compact = false,
  stacked = false,
  sizeClass = 'text-base sm:text-lg',
}: {
  as?: 'h1' | 'p';
  compact?: boolean;
  stacked?: boolean;
  sizeClass?: string;
}) {
  const t = useTranslations('Hero');
  return (
    <Tag
      // the parent Brand link is forced dir="ltr" so the logo stays left;
      // dir="auto" restores the text's own direction inside it, so Hebrew
      // lines right-align as RTL copy should
      dir="auto"
      // translate-y-[1px]: even bottom-aligned (items-end on Brand), the
      // last line's ink stops ~1px short of the box edge (half-leading +
      // glyph inset; measured 0.9px EN / 1.2px HE), so drop the block 1px
      // to sit flush with the logo's bottom edge
      className={`font-display ${sizeClass} translate-y-[1px] leading-tight tracking-tight text-neutral-900`}
    >
      {/* nameBold stays nowrap so "Omri"/"Meron" never separate — it's one
          short name. stacked (mobile bar + drawer) forces the break exactly
          after the name: name on line 1, phrase on line 2, never elsewhere.
          Inline (desktop), the explicit {' '} between the spans matters:
          two adjacent JSX elements with no text between them share no
          line-break opportunity, so without it the pair is one unbreakable
          run that overflows instead of wrapping when space is tight. The
          phrase only joins at xl+ when compact: the desktop 3-column nav
          (brand | tabs | locale) switches on at lg but doesn't have room
          for the full phrase until xl, or it squeezes into the tabs. */}
      <span className={`font-bold whitespace-nowrap ${stacked ? 'block' : ''}`}>
        {t('nameBold')}
      </span>{' '}
      <span
        className={`font-normal ${stacked ? 'block whitespace-nowrap' : 'ms-2'} ${
          compact ? 'hidden xl:inline' : ''
        }`}
      >
        {t('nameRegular')}
      </span>
    </Tag>
  );
}

// logo + site name, linking home. dir="ltr" pins the internal order
// physically — logo first (left), name to its right — in both languages;
// the Hebrew text itself still renders right-to-left via bidi. Without it
// the RTL site mirrors the pair and puts the logo on the right.
function Brand({
  nameTag = 'h1',
  compact = false,
  stacked = false,
  logoClass,
  nameSizeClass,
  gap,
  onNavigate,
}: {
  nameTag?: 'h1' | 'p';
  compact?: boolean;
  stacked?: boolean;
  logoClass: string;
  nameSizeClass?: string;
  gap: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href="/"
      aria-label="Home"
      dir="ltr"
      // landing anchor for the IntroOverlay's fly-to-navbar animation; the
      // overlay picks whichever instance is actually visible on screen
      data-intro-brand
      onClick={onNavigate}
      // items-end, not center: the name's last line should sit flush with
      // the logo's bottom edge (visually the two share a baseline)
      className={`flex min-w-0 items-end ${gap}`}
    >
      <Logo className={`${logoClass} w-auto shrink-0`} />
      <BrandName
        as={nameTag}
        compact={compact}
        stacked={stacked}
        sizeClass={nameSizeClass}
      />
    </Link>
  );
}

// mobile: logo + hamburger, options live in the drawer.
// dir="ltr" on the whole row keeps the layout physical in both languages:
// brand pinned left, toggle+hamburger cluster pinned right (absolute, so
// it stays in that corner without mirroring), flag left of the hamburger.
// pr-24 reserves the corner so the brand never grows under the cluster.
// Everything is sized to the h-8 controls: logo h-8, name text-xs (its
// two tight lines come to ~30px, so the text block stays just inside the
// 32px logo/buttons — same text-shorter-than-logo proportion as desktop).
function MobileBar({
  open,
  onToggle,
  onClose,
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    // pl-4 mirrors the cluster's right-4 gutter
    <div
      dir="ltr"
      className="relative flex items-center py-4 pr-24 pl-4 lg:hidden"
    >
      <Brand
        stacked
        logoClass="h-8"
        nameSizeClass="text-xs"
        gap="gap-2"
        onNavigate={onClose}
      />
      <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-3">
        <LocaleSwitcher />
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center text-2xl leading-none text-neutral-700"
        >
          {/* measured: ☰ ink sits ~1.5px below the centered line box, so
              lift it to true center (block: transforms skip inline els) */}
          <span className="block -translate-y-[1.5px]">☰</span>
        </button>
      </div>
    </div>
  );
}

// mobile: full-height drawer sliding in from the trailing edge
// (right for LTR, left for RTL) with the logo at the top
function MobileDrawer({
  open,
  rtl,
  onClose,
  tabLinks,
}: {
  open: boolean;
  rtl: boolean;
  onClose: () => void;
  tabLinks: React.ReactNode;
}) {
  return (
    <>
      <div
        aria-hidden={!open}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        // closed drawer is only translated off-screen, so inert keeps its
        // links out of the tab order and the accessibility tree
        inert={!open}
        className={`fixed inset-y-0 z-50 flex w-4/5 max-w-xs flex-col gap-8 bg-white px-6 py-6 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${
          rtl ? 'left-0' : 'right-0'
        } ${
          open
            ? 'translate-x-0'
            : rtl
              ? '-translate-x-full'
              : 'translate-x-full'
        }`}
      >
        {/* dir="ltr": logo stays in the left corner, ✕ in the right, in
            both languages — matching the bar underneath */}
        <div dir="ltr" className="flex items-center justify-between gap-4">
          <Brand
            nameTag="p"
            stacked
            logoClass="h-8"
            nameSizeClass="text-xs"
            gap="gap-2"
            onNavigate={onClose}
          />
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="text-2xl leading-none text-neutral-700"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-start gap-5">{tabLinks}</div>
      </div>
    </>
  );
}

// desktop: brand and locale are both taken out of flow (absolute)
// so the tabs can center on the *true* full bar width via a plain
// w-full flex, instead of the space left over after two differently-
// sized, asymmetric siblings — that leftover space isn't symmetric
// (brand's width varies with locale/text length, the locale switcher
// is a fixed small icon), so centering within it was visibly off.
// Both corners use physical `left-*`/`right-*` (not logical start/end)
// so the layout doesn't mirror in Hebrew: brand always left, locale
// switcher always right, in both languages.
function DesktopBar({
  onNavigate,
  tabLinks,
}: {
  onNavigate: () => void;
  tabLinks: React.ReactNode;
}) {
  return (
    <div className="relative hidden items-center py-6 lg:flex">
      {/* -3.5px on top of the -50% centering: measured baseline gap between
          the brand name (text-lg) and the tab labels (text-sm) when both
          blocks are box-centered; lifting the whole lockup keeps the name
          flush with the logo while putting both texts on one baseline */}
      <div className="absolute top-1/2 left-6 -translate-y-[calc(50%+3.5px)] lg:left-12">
        <Brand compact logoClass="h-6" gap="gap-3" onNavigate={onNavigate} />
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {tabLinks}
      </div>
      <div className="absolute top-1/2 right-6 -translate-y-1/2 lg:right-12">
        <LocaleSwitcher />
      </div>
    </div>
  );
}

export default function FilterBar({ active }: { active: FilterValue }) {
  const t = useTranslations('Filters');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const rtl = locale === 'he';

  // Lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // 'all' is the bare landing route (/), reached via the logo — not a tab
  const tabLinks = FILTER_VALUES.filter((v) => v !== 'all').map((option) => {
    const isActive = option === active;
    return (
      <Link
        key={option}
        href={pathForFilter(option)}
        onClick={() => setOpen(false)}
        aria-current={isActive ? 'page' : undefined}
        className="group relative inline-flex items-center justify-center px-3 py-1"
      >
        <span
          className={`relative text-sm tracking-wide uppercase transition-colors duration-300 group-hover:font-bold group-hover:text-neutral-900 ${
            isActive
              ? 'font-bold text-neutral-900'
              : 'font-normal text-neutral-400'
          }`}
        >
          {t(option)}
        </span>
        {/* bold underline that grows out from the center under the text
            on hover; inset-x-3 keeps it text-wide, inside the px-3 pad */}
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-0.5 h-0.5 origin-center scale-x-0 bg-neutral-900 transition-transform duration-300 ease-out group-hover:scale-x-100"
        />
      </Link>
    );
  });

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <MobileBar
        open={open}
        onToggle={() => setOpen(!open)}
        onClose={() => setOpen(false)}
      />
      <MobileDrawer
        open={open}
        rtl={rtl}
        onClose={() => setOpen(false)}
        tabLinks={tabLinks}
      />
      <DesktopBar onNavigate={() => setOpen(false)} tabLinks={tabLinks} />
    </nav>
  );
}
