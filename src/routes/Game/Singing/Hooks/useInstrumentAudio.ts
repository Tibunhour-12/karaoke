import { useEffect, useRef } from "react";

const INSTRUMENTS = ["vocals", "bass", "drums", "other"] as const;

export function useInstrumentAudio(songId: string, enabledInstruments: string[], isPlaying: boolean, p0?: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const tracksRef = useRef<Record<string, { gainNode: GainNode; source: AudioBufferSourceNode | null; buffer: AudioBuffer | null }>>({});
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const loadedRef = useRef(false);
  const hasInitialSeek = useRef(false);
  useEffect(() => {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Resume context on user interaction
    document.addEventListener("click", () => ctx.resume(), { once: true });

    INSTRUMENTS.forEach(async (instrument) => {
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);
      gainNode.gain.value = enabledInstruments.includes(instrument) ? 1 : 0;
      tracksRef.current[instrument] = { gainNode, source: null, buffer: null };

      try {
        const url = `/songs/${songId}/${instrument}.mp3`;
        console.log("Loading instrument:", url);
        const response = await fetch(url);
        if (!response.ok) {
          console.warn("Failed to load:", url, response.status);
          return;
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        tracksRef.current[instrument].buffer = audioBuffer;
        console.log("Loaded:", instrument);
      } catch (e) {
        console.warn(`Could not load ${instrument}.mp3`, e);
      }
    });

    return () => {
      ctx.close();
      loadedRef.current = false;
    };
  }, [songId]);

  useEffect(() => {
    Object.entries(tracksRef.current).forEach(([instrument, track]) => {
      track.gainNode.gain.value = enabledInstruments.includes(instrument) ? 1 : 0;
      console.log("Setting gain:", instrument, enabledInstruments.includes(instrument) ? 1 : 0);
    });
  }, [enabledInstruments]);

  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (isPlaying) {
      ctx.resume();
      Object.values(tracksRef.current).forEach((track) => {
        if (!track.buffer) return;
        if (track.source) { try { track.source.stop(); } catch(e) {} }
        const source = ctx.createBufferSource();
        source.buffer = track.buffer;
        source.connect(track.gainNode);
        source.start(0, offsetRef.current);
        track.source = source;
      });
      startTimeRef.current = ctx.currentTime;
    } else {
      offsetRef.current += ctx.currentTime - startTimeRef.current;
      Object.values(tracksRef.current).forEach(({ source }) => { try { source?.stop(); } catch(e) {} });
    }
  }, [isPlaying]);
}
