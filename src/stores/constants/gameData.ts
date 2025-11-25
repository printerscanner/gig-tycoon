import type { WorkerTrait } from "@/types";

// Worker names for random generation
export const WORKER_NAMES = [
  "Alex",
  "Sam",
  "Jordan",
  "Casey",
  "Taylor",
  "Morgan",
];

// Office worker names
export const OFFICE_WORKER_NAMES = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "William",
  "Sophia",
  "James",
  "Isabella",
  "Oliver",
  "Charlotte",
  "Benjamin",
  "Amelia",
  "Lucas",
  "Mia",
];

// Support staff names
export const SUPPORT_STAFF_NAMES = [
  "Jordan",
  "Riley",
  "Avery",
  "Quinn",
  "Drew",
  "Sage",
  "Blake",
  "Rowan",
];

// Worker traits that affect performance
export const WORKER_TRAITS: WorkerTrait[] = [
  { name: "Reliable", description: "Always on time", effect: "positive" },
  { name: "Hustler", description: "Works extra fast", effect: "positive" },
  {
    name: "Burnout-prone",
    description: "Happiness drops quickly",
    effect: "negative",
  },
  { name: "Lazy", description: "Moves slowly", effect: "negative" },
  { name: "Stressed", description: "Makes more mistakes", effect: "negative" },
  { name: "Optimist", description: "Stays happy longer", effect: "positive" },
];

// Sarcastic messages for unhappy workers
export const SARCASTIC_MESSAGES = [
  "Guess I'll eat instant noodles again lol",
  "Living the dream on minimum wage! 🙃",
  "Another day, another dollar... wait, make that 50 cents",
  "My landlord will understand, right?",
  "Time to update my LinkedIn... again",
];

// Job descriptions by type
export const JOB_DESCRIPTIONS = {
  delivery: [
    "🍕 Tony's Pizza → Apartment",
    "🍔 Burger Express → Office Building",
    "🥗 Fresh Salads → Home",
    "🍜 Noodle House → University",
    "🌮 Taco Fiesta → Business District",
    "🍣 Sushi Zone → Residential",
    "🍗 Chicken Palace → Hospital",
    "🥪 Deli Corner → School",
    "🍝 Pasta Central → Hotel",
    "🍰 Sweet Treats → Apartment Complex",
    "☕ Coffee Roasters → Office Tower",
    "🥘 Curry Express → Shopping Mall",
  ],
} as const;
