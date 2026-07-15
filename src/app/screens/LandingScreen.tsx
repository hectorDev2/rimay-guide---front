import { motion, useScroll, useTransform } from 'motion/react';
import { 
  Crosshair, 
  Target, 
  ArrowRight, 
  Satellite, 
  Box, 
  Terminal, 
  Map as MapIcon, 
  Layers,
  Database,
  ShieldCheck,
  Cpu,
  Navigation,
  Globe,
  Github,
  Twitter,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * LandingScreen: Professional HUD-style marketing page for Rimay Guide.
 * Implements the "Refined Blueprint Landing" design from canvas var_0cd11e13fb44.
 */
export function LandingScreen() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const videoOpacity = useTransform(scrollYProgress, [0, 0.5], [0.4, 0.1]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="bg-vantablack text-white font-sans min-h-screen selection:bg-primary selection:text-black overflow-x-hidden relative">
      {/* GLOBAL HUD ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-20 bg-[linear-gradient(to_bottom,rgba(230,255,0,0.05)_50%,transparent_50%)] bg-[length:100%_4px]" />
      
      {/* STICKY HEADER */}
      <nav className="sticky top-0 z-40 border-b border-blueprint-green bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 border border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all duration-300">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tighter text-primary leading-none">RIMAY_GUIDE</span>
              <span className="text-[8px] opacity-40 tracking-[0.4em]">CULTURAL_UPLINK</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 uppercase tracking-widest text-white/50 text-[10px]">
            <a href="#systems" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="text-primary/30 group-hover:text-primary transition-colors">01.</span> {t('landing.nav.systems')}
            </a>
            <a href="#archive" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="text-primary/30 group-hover:text-primary transition-colors">02.</span> {t('landing.nav.archive')}
            </a>
            <a href="#uplink" className="hover:text-primary transition-colors flex items-center gap-2 group">
              <span className="text-primary/30 group-hover:text-primary transition-colors">03.</span> {t('landing.nav.uplink')}
            </a>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-primary animate-pulse flex items-center gap-2 font-bold tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                SYS.READY
              </span>
              <span className="text-[8px] opacity-30 font-mono">LAT_SYNC: OK</span>
            </div>

            <select
              value={i18n.language.startsWith('es') ? 'es' : 'en'}
              onChange={(e) => {
                i18n.changeLanguage(e.target.value);
                localStorage.setItem('rimay-lang', e.target.value);
              }}
              className="bg-transparent border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-2 outline-none cursor-pointer hover:border-primary/50 hover:text-primary transition-colors appearance-none"
            >
              <option value="es" className="bg-black text-white/80">ES</option>
              <option value="en" className="bg-black text-white/80">EN</option>
            </select>

            <Button 
              variant="default" 
              className="bg-primary text-black font-bold h-10 rounded-none hover:bg-white hover:scale-105 transition-all uppercase px-6 text-xs shadow-[0_0_20px_rgba(230,255,0,0.2)]"
              onClick={() => navigate('/tour')}
            >
              {t('landing.nav.deploy')}
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 pb-32 border-b border-blueprint-green">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(var(--blueprint-green)_1px,transparent_1px),linear-gradient(90deg,var(--blueprint-green)_1px,transparent_1px)] bg-[length:40px_40px]" />
        
        {/* Dynamic Background */}
        <motion.div 
          style={{ opacity: videoOpacity, scale: heroScale }}
          className="absolute right-0 top-0 w-full lg:w-[60%] h-full mix-blend-screen pointer-events-none"
        >
          <video 
            src="https://videos.pexels.com/video-files/34342325/14549107_640_360_30fps.mp4" 
            poster="https://images.pexels.com/videos/34342325/pexels-photo-34342325.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200" 
            autoPlay 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover grayscale brightness-125 contrast-150"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-vantablack via-vantablack/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-vantablack via-transparent to-vantablack" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <motion.div 
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-3 px-4 py-1.5 border border-blueprint-green bg-blueprint-green/20 text-primary font-mono text-[10px] mb-10 uppercase tracking-[0.3em]"
            >
              <Target className="w-4 h-4" /> {t('landing.hero.badge')}
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-6xl lg:text-[100px] font-bold mb-8 tracking-tighter leading-[0.85] uppercase"
            >
              {t('landing.hero.line1')} <br />
              <span className="text-primary drop-shadow-[0_0_30px_rgba(230,255,0,0.3)]">{t('landing.hero.line2')}</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl lg:text-2xl text-white/70 mb-12 max-w-xl leading-relaxed font-body font-light"
            >
              {t('landing.hero.subtitle')}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
              <Button 
                onClick={() => navigate('/tour')}
                className="px-10 py-8 bg-primary text-black font-bold text-xl rounded-none flex items-center gap-4 hover:bg-white transition-all group shadow-[0_0_40px_rgba(230,255,0,0.2)]"
              >
                {t('landing.hero.cta')} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </Button>
              <Button 
                variant="outline"
                className="px-10 py-8 border-white/10 text-white hover:border-primary hover:text-primary rounded-none transition-all font-mono text-sm tracking-[0.2em] bg-white/5 backdrop-blur-sm"
                onClick={() => document.getElementById('systems')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('landing.hero.schematics')}
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* HUD Elements */}
        <div className="absolute bottom-12 right-12 text-right font-mono text-[10px] opacity-30 hidden lg:block uppercase tracking-widest space-y-1">
          <div>MESH_STATUS: OPTIMIZED_92%</div>
          <div>VRAM_USAGE: 18.2MB</div>
          <div>BUILD: 6.3.5_STABLE</div>
        </div>
      </header>

      {/* 01. SYSTEMS - GEOLOCATION */}
      <section id="systems" className="py-32 border-b border-blueprint-green relative overflow-hidden bg-gradient-to-b from-black to-vantablack">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={sectionVariants}
            >
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-10">
                <Satellite className="w-8 h-8" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-10 uppercase tracking-tighter leading-none">
                <span className="text-primary font-mono text-2xl block mb-2 opacity-50">01. {t('landing.nav.systems')}</span>
                {t('landing.systems.heading')}
              </h2>
              <div className="space-y-8 text-white/70">
                <p className="text-xl font-body leading-relaxed">
                  {t('landing.systems.desc')}
                </p>
                <div className="p-8 border-l-4 border-primary bg-primary/5 font-mono text-sm space-y-2 backdrop-blur-sm">
                  <div className="text-primary font-bold tracking-widest flex items-center gap-2">
                    <Navigation className="w-4 h-4" /> {t('landing.systems.metrics')}
                  </div>
                  <div className="opacity-60 flex justify-between uppercase">
                    <span>{t('landing.systems.accuracy')}</span>
                    <span className="text-white">{t('landing.systems.accuracyVal')}</span>
                  </div>
                  <div className="opacity-60 flex justify-between uppercase">
                    <span>{t('landing.systems.frequency')}</span>
                    <span className="text-white">{t('landing.systems.frequencyVal')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -inset-6 border border-blueprint-green opacity-30 group-hover:border-primary/50 transition-colors duration-700" />
              <div className="bg-blueprint-green/10 p-10 relative overflow-hidden backdrop-blur-md">
                <div className="font-mono text-[10px] text-primary/40 mb-6 flex justify-between uppercase tracking-widest">
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> RADAR_SCAN_ACTIVE</span>
                  <span>LAT: -13.5183 / LNG: -71.9772</span>
                </div>
                <div className="aspect-square border border-blueprint-green relative bg-black/60 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(var(--blueprint-green)_1px,transparent_1px),linear-gradient(90deg,var(--blueprint-green)_1px,transparent_1px)] bg-[length:30px_30px]" />
                  
                  {/* Radar Circles */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[80%] h-[80%] border border-primary/5 rounded-full" />
                    <div className="w-[60%] h-[60%] border border-primary/10 rounded-full" />
                    <div className="w-[40%] h-[40%] border border-primary/20 rounded-full" />
                  </div>

                  <div className="relative w-64 h-64 flex items-center justify-center">
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 border-2 border-primary rounded-full" 
                    />
                    <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_30px_#E6FF00] relative z-10" />
                  </div>
                  
                  <div className="absolute bottom-6 left-6 font-mono text-[10px] text-white/50 uppercase tracking-widest bg-black/40 px-3 py-1.5 border border-white/5">
                    TARGET_LOCKED: SACSAYHUAMÁN_FORTRESS
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 02. ARCHIVE - 3D REPOSITORY */}
      <section id="archive" className="py-32 bg-black relative border-b border-blueprint-green">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              className="relative order-2 lg:order-1 group"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative overflow-hidden border border-blueprint-green bg-black">
                <img 
                  src="https://images.unsplash.com/photo-1767610754994-59081923bbb1?auto=format&w=1200&q=80&fit=crop" 
                  className="w-full h-[500px] object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
                  alt="3D Archaeological Site View" 
                />
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(var(--blueprint-green)_1px,transparent_1px),linear-gradient(90deg,var(--blueprint-green)_1px,transparent_1px)] bg-[length:32px_32px]" />
                
                {/* HUD Data Overlays */}
                <div className="absolute top-6 left-6 font-mono text-[10px] bg-black/80 px-4 py-2 border border-blueprint-green uppercase tracking-widest text-primary font-bold">
                  [ ARCHIVE_VIEW_ACTIVE: QORICANCHA_TEMPLE ]
                </div>
                <div className="absolute bottom-6 right-6 font-mono text-[9px] text-white/40 text-right uppercase tracking-[0.2em] space-y-1">
                   <div>VERTICES: 947,211</div>
                   <div>NORMALS: CALC_OK</div>
                   <div>TEXTURE_MODE: BUMP_PROCEDURAL</div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="order-1 lg:order-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-10">
                <Box className="w-8 h-8" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-10 uppercase tracking-tighter leading-none">
                <span className="text-primary font-mono text-2xl block mb-2 opacity-50">02. {t('landing.nav.archive')}</span>
                {t('landing.archive.heading')}
              </h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed font-body">
                {t('landing.archive.desc')}
              </p>
              
              <div className="grid grid-cols-1 gap-6">
                {[
                  { icon: Layers, title: t('landing.archive.feature1.title'), desc: t('landing.archive.feature1.desc') },
                  { icon: MapIcon, title: t('landing.archive.feature2.title'), desc: t('landing.archive.feature2.desc') },
                  { icon: Globe, title: t('landing.archive.feature3.title'), desc: t('landing.archive.feature3.desc') }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-12 h-12 shrink-0 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary/60 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm font-bold uppercase tracking-widest text-white/90">{feature.title}</h4>
                      <p className="text-sm text-white/40 font-body">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 03. UPLINK - HYBRID AI */}
      <section id="uplink" className="py-32 border-b border-blueprint-green relative overflow-hidden bg-gradient-to-t from-black to-vantablack">
        {/* Millimeter Grid Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(rgba(26,51,0,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(26,51,0,0.4)_1px,transparent_1px)] bg-[length:10px_10px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              className="bg-black/90 border border-blueprint-green shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative group overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="px-6 py-4 border-b border-blueprint-green flex items-center justify-between bg-blueprint-green/10">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                </div>
                <span className="font-mono text-[9px] text-white/40 tracking-[0.4em] uppercase">HYBRID_CHAT_SYNTHESIS_V1.2</span>
              </div>
              
              <div className="p-10 font-mono text-sm space-y-8 min-h-[350px]">
                <div className="flex gap-4">
                  <span className="text-primary font-bold shrink-0">[USER]:</span>
                  <span className="text-white/80 font-light">{t('landing.uplink.chat.user')}</span>
                </div>
                
                <div className="flex gap-4">
                  <span className="text-white/40 shrink-0 font-bold">[SYS]:</span>
                  <span className="text-white/30 italic">{t('landing.uplink.chat.sys')}</span>
                </div>

                <div className="flex gap-4">
                  <span className="text-primary font-bold shrink-0">[RIMAY]:</span>
                  <div className="text-white/90 border-l-2 border-primary/20 pl-6 py-1 leading-relaxed font-light">
                    {t('landing.uplink.chat.rimay')}
                    <motion.span 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-2.5 h-5 bg-primary align-middle ml-2" 
                    />
                  </div>
                </div>
                
                <div className="pt-10 border-t border-white/5 flex items-center gap-6 text-[9px] text-white/30 tracking-widest uppercase">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    CLOUDLINK_ESTABLISHED
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    FUSE.JS_STANDBY
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={sectionVariants}
            >
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-10">
                <Terminal className="w-8 h-8" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-10 uppercase tracking-tighter leading-none">
                <span className="text-primary font-mono text-2xl block mb-2 opacity-50">03. {t('landing.nav.uplink')}</span>
                {t('landing.uplink.heading')}
              </h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed font-body">
                {t('landing.uplink.desc')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 border border-blueprint-green bg-blueprint-green/5 group hover:border-primary transition-all duration-500 backdrop-blur-sm">
                  <div className="text-primary font-mono text-[10px] mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Database className="w-4 h-4" /> Cloud_Link
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-tight mb-2">{t('landing.uplink.card1.title')}</h4>
                  <p className="text-xs text-white/40 leading-relaxed font-body">{t('landing.uplink.card1.desc')}</p>
                </div>
                
                <div className="p-6 border border-blueprint-green bg-blueprint-green/5 group hover:border-primary transition-all duration-500 backdrop-blur-sm">
                  <div className="text-primary font-mono text-[10px] mb-4 uppercase tracking-[0.3em] flex items-center gap-3">
                    <Cpu className="w-4 h-4" /> Intelligence
                  </div>
                  <h4 className="text-lg font-bold uppercase tracking-tight mb-2">{t('landing.uplink.card2.title')}</h4>
                  <p className="text-xs text-white/40 leading-relaxed font-body">{t('landing.uplink.card2.desc')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - SECURE ACCESS */}
      <section className="py-40 relative bg-vantablack">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            className="bg-vantablack border-2 border-primary/20 relative p-12 lg:p-24 overflow-hidden shadow-[0_0_80px_rgba(230,255,0,0.05)]"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary" />
            
            <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />
            
            <div className="text-center mb-16">
              <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-primary font-mono text-sm tracking-[0.5em] uppercase mb-8"
              >
                {t('landing.cta.badge')}
              </motion.div>
              <h2 className="text-5xl lg:text-[80px] font-bold mb-10 uppercase tracking-tighter leading-[0.9] text-white">
                {t('landing.cta.line1')} <br />
                <span className="text-primary">{t('landing.cta.line2')}</span>
              </h2>
              <p className="text-xl text-white/60 mb-14 max-w-2xl mx-auto font-body font-light">
                {t('landing.cta.subtitle')}
              </p>
              
              <div className="flex flex-col items-center gap-10">
                <Button 
                  onClick={() => navigate('/tour')}
                  className="relative px-16 py-10 bg-transparent border-2 border-primary text-primary font-bold text-3xl tracking-[0.2em] hover:bg-primary hover:text-black transition-all duration-500 group rounded-none shadow-[0_0_50px_rgba(230,255,0,0.1)] hover:shadow-[0_0_60px_rgba(230,255,0,0.3)]"
                >
                  <span className="relative z-10 uppercase">{t('landing.cta.button')}</span>
                  <div className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                </Button>
                
                <div className="flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity duration-500">
                   <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em]">
                       <ShieldCheck className="w-5 h-5 text-primary" /> {t('landing.cta.tagline')}
                    </div>
                    <span className="text-[10px] font-mono opacity-50 uppercase tracking-[0.4em]">{t('landing.cta.subtag')}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 pt-16 border-t border-white/5">
              {[
                { label: t('landing.metrics.cache'), val: t('landing.metrics.cacheVal'), sub: t('landing.metrics.cacheSub') },
                { label: t('landing.metrics.roaming'), val: t('landing.metrics.roamingVal'), sub: t('landing.metrics.roamingSub') },
                { label: t('landing.metrics.pois'), val: t('landing.metrics.poisVal'), sub: t('landing.metrics.poisSub') },
                { label: t('landing.metrics.sync'), val: t('landing.metrics.syncVal'), sub: t('landing.metrics.syncSub') }
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="text-[8px] font-mono text-white/30 uppercase tracking-[0.3em] mb-2">{m.label}</div>
                  <div className="text-2xl font-bold text-primary mb-1 tracking-tight">{m.val}</div>
                  <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{m.sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-blueprint-green bg-black relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-12 mb-20">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <MapIcon className="w-6 h-6" />
               </div>
               <span className="text-2xl font-bold tracking-tighter uppercase text-primary">Rimay Guide</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-10 lg:gap-16 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              <a href="#systems" className="hover:text-primary transition-colors hover:translate-y-[-2px]">{t('landing.footer.protocols')}</a>
              <a href="#uplink" className="hover:text-primary transition-colors hover:translate-y-[-2px]">{t('landing.footer.intelligence')}</a>
              <a href="#archive" className="hover:text-primary transition-colors hover:translate-y-[-2px]">{t('landing.footer.coordinates')}</a>
              <button type="button" onClick={() => navigate('/tour')} className="hover:text-primary transition-colors hover:translate-y-[-2px]">{t('landing.footer.terminal')}</button>
            </div>

            <div className="flex gap-8">
              {[Github, Twitter, MessageSquare].map((Icon, i) => (
                <Icon key={i} className="w-5 h-5 text-white/20" />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center font-mono text-[10px] opacity-20 uppercase tracking-[0.4em] border-t border-white/5 pt-12 space-y-6 md:space-y-0">
            <div className="flex items-center gap-8">
              <span>{t('landing.footer.copyright')}</span>
              <span className="hidden md:inline">|</span>
              <span>{t('landing.footer.encryption')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t('landing.footer.connection')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
