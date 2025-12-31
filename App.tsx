import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Square, Loader2, Sparkles, Wand2, Download } from 'lucide-react';
import { ScriptEditor } from './components/ScriptEditor';
import { VoiceSelector } from './components/VoiceSelector';
import { Visualizer } from './components/Visualizer';
import { VoiceName, INITIAL_SCRIPT } from './types';
import { generateSpeech } from './services/geminiService';
import { decodeBase64, decodeAudioData, cleanScript, createWavBlob } from './utils/audioUtils';

// Constants for Audio Context
const SAMPLE_RATE = 24000;

const App: React.FC = () => {
  // State
  const [script, setScript] = useState<string>(INITIAL_SCRIPT);
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [stripDirections, setStripDirections] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawAudio, setRawAudio] = useState<Uint8Array | null>(null);

  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  
  // Initialize Audio Context lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return { ctx: audioContextRef.current, analyser: analyserRef.current };
  }, []);

  const handleStop = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(async (buffer: AudioBuffer) => {
    handleStop(); // Stop any existing playback

    const { ctx, analyser } = getAudioContext();
    if (!ctx || !analyser) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Connect source -> Analyser -> Destination
    source.connect(analyser);
    analyser.connect(ctx.destination);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    sourceNodeRef.current = source;
    source.start();
    setIsPlaying(true);
  }, [getAudioContext, handleStop]);

  const handleGenerateAndPlay = async () => {
    if (!script.trim()) return;
    
    setError(null);
    setIsLoading(true);
    handleStop(); // Ensure stopped before new gen
    setRawAudio(null);

    try {
      // 1. Prepare Text
      const textToProcess = stripDirections ? cleanScript(script) : script;
      
      // 2. Call Gemini API
      const base64Audio = await generateSpeech(textToProcess, voice);
      
      if (!base64Audio) {
        throw new Error("Received empty response from generation service.");
      }

      // 3. Decode Audio
      const { ctx } = getAudioContext();
      if (!ctx) throw new Error("Could not initialize AudioContext");

      const audioBytes = decodeBase64(base64Audio);
      setRawAudio(audioBytes);
      
      const decodedBuffer = await decodeAudioData(audioBytes, ctx, SAMPLE_RATE);
      
      // 4. Store and Play
      audioBufferRef.current = decodedBuffer;
      await playAudio(decodedBuffer);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = () => {
    if (audioBufferRef.current) {
      playAudio(audioBufferRef.current);
    }
  };

  const handleDownload = () => {
    if (!rawAudio) return;
    
    try {
      const blob = createWavBlob(rawAudio, SAMPLE_RATE);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `midnight-motivation-${voice.toLowerCase()}-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download audio:", e);
      setError("Failed to generate download file.");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [handleStop]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                Midnight Motivation
              </h1>
              <p className="text-xs text-zinc-500 font-medium tracking-wide">AI VOICE SYNTHESIS</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             {/* Info badge */}
             <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
               Gemini 2.5 Flash TTS
             </span>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Left Column: Script Input */}
          <div className="lg:col-span-7 flex flex-col min-h-[400px]">
            <ScriptEditor 
              value={script} 
              onChange={setScript} 
              disabled={isLoading || isPlaying} 
            />
          </div>

          {/* Right Column: Controls & Output */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Control Panel */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Wand2 className="w-4 h-4 mr-2 text-blue-400" />
                Generation Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">Voice Model</label>
                  <VoiceSelector 
                    selectedVoice={voice} 
                    onSelectVoice={setVoice} 
                    disabled={isLoading || isPlaying}
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-zinc-800">
                  <span className="text-sm text-zinc-300">Clean Script</span>
                  <button 
                    onClick={() => setStripDirections(!stripDirections)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${stripDirections ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  >
                    <span className={`${stripDirections ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </button>
                </div>
                <p className="text-xs text-zinc-500">
                  {stripDirections 
                    ? "Removes stage directions like [0-5s | HOOK] automatically." 
                    : "Sends raw text to the model including brackets."}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Visualizer & Playback Status */}
            <div className="flex-grow flex flex-col justify-end space-y-4">
              <Visualizer analyser={analyserRef.current} isPlaying={isPlaying} />
              
              <div className="grid grid-cols-2 gap-3">
                {isPlaying ? (
                   <button
                   onClick={handleStop}
                   className="col-span-2 w-full py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-900/20"
                 >
                   <Square className="w-5 h-5 fill-current" />
                   <span>Stop Playback</span>
                 </button>
                ) : (
                  <>
                     <button
                      onClick={handleGenerateAndPlay}
                      disabled={isLoading || !script}
                      className={`col-span-2 w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg ${
                        isLoading || !script
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-white hover:bg-zinc-200 text-black shadow-white/10'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Synthesizing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Generate Speech</span>
                        </>
                      )}
                    </button>
                    
                    {audioBufferRef.current && !isLoading && (
                      <>
                       <button
                         onClick={handleReplay}
                         className="col-span-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 border border-zinc-700"
                       >
                         <Play className="w-4 h-4 fill-current" />
                         <span>Replay</span>
                       </button>
                       <button
                         onClick={handleDownload}
                         className="col-span-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 border border-zinc-700"
                       >
                         <Download className="w-4 h-4" />
                         <span>Save</span>
                       </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;