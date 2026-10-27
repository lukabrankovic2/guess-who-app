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
    { name: "Jill Valentine", image: "/images/video-game-characters/jill-valentine.png" },
    { name: "Geralt of Rivia", image: "/images/video-game-characters/geralt.png" },
    { name: "Clementine", image: "/images/video-game-characters/clementine.png" },
    { name: "Princess Zelda", image: "/images/video-game-characters/zelda.png" },
    { name: "Master Chief", image: "/images/video-game-characters/master-chief.png" },
    { name: "Ellie", image: "/images/video-game-characters/ellie.png" },
    { name: "Samus Aran", image: "/images/video-game-characters/samus.png" },
    { name: "2B", image: "/images/video-game-characters/2b.png" },
    { name: "Lilith", image: "/images/video-game-characters/lilith.png" },
    { name: "Hornet", image: "/images/video-game-characters/hornet.png" },


  ],
};