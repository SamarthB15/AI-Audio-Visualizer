"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs"; // Auth
import { saveAnalysis, getHistory } from "./actions"; // Database Actions

// Custom Visual Components
import ColorScale from "~/components/ColorScale";
import FeatureMap from "~/components/FeatureMap";
import BackgroundEffects from "~/components/BackgroundEffects";
import AudioBars from "~/components/AudioBars";
import HistorySidebar from "~/components/HistorySidebar";
import Waveform from "~/components/WaveForm";

// UI Components
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

// --- Types ---
interface Prediction {
  class: string;
  confidence: number;
}

interface LayerData {
  shape: number[];
  values: number[][];
}

interface VisualizationData {
  [layerName: string]: LayerData;
}

interface WaveformData {
  values: number[];
  sample_rate: number;
  duration: number;
}

interface ApiResponse {
  predictions: Prediction[];
  visualization: VisualizationData;
  input_spectrogram: LayerData;
  waveform: WaveformData;
}

// --- Constants & Helpers ---
const ESC50_EMOJI_MAP: Record<string, string> = {
  dog: "🐕", rain: "🌧️", crying_baby: "👶", door_wood_knock: "🚪", helicopter: "🚁",
  rooster: "🐓", sea_waves: "🌊", sneezing: "🤧", mouse_click: "🖱️", chainsaw: "🪚",
  pig: "🐷", crackling_fire: "🔥", clapping: "👏", keyboard_typing: "⌨️", siren: "🚨",
  cow: "🐄", crickets: "🦗", breathing: "💨", door_wood_creaks: "🚪", car_horn: "📯",
  frog: "🐸", chirping_birds: "🐦", coughing: "😷", can_opening: "🥫", engine: "🚗",
  cat: "🐱", water_drops: "💧", footsteps: "👣", washing_machine: "🧺", train: "🚂",
  hen: "🐔", wind: "💨", laughing: "😂", vacuum_cleaner: "🧹", church_bells: "🔔",
  insects: "🦟", pouring_water: "🚰", brushing_teeth: "🪥", clock_alarm: "⏰", airplane: "✈️",
  sheep: "🐑", toilet_flush: "🚽", snoring: "😴", clock_tick: "⏱️", fireworks: "🎆",
  crow: "🐦‍⬛", thunderstorm: "⛈️", drinking_sipping: "🥤", glass_breaking: "🔨", hand_saw: "🪚",
};

const getEmojiForClass = (className: string): string => ESC50_EMOJI_MAP[className] || "🔈";

function splitLayers(visualization: VisualizationData) {
  const main: [string, LayerData][] = [];
  const internals: Record<string, [string, LayerData][]> = {};

  for (const [name, data] of Object.entries(visualization)) {
    if (!name.includes(".")) {
      main.push([name, data]);
    } else {
      const [parent] = name.split(".");
      if (parent === undefined) continue;
      if (!internals[parent]) internals[parent] = [];
      internals[parent].push([name, data]);
    }
  }
  return { main, internals };
}

export default function HomePage() {
  // Auth State
  const { isSignedIn, user } = useUser();
  
  // App State
  const [vizData, setVizData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load History on Mount (if logged in)
  useEffect(() => {
    if (isSignedIn) {
      getHistory().then((data) => setHistory(data));
    }
  }, [isSignedIn]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    setVizData(null);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );

        // Call the AI Model
        const response = await fetch("https://infinitet715--audio-cnn-inference-audioclassifier-inference.modal.run/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio_data: base64String }),
        });

        if (!response.ok) throw new Error(`API error ${response.statusText}`);
        const data: ApiResponse = await response.json();
        setVizData(data);

        // --- Save to Database ---
        if (isSignedIn && data.predictions.length > 0) {
           await saveAnalysis(file.name, data.predictions[0]);
           const newHistory = await getHistory(); // Refresh sidebar
           setHistory(newHistory);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occured");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file.");
      setIsLoading(false);
    };
  };

  const { main, internals } = vizData
    ? splitLayers(vizData?.visualization)
    : { main: [], internals: {} };

  return (
    <main className="relative min-h-screen text-neutral-100 selection:bg-indigo-500/30">
      <BackgroundEffects />

      {/* --- SIDEBAR & AUTH UI --- */}
      {isSignedIn && (
        <>
          <HistorySidebar 
            history={history} 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen} 
          />
          <div className="fixed top-4 right-4 z-50">
             <UserButton 
               appearance={{
                 elements: {
                   avatarBox: "h-10 w-10 ring-2 ring-indigo-500 ring-offset-2 ring-offset-neutral-900"
                 }
               }}
             />
          </div>
        </>
      )}
      
      <div className={`relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-8 transition-all duration-300 ${isSidebarOpen ? "pl-80" : ""}`}>
        
        {/* --- HEADER SECTION --- */}
        <div className="relative mb-20 overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/30 p-12 text-center shadow-2xl backdrop-blur-md transition-all hover:bg-neutral-900/40">
          <div className="flex flex-col items-center">
            
            {/* System Status Badge */}
            <div className="mb-6 flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-mono font-medium tracking-widest text-indigo-300">
                V1.0 // ONLINE
              </span>
            </div>

            {/* Title */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-sm">
                AI
              </h1>
              <AudioBars />
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                AUDIO VISUALIZER
              </h1>
            </div>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-400 leading-relaxed">
              Experience the inner workings of deep learning. Upload audio to see 
              <span className="text-indigo-400 font-semibold"> feature extraction</span>, 
              <span className="text-purple-400 font-semibold"> spectrograms</span>, and 
              <span className="text-pink-400 font-semibold"> activations</span> in real-time.
            </p>

            {/* --- UPLOAD SECTION (Conditional) --- */}
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
               {!isSignedIn ? (
                  <div className="mt-4 p-6 border border-yellow-500/30 bg-yellow-500/10 rounded-xl w-full">
                    <h3 className="text-yellow-400 font-bold mb-2 tracking-widest">⚠ AUTHENTICATION REQUIRED</h3>
                    <p className="text-neutral-400 text-sm mb-4">Access to the Neural Network is restricted to authorized personnel only.</p>
                    <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold">
                      <Link href="/sign-in">LOGIN TO SYSTEM</Link>
                    </Button>
                  </div>
               ) : (
                  <div className="group relative w-full">
                    <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 opacity-50 blur transition duration-200 group-hover:opacity-100"></div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".wav"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="absolute inset-0 z-20 w-full h-full cursor-pointer opacity-0"
                      />
                      <Button
                        disabled={isLoading}
                        className="w-full h-16 bg-neutral-900 border border-neutral-800 text-white text-lg font-semibold hover:bg-neutral-800 transition-all active:scale-[0.98]"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-3">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></span>
                            Processing Audio Tensor...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            Upload WAV File
                          </span>
                        )}
                      </Button>
                    </div>
                    {fileName && (
                      <div className="flex items-center justify-center gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                        <span className="font-mono text-sm text-neutral-400">
                            Analyzing: <span className="text-white">{fileName}</span>
                        </span>
                      </div>
                    )}
                  </div>
               )}
            </div>
          </div>
        </div>

        {error && (
          <Card className="mx-auto mb-8 max-w-2xl border-red-500/50 bg-red-950/20 backdrop-blur-sm">
            <CardContent className="pt-6">
              <p className="text-center font-medium text-red-400">Error: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* --- VISUALIZATION RESULTS --- */}
        {vizData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 space-y-8 duration-700">
            
            {/* Top Predictions Card */}
            <Card className="border-neutral-800 bg-neutral-900/60 shadow-2xl backdrop-blur-md overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <CardHeader className="border-b border-neutral-800/50">
                <CardTitle className="flex items-center gap-2 text-xl font-light tracking-wide text-neutral-200">
                  <span className="text-indigo-500">◆</span> Neural Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {vizData.predictions.slice(0, 3).map((pred, i) => (
                    <div key={pred.class} className="space-y-2 group">
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110">
                            {getEmojiForClass(pred.class)}
                          </span>
                          <span className="text-lg font-medium capitalize text-neutral-200 group-hover:text-white transition-colors">
                            {pred.class.replaceAll("_", " ")}
                          </span>
                        </div>
                        <span className={`font-mono text-sm font-bold ${i === 0 ? "text-indigo-400" : "text-neutral-500"}`}>
                          {(pred.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-800/50">
                        <div
                          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${
                            i === 0 ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]" : "bg-neutral-600"
                          }`}
                          style={{ width: `${pred.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Input & Waveform Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-neutral-800 bg-neutral-900/60 shadow-xl backdrop-blur-md transition-all hover:border-neutral-700 hover:shadow-indigo-500/5 ring-1 ring-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-neutral-300">
                    Input Spectrogram
                    <Badge variant="outline" className="font-mono text-xs border-neutral-700 text-neutral-500">
                      {vizData.input_spectrogram.shape.join(" × ")}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-md border border-neutral-800 bg-black/80 p-2 ring-1 ring-white/5">
                    <FeatureMap data={vizData.input_spectrogram.values} title="" spectrogram />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <ColorScale width={200} height={12} min={-1} max={1} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-neutral-800 bg-neutral-900/60 shadow-xl backdrop-blur-md transition-all hover:border-neutral-700 hover:shadow-indigo-500/5 ring-1 ring-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-neutral-300">
                    Audio Waveform
                    <Badge variant="outline" className="font-mono text-xs border-neutral-700 text-neutral-500">
                      {vizData.waveform.sample_rate}Hz
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-full flex-col justify-center">
                    <div className="rounded-md border border-neutral-800 bg-black/50 p-4 ring-1 ring-white/5">
                      <Waveform data={vizData.waveform.values} title={`${vizData.waveform.duration.toFixed(2)}s`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Maps Grid */}
            <Card className="border-neutral-800 bg-neutral-900/40 backdrop-blur-md ring-1 ring-white/5">
              <CardHeader className="border-b border-neutral-800 pb-4">
                <CardTitle className="text-2xl font-light text-neutral-100">
                  Network Architecture
                </CardTitle>
                <p className="text-sm text-neutral-500">
                  Visualizing convolutional filters and activation maps
                </p>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-5">
                  {main.map(([mainName, mainData]) => (
                    <div key={mainName} className="group flex flex-col space-y-4">
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:-translate-y-1">
                        <div className="mb-3 flex items-baseline justify-between">
                          <h4 className="font-mono text-sm font-bold text-indigo-400">{mainName}</h4>
                          <span className="font-mono text-[10px] text-neutral-500">{mainData.shape.join("×")}</span>
                        </div>
                        <div className="opacity-90 transition-opacity hover:opacity-100">
                          <FeatureMap data={mainData.values} title="" />
                        </div>
                      </div>
                      {internals[mainName] && (
                        <div className="custom-scrollbar h-64 space-y-3 overflow-y-auto rounded-lg border border-neutral-800 bg-black/40 p-2 pr-1 shadow-inner">
                          {internals[mainName].sort(([a], [b]) => a.localeCompare(b)).map(([layerName, layerData]) => (
                              <div key={layerName} className="space-y-1 rounded border border-neutral-800/50 bg-neutral-900/50 p-2 hover:bg-neutral-800 transition-colors">
                                <p className="truncate font-mono text-[10px] text-neutral-400">{layerName.replace(`${mainName}.`, "")}</p>
                                <FeatureMap data={layerData.values} title="" internal={true} />
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex justify-center opacity-70">
                  <ColorScale width={300} height={12} min={-1} max={1} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #171717; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #404040; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #525252; }
      `}</style>
    </main>
  );
}