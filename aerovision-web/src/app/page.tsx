import Navbar from "@/components/Navbar";
import Scrollytelling from "@/components/Scrollytelling";

export default function Home() {
  return (
    <main className="bg-[#050505] min-h-screen text-white selection:bg-electric-cyan/30">
      <Navbar />

      {/* 
        The Scrollytelling component takes up 400vh and pins the canvas for an immersive
        hardware-accelerated 3D image sequence.
      */}
      <Scrollytelling />

      {/* 
        A cinematic hardware-style tech specs section demonstrating Apple-level 
        clean typography and layout after the scrollytelling ends.
      */}
      <section id="technology" className="min-h-screen bg-[#0A0A0C] flex flex-col items-center justify-center border-t border-white/5 relative overflow-hidden py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-tactical-blue/5 via-[#0A0A0C] to-[#0A0A0C] pointer-events-none" />

        <div className="max-w-5xl w-full px-8 relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">Identify Any Aircraft. Instantly.</h2>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto font-medium text-balance">
              We combine modern web development with powerful AI to detect targets and stream their data in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-tactical-blue/20 flex items-center justify-center mb-6 text-tactical-blue font-bold group-hover:scale-110 transition-transform duration-500">
                01
              </div>
              <h3 className="text-2xl font-bold mb-3">Dual-Model Vision</h3>
              <p className="text-white/50 leading-relaxed text-balance">
                We chain two neural networks for maximum accuracy. YOLOv8 isolates the aircraft via bounding boxes, while a PyTorch EfficientNet classifier identifies the exact model from the cropped tensor.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-electric-cyan/20 flex items-center justify-center mb-6 text-electric-cyan font-bold group-hover:scale-110 transition-transform duration-500">
                02
              </div>
              <h3 className="text-2xl font-bold mb-3">Dynamic Gemini API</h3>
              <p className="text-white/50 leading-relaxed text-balance">
                Instead of hardcoding a massive database, we integrated the Gemini API. The backend dynamically prompts the LLM to fetch and parse structured JSON telemetry for the identified aircraft in real-time.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors duration-500 group flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-radar-green/20 flex items-center justify-center mb-6 text-radar-green font-bold group-hover:scale-110 transition-transform duration-500">
                03
              </div>
              <h3 className="text-2xl font-bold mb-3">High-Performance Stack</h3>
              <p className="text-white/50 leading-relaxed text-balance">
                Built for speed. A React/Next.js frontend handles state and hardware-accelerated animations, seamlessly interfacing with a Python/FastAPI backend that manages OpenCV image processing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-[#050505] border-t border-white/10 flex flex-col items-center justify-center relative">
        <p className="text-white/60 font-bold tracking-[0.2em] mb-4 text-sm">ADF-X © {new Date().getFullYear()}</p>
        <p className="text-white/30 text-xs tracking-widest font-mono">RESTRICTED CLASSIFICATION — AUTHORIZED PERSONNEL ONLY</p>
      </footer>
    </main>
  );
}
