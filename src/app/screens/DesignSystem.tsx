import { Play, SkipBack, SkipForward, Pause } from 'lucide-react';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[18px] font-semibold text-white mb-5">
      {children}
    </h2>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="space-y-2">
      <div
        className="w-full h-20 rounded-[16px] border border-white/10"
        style={{ background: hex }}
      />
      <p className="text-[13px] text-white font-medium">{name}</p>
      <p className="text-[11px] text-[#6E6E6E]">{hex}</p>
    </div>
  );
}

export function DesignSystem() {
  return (
    <div className="h-full overflow-y-auto bg-[#0E0E0E] px-5 py-6">
      <div className="max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[36px] font-bold text-white mb-2">Rimay Guide</h1>
          <p className="text-[#6E6E6E] text-[15px]">Dark Neon Design System</p>
        </div>

        {/* Colors */}
        <section className="mb-12">
          <SectionTitle>Colors</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Swatch name="Background" hex="#0E0E0E" />
            <Swatch name="Surface" hex="#171717" />
            <Swatch name="Surface Secondary" hex="#1E1E1E" />
            <Swatch name="Card" hex="#202020" />
            <Swatch name="Primary / Neon" hex="#E6FF00" />
            <Swatch name="Primary Soft" hex="#D6F500" />
            <Swatch name="Success" hex="#AFFF00" />
            <Swatch name="Danger" hex="#FF4D67" />
            <Swatch name="Text Primary" hex="#FFFFFF" />
            <Swatch name="Text Secondary" hex="#A6A6A6" />
            <Swatch name="Text Muted" hex="#6E6E6E" />
            <Swatch name="Border" hex="#2C2C2C" />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <SectionTitle>Typography — Poppins</SectionTitle>
          <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C] space-y-4">
            <div>
              <p className="text-[36px] font-bold text-white">Hero 36 Bold</p>
              <p className="text-[11px] text-[#6E6E6E]">36px · Poppins Bold</p>
            </div>
            <div>
              <p className="text-[24px] font-semibold text-white">Title 24 SemiBold</p>
              <p className="text-[11px] text-[#6E6E6E]">24px · Poppins SemiBold</p>
            </div>
            <div>
              <p className="text-[18px] font-medium text-white">Subtitle 18 Medium</p>
              <p className="text-[11px] text-[#6E6E6E]">18px · Poppins Medium</p>
            </div>
            <div>
              <p className="text-[15px] text-white">Body 15 Regular</p>
              <p className="text-[11px] text-[#6E6E6E]">15px · Poppins Regular</p>
            </div>
            <div>
              <p className="text-[13px] text-white">Body Small 13</p>
              <p className="text-[11px] text-[#6E6E6E]">13px · Poppins Regular</p>
            </div>
            <div>
              <p className="text-[11px] text-[#A6A6A6]">Caption 11</p>
              <p className="text-[11px] text-[#6E6E6E]">11px · Poppins Regular</p>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="mb-12">
          <SectionTitle>Border Radius</SectionTitle>
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'XS 10', value: 10 },
              { name: 'SM 16', value: 16 },
              { name: 'MD 22', value: 22 },
              { name: 'LG 30', value: 30 },
              { name: 'XL 40', value: 40 },
              { name: 'Pill 999', value: 9999 },
            ].map((r) => (
              <div
                key={r.name}
                className="bg-[#171717] border border-[#2C2C2C] px-5 py-4 text-center"
                style={{ borderRadius: r.value > 100 ? 9999 : r.value }}
              >
                <p className="text-[13px] text-white font-medium">{r.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Spacing */}
        <section className="mb-12">
          <SectionTitle>Spacing</SectionTitle>
          <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C] space-y-3">
            {[
              { name: 'XS', value: 4 },
              { name: 'SM', value: 8 },
              { name: 'MD', value: 16 },
              { name: 'LG', value: 24 },
              { name: 'XL', value: 32 },
              { name: '2XL', value: 40 },
            ].map((s) => (
              <div key={s.name} className="flex items-center gap-4">
                <span className="text-[13px] text-[#6E6E6E] w-8">{s.name}</span>
                <div
                  className="h-2 rounded-full bg-[#E6FF00]/30"
                  style={{ width: s.value * 2 }}
                />
                <span className="text-[11px] text-[#6E6E6E]">{s.value}px</span>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-12">
          <SectionTitle>Buttons</SectionTitle>
          <div className="space-y-3">
            <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C]">
              <p className="text-[11px] text-[#6E6E6E] mb-3 uppercase tracking-wide">Primary CTA</p>
              <button className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all">
                <Play className="w-5 h-5" fill="#111111" />
                Iniciar narración
              </button>
            </div>

            <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C]">
              <p className="text-[11px] text-[#6E6E6E] mb-3 uppercase tracking-wide">Secondary</p>
              <button className="w-full h-14 rounded-full bg-[#1E1E1E] text-white text-[15px] font-medium flex items-center justify-center gap-2 border border-[#2C2C2C] active:scale-[0.96] transition-all">
                Ver todas las paradas
              </button>
            </div>

            <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C]">
              <p className="text-[11px] text-[#6E6E6E] mb-3 uppercase tracking-wide">Icon Button</p>
              <div className="flex gap-3">
                <button className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center border border-[#2C2C2C] active:scale-90 transition-all">
                  <SkipBack className="w-5 h-5 text-white" />
                </button>
                <button className="w-16 h-16 rounded-full bg-[#E6FF00] flex items-center justify-center shadow-[0_8px_30px_rgba(230,255,0,0.35)] active:scale-90 transition-all">
                  <Play className="w-7 h-7 text-[#111111] ml-1" fill="#111111" />
                </button>
                <button className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center border border-[#2C2C2C] active:scale-90 transition-all">
                  <SkipForward className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Chips */}
        <section className="mb-12">
          <SectionTitle>Chips</SectionTitle>
          <div className="flex gap-2.5">
            <button className="h-[38px] px-[18px] rounded-full bg-[#E6FF00] text-[#111111] text-[13px] font-medium active:scale-95 transition-all">
              Todos
            </button>
            <button className="h-[38px] px-[18px] rounded-full bg-[#232323] text-white text-[13px] font-medium active:scale-95 transition-all">
              Históricos
            </button>
            <button className="h-[38px] px-[18px] rounded-full bg-[#232323] text-white text-[13px] font-medium active:scale-95 transition-all">
              Culturales
            </button>
          </div>
        </section>

        {/* Search Bar */}
        <section className="mb-12">
          <SectionTitle>Search Bar</SectionTitle>
          <div className="h-[52px] rounded-full bg-[#1B1B1B] flex items-center px-[18px] gap-3 border border-[#2C2C2C]">
            <svg className="w-[18px] h-[18px] text-[#6E6E6E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <span className="text-[15px] text-[#6E6E6E]">Buscar paradas...</span>
          </div>
        </section>

        {/* Audio Player Showcase */}
        <section className="mb-12">
          <SectionTitle>Audio Player Controls</SectionTitle>
          <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C] space-y-5">
            {/* Waveform */}
            <div className="h-12 flex items-end justify-between gap-[3px]">
              {Array.from({ length: 36 }, (_, i) => {
                const h = Math.random() * 40 + 10;
                return (
                  <div
                    key={i}
                    className="rounded-full w-full"
                    style={{
                      height: `${h}%`,
                      background: i < 18
                        ? 'linear-gradient(180deg, #E6FF00 0%, #AFFF00 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                      boxShadow: i < 18 ? '0 0 12px rgba(230,255,0,0.3)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Progress */}
            <div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className="h-full w-[35%] bg-[#E6FF00] rounded-full relative shadow-[0_0_12px_rgba(230,255,0,0.4)]" />
              </div>
              <div className="flex justify-between text-[#6E6E6E] text-[13px]">
                <span>1:23</span>
                <span>4:45</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                <SkipBack className="w-4 h-4 text-white" />
              </button>
              <button className="w-16 h-16 rounded-full bg-[#E6FF00] flex items-center justify-center shadow-[0_8px_30px_rgba(230,255,0,0.35)]">
                <Pause className="w-7 h-7 text-[#111111]" fill="#111111" />
              </button>
              <button className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                <SkipForward className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Navigation */}
        <section className="mb-12">
          <SectionTitle>Bottom Navigation</SectionTitle>
          <div className="bg-[#171717] rounded-full p-3 border border-[#2C2C2C] flex items-center justify-around shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#E6FF00] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#111111]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              </div>
              <span className="text-[11px] text-[#111111] font-medium">Inicio</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>
              <span className="text-[11px] text-white/60">Favoritos</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-[11px] text-white/60">Buscar</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <span className="text-[11px] text-white/60">Ajustes</span>
            </button>
          </div>
        </section>

        {/* Effects */}
        <section className="mb-12">
          <SectionTitle>Effects</SectionTitle>
          <div className="bg-[#171717] rounded-[22px] p-5 border border-[#2C2C2C] space-y-4">
            <div>
              <p className="text-[13px] text-white font-medium mb-2">Neon Glow</p>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-full bg-[#E6FF00] shadow-[0_0_30px_rgba(230,255,0,0.5)]" />
                <div className="w-16 h-16 rounded-full bg-[#E6FF00] shadow-[0_0_20px_rgba(230,255,0,0.3)]" />
                <div className="w-16 h-16 rounded-full bg-[#E6FF00] shadow-[0_8px_30px_rgba(230,255,0,0.35)]" />
              </div>
            </div>
            <div>
              <p className="text-[13px] text-white font-medium mb-2">Glassmorphism</p>
              <div className="w-full h-20 rounded-[22px] bg-white/10 backdrop-blur-[20px] border border-white/10 flex items-center justify-center">
                <span className="text-white text-[13px]">backdrop-blur: 20px</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stat Card */}
        <section className="mb-12">
          <SectionTitle>Stat Card</SectionTitle>
          <div className="h-[62px] bg-[#232323] rounded-[20px] flex items-center px-4 gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#E6FF00]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#E6FF00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white">12 paradas</p>
              <p className="text-[11px] text-[#8D8D8D]">En este tour</p>
            </div>
          </div>
        </section>

        {/* Gallery Thumbnails */}
        <section className="mb-12">
          <SectionTitle>Gallery Thumbnails</SectionTitle>
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-[88px] h-[68px] rounded-[18px] bg-gradient-to-br from-[#2C2C2C] to-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center"
              >
                <svg className="w-6 h-6 text-[#6E6E6E]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            ))}
          </div>
        </section>

        {/* Destination Card Preview */}
        <section className="mb-12">
          <SectionTitle>Destination Card</SectionTitle>
          <div
            className="w-full h-[220px] rounded-[28px] relative overflow-hidden border border-[#2C2C2C]"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400&q=60)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
              <div>
                <p className="text-[24px] font-semibold text-white">Sacsayhuamán</p>
                <p className="text-[12px] text-white/70">Fortaleza del Sol</p>
              </div>
              <button className="h-[42px] px-6 rounded-full bg-[#E6FF00] text-[#111111] text-[13px] font-semibold flex items-center gap-1.5 active:scale-95 transition-all shadow-[0_4px_16px_rgba(230,255,0,0.3)]">
                <Play className="w-4 h-4" fill="#111111" />
                Iniciar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
