export type Unit = {
  unitName: String;
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  textColor: `text-${string}`;
  borderColor: `border-${string}`;
  tiles: Tile[];
};

export type Tile =
  | {
      type: "star" | "dumbbell" | "book" | "trophy" | "fast-forward" | "memory";
      description: string;
    }
  | { type: "treasure" };

export type TileType = Tile["type"];

export const units: readonly Unit[] = [
  {
    unitName: "Basic exercises",
    unitNumber: 1,
    description: "Learn basic words",
    backgroundColor: "bg-[#235390]",
    textColor: "text-[#60A5FA]",
    borderColor: "border-[#3b82f6]",
    tiles: [
      { type: "star", description: "Form basic sentences" },
      { type: "book", description: "Good morning" },
      { type: "star", description: "Greet people" },
      { type: "book", description: "" },
      { type: "trophy", description: "Unit 1 review" },
    ],
  },
  {
    unitName: "Memory games",
    unitNumber: 2,
    description: "Learn while exercising the brain!",
    backgroundColor: "bg-[#4F8FE8]",
    textColor: "text-[#4F8FE8]",
    borderColor: "border-[#3A6DC4]",
    tiles: [
      { type: "book", description: "Dog & Perro" },
      { type: "star", description: "Get around in a city" },
      { type: "book", description: "House & Casa" },
      { type: "star", description: "Get around in a city" },
      { type: "trophy", description: "A very big family" },
    ],
  },
  {
    unitName: "Voice recognition",
    unitNumber: 3,
    description: "Practice your pronunciation with voice exercises!",
    backgroundColor: "bg-[#60A5FA]",
    textColor: "text-[#60A5FA]",
    borderColor: "border-[#4C7EDB]",
    tiles: [
      { type: "book", description: "Voice Exercise 1" },
      { type: "book", description: "Voice Exercise 2" },
      { type: "book", description: "Voice Exercise 3" },
      { type: "trophy", description: "Unit 3 review" },
    ],
  },
];
