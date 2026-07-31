import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { api } from '../api/client';

const PRESETS = [5, 30, 60];

interface PauseResumeControlProps {
  paused: boolean;
  pausedUntil: number | null;
  onChange: () => void;
}

export default function PauseResumeControl({ paused, pausedUntil, onChange }: PauseResumeControlProps) {
  const [customMinutes, setCustomMinutes] = useState('15');
  const [busy, setBusy] = useState(false);

  const pause = async (minutes: number) => {
    setBusy(true);
    try {
      await api.pauseBlocking(minutes);
      onChange();
    } finally {
      setBusy(false);
    }
  };

  const resume = async () => {
    setBusy(true);
    try {
      await api.resumeBlocking();
      onChange();
    } finally {
      setBusy(false);
    }
  };

  if (paused) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 flex items-center justify-between">
        <div className="text-sm text-amber-300">
          Blocking paused{pausedUntil ? ` until ${new Date(pausedUntil).toLocaleTimeString()}` : ''}
        </div>
        <button
          type="button"
          onClick={resume}
          disabled={busy}
          className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-sm font-medium text-gray-950 hover:bg-amber-400 disabled:opacity-50"
        >
          <Play size={16} />
          Resume now
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4 flex items-center gap-3 flex-wrap">
      <span className="flex items-center gap-1.5 text-sm text-gray-300">
        <Pause size={16} />
        Pause blocking for
      </span>
      {PRESETS.map((minutes) => (
        <button
          key={minutes}
          type="button"
          onClick={() => pause(minutes)}
          disabled={busy}
          className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50"
        >
          {minutes}m
        </button>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1}
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          className="w-16 rounded-md border border-gray-700 bg-gray-950 px-2 py-1.5 text-sm text-gray-200"
        />
        <button
          type="button"
          onClick={() => pause(Number(customMinutes) || 1)}
          disabled={busy}
          className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50"
        >
          min
        </button>
      </div>
    </div>
  );
}
