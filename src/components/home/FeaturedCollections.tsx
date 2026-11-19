import { useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { NOIR_COLLECTION_PIECES, type CouturePiece } from '../../data/noirMedia';

export interface FeaturedCollectionsProps {
  onBookPiece: (pieceTitle: string) => void;
}

const CATEGORIES = ['All', 'Menswear', 'Womenswear', 'Atelier Bespoke'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

export function FeaturedCollections({ onBookPiece }: FeaturedCollectionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [activePiece, setActivePiece] = useState<CouturePiece | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const visiblePieces =
    selectedCategory === 'All'
      ? NOIR_COLLECTION_PIECES
      : NOIR_COLLECTION_PIECES.filter((item) => item.category === selectedCategory);

  return (
    <section
      id="collections"
      aria-labelledby="collections-heading"
      className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-20 sm:py-28 border-t border-[#EDE4D8]/10"
    >
      {/* Editorial Section Header + Interactive Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
        <div className="max-w-lg">
          <p className="font-sans-noir text-xs uppercase tracking-[0.28em] text-[#B69A6A]">
            Autumn / Winter Couture
          </p>
          <h2
            id="collections-heading"
            style={{ textWrap: 'balance' }}
            className="font-editorial mt-3 text-3xl sm:text-4xl lg:text-5xl font-light tracking-[0.03em] text-[#EDE4D8]"
          >
            Silhouettes of Quiet Sovereign Craft
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter collection by category"
          className="flex flex-wrap items-center gap-1 border border-[#EDE4D8]/12 p-1 bg-[#1B1517]"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] whitespace-nowrap transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B69A6A] ${
                  isSelected
                    ? 'bg-[#641F2B] text-[#EDE4D8]'
                    : 'text-[#EDE4D8]/65 hover:text-[#EDE4D8]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Uniform Editorial Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {visiblePieces.map((piece) => (
          <article
            key={piece.id}
            className="group flex flex-col border border-[#EDE4D8]/10 bg-[#1A1416] transition-transform duration-300 hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => setActivePiece(piece)}
              className="relative aspect-[3/4] w-full overflow-hidden bg-[#22191C] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B69A6A]"
              aria-label={`Inspect ${piece.title}`}
            >
              {!failedImages[piece.id] ? (
                <img
                  src={piece.image}
                  alt={piece.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({ ...prev, [piece.id]: true }))
                  }
                  className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#35151D] to-[#151112] p-6 text-center">
                  <span className="font-editorial text-2xl text-[#B69A6A]">{piece.code}</span>
                  <span className="mt-2 text-xs uppercase tracking-[0.2em] text-[#EDE4D8]/70">
                    {piece.title}
                  </span>
                </div>
              )}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#151112]/80 to-transparent"
              />
            </button>

            <div className="flex flex-1 flex-col justify-between p-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#B69A6A]">
                  <span>{piece.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{piece.category}</span>
                </div>
                <h3 className="font-editorial mt-2.5 text-2xl font-light tracking-[0.02em] text-[#EDE4D8]">
                  {piece.title}
                </h3>
                <p className="mt-2 text-sm font-light leading-relaxed text-[#EDE4D8]/68">
                  {piece.subtitle}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#EDE4D8]/10 pt-4">
                <span className="font-sans-noir text-sm font-normal tabular-nums text-[#EDE4D8]/90">
                  {piece.priceInr}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePiece(piece)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-[#B69A6A] transition-colors hover:text-[#EDE4D8] whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
                >
                  <span>View Dossier</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Couture Dossier Detail Modal */}
      {activePiece && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="piece-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#151112]/85 p-4 sm:p-6 backdrop-blur-sm"
          onClick={() => setActivePiece(null)}
        >
          <div
            className="relative grid w-full max-w-4xl grid-cols-1 md:grid-cols-2 overflow-hidden border border-[#EDE4D8]/15 bg-[#191416]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePiece(null)}
              aria-label="Close couture dossier"
              className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center bg-[#151112]/80 text-[#EDE4D8] hover:text-[#B69A6A] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B69A6A]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="aspect-[3/4] md:aspect-auto md:h-full bg-[#22191C]">
              <img
                src={activePiece.image}
                alt={activePiece.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="flex flex-col justify-between p-7 sm:p-10">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-[#B69A6A]">
                  <span>{activePiece.code}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePiece.category}</span>
                </div>

                <h3
                  id="piece-modal-title"
                  className="font-editorial mt-3 text-3xl sm:text-4xl font-light text-[#EDE4D8]"
                >
                  {activePiece.title}
                </h3>

                <p className="mt-4 text-sm font-light leading-relaxed text-[#EDE4D8]/78">
                  {activePiece.description}
                </p>

                <dl className="mt-7 space-y-4 border-t border-[#EDE4D8]/10 pt-6 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="uppercase tracking-[0.2em] text-[#EDE4D8]/50">Textile</dt>
                    <dd className="text-right text-[#EDE4D8]/90">{activePiece.fabric}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="uppercase tracking-[0.2em] text-[#EDE4D8]/50">Craftsmanship</dt>
                    <dd className="text-right tabular-nums text-[#EDE4D8]/90">{activePiece.craftHours}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="uppercase tracking-[0.2em] text-[#EDE4D8]/50">Made to Measure</dt>
                    <dd className="text-right tabular-nums text-[#B69A6A] font-medium">
                      {activePiece.priceInr}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    const title = activePiece.title;
                    setActivePiece(null);
                    onBookPiece(title);
                  }}
                  className="w-full min-h-[48px] bg-[#641F2B] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.24em] text-[#EDE4D8] transition-colors hover:bg-[#7A2735] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B69A6A]"
                >
                  Request Private Fitting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
