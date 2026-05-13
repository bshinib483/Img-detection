"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import Link from "next/link";

const FRAME_COUNT = 240;

export default function Scrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Refs for manual DOM updates to completely bypass any Next.js Turbopack interpolation bugs
  const introRef = useRef<HTMLDivElement>(null);
  const engineeringRef = useRef<HTMLDivElement>(null);
  const radarRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Preload frames
  useEffect(() => {
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const paddedIndex = i.toString().padStart(3, "0");
      img.src = `/frames/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        loadedCount++;
        setImagesLoaded(loadedCount);
      };
      loadedImages.push(img);
    }
    setImages(loadedImages);
  }, []);

  // Canvas Drawing
  const drawImage = (frameIndex: number) => {
    if (!canvasRef.current || images.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = images[frameIndex];
    if (!img || !img.complete) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    // Set actual size in memory (scaled to account for extra pixel density)
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Normalize coordinate system to use CSS pixels
    ctx.scale(dpr, dpr);

    // Cinematic scaling (fully visible but covers well)
    const scale = Math.min(width / img.width, height / img.height) * 1.3;

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;

    let offsetX = (width - drawWidth) / 2;
    let offsetY = (height - drawHeight) / 2;

    // Shift aircraft right (+15%) and down (+5%) to balance left-aligned text
    offsetX += width * 0.15;
    offsetY += height * 0.05;

    // Deep black tactical void background matching the images
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };


  // STRICT SCROLL CHOREOGRAPHY (GUARANTEED NO OVERLAPPING)
  // Intro: 0.00 -> 0.14
  const introOpacity = useTransform(scrollYProgress, [0, 0.10, 0.12, 0.14], [1, 1, 0, 0]);
  const introY = useTransform(scrollYProgress, [0.10, 0.14], [0, -40]);

  // Engineering Reveal: 0.18 -> 0.38
  const engineeringOpacity = useTransform(scrollYProgress, [0.18, 0.21, 0.35, 0.38], [0, 1, 1, 0]);
  const engineeringY = useTransform(scrollYProgress, [0.18, 0.21, 0.35, 0.38], [40, 0, 0, -40]);

  // Radar & Threat Detection: 0.42 -> 0.62
  const radarOpacity = useTransform(scrollYProgress, [0.42, 0.45, 0.59, 0.62], [0, 1, 1, 0]);
  const radarY = useTransform(scrollYProgress, [0.42, 0.45, 0.59, 0.62], [40, 0, 0, -40]);

  // AI Tactical Processing: 0.66 -> 0.86
  const aiOpacity = useTransform(scrollYProgress, [0.66, 0.69, 0.83, 0.86], [0, 1, 1, 0]);
  const aiY = useTransform(scrollYProgress, [0.66, 0.69, 0.83, 0.86], [40, 0, 0, -40]);

  // Reassembly & CTA: 0.90 -> 1.00
  const endOpacity = useTransform(scrollYProgress, [0.90, 0.93, 1, 1], [0, 1, 1, 1]);
  const endY = useTransform(scrollYProgress, [0.90, 0.93], [40, 0]);

  // Canvas Parallax
  const canvasY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  // Apply absolute manual DOM updates every scroll tick to bypass any framework bugs
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const currentFrame = Math.min(
      Math.floor(latest * (FRAME_COUNT - 1)),
      FRAME_COUNT - 1
    );
    requestAnimationFrame(() => drawImage(currentFrame));

    // Manual style overrides
    if (canvasContainerRef.current) {
      canvasContainerRef.current.style.transform = `translateY(${canvasY.get()}px)`;
    }

    // Force display updates based on opacity to completely ensure no ghosting layers
    const updateElement = (ref: React.RefObject<HTMLDivElement | null>, opacityVal: number, yVal: number) => {
      if (ref.current) {
        ref.current.style.opacity = opacityVal.toString();
        ref.current.style.transform = `translateY(${yVal}px)`;
        // If it's completely invisible, remove it from rendering entirely
        ref.current.style.visibility = opacityVal > 0.01 ? "visible" : "hidden";
      }
    };

    updateElement(introRef, introOpacity.get(), introY.get());
    updateElement(engineeringRef, engineeringOpacity.get(), engineeringY.get());
    updateElement(radarRef, radarOpacity.get(), radarY.get());
    updateElement(aiRef, aiOpacity.get(), aiY.get());
    updateElement(endRef, endOpacity.get(), endY.get());
  });

  useEffect(() => {
    if (imagesLoaded > 0) {
      drawImage(Math.min(Math.floor(scrollYProgress.get() * (FRAME_COUNT - 1)), FRAME_COUNT - 1));

      // Initialize states
      if (introRef.current) introRef.current.style.opacity = "1";
      if (engineeringRef.current) engineeringRef.current.style.opacity = "0";
      if (radarRef.current) radarRef.current.style.opacity = "0";
      if (aiRef.current) aiRef.current.style.opacity = "0";
      if (endRef.current) endRef.current.style.opacity = "0";
    }
    const handleResize = () => drawImage(Math.min(Math.floor(scrollYProgress.get() * (FRAME_COUNT - 1)), FRAME_COUNT - 1));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded, scrollYProgress]);


  return (
    <div ref={containerRef} className="relative h-[400vh] bg-[#050505] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">

        {imagesLoaded < FRAME_COUNT && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]">
            <div className="text-white/60 mb-4 tracking-widest text-sm font-medium animate-pulse">INITIALIZING OPTICS</div>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-electric-cyan transition-all duration-300 shadow-[0_0_10px_rgba(0,214,255,0.8)]"
                style={{ width: `${(imagesLoaded / FRAME_COUNT) * 100}%` }}
              />
            </div>
            <div className="text-white/40 mt-2 text-xs">{Math.round((imagesLoaded / FRAME_COUNT) * 100)}%</div>
          </div>
        )}

        {/* Dynamic Canvas */}
        <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* --- Cinematic Overlays & Depth Gradients --- */}
        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 bg-gradient-to-tr from-tactical-blue/50 via-transparent to-orange-400/10" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#050505]/80 via-transparent to-[#050505]/95" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(5,5,5,0.9)_110%)]" />


        {/* --- STORYTELLING SECTIONS --- */}

        {/* 1. Hero Intro (Left) */}
        <div
          ref={introRef}
          className="absolute inset-0 flex flex-col justify-center items-start pl-[5%] md:pl-[8%] pointer-events-none opacity-0 invisible"
        >
          <div className="w-full max-w-[600px] text-left mt-[10vh]">
            <h1 className="text-[2.5rem] md:text-[4rem] lg:text-[5rem] leading-[0.95] tracking-tight font-bold text-white mb-6 drop-shadow-2xl">
              Neural Aircraft Recognition Platform
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-4 font-medium max-w-[450px] leading-snug">
              Identify targets instantly.
            </p>
            <p className="text-sm md:text-base text-white/50 max-w-[450px] leading-relaxed font-light">
              Next-generation computer vision engineered for modern intelligence operations. YOLO object detection merged with Gemini AI telemetry.
            </p>
          </div>
        </div>

        {/* 2. Engineering Reveal (Left) */}
        <div
          ref={engineeringRef}
          className="absolute inset-0 flex flex-col justify-center items-start pl-[5%] md:pl-[8%] pointer-events-none opacity-0 invisible"
        >
          <div className="w-full max-w-[420px] bg-[#0A0A0C]/70 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative">
            <h2 className="text-2xl font-bold text-white mb-5 tracking-tight">Precision computer vision.</h2>
            <p className="text-white/60 mb-5 leading-relaxed font-light text-sm">
              Custom-trained YOLO models and EfficientNet classifiers deliver sub-second aircraft identification from raw imagery.
            </p>
            <p className="text-white/40 text-xs tracking-wide leading-relaxed">
              Optimized for high-confidence tactical classification and rapid response.
            </p>
          </div>
        </div>

        {/* 3. Radar & Threat Detection (Right) */}
        <div
          ref={radarRef}
          className="absolute inset-0 flex flex-col justify-center items-end pr-[5%] md:pr-[8%] pointer-events-none opacity-0 invisible"
        >
          <div className="w-full max-w-[420px] bg-[#0A0A0C]/70 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-left">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Automated visual acquisition.</h2>
            <ul className="text-white/60 space-y-5 font-light text-sm">
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-radar-green shadow-[0_0_10px_rgba(0,255,178,1)] flex-shrink-0" />
                <span className="leading-relaxed">Deep learning architectures instantly scan uploaded imagery, drawing precise bounding boxes around detected incursions.</span>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-radar-green shadow-[0_0_10px_rgba(0,255,178,1)] flex-shrink-0" />
                <span className="leading-relaxed">The neural network adapts dynamically to varying resolutions, angles, and stealth profiles.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. AI & Tactical Processing (Left) */}
        <div
          ref={aiRef}
          className="absolute inset-0 flex flex-col justify-center items-start pl-[5%] md:pl-[8%] pointer-events-none opacity-0 invisible"
        >
          <div className="w-full max-w-[420px] bg-[#0A0A0C]/70 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-tactical-blue/10 blur-[50px] -ml-16 -mt-16 rounded-full" />
            <h2 className="text-2xl font-bold text-white mb-5 relative z-10 tracking-tight">Gemini-powered intelligence.</h2>
            <p className="text-white/60 mb-5 relative z-10 leading-relaxed font-light text-sm">
              The system connects classifications instantly to the global Gemini intelligence grid for immediate technical telemetry retrieval.
            </p>
            <p className="text-white/40 text-xs relative z-10 tracking-wide leading-relaxed">
              Generative AI engineered to provide comprehensive tactical dossiers on acquired targets.
            </p>
          </div>
        </div>

        {/* 5. Reassembly & CTA (Center) */}
        <div
          ref={endRef}
          className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none text-center px-4 opacity-0 invisible"
        >
          <div className="w-full max-w-3xl flex flex-col items-center pointer-events-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 drop-shadow-lg">
              Total control of intelligence.
            </h2>
            <p className="text-lg md:text-xl text-white/70 mb-10 font-light max-w-xl">
              Engineered for deep data retrieval. Built for absolute awareness.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 mb-8">
              <Link href="/analyze" className="px-8 py-3.5 bg-tactical-blue hover:bg-tactical-blue/90 text-white text-sm font-medium rounded-full transition-all duration-300 shadow-[0_0_30px_rgba(0,80,255,0.4)] cursor-pointer">
                Aircraft Recognition System.
              </Link>
              {/*  <button className="px-8 py-3.5 bg-[#0A0A0C]/80 hover:bg-white/10 text-white text-sm border border-white/20 font-medium rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer">
                View Technical Specifications
              </button> */}
            </div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase font-mono">
              {/* Designed for airbases, border security, and strategic defence operations. */}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
