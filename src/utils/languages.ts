export type Language = (typeof languages)[number];

const languages = [
  { name: "English", nativeName: "English", viewBox: "0 0 82 66", code: "en" },
  { name: "Spanish", nativeName: "Español", viewBox: "0 66 82 66", code: "es" },
] as const;

export default languages;
