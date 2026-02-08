import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { tauri, type RuntimeStatus as TauriRuntimeStatus } from '../lib/tauri';
import { Loader2, Download, Check, AlertCircle } from 'lucide-react';

export function Settings() {
  const { error, runtimeStatus, setScreen, setGatewayStatus, setApiKeyConfigured, setError, setRuntimeStatus } = useAppStore();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [runtimeDetails, setRuntimeDetails] = useState<TauriRuntimeStatus | null>(null);

  // Fetch runtime details
  useEffect(() => {
    const fetchRuntime = async () => {
      try {
        const status = await tauri.getRuntimeStatus();
        setRuntimeDetails(status);
      } catch (err) {
        console.error('Failed to get runtime status:', err);
      }
    };
    fetchRuntime();
    const interval = setInterval(fetchRuntime, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInstallRuntime = async () => {
    setRuntimeStatus({ type: 'downloading', progress: 0 });
    try {
      await tauri.installRuntime();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setRuntimeStatus({ type: 'error', message });
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    // Check if runtime is installed
    if (runtimeStatus.type !== 'installed') {
      setError('Please wait for the runtime to finish installing.');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      await tauri.setApiKey(apiKey.trim());
      setApiKeyConfigured(true);

      setGatewayStatus({ type: 'starting' });
      const info = await tauri.startGateway();
      setGatewayStatus({ type: 'running', info });
      setScreen('chat');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setGatewayStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const runtimeReady = runtimeStatus.type === 'installed';
  const runtimeDownloading = runtimeStatus.type === 'downloading';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-[#fafafa] antialiased p-8">
      <div className="w-full max-w-md">
        {/* Header - confident, minimal */}
        <div className="text-center mb-12">
          <h1 className="text-[28px] font-medium tracking-[-0.02em] mb-3">
            Enter your API key
          </h1>
          <p className="text-[15px] text-white/50 leading-relaxed">
            Your key stays on your computer. We never see it.
          </p>
        </div>

        {/* Runtime status - only show if not ready */}
        {!runtimeReady && (
          <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/10">
            {runtimeDownloading ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-blue-400 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-[15px] text-white/70">Setting up...</p>
                    <p className="text-[13px] text-white/40">
                      Downloading runtime ({Math.round(runtimeStatus.progress)}%)
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${runtimeStatus.progress}%` }}
                  />
                </div>
              </div>
            ) : runtimeStatus.type === 'error' ? (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[15px] text-white/70">Setup failed</p>
                  <p className="text-[13px] text-white/40 mb-3">{runtimeStatus.message}</p>
                  <button
                    onClick={handleInstallRuntime}
                    className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                <p className="text-[15px] text-white/50">Checking system...</p>
              </div>
            )}
          </div>
        )}

        {/* Error - calm, guiding, not alarming */}
        {error && (
          <div className="mb-8 p-5 rounded-xl bg-white/[0.02] border border-white/10">
            <p className="text-[15px] text-white/70 mb-1">Something went wrong</p>
            <p className="text-[13px] text-white/40">{error}</p>
          </div>
        )}

        {/* Form - simple, focused */}
        <div className="space-y-6">
          <div>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-[15px] placeholder-white/30 focus:outline-none focus:border-white/20 font-mono transition-colors"
              disabled={saving || !runtimeReady}
              autoFocus={runtimeReady}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!apiKey.trim() || saving || !runtimeReady}
            className={`w-full py-3 rounded-xl text-[15px] font-medium transition-all flex items-center justify-center gap-2 ${
              apiKey.trim() && !saving && runtimeReady
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : !runtimeReady ? (
              'Waiting for setup...'
            ) : (
              'Continue'
            )}
          </button>
        </div>

        {/* Footer help - subtle, not desperate */}
        <p className="mt-8 text-[13px] text-white/30 text-center">
          Get your key from{' '}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/70 transition-colors"
          >
            console.anthropic.com
          </a>
        </p>

        {/* Runtime info footer */}
        {runtimeReady && runtimeDetails && (
          <p className="mt-4 text-[11px] text-white/20 text-center">
            <Check className="w-3 h-3 inline mr-1 text-green-500/50" />
            Node.js {runtimeDetails.version} ready
          </p>
        )}
      </div>
    </div>
  );
}
