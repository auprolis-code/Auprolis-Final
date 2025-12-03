// Enhanced Assets Data
// This file contains comprehensive asset data for the enhanced dashboard

const SAMPLE_ASSETS = [
    // Distressed Properties Only - Removed vehicles, equipment, furniture, and electronics
    {
        id: 'asset-001',
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
        id: 'asset-002',
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
];

// Categories for filtering - Distressed Properties Only
const ASSET_CATEGORIES = [
    { value: 'property', label: 'Property' }
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
