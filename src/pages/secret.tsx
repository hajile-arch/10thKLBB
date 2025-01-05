import { useState, useEffect } from 'react';
import {
  Skull,
  Eye,
  EyeOff,
  Binary,
  Shield,
  KeyRound,
  Scan,
  Radar,
  Crosshair,
  Wifi,
} from 'lucide-react';

export default function SecretPage() {
  const [phase, setPhase] = useState(0);
  const [code, setCode] = useState('');
  const [scanningEffect, setScanningEffect] = useState(false);

  // Update code on interval for dynamic effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCode(Math.random().toString(2).substring(2, 10));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Handle scanning effect timeout
  useEffect(() => {
    if (scanningEffect) {
      const timeout = setTimeout(() => setScanningEffect(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [scanningEffect]);

  // Auto-close effect for phase 4
  useEffect(() => {
    if (phase === 4) {
      setTimeout(() => {
        try {
          // Attempt to navigate to a blank page and simulate closing the tab
          window.open("about:blank", "_self"); // Opens a blank page in the same tab
          window.close(); // Attempts to close the window (it will fail in most browsers)

          // Fallback for browsers that prevent window.close()
          document.body.innerHTML = `
            <div style="
              background: black;
              color: #22c55e;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
            ">
              Connection terminated.
            </div>`;
        } catch (error) {
          console.error("Unable to close the tab:", error);

          // Fallback: display the exit message if `window.close()` fails
          document.body.innerHTML = `
            <div style="
              background: black;
              color: #22c55e;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: monospace;
            ">
              Connection terminated.
            </div>`;
        }
      }, 3000); // Adjust the delay as needed
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono relative">
      <style>
        {`
          @keyframes scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          .animate-scan {
            animation: scan 2s linear infinite;
          }
          .glitch-text {
            text-shadow: 
              2px 2px rgba(255, 0, 0, 0.12),
              -2px -2px rgba(0, 0, 255, 0.12);
          }
          @keyframes fadeOut {
            to { opacity: 0; }
          }
          .fade-out {
            animation: fadeOut 2s forwards;
          }
        `}
      </style>

      <div className="max-w-2xl mx-auto">
        {scanningEffect && (
          <div className="fixed inset-0 bg-green-500/5 animate-pulse">
            <div className="absolute inset-0 border-2 border-green-500/20 animate-scan" />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <code>LEVEL {phase}/5</code>
          </div>
          <div className="flex items-center gap-4">
            <Binary className="w-6 h-6 animate-pulse" />
            <code>{code}</code>
          </div>
        </div>

        <div className="border border-green-500/20 rounded-lg p-8 bg-black/50 backdrop-blur">
          <div className="text-center space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Radar className="animate-spin" />
              <Scan className="animate-pulse" />
              <Wifi className="animate-ping" />
            </div>

            <h1 className="text-4xl font-bold mb-4 glitch-text">
              CLASSIFIED DATABASE
            </h1>

            <div className="flex justify-center space-x-4 mb-8">
              {Array(5).fill(0).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i <= phase ? 'bg-green-500' : 'bg-green-500/20'}`}
                />
              ))}
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="ENTER ACCESS CODE"
                className="w-full bg-black border border-green-500/30 rounded px-4 py-2 text-center text-green-500 placeholder-green-500/50"
                onChange={(e) => {
                  if (e.target.value === '1337') {
                    setScanningEffect(true);
                    setTimeout(() => setPhase((prev) => Math.min(prev + 1, 4)), 2000);
                    e.target.value = '';
                  }
                }}
              />
              <KeyRound className="absolute right-3 top-2.5 w-5 h-5 text-green-500/50" />
            </div>

            <div className="flex justify-center gap-6 mt-8">
              <Eye className="w-6 h-6 animate-pulse" />
              <Crosshair className="w-6 h-6 animate-ping" />
              <EyeOff className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center text-green-500/50">
          <code>Terminal://SecureAccess_v1.33.7</code>
          <Skull className="w-6 h-6" />
        </div>

        {phase === 4 && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="text-center space-y-4 fade-out">
              <h2 className="text-3xl font-bold text-green-500 glitch-text">ACCESS GRANTED</h2>
              <p className="text-green-500/70">Welcome to the void...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
