export interface Product {
    brand: string
    shortDescription: string
    sku: string
    id: string
    slug: string
    name: string
    description: string
    price: number
    images: string[]
    thumbnail?: string
    category: string
    rating: number
    stock: number
    reviews: Review[]
    specifications: Record<string, string>
}

export interface Review {
    id: string
    user: string
    rating: number
    comment: string
    date: string
}

export interface CartItem {
    product: Product
    quantity: number
    brand: string
}

export interface Order {
    id: string
    date: string
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
    items: CartItem[]
    total: number
    shippingAddress: Address
}

export interface Address {
    id: string
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault: boolean
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  dob?: string;
  bio?: string;
  companyName?: string;
  gstin?: string;
  loyaltyPoints?: number;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  profileCompletion?: { score: number; missing: string[] };
  preferences?: {
    language?: string;
    currency?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      orderUpdates?: boolean;
      marketing?: boolean;
      push?: boolean;
    };
  };
}