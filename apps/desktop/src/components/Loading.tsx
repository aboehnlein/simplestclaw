import { AlertCircle, Check, Download, Loader2 } from 'lucide-react';
import { useAppStore } from '../lib/store';

export function Loading() {
  const { runtimeStatus } = useAppStore();

  const getStatusContent = () => {
    switch (runtimeStatus.type) {
      case 'checking':
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin text-white/40" />,
          text: 'Checking system...',
          subtext: null,
        };
      case 'downloading':
        return {
          icon: <Download className="w-6 h-6 text-blue-400 animate-pulse" />,
          text: 'Setting up (first time only)',
          subtext: `Downloading Node.js runtime... ${Math.round(runtimeStatus.progress)}%`,
          progress: runtimeStatus.progress,
        };
      case 'installed':
        return {
          icon: <Check className="w-6 h-6 text-green-400" />,
          text: 'Starting...',
          subtext: null,
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-400" />,
          text: 'Setup failed',
          subtext: runtimeStatus.message,
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin text-white/40" />,
          text: 'Starting...',
          subtext: null,
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-[#fafafa] antialiased">
      <div className="flex flex-col items-center space-y-4 max-w-md px-8">
        {content.icon}
        <p className="text-[15px] text-white/80 font-medium">{content.text}</p>

        {content.subtext && (
          <p className="text-[13px] text-white/40 text-center">{content.subtext}</p>
        )}

        {'progress' in content && content.progress !== undefined && (
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${content.progress}%` }}
            />
          </div>
        )}

        {runtimeStatus.type === 'downloading' && (
          <p className="text-[11px] text-white/30 text-center mt-4">
            This downloads a lightweight Node.js runtime (~45MB).
            <br />
            You won't need to do this again.
          </p>
        )}
      </div>
    </div>
  );
}
