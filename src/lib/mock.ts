import { Product, CartItem } from "@/types/product"

export const mockProducts: Product[] = [
    {
        id: "1",
        slug: "premium-sneakers",
        name: "Premium Comfort Sneakers",
        brand: "Nike",
        price: 129.99,
        description: "Experience ultimate comfort with our premium sneakers featuring advanced cushioning technology and breathable materials for all-day wear.",
        shortDescription: "Premium comfort sneakers with advanced cushioning",
        images: [
            "https://plus.unsplash.com/premium_photo-1698846878442-4f0b4166fb85?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://plus.unsplash.com/premium_photo-1698846878442-4f0b4166fb85?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://plus.unsplash.com/premium_photo-1698846878442-4f0b4166fb85?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        ],
        category: "Footwear",
        rating: 4.5,
        stock: 15,
        sku: "NK-PS-001",
        specifications: {
            "Material": "Mesh and synthetic leather",
            "Sole": "Rubber",
            "Closure": "Lace-up",
            "Color": "White/Black",
            "Weight": "320g"
        },
        reviews: [
            {
                id: "1",
                user: "Alex Johnson",
                rating: 5,
                comment: "Extremely comfortable right out of the box!",
                date: "2023-05-15"
            },
            {
                id: "2",
                user: "Sam Wilson",
                rating: 4,
                comment: "Great shoes but run a bit small",
                date: "2023-04-22"
            }
        ]
    },
    // Add more products as needed
]

export const mockCartItems: CartItem[] = [
    {
        product: mockProducts[0],
        quantity: 2,
        brand: ""
    },
    // Add more cart items as needed
]