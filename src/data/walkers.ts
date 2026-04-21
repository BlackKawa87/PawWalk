export interface MockWalker {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  pricePerWalk: number;
  distance: string;
  verified: boolean;
  experience: string;
  bio: string;
  location: string;
  dogSizes: string[];
  specialties: string[];
  availability: string[];
}

export const MOCK_WALKERS: MockWalker[] = [
  {
    id: "w1",
    name: "Emily Carter",
    rating: 4.9,
    reviews: 128,
    pricePerWalk: 15,
    distance: "0.3 mi",
    verified: true,
    experience: "3 years",
    bio: "Dog lover with 3 years of professional walking experience. Former veterinary assistant — I treat every dog like my own.",
    location: "Islington, London",
    dogSizes: ["Small", "Medium", "Large"],
    specialties: ["Senior dogs", "Reactive dogs", "Puppies"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  },
  {
    id: "w2",
    name: "James Reid",
    rating: 4.8,
    reviews: 74,
    pricePerWalk: 14,
    distance: "0.5 mi",
    verified: true,
    experience: "2 years",
    bio: "Reliable and punctual. I own two dogs myself — I know what owners need: updates, photos, and genuine care.",
    location: "Camden, London",
    dogSizes: ["Small", "Medium"],
    specialties: ["Group walks", "Puppies"],
    availability: ["Mon", "Wed", "Fri", "Sat", "Sun"],
  },
  {
    id: "w3",
    name: "Sophie Walsh",
    rating: 5.0,
    reviews: 41,
    pricePerWalk: 16,
    distance: "0.8 mi",
    verified: true,
    experience: "5 years",
    bio: "Professional dog trainer and walker. Specialise in anxious and reactive dogs. Every walk includes enrichment exercises.",
    location: "Hackney, London",
    dogSizes: ["Small", "Medium", "Large", "Extra Large"],
    specialties: ["Reactive dogs", "Training walks", "Senior dogs"],
    availability: ["Tue", "Thu", "Sat", "Sun"],
  },
  {
    id: "w4",
    name: "Marcus Chen",
    rating: 4.7,
    reviews: 33,
    pricePerWalk: 13,
    distance: "1.1 mi",
    verified: true,
    experience: "1 year",
    bio: "Energetic and adventurous. Great with high-energy breeds who need a real workout. I always find the best routes.",
    location: "Shoreditch, London",
    dogSizes: ["Medium", "Large"],
    specialties: ["High-energy breeds", "Long walks"],
    availability: ["Mon", "Tue", "Thu", "Fri"],
  },
  {
    id: "w5",
    name: "Priya Sharma",
    rating: 4.9,
    reviews: 87,
    pricePerWalk: 18,
    distance: "0.6 mi",
    verified: true,
    experience: "4 years",
    bio: "Animal behaviourist and certified walker. I provide detailed walk reports with GPS routes. Safety is always my first priority.",
    location: "Stoke Newington, London",
    dogSizes: ["Small", "Medium", "Large"],
    specialties: ["Behaviour support", "Senior dogs", "Puppies"],
    availability: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  {
    id: "w6",
    name: "Tom Clarke",
    rating: 4.6,
    reviews: 22,
    pricePerWalk: 12,
    distance: "1.4 mi",
    verified: false,
    experience: "8 months",
    bio: "New to PawGo but passionate about dogs. Competitive rates while I build my client base. Always on time, always enthusiastic.",
    location: "Dalston, London",
    dogSizes: ["Small", "Medium"],
    specialties: ["Short walks", "Puppies"],
    availability: ["Wed", "Thu", "Fri", "Sat", "Sun"],
  },
];

export function getWalkerById(id: string): MockWalker | undefined {
  return MOCK_WALKERS.find((w) => w.id === id);
}
