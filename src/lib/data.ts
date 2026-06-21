export const COLLEGES = [
  // North Campus
  "Daulat Ram College",
  "Hansraj College",
  "Hindu College",
  "Kirori Mal College",
  "Miranda House",
  "Ramjas College",
  "SRCC",
  "St. Stephen's College",
  "SGTB Khalsa College",
  "Vallabhbhai Patel Chest Institute",
  // South Campus
  "Aryabhatta College",
  "ARSD College",
  "Motilal Nehru College",
  "Motilal Nehru College (Evening)",
  "Ram Lal Anand College",
  "Sri Venkateswara College",
  "Jesus and Mary College",
  "Maitreyi College",
  "Gargi College",
  "Kamala Nehru College",
  "Institute of Home Economics",
  "DCAC",
  "Lady Shri Ram College",
  "PGDAV College",
  "PGDAV College (Evening)",
  // East Campus
  "Shaheed Bhagat Singh College",
  "Shaheed Bhagat Singh College (Evening)",
  "College of Vocational Studies",
  "Sri Aurobindo College",
  "Sri Aurobindo College (Evening)",
  "Deshbandhu College",
  "Ramanujan College",
  "Acharya Narendra Dev College",
  "Shyam Lal College",
  "Shyam Lal College (Evening)",
  "Vivekananda College",
  "Bhim Rao Ambedkar College",
  "Maharaja Agrasen College",
  "Shaheed Rajguru College",
  // West Campus
  "Dyal Singh College",
  "Dyal Singh College (Evening)",
  "Rajdhani College",
  "Shivaji College",
  "Shyama Prasad Mukherji College",
  "Kalindi College",
  "Bharati College",
  "Deen Dayal Upadhyaya College",
  "Bhagini Nivedita College",
  "Janki Devi Memorial College",
  "Sri Guru Nanak Dev Khalsa College",
  "Lakshmibai College",
  "Satyawati College",
  "Satyawati College (Evening)",
  "Swami Shraddhanand College",
  "Aditi Mahavidyalaya",
  "Keshav Mahavidyalaya",
  "Sri Guru Gobind Singh College of Commerce",
  "SSCBS",
  // Medical & Special
  "Mata Sundri College for Women",
  "Zakir Husain Delhi College",
  "Zakir Husain Delhi College (Evening)",
  "Maulana Azad Medical College",
  "Lady Irwin College",
  "Lady Hardinge Medical College",
  "UCMS",
  "Rajkumari Amrit Kaur College of Nursing",
  "Ahilya Bai College of Nursing",
  "Florence Nightingale College of Nursing",
  "College of Art",
  "Ayurvedic and Unani Tibbia College",
] as const;

export type College = (typeof COLLEGES)[number];
export type Gender = "Girls only" | "Boys only" | "Co-ed";
export type ListingType = "PG" | "Flat";

export type Meal = { timing: string; menu: string };
export type Flatmate = { name: string; year: string; course: string };

export type Listing = {
  id: string;
  type: ListingType;
  name: string;
  locality: string;
  college: College;
  rent: number;
  rentSingle?: number;
  rentDouble?: number;
  rentTriple?: number;
  walkMinutes: number;
  gender: Gender;
  curfew: string;
  ac: boolean;
  roomType?: string;
  bhk?: string;
  idealSharers?: number;
  metroStation: string;
  metroWalk: number;
  metroPass: number;
  autoCost?: number;
  food: "Included" | "Tiffin service" | "Self-cooking" | "None";
  meals?: { breakfast?: Meal; lunch?: Meal; dinner?: Meal };
  electricity: string;
  water: string;
  laundry: string;
  internet: string;
  security: string[];
  negotiable: "Yes" | "No" | "Flexible";
  amenities: {
    gym?: { name: string; distance: string; fee: number };
    jogging?: { name: string; distance: string };
    market?: { name: string; walk: string };
    hospital?: { name: string; distance: string };
    atm?: { name: string; walk: string };
    pharmacy?: { name: string; walk: string };
    laundryShop?: { walk: string };
  };
  maid?: number;
  cook?: number;
  deposit?: number;
  flatmates?: Flatmate[];
  bestMatch?: boolean;
  founding?: boolean;
  localityDesc: string;
  reviewsNote?: string;
  whatsapp?: string;
  photos?: string[];
};

export const FILTER_CHIPS = [
  "Food included",
  "Girls only",
  "Boys only",
  "AC room",
  "Gym nearby",
  "Negotiable rent",
  "No curfew",
  "Under ₹6000",
  "Under ₹8000",
  "Under ₹10000",
  "Under ₹12000",
] as const;

export type FilterChip = (typeof FILTER_CHIPS)[number];

export function securityScore(security: string[]) {
  return Math.min(5, security.length);
}

// Approximate walking/metro distances from major DU localities (in km)
export const COLLEGE_DISTANCES: Record<string, Record<string, { km: number; metro: string; metroFare: number }>> = {
  "Vijay Nagar": {
    "Hindu College": { km: 0.8, metro: "Vishwavidyalaya", metroFare: 20 },
    "Miranda House": { km: 0.9, metro: "Vishwavidyalaya", metroFare: 20 },
    "Hansraj College": { km: 1.0, metro: "Vishwavidyalaya", metroFare: 20 },
    "Kirori Mal College": { km: 1.2, metro: "Vishwavidyalaya", metroFare: 20 },
    "SRCC": { km: 1.5, metro: "Vishwavidyalaya", metroFare: 20 },
    "St. Stephen's College": { km: 1.1, metro: "Vishwavidyalaya", metroFare: 20 },
  },
  "Kamla Nagar": {
    "Hindu College": { km: 1.2, metro: "Vishwavidyalaya", metroFare: 20 },
    "Miranda House": { km: 1.3, metro: "Vishwavidyalaya", metroFare: 20 },
    "SRCC": { km: 1.8, metro: "Vishwavidyalaya", metroFare: 20 },
    "Hansraj College": { km: 1.4, metro: "Vishwavidyalaya", metroFare: 20 },
    "Ramjas College": { km: 1.0, metro: "Vishwavidyalaya", metroFare: 20 },
  },
  "GTB Nagar": {
    "Hindu College": { km: 2.1, metro: "GTB Nagar", metroFare: 30 },
    "Miranda House": { km: 2.0, metro: "GTB Nagar", metroFare: 30 },
    "Hansraj College": { km: 2.3, metro: "GTB Nagar", metroFare: 30 },
    "SRCC": { km: 2.5, metro: "GTB Nagar", metroFare: 30 },
  },
  "Mukherjee Nagar": {
    "Hindu College": { km: 3.2, metro: "Adarsh Nagar", metroFare: 40 },
    "Miranda House": { km: 3.1, metro: "Adarsh Nagar", metroFare: 40 },
    "SRCC": { km: 3.8, metro: "Adarsh Nagar", metroFare: 40 },
    "Kirori Mal College": { km: 3.0, metro: "Adarsh Nagar", metroFare: 40 },
  },
};
