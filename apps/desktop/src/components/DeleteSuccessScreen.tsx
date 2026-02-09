import { exit, relaunch } from '@tauri-apps/plugin-process';
import { CheckCircle, LogOut, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export function DeleteSuccessScreen() {
  const [isRestarting, setIsRestarting] = useState(false);
  const [isQuitting, setIsQuitting] = useState(false);
  const restartButtonRef = useRef<HTMLButtonElement>(null);

  // Focus the primary action button on mount for accessibility
  useEffect(() => {
    restartButtonRef.current?.focus();
  }, []);

  const handleRestart = useCallback(async () => {
    setIsRestarting(true);
    try {
      await relaunch();
    } catch (err) {
      console.error('Failed to restart:', err);
      setIsRestarting(false);
    }
  }, []);

  const handleQuit = useCallback(async () => {
    setIsQuitting(true);
    try {
      await exit(0);
    } catch (err) {
      console.error('Failed to quit:', err);
      setIsQuitting(false);
    }
  }, []);

  const isDisabled = isRestarting || isQuitting;

  return (
    <main
      className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-[#fafafa] antialiased"
      role="main"
      aria-labelledby="delete-success-title"
    >
      <div className="flex flex-col items-center space-y-6 max-w-md px-8 text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
          <CheckCircle className="w-8 h-8 text-emerald-400" aria-hidden="true" />
        </div>

        {/* Heading */}
        <h1 id="delete-success-title" className="text-[22px] font-semibold text-white">
          All data deleted
        </h1>

        {/* Description */}
        <p className="text-[14px] text-white/50 leading-relaxed">
          Your API key, Node.js runtime, and settings have been removed. Choose what to do next:
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full mt-4">
          <button
            ref={restartButtonRef}
            type="button"
            onClick={handleRestart}
            disabled={isDisabled}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium text-[15px] hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            <RotateCcw
              className={`w-4 h-4 ${isRestarting ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            {isRestarting ? 'Restarting...' : 'Restart App'}
          </button>

          <button
            type="button"
            onClick={handleQuit}
            disabled={isDisabled}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white/70 font-medium text-[15px] hover:bg-white/[0.08] hover:text-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
          >
            <LogOut
              className={`w-4 h-4 ${isQuitting ? 'animate-pulse' : ''}`}
              aria-hidden="true"
            />
            {isQuitting ? 'Quitting...' : 'Quit'}
          </button>
        </div>

        {/* Helper text */}
        <p className="text-[12px] text-white/30 mt-4">
          Restart to set up fresh, or quit if you're uninstalling.
        </p>
      </div>
    </main>
  );
}
