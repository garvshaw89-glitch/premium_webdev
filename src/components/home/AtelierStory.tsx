import { NOIR_INTRO_MEDIA } from '../../data/noirMedia';

export interface AtelierStoryProps {
  onOpenAppointment: () => void;
}

export function AtelierStory({ onOpenAppointment }: AtelierStoryProps) {
  return (
    <section
      id="craft"
      aria-labelledby="atelier-heading"
      className="border-t border-[#EDE4D8]/10 bg-[#191315]"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
          {/* Editorial Macro Textile Photography */}
          <div className="lg:col-span-7 relative overflow-hidden border border-[#EDE4D8]/10 bg-[#151112] min-h-[340px]">
            <img
              src={NOIR_INTRO_MEDIA.craftsmanshipPoster}
              alt="Macro detail of hand-stitched antique gold zardozi embroidery on deep wine velvet"
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#151112]/70 via-transparent to-transparent"
            />
            <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-[#EDE4D8]/75">
              <span>Varanasi &amp; Lucknow Master Karigars</span>
              <span>Real Antique Zari</span>
            </div>
          </div>

          {/* Editorial Craftsmanship Narrative */}
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div>
              <p className="font-sans-noir text-xs uppercase tracking-[0.28em] text-[#B69A6A]">
                The Atelier · Heritage Craft
              </p>
              <h2
                id="atelier-heading"
                style={{ textWrap: 'balance' }}
                className="font-editorial mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-light leading-[1.12] text-[#EDE4D8]"
              >
                Woven in Shadow, Illuminated by Hand
              </h2>
              <p className="mt-6 text-sm sm:text-[15px] font-light leading-relaxed text-[#EDE4D8]/75">
                Every NOIR® garment begins on heritage pit looms across Varanasi and Murshidabad,
                where silk yarns are dyed in small-batch deep wine vats before arriving at our
                Mumbai atelier. Master embroiderers spend up to 380 hours laying antique metallic
                zardozi thread with architectural restraint.
              </p>

              <div className="mt-9 grid grid-cols-2 gap-6 border-t border-[#EDE4D8]/10 pt-8">
                <div>
                  <p className="font-editorial text-3xl sm:text-4xl font-light tabular-nums text-[#B69A6A]">
                    380h
                  </p>
                  <p className="mt-1.5 text-xs tracking-[0.12em] text-[#EDE4D8]/60">
                    Hand embroidery per bespoke overcoat
                  </p>
                </div>
                <div>
                  <p className="font-editorial text-3xl sm:text-4xl font-light tabular-nums text-[#B69A6A]">
                    100%
                  </p>
                  <p className="mt-1.5 text-xs tracking-[0.12em] text-[#EDE4D8]/60">
                    Handloom Indian mulberry &amp; katan silk
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="button"
                onClick={onOpenAppointment}
                className="inline-flex min-h-[46px] items-center justify-center border border-[#B69A6A]/65 px-7 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#EDE4D8] transition-colors duration-200 hover:bg-[#641F2B] hover:border-[#641F2B] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B69A6A]"
              >
                Schedule Atelier Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
