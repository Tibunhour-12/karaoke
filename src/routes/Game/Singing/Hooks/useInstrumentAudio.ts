import { useEffect, useRef } from "react";

const INSTRUMENTS = ["vocals", "bass", "drums", "other"] as const;

export function useInstrumentAudio(songId: string, enabledInstruments: string[], isPlaying: boolean) {
  const audioElementsRef = useRef<Record<string, HTMLAudioElement>>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    INSTRUMENTS.forEach((instrument) => {
      const audio = new Audio(`/songs/${songId}/${instrument}.mp3`);
      audio.preload = "auto";
      audio.muted = false;
      audio.volume = 1;
      audioElementsRef.current[instrument] = audio;
      console.log("Created audio element for:", instrument);
    });

    return () => {
      INSTRUMENTS.forEach((instrument) => {
        audioElementsRef.current[instrument]?.pause();
      });
    };
  }, [songId]);

  // Mute/unmute based on enabled instruments
  useEffect(() => {
    INSTRUMENTS.forEach((instrument) => {
      const audio = audioElementsRef.current[instrument];
      if (!audio) return;
      const shouldPlay = enabledInstruments.includes(instrument);
      audio.muted = !shouldPlay;
      audio.volume = shouldPlay ? 1 : 0;
      console.log(`${instrument}: muted=${audio.muted}, volume=${audio.volume}`);
    });
  }, [enabledInstruments]);

  // Play/pause all tracks together
  useEffect(() => {
    INSTRUMENTS.forEach((instrument) => {
      const audio = audioElementsRef.current[instrument];
      if (!audio) return;
      if (isPlaying) {
        audio.play().catch(console.error);
        console.log("Playing:", instrument);
      } else {
        audio.pause();
      }
    });
  }, [isPlaying]);
}