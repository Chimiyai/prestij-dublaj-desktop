// src/components/UpdateNotification.tsx
import { useState, useEffect } from 'react';
import type { IpcRendererEvent } from 'electron';
import { CheckCircle, AlertCircle, Download, Info } from 'lucide-react';

interface UpdateInfo {
  version: string;
  releaseDate: string;
}

interface ProgressInfo {
  bytesPerSecond: number;
  percent: number;
  total: number;
  transferred: number;
}

interface UpdateStatus {
  text: string;
  data?: UpdateInfo | ProgressInfo;
}

export default function UpdateNotification() {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const listener = (_event: IpcRendererEvent, ...args: unknown[]) => {
      const newStatus = args[0] as UpdateStatus;

      if (newStatus.text === 'hide-status') {
        setIsVisible(false);
        setTimeout(() => setStatus(null), 500);
        return;
      }
      
      setStatus(newStatus);
      setIsVisible(true);
    };

    window.ipcRenderer.on('update-status', listener);
    
    return () => {
      window.ipcRenderer.removeListener('update-status', listener as (...args: unknown[]) => void);
    };
  }, []);

  if (!status || !isVisible) {
    return null;
  }

  const getIcon = () => {
    if (status.text.includes('güncel')) return <CheckCircle className="text-green-400" size={20} />;
    if (status.text.includes('hatası')) return <AlertCircle className="text-red-400" size={20} />;
    if (status.text.includes('indiriliyor')) return <Download className="text-blue-400 animate-pulse" size={20} />;
    return <Info className="text-gray-400" size={20} />;
  };

  return (
    <div className={`fixed bottom-5 right-5 z-50 bg-prestij-bg-dark-1 border border-prestij-border-primary rounded-lg shadow-2xl p-4 flex items-center gap-4 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      {getIcon()}
      <p className="text-sm text-prestij-text-secondary">{status.text}</p>
    </div>
  );
}
