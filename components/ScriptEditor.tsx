import React from 'react';
import { PenLine } from 'lucide-react';

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center space-x-2 text-zinc-400">
        <PenLine className="w-4 h-4" />
        <span className="text-sm font-medium uppercase tracking-wider">Script Input</span>
      </div>
      <div className="relative flex-grow group">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter your text here..."
          className="w-full h-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-zinc-700 resize-none transition-all font-mono text-base leading-relaxed"
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 text-xs text-zinc-600 pointer-events-none group-hover:text-zinc-500 transition-colors">
          {value.length} characters
        </div>
      </div>
    </div>
  );
};