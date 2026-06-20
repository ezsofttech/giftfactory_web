import {
  Smartphone,
  Laptop,
  Shirt,
  Handbag,
  Sofa,
  Microwave,
  Gamepad2,
  ShirtIcon,
  Table2,
  Box,
  CookingPot,
  CloudLightning,
} from "lucide-react";

// export const headCategory = [
//   {
//     name: "Electronics",
//     slug: "electronics",
//     icon: (
//       <Smartphone className="h-5 w-5 sm:mr-2 fill-current sm:fill-none text-secondary " />
//     ),
//     children: [
//       {
//         name: "Mobiles",
//         slug: "mobiles",
//         icon: (
//           <Smartphone
//             strokeWidth={3}
//             className="h-4 w-4 fill-current sm:fill-none sm:mr-2"
//           />
//         ),
//         children: [
//           {
//             name: "Smartphones",
//             slug: "smartphones",
//             icon: (
//               <Smartphone className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Feature Phones",
//             slug: "feature-phones",
//             icon: (
//               <Smartphone className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Refurbished Phones",
//             slug: "refurbished-phones",
//             icon: (
//               <Smartphone className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//         ],
//       },
//       {
//         name: "Laptops",
//         slug: "laptops",
//         icon: (
//           <Laptop
//             strokeWidth={3}
//             className="h-4 w-4 fill-current sm:fill-none sm:mr-2"
//           />
//         ),
//         children: [
//           {
//             name: "Gaming Laptops",
//             slug: "gaming-laptops",
//             icon: (
//               <Gamepad2 className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Ultrabooks",
//             slug: "ultrabooks",
//             icon: (
//               <Laptop className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "2-in-1 Laptops",
//             slug: "2-in-1-laptops",
//             icon: (
//               <Laptop className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Fashion",
//     slug: "fashion",
//     icon: (
//       <ShirtIcon className="h-5 w-5 sm:mr-2 fill-current sm:fill-none text-secondary " />
//     ),
//     children: [
//       {
//         name: "Men",
//         slug: "men",
//         icon: (
//           <Shirt
//             strokeWidth={3}
//             className="h-4 w-4 fill-current sm:fill-none sm:mr-2"
//           />
//         ),
//         children: [
//           {
//             name: "T-Shirts",
//             slug: "t-shirts",
//             icon: (
//               <Shirt className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Jeans",
//             slug: "jeans",
//             icon: (
//               <Shirt className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Shoes",
//             slug: "shoes",
//             icon: (
//               <Shirt className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//         ],
//       },
//       {
//         name: "Women",
//         slug: "women",
//         icon: (
//           <CloudLightning
//             strokeWidth={3}
//             className="h-4 w-4 fill-current sm:fill-none sm:mr-2"
//           />
//         ),
//         children: [
//           {
//             name: "Dresses",
//             slug: "dresses",
//             icon: (
//               <CloudLightning className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Handbags",
//             slug: "handbags",
//             icon: (
//               <Handbag className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Heels",
//             slug: "heels",
//             icon: (
//               <CloudLightning className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//         ],
//       },
//     ],
//   },
//   {
//     name: "Home & Kitchen",
//     slug: "home-kitchen",
//     icon: (
//       <Sofa className="h-5 w-5 sm:mr-2 fill-current sm:fill-none text-secondary " />
//     ),
//     children: [
//       {
//         name: "Furniture",
//         slug: "furniture",
//         icon: (
//           <Sofa
//             strokeWidth={3}
//             className="h-4 w-4 fill-current sm:fill-none sm:mr-2"
//           />
//         ),
//         children: [
//           {
//             name: "Sofas",
//             slug: "sofas",
//             icon: (
//               <Sofa className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Beds",
//             slug: "beds",
//             icon: (
//               <Sofa className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Dining Tables",
//             slug: "dining-tables",
//             icon: (
//               <Table2 className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//         ],
//       },
//       {
//         name: "Kitchen",
//         slug: "kitchen",
//         icon: (
//           <CookingPot
//             strokeWidth={3}
//             className="h-4 w-4 fill-current sm:fill-none sm:mr-2"
//           />
//         ),
//         children: [
//           {
//             name: "Cookware",
//             slug: "cookware",
//             icon: (
//               <CookingPot className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//           {
//             name: "Storage",
//             slug: "storage",
//             icon: <Box className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />,
//           },
//           {
//             name: "Appliances",
//             slug: "appliances",
//             icon: (
//               <Microwave className="h-4 w-4 fill-current sm:fill-none sm:mr-2" />
//             ),
//           },
//         ],
//       },
//     ],
//   },
// ];

export const headCategory = [
  {
    name: "Electronics",
    slug: "electronics",
    image:
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=100&auto=format",
    children: [
      {
        name: "Mobiles",
        slug: "mobiles",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format",
        children: [
          {
            name: "Smartphones",
            slug: "smartphones",
            image:
              "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Feature Phones",
            slug: "feature-phones",
            image:
              "https://images.unsplash.com/photo-1520923642038-b4259acecbd7?w=100&auto=format",
          },
          {
            name: "Refurbished Phones",
            slug: "refurbished-phones",
            image:
              "https://images.pexels.com/photos/341523/pexels-photo-341523.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Mobile Accessories",
            slug: "mobile-accessories",
            image:
              "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=100&auto=format",
          },
        ],
      },
      {
        name: "Laptops",
        slug: "laptops",
        image:
          "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=100&auto=format",
        children: [
          {
            name: "Gaming Laptops",
            slug: "gaming-laptops",
            image:
              "https://images.pexels.com/photos/5626726/pexels-photo-5626726.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Ultrabooks",
            slug: "ultrabooks",
            image:
              "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100&auto=format",
          },
          {
            name: "2-in-1 Laptops",
            slug: "2-in-1-laptops",
            image:
              "https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Business Laptops",
            slug: "business-laptops",
            image:
              "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&auto=format",
          },
        ],
      },
      {
        name: "TVs & Displays",
        slug: "tvs-displays",
        image:
          "https://images.pexels.com/photos/5721908/pexels-photo-5721908.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Smart TVs",
            slug: "smart-tvs",
            image:
              "https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=100&auto=format",
          },
          {
            name: "Monitors",
            slug: "monitors",
            image:
              "https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Projectors",
            slug: "projectors",
            image:
              "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=100&auto=format",
          },
        ],
      },
      {
        name: "Audio",
        slug: "audio",
        image:
          "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Headphones",
            slug: "headphones",
            image:
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&auto=format",
          },
          {
            name: "Speakers",
            slug: "speakers",
            image:
              "https://images.pexels.com/photos/2047905/pexels-photo-2047905.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Earbuds",
            slug: "earbuds",
            image:
              "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100&auto=format",
          },
          {
            name: "Soundbars",
            slug: "soundbars",
            image:
              "https://images.pexels.com/photos/3944405/pexels-photo-3944405.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&auto=format",
    children: [
      {
        name: "Men's Fashion",
        slug: "mens-fashion",
        image:
          "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "T-Shirts",
            slug: "mens-t-shirts",
            image:
              "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=100&auto=format",
          },
          {
            name: "Jeans",
            slug: "mens-jeans",
            image:
              "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Shoes",
            slug: "mens-shoes",
            image:
              "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=100&auto=format",
          },
          {
            name: "Watches",
            slug: "mens-watches",
            image:
              "https://images.pexels.com/photos/2783873/pexels-photo-2783873.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
        ],
      },
      {
        name: "Women's Fashion",
        slug: "womens-fashion",
        image:
          "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=100&auto=format",
        children: [
          {
            name: "Dresses",
            slug: "womens-dresses",
            image:
              "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Handbags",
            slug: "womens-handbags",
            image:
              "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=100&auto=format",
          },
          {
            name: "Heels",
            slug: "womens-heels",
            image:
              "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Jewelry",
            slug: "womens-jewelry",
            image:
              "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&auto=format",
          },
        ],
      },
      {
        name: "Kids' Fashion",
        slug: "kids-fashion",
        image:
          "https://images.pexels.com/photos/35537/child-children-girl-happy.jpg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Boys' Clothing",
            slug: "boys-clothing",
            image:
              "https://images.unsplash.com/photo-1604917018138-9fe1829a07bc?w=100&auto=format",
          },
          {
            name: "Girls' Clothing",
            slug: "girls-clothing",
            image:
              "https://images.pexels.com/photos/5875797/pexels-photo-5875797.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Kids' Shoes",
            slug: "kids-shoes",
            image:
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format",
          },
        ],
      },
    ],
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    image:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=100&auto=format",
    children: [
      {
        name: "Furniture",
        slug: "furniture",
        image:
          "https://images.pexels.com/photos/276534/pexels-photo-276534.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Sofas",
            slug: "sofas",
            image:
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100&auto=format",
          },
          {
            name: "Beds",
            slug: "beds",
            image:
              "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Dining Tables",
            slug: "dining-tables",
            image:
              "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=100&auto=format",
          },
          {
            name: "Wardrobes",
            slug: "wardrobes",
            image:
              "https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
        ],
      },
      {
        name: "Kitchen Appliances",
        slug: "kitchen-appliances",
        image:
          "https://images.unsplash.com/photo-1583778176476-4a8b02a64c01?w=100&auto=format",
        children: [
          {
            name: "Refrigerators",
            slug: "refrigerators",
            image:
              "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Microwaves",
            slug: "microwaves",
            image:
              "https://images.unsplash.com/photo-1597733336794-12d05021d510?w=100&auto=format",
          },
          {
            name: "Blenders",
            slug: "blenders",
            image:
              "https://images.pexels.com/photos/4397919/pexels-photo-4397919.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Coffee Makers",
            slug: "coffee-makers",
            image:
              "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&auto=format",
          },
        ],
      },
      {
        name: "Home Decor",
        slug: "home-decor",
        image:
          "https://images.pexels.com/photos/584399/living-room-couch-interior-room-584399.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Lamps",
            slug: "lamps",
            image:
              "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=100&auto=format",
          },
          {
            name: "Wall Art",
            slug: "wall-art",
            image:
              "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Curtains",
            slug: "curtains",
            image:
              "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&auto=format",
          },
        ],
      },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=100&auto=format",
    children: [
      {
        name: "Skincare",
        slug: "skincare",
        image:
          "https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Moisturizers",
            slug: "moisturizers",
            image:
              "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=100&auto=format",
          },
          {
            name: "Face Wash",
            slug: "face-wash",
            image:
              "https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Sunscreen",
            slug: "sunscreen",
            image:
              "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&auto=format",
          },
        ],
      },
      {
        name: "Hair Care",
        slug: "hair-care",
        image:
          "https://images.pexels.com/photos/3998418/pexels-photo-3998418.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Shampoo",
            slug: "shampoo",
            image:
              "https://images.unsplash.com/photo-1608248544923-0ac26a2756da?w=100&auto=format",
          },
          {
            name: "Conditioner",
            slug: "conditioner",
            image:
              "https://images.pexels.com/photos/673858/pexels-photo-673858.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Hair Styling",
            slug: "hair-styling",
            image:
              "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=100&auto=format",
          },
        ],
      },
      {
        name: "Makeup",
        slug: "makeup",
        image:
          "https://images.pexels.com/photos/2536965/pexels-photo-2536965.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Lipstick",
            slug: "lipstick",
            image:
              "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&auto=format",
          },
          {
            name: "Foundation",
            slug: "foundation",
            image:
              "https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Eyeshadow",
            slug: "eyeshadow",
            image:
              "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=100&auto=format",
          },
        ],
      },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    image:
      "https://images.unsplash.com/photo-1530137073520-4d84d65a8a80?w=100&auto=format",
    children: [
      {
        name: "Fitness",
        slug: "fitness",
        image:
          "https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Treadmills",
            slug: "treadmills",
            image:
              "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&auto=format",
          },
          {
            name: "Dumbbells",
            slug: "dumbbells",
            image:
              "https://images.pexels.com/photos/17840/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Yoga Mats",
            slug: "yoga-mats",
            image:
              "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&auto=format",
          },
        ],
      },
      {
        name: "Outdoor Recreation",
        slug: "outdoor-recreation",
        image:
          "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Camping Gear",
            slug: "camping-gear",
            image:
              "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=100&auto=format",
          },
          {
            name: "Bicycles",
            slug: "bicycles",
            image:
              "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Hiking Boots",
            slug: "hiking-boots",
            image:
              "https://images.unsplash.com/photo-1600267165477-39d6ecc47ee5?w=100&auto=format",
          },
        ],
      },
      {
        name: "Team Sports",
        slug: "team-sports",
        image:
          "https://images.pexels.com/photos/3148452/pexels-photo-3148452.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Soccer",
            slug: "soccer",
            image:
              "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=100&auto=format",
          },
          {
            name: "Basketball",
            slug: "basketball",
            image:
              "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Cricket",
            slug: "cricket",
            image:
              "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=100&auto=format",
          },
        ],
      },
    ],
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=100&auto=format",
    children: [
      {
        name: "Kids' Toys",
        slug: "kids-toys",
        image:
          "https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Action Figures",
            slug: "action-figures",
            image:
              "https://images.unsplash.com/photo-1593990965215-075c1f918806?w=100&auto=format",
          },
          {
            name: "Dolls",
            slug: "dolls",
            image:
              "https://images.pexels.com/photos/38285/kids-dolls-play-girls-38285.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Building Blocks",
            slug: "building-blocks",
            image:
              "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=100&auto=format",
          },
        ],
      },
      {
        name: "Board Games",
        slug: "board-games",
        image:
          "https://images.pexels.com/photos/776654/pexels-photo-776654.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Classic Games",
            slug: "classic-games",
            image:
              "https://images.unsplash.com/photo-1589996448606-27d38c70f3bc?w=100&auto=format",
          },
          {
            name: "Strategy Games",
            slug: "strategy-games",
            image:
              "https://images.pexels.com/photos/262333/pexels-photo-262333.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Party Games",
            slug: "party-games",
            image:
              "https://images.unsplash.com/photo-1608889825103-eb5af1a51a0f?w=100&auto=format",
          },
        ],
      },
      {
        name: "Video Games",
        slug: "video-games",
        image:
          "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=100",
        children: [
          {
            name: "Game Consoles",
            slug: "game-consoles",
            image:
              "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=100&auto=format",
          },
          {
            name: "Game Accessories",
            slug: "game-accessories",
            image:
              "https://images.pexels.com/photos/4522994/pexels-photo-4522994.jpeg?auto=compress&cs=tinysrgb&w=100",
          },
          {
            name: "Game Cards",
            slug: "game-cards",
            image:
              "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100&auto=format",
          },
        ],
      },
    ],
  },
];
