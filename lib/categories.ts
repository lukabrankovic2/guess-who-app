export type Item = { name: string; image?: string };

// To add a category, add a new "Name": [ ... ] entry.
// To add a thing, add a line inside that category's list.
export const CATEGORIES: Record<string, Item[]> = {
  "Video game characters": [
    { name: "Doom Slayer", image: "/images/video-game-characters/doomguy.png" },
    { name: "Crash Bandicoot", image: "/images/video-game-characters/crash.png" },
    { name: "Steve", image: "/images/video-game-characters/steve.png" },
    { name: "V", image: "/images/video-game-characters/V.jpg" },
    { name: "Kratos", image: "/images/video-game-characters/kratos.png" },
    { name: "Arthur Morgan", image: "/images/video-game-characters/arthur-morgan.jpg" },
    { name: "Super Mario", image: "/images/video-game-characters/super-mario.png" },
    { name: "Sonic the Hedgehog", image: "/images/video-game-characters/sonic.png" },
    { name: "Jimbo", image: "/images/video-game-characters/jimbo.png" },
    { name: "The Tarnished", image: "/images/video-game-characters/tarnished.png" },
    { name: "Terrorist", image: "/images/video-game-characters/terrorist.jpg" },
    { name: "Counter-Terrorist", image: "/images/video-game-characters/counter-terrorist.png" },
    { name: "The Knight", image: "/images/video-game-characters/hollow-knight.jpg" },
    { name: "CJ", image: "/images/video-game-characters/cj.png" },
    { name: "Dragonborn", image: "/images/video-game-characters/dragonborn.jpeg" },
    { name: "Imposter", image: "/images/video-game-characters/imposter.png" },
    { name: "Gordon Freeman", image: "/images/video-game-characters/gordon-freeman.png" },
    { name: "Chell", image: "/images/video-game-characters/chell.png" },
    { name: "Lara Croft", image: "/images/video-game-characters/lara-croft.png" },
    { name: "Ellie", image: "/images/video-game-characters/ellie.png" },


  ],
};