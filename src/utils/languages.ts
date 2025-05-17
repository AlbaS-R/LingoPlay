export type Language = (typeof languages)[number];

const languages = [
  { name: "Spanish", nativeName: "Español", viewBox: "0 66 82 66", code: "es" },
] as const;

export default languages;
