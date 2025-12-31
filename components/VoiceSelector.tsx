import React from 'react';
import { Mic } from 'lucide-react';
import { VoiceName } from '../types.ts';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  disabled?: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  disabled,
}) => {
  return (
    <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2">
      <Mic className="w-4 h-4 text-zinc-400" />
      <div className="flex-grow">
        <label htmlFor="voice-select" className="sr-only">Select Voice</label>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => onSelectVoice(e.target.value as VoiceName)}
          disabled={disabled}
          className="bg-transparent text-zinc-200 text-sm focus:outline-none w-full cursor-pointer disabled:opacity-50"
        >
          {Object.values(VoiceName).map((voice) => (
            <option key={voice} value={voice} className="bg-zinc-900 text-zinc-100">
              {voice}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};