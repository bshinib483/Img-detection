"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 transition-all duration-700 ${
        scrolled 
          ? "bg-[#050505]/40 backdrop-blur-xl border-b border-white/5 shadow-2xl" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-white font-bold tracking-widest text-lg drop-shadow-md">ADF-X</span>
      </div>
      
      <div className="hidden md:flex space-x-10 text-[13px] font-medium tracking-wide text-white/60">
        <Link href="#overview" className="hover:text-white transition-colors duration-300">Platform</Link>
        <Link href="#technology" className="hover:text-white transition-colors duration-300">Computer Vision</Link>
        <Link href="#detection" className="hover:text-white transition-colors duration-300">Neural Architecture</Link>
        <Link href="#threat" className="hover:text-white transition-colors duration-300">Gemini AI</Link>
        <Link href="#specs" className="hover:text-white transition-colors duration-300">Model Specs</Link>
      </div>

      <div className="flex items-center">
        <button className="relative overflow-hidden rounded-full p-[1px] focus:outline-none group">
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#0050FF_0%,#00D6FF_50%,#0050FF_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Link href="/analyze" className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white/5 border border-white/10 px-6 py-2 text-[13px] font-medium text-white backdrop-blur-3xl group-hover:bg-[#050505]/60 group-hover:border-transparent transition-all duration-500">
            Launch Detection Interface
          </Link>
        </button>
      </div>
    </nav>
  );
}
