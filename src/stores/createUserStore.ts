import dayjs from "dayjs";
import type { BoundStateCreator } from "~/hooks/useBoundStore";

export type UserSlice = {
  name: string;
  username: string;
  joinedAt: dayjs.Dayjs;
  loggedIn: boolean;
  streak: number;
  xp: number;
  league: string;
  top3Finishes: number;
  achievements: Record<string, number>;
  followers: string[];
  following: string[];
  setName: (name: string) => void;
  setUsername: (username: string) => void;
  setLoggedIn: (value: boolean) => void; 
  logIn: () => void;
  logOut: () => void;
};

export const createUserSlice: BoundStateCreator<UserSlice> = (set) => ({
  name: "",
  username: "",
  joinedAt: dayjs(),
  loggedIn: false,
  streak: 0,
  xp: 0,
  league: "Bronze",
  top3Finishes: 0,
  achievements: {},
  followers: [],
  following: [], 

  setName: (name: string) => set(() => ({ name })),
  setUsername: (username: string) => set(() => ({ username })),
  setLoggedIn: (value: boolean) => set({ loggedIn: value }),
  logIn: () => set(() => ({ loggedIn: true })),
  logOut: () => set(() => ({ loggedIn: false })),
});
