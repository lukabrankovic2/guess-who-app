export type Item = { name: string; image?: string };

// To add a category, add a new "Name": [ ... ] entry.
// To add a thing, add a line inside that category's list.
export const CATEGORIES: Record<string, Item[]> = {
  "Video game characters": [
    { name: "Doom Slayer", image: "/images/video-game-characters/doomguy.png" },
    { name: "Crash Bandicoot", image: "/images/video-game-characters/crash.png" },
    { name: "Steve", image: "/images/video-game-characters/steve.png" },
    
  ],
};