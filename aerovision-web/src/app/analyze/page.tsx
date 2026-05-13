"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, UploadCloud, ScanLine, Crosshair, Shield, Activity, Database } from "lucide-react";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 'idle' -> 'predicting' -> 'fetching_intel' -> 'complete'
  const [stage, setStage] = useState<'idle' | 'predicting' | 'fetching_intel' | 'complete'>('idle');
  
  const [prediction, setPrediction] = useState<any>(null);
  const [intel, setIntel] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setPrediction(null);
    setIntel(null);
    setStage('idle');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStage('predicting');
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 1. Send image to FastAPI (predict.py wrapper)
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setPrediction(data);

      // Render the image with bounding boxes drawn by the backend
      if (data.image_base64) {
        setPreview(`data:image/jpeg;base64,${data.image_base64}`);
      }

      // 2. Fetch Deep Intelligence from Gemini API
      setStage('fetching_intel');
      const intelResponse = await fetch("/api/intel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelName: data.model }),
      });
      const intelData = await intelResponse.json();
      setIntel(intelData);
      
      setStage('complete');

    } catch (error) {
      console.error("Error analyzing image:", error);
      // Fallback
      setStage('complete');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setPrediction(null);
    setIntel(null);
    setPreview(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 md:px-12 flex flex-col relative overflow-hidden selection:bg-electric-cyan/30">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-tactical-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-electric-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mx-auto flex items-center justify-between mb-16 relative z-10"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Target Intelligence Dashboard</h1>
          <p className="text-white/50 text-sm md:text-base font-light">Upload intel for real-time AI identification and telemetry retrieval.</p>
        </div>
        <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={16} />
          Back to Hangar
        </Link>
      </motion.div>

      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col lg:flex-row gap-12 relative z-10 pb-20">
        
        {/* Left Side: Upload / Preview */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {!preview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all duration-500 bg-[#0A0A0C]/50 backdrop-blur-xl ${
                isDragging ? "border-electric-cyan bg-electric-cyan/5 shadow-[0_0_30px_rgba(0,214,255,0.15)]" : "border-white/10 hover:border-white/30 hover:bg-white/5"
              }`}
            >
              <UploadCloud size={48} className={`mb-6 transition-colors duration-300 ${isDragging ? "text-electric-cyan" : "text-white/40"}`} />
              <h3 className="text-xl font-medium mb-2">Initialize Sensor Scan</h3>
              <p className="text-white/40 text-sm mb-6 max-w-[250px] text-center font-light leading-relaxed">Drag and drop aerial imagery, or click to browse local files.</p>
              <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/80 transition-all hover:bg-white/10">Select File</span>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
          ) : (
            <div className={`relative flex-1 min-h-[400px] rounded-3xl overflow-hidden border ${stage === 'complete' ? 'border-electric-cyan/30 shadow-[0_0_50px_rgba(0,214,255,0.1)] bg-[#050505]' : 'border-white/10 bg-[#0A0A0C]/50'} backdrop-blur-xl flex items-center justify-center group p-8 transition-all duration-700`}>
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={preview} alt="Upload preview" className="w-full h-full object-contain rounded-lg opacity-90 shadow-2xl" />
                
                {/* Scanning Animation */}
                {(stage === 'predicting' || stage === 'fetching_intel') && (
                  <>
                    <div className="absolute inset-0 bg-tactical-blue/10 mix-blend-overlay rounded-lg" />
                    <motion.div 
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-electric-cyan shadow-[0_0_20px_2px_rgba(0,214,255,0.8)] z-20"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-30">
                      <div className="bg-[#050505]/80 backdrop-blur-md border border-electric-cyan/30 px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(0,214,255,0.2)]">
                        <ScanLine size={18} className="text-electric-cyan animate-pulse" />
                        <span className="text-electric-cyan text-sm tracking-widest font-mono">
                          {stage === 'predicting' ? 'DETECTING AIRCRAFT...' : 'UPLINKING DATABASE...'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {stage === 'idle' && (
                <div className="absolute bottom-8 flex gap-4 z-20">
                  <button onClick={handleReset} className="px-6 py-2.5 bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white text-sm font-medium rounded-full transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button onClick={handleAnalyze} className="px-6 py-2.5 bg-tactical-blue hover:bg-tactical-blue/80 text-white text-sm font-medium rounded-full shadow-[0_0_20px_rgba(0,80,255,0.4)] transition-all flex items-center gap-2 cursor-pointer">
                    <Crosshair size={16} />
                    Run Diagnostics
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Right Side: Target Intelligence Dashboard */}
        <div className="w-full lg:w-[420px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {stage === 'idle' || stage === 'predicting' ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col justify-center opacity-40 px-4"
              >
                <Shield size={32} className="text-white/20 mb-6" />
                <h3 className="text-xl font-medium mb-3 text-white/60">Awaiting Telemetry</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">
                  System is standing by. Upload imagery to engage the neural network and retrieve aircraft specifications.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0A0A0C]/70 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-electric-cyan/10 blur-[60px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Activity size={18} className="text-electric-cyan animate-pulse" />
                    <span className="text-[11px] font-mono tracking-[0.25em] text-electric-cyan uppercase font-semibold">Target Acquired</span>
                  </div>
                  {prediction?.confidence && (
                     <span className="text-[10px] font-mono tracking-widest text-white/30 border border-white/10 px-2 py-1 rounded">MATCH: {(prediction.confidence * 100).toFixed(1)}%</span>
                  )}
                </div>

                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{prediction?.model}</h2>
                
                {stage === 'fetching_intel' && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 opacity-60">
                    <Database className="animate-pulse mb-5 text-electric-cyan" size={28} />
                    <p className="text-[11px] font-mono tracking-[0.2em] text-electric-cyan uppercase">Retrieving classified telemetry...</p>
                  </div>
                )}

                {stage === 'complete' && intel && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-5"
                  >
                    <p className="text-white/50 text-sm mb-6 font-medium">{intel.purpose}</p>

                    {/* Origin Profile */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-2 font-mono">Origin Profile</p>
                      <p className="text-xs text-white/70 leading-relaxed font-light">{intel.history}</p>
                    </div>

                    {/* Technical Specs Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {intel.specs?.map((spec: any, idx: number) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 transition-all hover:bg-white/10">
                          <p className="text-[9px] uppercase tracking-wider text-white/40 mb-1.5 font-mono">{spec.label}</p>
                          <p className="text-[13px] text-electric-cyan font-medium">{spec.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* System Capabilities */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all hover:bg-white/10">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3 font-mono">System Capabilities</p>
                      <ul className="space-y-2.5">
                        {intel.relevantInfo?.map((info: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="w-1 h-1 mt-1.5 rounded-full bg-electric-cyan/70 shadow-[0_0_5px_rgba(0,214,255,0.5)] flex-shrink-0" />
                            <span className="text-xs text-white/70 font-light leading-relaxed">{info}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}

                {stage === 'complete' && (
                  <button 
                    onClick={handleReset}
                    className="w-full mt-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-all duration-300 text-white/80 hover:text-white cursor-pointer"
                  >
                    Clear Dashboard
                  </button>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
