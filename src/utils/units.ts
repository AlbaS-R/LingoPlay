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
    unitName: "Under Construction",
    unitNumber: 3,
    description: "Updates will be available soon!",
    backgroundColor: "bg-[#60A5FA]",
    textColor: "text-[#60A5FA]",
    borderColor: "border-[#4C7EDB]",
    tiles: [
      { type: "fast-forward", description: "Order food and drink" },
      { type: "book", description: "The passport" },
      { type: "star", description: "Order food and drinks" },
      { type: "treasure" },
      { type: "book", description: "The honeymoon" },
      { type: "star", description: "Get around in a city" },
      { type: "treasure" },
      { type: "dumbbell", description: "Personalized practice" },
      { type: "book", description: "Doctor Eddy" },
      { type: "trophy", description: "Unit 2 review" },
    ],
  },
];
