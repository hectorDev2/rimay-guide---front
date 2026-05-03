export function DesignSystem() {
  return (
    <div className="h-full overflow-y-auto bg-[var(--warm-white)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Rimay Guide</h1>
          <p className="text-[var(--muted-foreground)]">Design System Components</p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-20 rounded-xl bg-[var(--terracotta)] shadow-sm"></div>
              <p className="text-sm">Terracotta</p>
              <p className="text-xs text-[var(--muted-foreground)]">#A0522D</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-xl bg-[var(--inca-gold)] shadow-sm"></div>
              <p className="text-sm">Inca Gold</p>
              <p className="text-xs text-[var(--muted-foreground)]">#C8922A</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-xl bg-[var(--andean-blue)] shadow-sm"></div>
              <p className="text-sm">Andean Blue</p>
              <p className="text-xs text-[var(--muted-foreground)]">#4A7FA5</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-xl bg-[var(--sage-green)] shadow-sm"></div>
              <p className="text-sm">Sage Green</p>
              <p className="text-xs text-[var(--muted-foreground)]">#6B8F71</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Typography</h2>
          <div className="space-y-4 bg-white rounded-2xl p-6">
            <div>
              <h1 className="text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>Playfair Display</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Headings and titles</p>
            </div>
            <div>
              <p className="text-xl">Inter Regular</p>
              <p className="text-sm text-[var(--muted-foreground)]">Body text and UI</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Buttons</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Primary</p>
              <button className="px-8 py-4 rounded-2xl bg-[var(--terracotta)] text-white hover:bg-[#8B4513] transition-colors">
                Iniciar narración
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Secondary (Outlined)</p>
              <button className="px-8 py-4 rounded-2xl border-2 border-[var(--terracotta)] text-[var(--terracotta)] hover:bg-[var(--terracotta)]/5 transition-colors">
                Ver todas las paradas
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6">
              <p className="text-sm text-[var(--muted-foreground)] mb-3">Ghost</p>
              <button className="px-8 py-4 text-[var(--muted-foreground)] hover:text-[var(--dark-charcoal)] transition-colors">
                Ahora no
              </button>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Progress Bar</h2>
          <div className="bg-white rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">Download progress</p>
                <div className="h-2 bg-[var(--stone-gray)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--inca-gold)] w-2/3 transition-all"></div>
                </div>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">Audio scrubber</p>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden bg-[var(--stone-gray)]">
                  <div className="h-full bg-[var(--inca-gold)] w-1/2 transition-all"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Tour Stop States</h2>
          <div className="bg-white rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--inca-gold)] text-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">Entrada Principal</p>
                <p className="text-sm text-[var(--muted-foreground)]">Completed</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[var(--terracotta)]/5 -mx-6 px-6 py-2 border-l-4 border-[var(--terracotta)]">
              <div className="w-12 h-12 rounded-full bg-[var(--terracotta)] text-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold">Plaza del Inca</p>
                <p className="text-sm text-[var(--muted-foreground)]">Currently playing</p>
              </div>
              <div className="flex items-center gap-1 text-[var(--terracotta)]">
                <div className="w-2 h-2 bg-[var(--terracotta)] rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--stone-gray)] text-[var(--muted-foreground)] flex items-center justify-center">
                4
              </div>
              <div className="flex-1">
                <p className="font-medium text-[var(--muted-foreground)]">La Gran Plaza</p>
                <p className="text-sm text-[var(--muted-foreground)]">Future</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Cards & Surfaces</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Standard Card</h3>
              <p className="text-sm text-[var(--muted-foreground)]">16px border radius, subtle shadow</p>
            </div>

            <div className="bg-[var(--sage-green)]/10 rounded-xl p-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-[var(--sage-green)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm">Success banner with icon</span>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Inca Geometric Motifs</h2>
          <div className="bg-white rounded-2xl p-6">
            <div className="flex gap-8">
              <div className="w-20 h-20 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="inca-diamond" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M0,20 L20,0 L40,20 L20,40 Z" fill="var(--terracotta)" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#inca-diamond)" />
                </svg>
              </div>

              <div className="w-20 h-20 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <pattern id="inca-step" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M0,0 L10,0 L10,10 L20,10 L20,20 L30,20 L30,30 L0,30 Z" fill="var(--inca-gold)" />
                  </pattern>
                  <rect width="100" height="100" fill="url(#inca-step)" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-4">
              Used sparingly at low opacity as decorative accents
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
