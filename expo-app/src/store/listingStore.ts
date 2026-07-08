import { create } from 'zustand';

export type Urgency = 'green' | 'amber' | 'red';
export type Status = 'available' | 'claimed' | 'collected' | 'expired';

export interface Listing {
  id: string;
  donorName: string;
  foodName: string;
  category: string;
  qty: number;
  urgency: Urgency;
  status: Status;
  distance: string;
  timeRemaining: string;
}

const mockListings: Listing[] = [
  { id: '1', donorName: 'Local Cafe', foodName: 'Chicken Biryani', category: 'Cooked', qty: 15, urgency: 'red', status: 'available', distance: '1.2 km', timeRemaining: '45 mins' },
  { id: '2', donorName: 'Fresh Bakery', foodName: 'Assorted Bread', category: 'Bakery', qty: 5, urgency: 'amber', status: 'available', distance: '2.5 km', timeRemaining: '3 hrs' },
  { id: '3', donorName: 'Green Grocers', foodName: 'Mixed Vegetables', category: 'Raw', qty: 20, urgency: 'green', status: 'available', distance: '4.0 km', timeRemaining: '8 hrs' },
  { id: '4', donorName: 'Spice House', foodName: 'Paneer Tikka', category: 'Cooked', qty: 8, urgency: 'green', status: 'claimed', distance: '1.5 km', timeRemaining: '5 hrs' },
];

interface ListingState {
  listings: Listing[];
  addListing: (listing: Omit<Listing, 'id'>) => void;
  claimListing: (id: string) => void;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: mockListings,
  addListing: (listing) => set((state) => ({
    listings: [{ ...listing, id: Math.random().toString() }, ...state.listings]
  })),
  claimListing: (id) => set((state) => ({
    listings: state.listings.map(l => l.id === id ? { ...l, status: 'claimed' } : l)
  }))
}));
