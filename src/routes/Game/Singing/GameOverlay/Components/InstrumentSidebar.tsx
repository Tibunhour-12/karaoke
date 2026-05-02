import { useState } from 'react';

const INSTRUMENTS = ['vocals', 'bass', 'drums', 'other'] as const;
type Instrument = (typeof INSTRUMENTS)[number];

const instrumentLabels: Record<Instrument, { label: string; emoji: string }> = {
  vocals: { label: 'Vocals', emoji: '🎤' },
  bass: { label: 'Bass', emoji: '🎸' },
  drums: { label: 'Drums', emoji: '🥁' },
  other: { label: 'Other', emoji: '🎵' },
};

interface Props {
  songId: string;
  instruments: string[];
}

export default function InstrumentSidebar({ songId, instruments: initialInstruments }: Props) {
  console.log("InstrumentSidebar rendered", { songId, initialInstruments });
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() => {
    const result: Record<string, boolean> = {};
    INSTRUMENTS.forEach((inst) => {
      result[inst] = initialInstruments.includes(inst);
    });
    return result;
  });

  const [audioNodes, setAudioNodes] = useState<Record<string, { gainNode: GainNode } | null>>({});

  const toggle = (instrument: Instrument) => {
    setEnabled((prev) => {
      const newEnabled = { ...prev, [instrument]: !prev[instrument] };
      if (audioNodes[instrument]) {
        audioNodes[instrument]!.gainNode.gain.value = newEnabled[instrument] ? 1 : 0;
      }
      return newEnabled;
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        background: 'rgba(0,0,0,0.7)',
        padding: '1rem',
        borderRadius: '0.5rem',
      }}>
      {INSTRUMENTS.map((instrument) => (
        <button
          key={instrument}
          onClick={() => toggle(instrument)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            background: enabled[instrument] ? '#f59e0b' : '#374151',
            color: enabled[instrument] ? '#000' : '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            minWidth: '8rem',
          }}>
          <span>{instrumentLabels[instrument].emoji}</span>
          <span>{instrumentLabels[instrument].label}</span>
          <span style={{ marginLeft: 'auto' }}>{enabled[instrument] ? 'ON' : 'OFF'}</span>
        </button>
      ))}
    </div>
  );
}