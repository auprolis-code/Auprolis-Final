// Demo Data for Local Testing
// This file provides comprehensive mock data so the application can run without Firebase
// All data is designed for demo purposes with realistic values

const DEMO_USERS = [
    {
        uid: 'demo-user-1',
        email: 'buyer@demo.com',
        displayName: 'Demo Buyer',
        firstName: 'Demo',
        lastName: 'Buyer',
        userType: 'buyer',
        phone: '+267 712 345 678',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        permissions: ['placeBids', 'viewAnalytics']
    },
    {
        uid: 'demo-user-2',
        email: 'seller@demo.com',
        displayName: 'Demo Seller',
        firstName: 'Demo',
        lastName: 'Seller',
        userType: 'sheriff',
        phone: '+267 723 456 789',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastActivity: new Date(Date.now() - 30 * 60 * 1000),
        permissions: ['createListings', 'manageBids', 'viewAnalytics']
    },
    {
        uid: 'demo-user-3',
        email: 'admin@demo.com',
        displayName: 'Demo Admin',
        firstName: 'Demo',
        lastName: 'Admin',
        userType: 'admin',
        phone: '+267 734 567 890',
        status: 'active',
        createdAt: new Date('2024-01-01'),
        lastActivity: new Date(Date.now() - 10 * 60 * 1000),
        permissions: ['createListings', 'placeBids', 'manageUsers', 'viewAnalytics', 'manageSystem']
    },
    {
        uid: 'demo-user-4',
        email: 'john.smith@demo.com',
        displayName: 'John Smith',
        firstName: 'John',
        lastName: 'Smith',
        userType: 'buyer',
        phone: '+267 745 678 901',
        status: 'active',
        createdAt: new Date('2024-02-01'),
        lastActivity: new Date(Date.now() - 5 * 60 * 60 * 1000),
        permissions: ['placeBids']
    },
    {
        uid: 'demo-user-5',
        email: 'mary.johnson@demo.com',
        displayName: 'Mary Johnson',
        firstName: 'Mary',
        lastName: 'Johnson',
        userType: 'buyer',
        phone: '+267 756 789 012',
        status: 'active',
        createdAt: new Date('2024-02-05'),
        lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
        permissions: ['placeBids']
    },
    {
        uid: 'demo-user-6',
        email: 'david.brown@demo.com',
        displayName: 'David Brown',
        firstName: 'David',
        lastName: 'Brown',
        userType: 'buyer',
        phone: '+267 767 890 123',
        status: 'active',
        createdAt: new Date('2024-01-20'),
        lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000),
        permissions: ['placeBids']
    }
];

const DEMO_ASSETS = [
    {
        id: 'asset-001',
        title: '2018 Toyota Hilux Double Cab',
        category: 'vehicles',
        location: 'Gaborone, Botswana',
        startingBid: 150000,
        currentBid: 175000,
        reservePrice: 150000,
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        mileage: '85000 km',
        year: '2018',
        fuelType: 'Diesel',
        transmission: 'Manual',
        description: 'Well-maintained Toyota Hilux Double Cab in excellent condition. Perfect for both city and off-road use. Regular servicing and low mileage. One owner.',
        images: [
            'vehicles/vehicles_2018-toyota-hilux-double-cab_gaborone_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Gaborone High Court',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        bidCount: 12,
        viewCount: 145,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-002',
        title: 'Commercial Building - CBD',
        category: 'property',
        location: 'Gaborone CBD, Botswana',
        startingBid: 2500000,
        currentBid: 2750000,
        reservePrice: 2500000,
        startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        size: '500 sqm',
        floors: '2',
        parking: '10 spaces',
        description: 'Prime commercial property in the heart of Gaborone CBD. Modern facilities, excellent location, high visibility. Ideal for retail or office space.',
        images: [
            'property/property_commercial-building-cbd_gaborone_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Botswana Development Corporation',
        contactInfo: {
            name: 'Botswana Development Corporation',
            email: 'properties@bdc.co.bw',
            phone: '+267 345 678 901'
        },
        bidCount: 8,
        viewCount: 89,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        badge: 'ending-soon',
        sellerType: 'institution'
    },
    {
        id: 'asset-003',
        title: 'Massey Ferguson Tractor',
        category: 'equipment',
        location: 'Francistown, Botswana',
        startingBid: 85000,
        currentBid: 92000,
        reservePrice: 85000,
        startDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Good',
        year: '2015',
        hours: '2500 hours',
        fuelType: 'Diesel',
        description: 'Heavy-duty farming tractor suitable for large-scale agricultural operations. Well maintained with regular servicing. Comes with farming implements.',
        images: [
            'vehicles/Tractor.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Francistown Sheriff Office',
        contactInfo: {
            name: 'Francistown Sheriff Office',
            email: 'sheriff@francistown.gov.bw',
            phone: '+267 234 567 890'
        },
        bidCount: 15,
        viewCount: 167,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        badge: 'ending-soon',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-004',
        title: 'Suburban House - Phakalane',
        category: 'property',
        location: 'Phakalane, Gaborone',
        startingBid: 1200000,
        currentBid: 1350000,
        reservePrice: 1200000,
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        bedrooms: '4',
        bathrooms: '3',
        size: '250 sqm',
        garden: 'Yes',
        description: 'Beautiful family home in Phakalane with modern amenities and spacious garden. Spacious 4-bedroom house in a quiet residential area.',
        images: [
            'assets/images/property/property_suburban-house_phakalane-gaborone_01.jpg',
            'assets/images/property/property_suburban-house_phakalane-gaborone_02.jpg',
            'assets/images/property/property_suburban-house_phakalane-gaborone_03.jpg',
            'assets/images/property/property_suburban-house_phakalane-gaborone_04.jpg'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Gaborone High Court',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        bidCount: 6,
        viewCount: 56,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-005',
        title: 'Office Furniture Set',
        category: 'furniture',
        location: 'Maun, Botswana',
        startingBid: 25000,
        currentBid: 28000,
        reservePrice: 25000,
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Good',
        pieces: '15',
        material: 'Wood',
        description: 'Complete office furniture set including desks, chairs, filing cabinets, and conference table. Good condition, ready for use.',
        images: [
            'furniture/furniture_office-furniture-set_maun_02.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Maun District Court',
        contactInfo: {
            name: 'Maun District Court',
            email: 'court@maun.gov.bw',
            phone: '+267 456 789 012'
        },
        bidCount: 4,
        viewCount: 42,
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
        sellerType: 'sheriff'
    },
    {
        id: 'asset-006',
        title: 'Computer Equipment Lot',
        category: 'electronics',
        location: 'Serowe, Botswana',
        startingBid: 45000,
        currentBid: 52000,
        reservePrice: 45000,
        startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Good',
        quantity: '25 units',
        specifications: 'Various models and configurations',
        description: 'Lot of computer equipment including desktops, laptops, and peripherals. All units tested and in working condition.',
        images: [
            'electronics/electronics_computer-equipment-lot_serowe_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Serowe Magistrate Court',
        contactInfo: {
            name: 'Serowe Magistrate Court',
            email: 'court@serowe.gov.bw',
            phone: '+267 567 890 123'
        },
        bidCount: 7,
        viewCount: 73,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-007',
        title: '2019 Nissan Navara',
        category: 'vehicles',
        location: 'Kasane, Botswana',
        startingBid: 180000,
        currentBid: 195000,
        reservePrice: 180000,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        mileage: '65000 km',
        year: '2019',
        fuelType: 'Diesel',
        transmission: 'Automatic',
        description: 'Nissan Navara in excellent condition, perfect for both city and off-road use. Low mileage, one owner, full service history.',
        images: [
            'vehicles/vehicles_2019-nissan-navara_kasane_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Kasane Sheriff Office',
        contactInfo: {
            name: 'Kasane Sheriff Office',
            email: 'sheriff@kasane.gov.bw',
            phone: '+267 678 901 234'
        },
        bidCount: 9,
        viewCount: 98,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-008',
        title: 'Industrial Generator',
        category: 'equipment',
        location: 'Lobatse, Botswana',
        startingBid: 75000,
        currentBid: 82000,
        reservePrice: 75000,
        startDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Good',
        capacity: '50 KVA',
        fuelType: 'Diesel',
        hours: '1200 hours',
        description: 'Heavy-duty industrial generator suitable for backup power or construction sites. Well maintained with regular servicing.',
        images: [
            'equipment/equipment_industrial-generator-50kva_lobatse_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Lobatse High Court',
        contactInfo: {
            name: 'Lobatse High Court',
            email: 'court@lobatse.gov.bw',
            phone: '+267 789 012 345'
        },
        bidCount: 11,
        viewCount: 124,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        badge: 'ending-soon',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-009',
        title: 'Luxury Villa - Phakalane',
        category: 'property',
        location: 'Phakalane, Gaborone',
        startingBid: 2800000,
        currentBid: 3200000,
        reservePrice: 2800000,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        bedrooms: '5',
        bathrooms: '4',
        size: '450 sqm',
        garden: 'Yes',
        pool: 'Yes',
        description: 'Stunning luxury villa with modern amenities, swimming pool, and landscaped garden. Perfect for luxury living.',
        images: [
            'property/property_luxury-villa_phakalane-gaborone_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Gaborone High Court',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        bidCount: 14,
        viewCount: 201,
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-010',
        title: 'Modern Apartment - CBD',
        category: 'property',
        location: 'Gaborone CBD, Botswana',
        startingBid: 950000,
        currentBid: 1100000,
        reservePrice: 950000,
        startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        bedrooms: '2',
        bathrooms: '2',
        size: '120 sqm',
        floor: '8th Floor',
        description: 'Contemporary apartment in the heart of CBD with city views and modern amenities. Perfect for professionals.',
        images: [
            'assets/images/property/property_modern-apartment-cbd_gaborone_01.jpg',
            'assets/images/property/property_modern-apartment-cbd_gaborone_02.jpg',
            'assets/images/property/property_modern-apartment-cbd_gaborone_03.jpg'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Gaborone High Court',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        bidCount: 5,
        viewCount: 67,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        sellerType: 'sheriff'
    },
    {
        id: 'asset-011',
        title: 'Office Building - CBD',
        category: 'property',
        location: 'Gaborone CBD, Botswana',
        startingBid: 4500000,
        currentBid: 5200000,
        reservePrice: 4500000,
        startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        floors: '6',
        size: '2000 sqm',
        parking: '25 spaces',
        description: 'Prime office building in CBD with modern facilities, parking, and excellent location. Ideal for corporate headquarters.',
        images: [
            'property/property_office-building-cbd_gaborone_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Botswana Development Corporation',
        contactInfo: {
            name: 'Botswana Development Corporation',
            email: 'properties@bdc.co.bw',
            phone: '+267 345 678 901'
        },
        bidCount: 6,
        viewCount: 156,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'institution'
    },
    {
        id: 'asset-012',
        title: 'Farm - Mahalapye',
        category: 'property',
        location: 'Mahalapye, Botswana',
        startingBid: 3800000,
        currentBid: 4200000,
        reservePrice: 3800000,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Good',
        size: '50 hectares',
        farmhouse: 'Yes',
        irrigation: 'Yes',
        description: 'Large agricultural farm with irrigation system, farmhouse, and equipment. Perfect for commercial farming operations.',
        images: [
            'assets/images/property/property_farm_mahalapye_01.jpg',
            'assets/images/property/property_farm_mahalapye_02.jpg',
            'assets/images/property/property_farm_mahalapye_03.jpg'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Mahalapye Magistrate Court',
        contactInfo: {
            name: 'Mahalapye Magistrate Court',
            email: 'court@mahalapye.gov.bw',
            phone: '+267 234 567 890'
        },
        bidCount: 10,
        viewCount: 178,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    },
    {
        id: 'asset-013',
        title: '2020 BMW X5',
        category: 'vehicles',
        location: 'Francistown, Botswana',
        startingBid: 280000,
        currentBid: 320000,
        reservePrice: 280000,
        startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000),
        status: 'active',
        condition: 'Excellent',
        mileage: '45000 km',
        year: '2020',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        description: 'Luxury SUV in pristine condition with full service history. All features working perfectly, like new condition.',
        images: [
            'vehicles/vehicles_2020-bmw-x5_francistown_01.png'
        ],
        sellerId: 'demo-user-2',
        sellerName: 'Francistown Sheriff Office',
        contactInfo: {
            name: 'Francistown Sheriff Office',
            email: 'sheriff@francistown.gov.bw',
            phone: '+267 234 567 890'
        },
        bidCount: 13,
        viewCount: 189,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        badge: 'new',
        sellerType: 'sheriff'
    }
];

const DEMO_BIDS = [
    // Bids for asset-001 (Toyota Hilux)
    {
        id: 'bid-001',
        listingId: 'asset-001',
        assetId: 'asset-001',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 175000,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'winning',
        isWinning: true,
        isActive: true
    },
    {
        id: 'bid-002',
        listingId: 'asset-001',
        assetId: 'asset-001',
        bidderId: 'demo-user-4',
        bidderName: 'John Smith',
        bidderEmail: 'john.smith@demo.com',
        amount: 170000,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'outbid',
        isWinning: false,
        isActive: false
    },
    {
        id: 'bid-003',
        listingId: 'asset-001',
        assetId: 'asset-001',
        bidderId: 'demo-user-5',
        bidderName: 'Mary Johnson',
        bidderEmail: 'mary.johnson@demo.com',
        amount: 165000,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'outbid',
        isWinning: false,
        isActive: false
    },
    // Bids for asset-002 (Commercial Building)
    {
        id: 'bid-004',
        listingId: 'asset-002',
        assetId: 'asset-002',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 2750000,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'winning',
        isWinning: true,
        isActive: true
    },
    {
        id: 'bid-005',
        listingId: 'asset-002',
        assetId: 'asset-002',
        bidderId: 'demo-user-6',
        bidderName: 'David Brown',
        bidderEmail: 'david.brown@demo.com',
        amount: 2700000,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'outbid',
        isWinning: false,
        isActive: false
    },
    // Bids for asset-003 (Tractor)
    {
        id: 'bid-006',
        listingId: 'asset-003',
        assetId: 'asset-003',
        bidderId: 'demo-user-4',
        bidderName: 'John Smith',
        bidderEmail: 'john.smith@demo.com',
        amount: 92000,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'winning',
        isWinning: true,
        isActive: true
    },
    {
        id: 'bid-007',
        listingId: 'asset-003',
        assetId: 'asset-003',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 90000,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'outbid',
        isWinning: false,
        isActive: false
    },
    // Bids for asset-004 (Suburban House)
    {
        id: 'bid-008',
        listingId: 'asset-004',
        assetId: 'asset-004',
        bidderId: 'demo-user-5',
        bidderName: 'Mary Johnson',
        bidderEmail: 'mary.johnson@demo.com',
        amount: 1350000,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        status: 'winning',
        isWinning: true,
        isActive: true
    },
    // Bids for asset-009 (Luxury Villa)
    {
        id: 'bid-009',
        listingId: 'asset-009',
        assetId: 'asset-009',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 3200000,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: 'winning',
        isWinning: true,
        isActive: true
    },
    {
        id: 'bid-010',
        listingId: 'asset-009',
        assetId: 'asset-009',
        bidderId: 'demo-user-6',
        bidderName: 'David Brown',
        bidderEmail: 'david.brown@demo.com',
        amount: 3100000,
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        status: 'outbid',
        isWinning: false,
        isActive: false
    },
    // Bids for asset-013 (BMW X5)
    {
        id: 'bid-011',
        listingId: 'asset-013',
        assetId: 'asset-013',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 320000,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'winning',
        isWinning: true,
        isActive: true
    },
    {
        id: 'bid-012',
        listingId: 'asset-013',
        assetId: 'asset-013',
        bidderId: 'demo-user-4',
        bidderName: 'John Smith',
        bidderEmail: 'john.smith@demo.com',
        amount: 300000,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: 'outbid',
        isWinning: false,
        isActive: false
    },
    // Historical completed bids
    {
        id: 'bid-013',
        listingId: 'asset-007',
        assetId: 'asset-007',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 195000,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'won',
        isWinning: true,
        isActive: false
    },
    {
        id: 'bid-014',
        listingId: 'asset-008',
        assetId: 'asset-008',
        bidderId: 'demo-user-1',
        bidderName: 'Demo Buyer',
        bidderEmail: 'buyer@demo.com',
        amount: 82000,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'pending',
        isWinning: true,
        isActive: true
    }
];

const DEMO_TRANSACTIONS = [
    {
        id: 'txn-001',
        listingId: 'asset-007',
        listingTitle: '2019 Nissan Navara',
        buyerId: 'demo-user-1',
        buyerName: 'Demo Buyer',
        buyerEmail: 'buyer@demo.com',
        sellerId: 'demo-user-2',
        sellerName: 'Kasane Sheriff Office',
        amount: 195000,
        commission: 9750,
        netAmount: 185250,
        status: 'completed',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Bank Transfer',
        reference: 'TXN-001-2024'
    },
    {
        id: 'txn-002',
        listingId: 'asset-008',
        listingTitle: 'Industrial Generator',
        buyerId: 'demo-user-4',
        buyerName: 'John Smith',
        buyerEmail: 'john.smith@demo.com',
        sellerId: 'demo-user-2',
        sellerName: 'Lobatse High Court',
        amount: 82000,
        commission: 4100,
        netAmount: 77900,
        status: 'pending',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Credit Card',
        reference: 'TXN-002-2024'
    },
    {
        id: 'txn-003',
        listingId: 'asset-005',
        listingTitle: 'Office Furniture Set',
        buyerId: 'demo-user-5',
        buyerName: 'Mary Johnson',
        buyerEmail: 'mary.johnson@demo.com',
        sellerId: 'demo-user-2',
        sellerName: 'Maun District Court',
        amount: 28000,
        commission: 1400,
        netAmount: 26600,
        status: 'completed',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Bank Transfer',
        reference: 'TXN-003-2024'
    },
    {
        id: 'txn-004',
        listingId: 'asset-006',
        listingTitle: 'Computer Equipment Lot',
        buyerId: 'demo-user-6',
        buyerName: 'David Brown',
        buyerEmail: 'david.brown@demo.com',
        sellerId: 'demo-user-2',
        sellerName: 'Serowe Magistrate Court',
        amount: 52000,
        commission: 2600,
        netAmount: 49400,
        status: 'completed',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Bank Transfer',
        reference: 'TXN-004-2024'
    },
    {
        id: 'txn-005',
        listingId: 'asset-001',
        listingTitle: '2018 Toyota Hilux Double Cab',
        buyerId: 'demo-user-1',
        buyerName: 'Demo Buyer',
        buyerEmail: 'buyer@demo.com',
        sellerId: 'demo-user-2',
        sellerName: 'Gaborone High Court',
        amount: 175000,
        commission: 8750,
        netAmount: 166250,
        status: 'pending',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Pending',
        reference: 'TXN-005-2024'
    }
];

// Watchlist items for demo buyer (demo-user-1)
const DEMO_WATCHLIST = [
    {
        id: 'watch-001',
        userId: 'demo-user-1',
        assetId: 'asset-009',
        addedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        notes: 'Luxury property - potential investment',
        alerts: {
            priceChange: true,
            endingSoon: true,
            newBids: true
        }
    },
    {
        id: 'watch-002',
        userId: 'demo-user-1',
        assetId: 'asset-011',
        addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: 'Office building for business expansion',
        alerts: {
            priceChange: true,
            endingSoon: false,
            newBids: true
        }
    },
    {
        id: 'watch-003',
        userId: 'demo-user-1',
        assetId: 'asset-013',
        addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: 'Premium vehicle for personal use',
        alerts: {
            priceChange: false,
            endingSoon: true,
            newBids: true
        }
    }
];

// Reservations/Bookings data
const DEMO_RESERVATIONS = [
    {
        id: 'reservation-001',
        listingId: 'asset-001',
        assetId: 'asset-001',
        userId: 'demo-user-1',
        userName: 'Demo Buyer',
        userEmail: 'buyer@demo.com',
        userPhone: '+267 712 345 678',
        notes: 'Interested in viewing the vehicle',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'pending',
        isActive: true,
        asset: DEMO_ASSETS.find(a => a.id === 'asset-001')
    },
    {
        id: 'reservation-002',
        listingId: 'asset-002',
        assetId: 'asset-002',
        userId: 'demo-user-1',
        userName: 'Demo Buyer',
        userEmail: 'buyer@demo.com',
        userPhone: '+267 712 345 678',
        notes: 'Would like to schedule a viewing',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'confirmed',
        isActive: true,
        asset: DEMO_ASSETS.find(a => a.id === 'asset-002')
    },
    {
        id: 'reservation-003',
        listingId: 'asset-009',
        assetId: 'asset-009',
        userId: 'demo-user-4',
        userName: 'John Smith',
        userEmail: 'john.smith@demo.com',
        userPhone: '+267 745 678 901',
        notes: '',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        status: 'pending',
        isActive: true,
        asset: DEMO_ASSETS.find(a => a.id === 'asset-009')
    }
];

// Sample assets data (for assets-list.js)
const SAMPLE_ASSETS = DEMO_ASSETS;

// Export for use in other files
window.DEMO_USERS = DEMO_USERS;
window.DEMO_ASSETS = DEMO_ASSETS;
window.DEMO_BIDS = DEMO_BIDS;
window.DEMO_RESERVATIONS = DEMO_RESERVATIONS;
window.DEMO_TRANSACTIONS = DEMO_TRANSACTIONS;
window.DEMO_WATCHLIST = DEMO_WATCHLIST;
window.SAMPLE_ASSETS = SAMPLE_ASSETS;
