export const CHROMATIC = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export const buttonModeNames = ["Keyboard", "CC"];

export const fromMidiNote = (midi: number) => {
  const name = CHROMATIC[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${name}${oct}`;
};
