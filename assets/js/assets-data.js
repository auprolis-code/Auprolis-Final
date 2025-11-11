// Enhanced Assets Data
// This file contains comprehensive asset data for the enhanced dashboard

const SAMPLE_ASSETS = [
    {
        id: 'asset-001',
        title: '2018 Toyota Hilux Double Cab',
        category: 'vehicles',
        location: 'Gaborone, Botswana',
        startingBid: 150000,
        currentBid: 175000,
        endDate: '2024-02-15T15:00:00Z',
        startDate: '2024-01-15T10:00:00Z',
        description: 'Well-maintained Toyota Hilux in excellent condition. Perfect for business or personal use.',
        images: [
            'vehicles/vehicles_2018-toyota-hilux-double-cab_gaborone_01.png'
        ],
        condition: 'Excellent',
        mileage: '85000 km',
        year: '2018',
        fuelType: 'Diesel',
        transmission: 'Manual',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'new',
        valuations: {
            marketValue: 180000,
            reservePrice: 150000,
            appraisalDate: '2024-01-10',
            appraiser: 'Botswana Motor Vehicle Assessors',
            reportUrl: 'assets/documents/vehicle-appraisal-001.pdf'
        },
        sheriffDetails: {
            office: 'Gaborone High Court',
            address: 'Government Enclave, Gaborone',
            contactPerson: 'Sheriff John Motsumi',
            phone: '+267 123 456 789',
            email: 'sheriff@gaborone.gov.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'registration', name: 'Vehicle Registration', url: 'assets/documents/vehicle-reg-001.pdf' },
            { type: 'inspection', name: 'Roadworthy Certificate', url: 'assets/documents/roadworthy-001.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/vehicle-appraisal-001.pdf' }
        ]
    },
    {
        id: 'asset-002',
        title: 'Massey Ferguson Tractor',
        category: 'equipment',
        location: 'Francistown, Botswana',
        startingBid: 85000,
        currentBid: 92000,
        endDate: '2024-02-20T14:00:00Z',
        startDate: '2024-01-20T09:00:00Z',
        description: 'Heavy-duty farming tractor suitable for large-scale agricultural operations.',
        images: [
            'vehicles/Tractor.png'
        ],
        condition: 'Good',
        year: '2015',
        hours: '2500 hours',
        fuelType: 'Diesel',
        contactInfo: {
            name: 'Francistown Sheriff Office',
            email: 'sheriff@francistown.gov.bw',
            phone: '+267 234 567 890'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'ending-soon'
    },
    {
        id: 'asset-003',
        title: 'Commercial Building - CBD',
        category: 'property',
        location: 'Gaborone CBD, Botswana',
        startingBid: 2500000,
        currentBid: 2750000,
        endDate: '2024-03-01T16:00:00Z',
        startDate: '2024-02-01T10:00:00Z',
        description: 'Prime commercial property in the heart of Gaborone CBD. Ideal for office or retail use.',
        images: [
            'property/property_commercial-building-cbd_gaborone_01.png'
        ],
        condition: 'Excellent',
        size: '500 sqm',
        floors: '2',
        parking: '10 spaces',
        contactInfo: {
            name: 'Botswana Development Corporation',
            email: 'properties@bdc.co.bw',
            phone: '+267 345 678 901'
        },
        sellerType: 'institution',
        isActive: true,
        badge: 'new'
    },
    {
        id: 'asset-004',
        title: 'Suburban House - Phakalane',
        category: 'property',
        location: 'Phakalane, Gaborone',
        startingBid: 1200000,
        currentBid: 1350000,
        endDate: '2024-02-25T12:00:00Z',
        startDate: '2024-01-25T08:00:00Z',
        description: 'Beautiful family home in Phakalane with modern amenities and spacious garden.',
        images: [
            'assets/images/property/property_suburban-house_phakalane-gaborone_01.jpg',
            'assets/images/property/property_suburban-house_phakalane-gaborone_02.jpg',
            'assets/images/property/property_suburban-house_phakalane-gaborone_03.jpg',
            'assets/images/property/property_suburban-house_phakalane-gaborone_04.jpg'
        ],
        condition: 'Excellent',
        bedrooms: '4',
        bathrooms: '3',
        size: '250 sqm',
        garden: 'Yes',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: null
    },
    {
        id: 'asset-005',
        title: 'Office Furniture Set',
        category: 'furniture',
        location: 'Maun, Botswana',
        startingBid: 25000,
        currentBid: 28000,
        endDate: '2024-02-18T13:00:00Z',
        startDate: '2024-01-18T09:00:00Z',
        description: 'Complete office furniture set including desks, chairs, and filing cabinets.',
        images: [
            'furniture/furniture_office-furniture-set_maun_02.png'
        ],
        condition: 'Good',
        pieces: '15',
        material: 'Wood',
        contactInfo: {
            name: 'Maun District Court',
            email: 'court@maun.gov.bw',
            phone: '+267 456 789 012'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'ending-soon'
    },
    {
        id: 'asset-006',
        title: 'Computer Equipment Lot',
        category: 'electronics',
        location: 'Serowe, Botswana',
        startingBid: 45000,
        currentBid: 52000,
        endDate: '2024-02-28T15:00:00Z',
        startDate: '2024-01-28T10:00:00Z',
        description: 'Lot of computer equipment including desktops, laptops, and peripherals.',
        images: [
            'electronics/electronics_computer-equipment-lot_serowe_01.png'
        ],
        condition: 'Good',
        quantity: '25 units',
        specifications: 'Various models and configurations',
        contactInfo: {
            name: 'Serowe Magistrate Court',
            email: 'court@serowe.gov.bw',
            phone: '+267 567 890 123'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'new'
    },
    {
        id: 'asset-007',
        title: '2019 Nissan Navara',
        category: 'vehicles',
        location: 'Kasane, Botswana',
        startingBid: 180000,
        currentBid: 195000,
        endDate: '2024-03-05T11:00:00Z',
        startDate: '2024-02-05T08:00:00Z',
        description: 'Nissan Navara in excellent condition, perfect for both city and off-road use.',
        images: [
            'vehicles/vehicles_2019-nissan-navara_kasane_01.png'
        ],
        condition: 'Excellent',
        mileage: '65000 km',
        year: '2019',
        fuelType: 'Diesel',
        transmission: 'Automatic',
        contactInfo: {
            name: 'Kasane Sheriff Office',
            email: 'sheriff@kasane.gov.bw',
            phone: '+267 678 901 234'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: null
    },
    {
        id: 'asset-008',
        title: 'Industrial Generator',
        category: 'equipment',
        location: 'Lobatse, Botswana',
        startingBid: 75000,
        currentBid: 82000,
        endDate: '2024-02-22T14:30:00Z',
        startDate: '2024-01-22T09:30:00Z',
        description: 'Heavy-duty industrial generator suitable for backup power or construction sites.',
        images: [
            'equipment/equipment_industrial-generator-50kva_lobatse_01.png'
        ],
        condition: 'Good',
        capacity: '50 KVA',
        fuelType: 'Diesel',
        hours: '1200 hours',
        contactInfo: {
            name: 'Lobatse High Court',
            email: 'court@lobatse.gov.bw',
            phone: '+267 789 012 345'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'ending-soon',
        valuations: {
            marketValue: 90000,
            reservePrice: 75000,
            appraisalDate: '2024-01-20',
            appraiser: 'Botswana Industrial Equipment Assessors',
            reportUrl: 'assets/documents/generator-appraisal-008.pdf'
        },
        sheriffDetails: {
            office: 'Lobatse High Court',
            address: 'High Court Building, Lobatse',
            contactPerson: 'Sheriff Mary Kgosi',
            phone: '+267 789 012 345',
            email: 'sheriff@lobatse.gov.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'certificate', name: 'Equipment Certificate', url: 'assets/documents/equipment-cert-008.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/generator-appraisal-008.pdf' }
        ]
    },
    // Additional Residential Properties
    {
        id: 'asset-009',
        title: 'Luxury Villa - Phakalane',
        category: 'property',
        location: 'Phakalane, Gaborone',
        startingBid: 2800000,
        currentBid: 3200000,
        endDate: '2024-03-10T16:00:00Z',
        startDate: '2024-02-10T10:00:00Z',
        description: 'Stunning luxury villa with modern amenities, swimming pool, and landscaped garden.',
        images: [
            'property/property_luxury-villa_phakalane-gaborone_01.png'
        ],
        condition: 'Excellent',
        bedrooms: '5',
        bathrooms: '4',
        size: '450 sqm',
        garden: 'Yes',
        pool: 'Yes',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'new',
        valuations: {
            marketValue: 3500000,
            reservePrice: 2800000,
            appraisalDate: '2024-02-05',
            appraiser: 'Botswana Property Valuers',
            reportUrl: 'assets/documents/villa-appraisal-009.pdf'
        },
        sheriffDetails: {
            office: 'Gaborone High Court',
            address: 'Government Enclave, Gaborone',
            contactPerson: 'Sheriff John Motsumi',
            phone: '+267 123 456 789',
            email: 'sheriff@gaborone.gov.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'title-deed', name: 'Title Deed', url: 'assets/documents/title-deed-009.pdf' },
            { type: 'survey', name: 'Survey Report', url: 'assets/documents/survey-009.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/villa-appraisal-009.pdf' }
        ]
    },
    {
        id: 'asset-010',
        title: 'Modern Apartment - CBD',
        category: 'property',
        location: 'Gaborone CBD, Botswana',
        startingBid: 950000,
        currentBid: 1100000,
        endDate: '2024-02-28T15:00:00Z',
        startDate: '2024-01-28T09:00:00Z',
        description: 'Contemporary apartment in the heart of CBD with city views and modern amenities.',
        images: [
            'assets/images/property/property_modern-apartment-cbd_gaborone_01.jpg',
            'assets/images/property/property_modern-apartment-cbd_gaborone_02.jpg',
            'assets/images/property/property_modern-apartment-cbd_gaborone_03.jpg'
        ],
        condition: 'Excellent',
        bedrooms: '2',
        bathrooms: '2',
        size: '120 sqm',
        floor: '8th Floor',
        contactInfo: {
            name: 'Gaborone High Court',
            email: 'court@gaborone.gov.bw',
            phone: '+267 123 456 789'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: null,
        valuations: {
            marketValue: 1200000,
            reservePrice: 950000,
            appraisalDate: '2024-01-25',
            appraiser: 'Botswana Property Valuers',
            reportUrl: 'assets/documents/apartment-appraisal-010.pdf'
        },
        sheriffDetails: {
            office: 'Gaborone High Court',
            address: 'Government Enclave, Gaborone',
            contactPerson: 'Sheriff John Motsumi',
            phone: '+267 123 456 789',
            email: 'sheriff@gaborone.gov.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'title-deed', name: 'Title Deed', url: 'assets/documents/title-deed-010.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/apartment-appraisal-010.pdf' }
        ]
    },
    // Commercial Properties
    {
        id: 'asset-011',
        title: 'Office Building - CBD',
        category: 'property',
        location: 'Gaborone CBD, Botswana',
        startingBid: 4500000,
        currentBid: 5200000,
        endDate: '2024-03-15T17:00:00Z',
        startDate: '2024-02-15T10:00:00Z',
        description: 'Prime office building in CBD with modern facilities, parking, and excellent location.',
        images: [
            'property/property_office-building-cbd_gaborone_01.png'
        ],
        condition: 'Excellent',
        floors: '6',
        size: '2000 sqm',
        parking: '25 spaces',
        contactInfo: {
            name: 'Botswana Development Corporation',
            email: 'properties@bdc.co.bw',
            phone: '+267 345 678 901'
        },
        sellerType: 'institution',
        isActive: true,
        badge: 'new',
        valuations: {
            marketValue: 5500000,
            reservePrice: 4500000,
            appraisalDate: '2024-02-10',
            appraiser: 'Botswana Commercial Property Valuers',
            reportUrl: 'assets/documents/office-appraisal-011.pdf'
        },
        sheriffDetails: {
            office: 'Botswana Development Corporation',
            address: 'BDC House, CBD, Gaborone',
            contactPerson: 'Property Manager Sarah Motsumi',
            phone: '+267 345 678 901',
            email: 'properties@bdc.co.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'title-deed', name: 'Title Deed', url: 'assets/documents/title-deed-011.pdf' },
            { type: 'survey', name: 'Survey Report', url: 'assets/documents/survey-011.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/office-appraisal-011.pdf' }
        ]
    },
    // Agricultural Properties
    {
        id: 'asset-012',
        title: 'Farm - Mahalapye',
        category: 'property',
        location: 'Mahalapye, Botswana',
        startingBid: 3800000,
        currentBid: 4200000,
        endDate: '2024-04-01T14:00:00Z',
        startDate: '2024-03-01T09:00:00Z',
        description: 'Large agricultural farm with irrigation system, farmhouse, and equipment.',
        images: [
            'assets/images/property/property_farm_mahalapye_01.jpg',
            'assets/images/property/property_farm_mahalapye_02.jpg',
            'assets/images/property/property_farm_mahalapye_03.jpg'
        ],
        condition: 'Good',
        size: '50 hectares',
        farmhouse: 'Yes',
        irrigation: 'Yes',
        contactInfo: {
            name: 'Mahalapye Magistrate Court',
            email: 'court@mahalapye.gov.bw',
            phone: '+267 234 567 890'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'new',
        valuations: {
            marketValue: 4500000,
            reservePrice: 3800000,
            appraisalDate: '2024-02-25',
            appraiser: 'Botswana Agricultural Property Valuers',
            reportUrl: 'assets/documents/farm-appraisal-012.pdf'
        },
        sheriffDetails: {
            office: 'Mahalapye Magistrate Court',
            address: 'Magistrate Court, Mahalapye',
            contactPerson: 'Sheriff Peter Kgosi',
            phone: '+267 234 567 890',
            email: 'sheriff@mahalapye.gov.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'title-deed', name: 'Title Deed', url: 'assets/documents/title-deed-012.pdf' },
            { type: 'survey', name: 'Survey Report', url: 'assets/documents/survey-012.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/farm-appraisal-012.pdf' }
        ]
    },
    // Additional Vehicles
    {
        id: 'asset-013',
        title: '2020 BMW X5',
        category: 'vehicles',
        location: 'Francistown, Botswana',
        startingBid: 280000,
        currentBid: 320000,
        endDate: '2024-03-05T12:00:00Z',
        startDate: '2024-02-05T08:00:00Z',
        description: 'Luxury SUV in pristine condition with full service history.',
        images: [
            'vehicles/vehicles_2020-bmw-x5_francistown_01.png'
        ],
        condition: 'Excellent',
        mileage: '45000 km',
        year: '2020',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        contactInfo: {
            name: 'Francistown Sheriff Office',
            email: 'sheriff@francistown.gov.bw',
            phone: '+267 234 567 890'
        },
        sellerType: 'sheriff',
        isActive: true,
        badge: 'new',
        valuations: {
            marketValue: 350000,
            reservePrice: 280000,
            appraisalDate: '2024-02-01',
            appraiser: 'Botswana Motor Vehicle Assessors',
            reportUrl: 'assets/documents/bmw-appraisal-013.pdf'
        },
        sheriffDetails: {
            office: 'Francistown Sheriff Office',
            address: 'Sheriff Office, Francistown',
            contactPerson: 'Sheriff Mary Kgosi',
            phone: '+267 234 567 890',
            email: 'sheriff@francistown.gov.bw',
            officeHours: 'Mon-Fri: 8:00-17:00',
            inspectionSchedule: 'By appointment only'
        },
        documents: [
            { type: 'registration', name: 'Vehicle Registration', url: 'assets/documents/vehicle-reg-013.pdf' },
            { type: 'inspection', name: 'Roadworthy Certificate', url: 'assets/documents/roadworthy-013.pdf' },
            { type: 'valuation', name: 'Valuation Report', url: 'assets/documents/bmw-appraisal-013.pdf' }
        ]
    }
];

// Categories for filtering
const ASSET_CATEGORIES = [
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'property', label: 'Property' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'electronics', label: 'Electronics' }
];

// Sort options
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'ending-soon', label: 'Ending Soon' }
];

// Export data
window.SAMPLE_ASSETS = SAMPLE_ASSETS;
window.ASSET_CATEGORIES = ASSET_CATEGORIES;
window.SORT_OPTIONS = SORT_OPTIONS;
