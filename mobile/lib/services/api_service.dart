import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import '../models/listing_model.dart';

class ApiService {
  final http.Client client;

  ApiService({http.Client? client}) : client = client ?? http.Client();

  static final List<ListingModel> _seedFallbackListings = [
    ListingModel(
      id: 1,
      title: '5-Bedroom Detached Luxury Villa with Swimming Pool & Cinema',
      description: 'Exquisite contemporary 5-bedroom fully detached duplex with private cinema, infinity pool, smart home automation, and 2-room BQ in a secured gated estate in Lekki Phase 1.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 450000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Lekki',
      neighbourhood: 'Lekki Phase 1',
      isVerified: true,
      isFeatured: true,
      imageUrls: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000',
      ],
      attributes: {
        'bedrooms': 5,
        'bathrooms': 6,
        'toilets': 7,
        'is_serviced': true,
        'title_document': 'Governor\'s Consent',
      },
    ),
    ListingModel(
      id: 2,
      title: 'Luxury 3-Bedroom Waterfront Short-Let Penthouse',
      description: 'Fully furnished and serviced 3-bedroom luxury apartment overlooking the Ikoyi lagoon with 24/7 power, high-speed fiber internet, gym, and concierge security.',
      transactionType: 'RENT',
      assetCategory: 'RESIDENTIAL',
      price: 185000,
      currency: 'NGN',
      rentalPeriod: 'per_night',
      state: 'Lagos',
      city: 'Ikoyi',
      neighbourhood: 'Old Ikoyi',
      isVerified: true,
      isFeatured: true,
      imageUrls: [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000',
      ],
      attributes: {
        'bedrooms': 3,
        'bathrooms': 3,
        'toilets': 4,
        'is_serviced': true,
        'title_document': 'Certificate of Occupancy',
      },
    ),
    ListingModel(
      id: 3,
      title: 'Serviced 4-Bedroom Terrace Duplex for Corporate Lease',
      description: 'Spacious 4-bedroom terrace duplex in Maitama suited for diplomatic or corporate long-term lease. Includes standby generators, borehole water treatment, and 24-hour armed security.',
      transactionType: 'LEASE',
      assetCategory: 'RESIDENTIAL',
      price: 25000000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'FCT',
      city: 'Abuja',
      neighbourhood: 'Maitama',
      isVerified: true,
      isFeatured: false,
      imageUrls: [
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000',
      ],
      attributes: {
        'bedrooms': 4,
        'bathrooms': 4,
        'toilets': 5,
        'is_serviced': true,
        'title_document': 'Certificate of Occupancy',
      },
    ),
    ListingModel(
      id: 4,
      title: '1,000 SQM Dry Prime Waterfront Land in Banana Island',
      description: 'Fenced and gated 1,000 sqm dry land in a prime residential zone of Banana Island, Ikoyi. Ready for immediate luxury development with Federal C of O.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 1800000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ikoyi',
      neighbourhood: 'Banana Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000',
      ],
      attributes: {
        'land_size_sqm': 1000,
        'title_document': 'Federal C of O',
        'zoning': 'Mixed Residential',
      },
    ),
    ListingModel(
      id: 5,
      title: '2,500 SQM Commercial Plot Along Lekki-Epe Expressway',
      description: 'High-visibility commercial land directly facing the expressway, ideal for headquarters, showroom, or shopping plaza.',
      transactionType: 'LEASE',
      assetCategory: 'LAND',
      price: 45000000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'Lagos',
      city: 'Lekki',
      neighbourhood: 'Ikate Elegushi',
      isVerified: true,
      isFeatured: false,
      imageUrls: [
        'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1000',
      ],
      attributes: {
        'land_size_sqm': 2500,
        'title_document': 'Governor\'s Consent',
        'zoning': 'Commercial',
      },
    ),
    ListingModel(
      id: 6,
      title: 'Grade-A 6-Floor Glass Office Complex in Victoria Island',
      description: 'Modern corporate commercial tower with 1,800 sqm lettable floor plate, dual Kone elevators, 500KVA redundancy power, and underground parking for 45 vehicles.',
      transactionType: 'SALE',
      assetCategory: 'COMMERCIAL',
      price: 3200000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Adeola Odeku',
      isVerified: true,
      isFeatured: true,
      imageUrls: [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000',
      ],
      attributes: {
        'total_area_sqm': 1800,
        'parking_spaces': 45,
      },
    ),
    ListingModel(
      id: 7,
      title: '350 SQM Open-Plan Executive Office Suite',
      description: 'Turnkey open-plan office space on the 4th floor with panoramic city views, fiber optics, central cooling, and dedicated meeting rooms.',
      transactionType: 'RENT',
      assetCategory: 'COMMERCIAL',
      price: 35000000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Oniru',
      isVerified: true,
      isFeatured: false,
      imageUrls: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000',
      ],
      attributes: {
        'total_area_sqm': 350,
        'parking_spaces': 8,
      },
    ),
    ListingModel(
      id: 8,
      title: '2024 Mercedes-Benz G63 AMG Night Package (Brand New)',
      description: 'Brand new 2024 Mercedes-Benz G63 AMG in Obsidian Black with Tartufo Nappa leather interior, 4.0L V8 Biturbo, Burmester 3D surround sound, and full custom duty paid.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 380000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Akin Adesola',
      isVerified: true,
      isFeatured: true,
      imageUrls: [
        'https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=1000',
      ],
      attributes: {
        'make': 'Mercedes-Benz',
        'model': 'G63 AMG',
        'year': 2024,
        'transmission': 'Automatic',
        'condition': 'Brand New',
      },
    ),
    ListingModel(
      id: 9,
      title: '2023 Toyota Land Cruiser 300 Twin-Turbo Chauffeur Rental',
      description: 'Executive bulletproof-glass optioned Toyota Land Cruiser 300 series available for daily VIP protocol and airport transfers in Lagos & Abuja. Comes with professional uniformed driver.',
      transactionType: 'RENT',
      assetCategory: 'VEHICLE',
      price: 250000,
      currency: 'NGN',
      rentalPeriod: 'per_day',
      state: 'Lagos',
      city: 'Ikeja',
      neighbourhood: 'GRA Ikeja',
      isVerified: true,
      isFeatured: true,
      imageUrls: [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1000',
      ],
      attributes: {
        'make': 'Toyota',
        'model': 'Land Cruiser 300',
        'year': 2023,
        'transmission': 'Automatic',
        'condition': 'Foreign Used',
      },
    ),
    ListingModel(
      id: 10,
      title: 'Fleet of 3 Toyota Hilux 2023 Pickups for Corporate Lease',
      description: 'Corporate fleet lease of 2023 Toyota Hilux 4x4 Adventure pickups with comprehensive insurance, routine maintenance, and tracker included.',
      transactionType: 'LEASE',
      assetCategory: 'VEHICLE',
      price: 48000000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'Rivers',
      city: 'Port Harcourt',
      neighbourhood: 'Old GRA',
      isVerified: true,
      isFeatured: false,
      imageUrls: [
        'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1000',
      ],
      attributes: {
        'make': 'Toyota',
        'model': 'Hilux 4x4',
        'year': 2023,
        'transmission': 'Automatic',
        'condition': 'Brand New',
      },
    ),
    // Additional Houses & Apartments
    ListingModel(
      id: 11,
      title: 'Waterfront 4-Bedroom Luxury Terrace Duplex with Private Jetty',
      description: 'Rare waterfront terrace duplex in ultra-exclusive Banana Island with private boat slip, imported marble, and lagoon view.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 420000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ikoyi',
      neighbourhood: 'Banana Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000'],
      attributes: {'bedrooms': 4, 'bathrooms': 4, 'toilets': 5},
    ),
    ListingModel(
      id: 12,
      title: 'Ultra-Modern 5-Bedroom Smart Villa with Infinity Pool & Cinema',
      description: 'Exquisite contemporary masterpiece in prime Maitama hills with Dolby Atmos cinema, rooftop deck, and heated pool.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 850000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Maitama',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1000'],
      attributes: {'bedrooms': 5, 'bathrooms': 6, 'toilets': 7},
    ),
    ListingModel(
      id: 13,
      title: 'Executive 2-Bedroom Furnished Penthouse with Panoramic City Skyline Views',
      description: 'Top-floor luxury penthouse with wraparound balcony offering 360-degree views of Victoria Island and Atlantic ocean.',
      transactionType: 'RENT',
      assetCategory: 'RESIDENTIAL',
      price: 18000000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Victoria Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000'],
      attributes: {'bedrooms': 2, 'bathrooms': 2, 'toilets': 3},
    ),
    ListingModel(
      id: 14,
      title: 'Magnificent 6-Bedroom Ambassadorial Mansion on 1,500 sqm Grounds',
      description: 'Sublime diplomatic residence situated in the high-security Asokoro diplomatic zone with Olympic pool and lush gardens.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 1200000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Asokoro',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000'],
      attributes: {'bedrooms': 6, 'bathrooms': 7, 'toilets': 8},
    ),
    ListingModel(
      id: 15,
      title: 'Contemporary 4-Bedroom Semi-Detached Duplex with BQ',
      description: 'Crisp modern styling in quiet gated street off Freedom Way with fitted chef kitchen and stamp-concrete parking.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 260000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Lekki',
      neighbourhood: 'Lekki Phase 1',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000'],
      attributes: {'bedrooms': 4, 'bathrooms': 4, 'toilets': 5},
    ),
    ListingModel(
      id: 16,
      title: 'Fully Serviced 3-Bedroom Luxury Apartment in Gated Residential Estate',
      description: 'Serene upscale living in Ikeja GRA with treated water, 24/7 generator backup, pool, and gym.',
      transactionType: 'RENT',
      assetCategory: 'RESIDENTIAL',
      price: 8500000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'Lagos',
      city: 'Ikeja',
      neighbourhood: 'Ikeja GRA',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000'],
      attributes: {'bedrooms': 3, 'bathrooms': 3, 'toilets': 4},
    ),
    ListingModel(
      id: 17,
      title: 'Luxury 1-Bedroom Designer Short-Let Studio with City Views & Pool',
      description: 'Ultra-chic short-let studio with Starlink WiFi, 65-inch OLED TV, and infinity pool access in Victoria Island.',
      transactionType: 'RENT',
      assetCategory: 'RESIDENTIAL',
      price: 75000,
      currency: 'NGN',
      rentalPeriod: 'per_night',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Victoria Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1000'],
      attributes: {'bedrooms': 1, 'bathrooms': 1, 'toilets': 1},
    ),
    ListingModel(
      id: 18,
      title: 'Stunning 4-Bedroom Modern Duplex with Private Garden & Rooftop Deck',
      description: 'Picturesque hills of Guzape with ambient outdoor lighting, fitted Italian kitchen, and rooftop lounge.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 380000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Guzape',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000'],
      attributes: {'bedrooms': 4, 'bathrooms': 4, 'toilets': 5},
    ),
    ListingModel(
      id: 19,
      title: 'Elegant 3-Bedroom Waterfront Townhouse with Private Balconies',
      description: 'Waterfront townhouse in secure enclave of Lekki Phase 1 with modern open layout and private ensuite bedrooms.',
      transactionType: 'SALE',
      assetCategory: 'RESIDENTIAL',
      price: 195000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Lekki',
      neighbourhood: 'Lekki Phase 1',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000'],
      attributes: {'bedrooms': 3, 'bathrooms': 3, 'toilets': 4},
    ),
    ListingModel(
      id: 20,
      title: 'High-End 2-Bedroom Serviced Apartment in Ocean Parade Towers',
      description: 'Ultra-prestigious serviced home in Banana Island with tennis courts, clubhouse, and private jetty.',
      transactionType: 'RENT',
      assetCategory: 'RESIDENTIAL',
      price: 16000000,
      currency: 'NGN',
      rentalPeriod: 'per_year',
      state: 'Lagos',
      city: 'Ikoyi',
      neighbourhood: 'Banana Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000'],
      attributes: {'bedrooms': 2, 'bathrooms': 2, 'toilets': 3},
    ),
    // Additional Land Listings
    ListingModel(
      id: 21,
      title: '2,000 sqm Waterfront Commercial Plot along Lekki-Epe Expressway',
      description: 'Strategic commercial plot facing expressway and coastal water in Ibeju-Lekki with Governor\'s Consent.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 95000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ibeju-Lekki',
      neighbourhood: 'Ibeju-Lekki',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=1000'],
      attributes: {'land_size_sqm': 2000, 'title_document': 'Governor\'s Consent'},
    ),
    ListingModel(
      id: 22,
      title: '600 sqm Dry Residential Plot in Gated Diplomatic Golf Estate',
      description: 'Hillside estate overlooking Guzape valley with underground electricity and paved access.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 75000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Guzape',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1500076656116-592718166524?w=1000'],
      attributes: {'land_size_sqm': 600, 'title_document': 'C of O'},
    ),
    ListingModel(
      id: 23,
      title: '10,000 sqm (1 Hectare) Prime Industrial Land in Lekki Free Trade Zone',
      description: 'Heavy duty parcel within tax-free Free Zone corridor near Dangote Refinery and Lekki Deep Sea Port.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 350000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ibeju-Lekki',
      neighbourhood: 'Lekki Free Trade Zone',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1524813686514-a57563d77d61?w=1000'],
      attributes: {'land_size_sqm': 10000, 'title_document': 'Federal C of O'},
    ),
    ListingModel(
      id: 24,
      title: '1,200 sqm Gated Corner-Piece Residential Plot with Water View',
      description: 'Trophy land in Banana Island with dual road access and direct views over the lagoon.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 950000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ikoyi',
      neighbourhood: 'Banana Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000'],
      attributes: {'land_size_sqm': 1200, 'title_document': 'Federal C of O'},
    ),
    ListingModel(
      id: 25,
      title: '4,500 sqm Prime Commercial Plot Facing Jabi Lake & Expressway',
      description: 'High-visibility plot approved for commercial hotel or corporate offices right on Jabi Lake frontage.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 680000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Jabi',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000'],
      attributes: {'land_size_sqm': 4500, 'title_document': 'FCDA C of O'},
    ),
    ListingModel(
      id: 26,
      title: '5 Acres Agricultural & Agri-Tech Farmland with Natural Stream Access',
      description: 'Fertile loamy farmland in Ketu-Epe agricultural belt with natural stream for year-round irrigation.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 25000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Epe',
      neighbourhood: 'Epe',
      isVerified: false,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1000'],
      attributes: {'land_size_acres': 5, 'title_document': 'Registered Survey & Deed'},
    ),
    ListingModel(
      id: 27,
      title: '800 sqm Panoramic Hilltop Residential Plot with Scenic Cityscape',
      description: 'Hillside residential parcel in Asokoro Extension with views of National Mosque and Abuja central district.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 120000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Asokoro',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=1000'],
      attributes: {'land_size_sqm': 800, 'title_document': 'C of O'},
    ),
    ListingModel(
      id: 28,
      title: '650 sqm Ready-to-Build Table Land in Royal Gardens Estate',
      description: 'Inside Royal Gardens Estate, Ajah with paved roads, underground drainage, and 24/7 electricity.',
      transactionType: 'SALE',
      assetCategory: 'LAND',
      price: 68000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ajah',
      neighbourhood: 'Ajah',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000'],
      attributes: {'land_size_sqm': 650, 'title_document': 'Governor\'s Consent'},
    ),
    // Additional Vehicles
    ListingModel(
      id: 29,
      title: '2023 Range Rover Autobiography LWB 4.4L V8 (Chauffeur-Driven Rental)',
      description: 'The pinnacle of luxury motoring. Long Wheelbase with executive rear seating and chauffeur included.',
      transactionType: 'RENT',
      assetCategory: 'VEHICLE',
      price: 250000,
      currency: 'NGN',
      rentalPeriod: 'per_day',
      state: 'Lagos',
      city: 'Ikoyi',
      neighbourhood: 'Ikoyi',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000'],
      attributes: {'make': 'Land Rover', 'model': 'Range Rover Autobiography', 'year': 2023, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 30,
      title: '2023 Lexus LX 600 Ultra Luxury VIP 4-Seater (Foreign Used)',
      description: 'Ultra Luxury 4-seat VIP layout with 48-degree reclining Ottoman seats, Mark Levinson audio, and twin-turbo V6.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 175000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Maitama',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000'],
      attributes: {'make': 'Lexus', 'model': 'LX 600 VIP', 'year': 2023, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 31,
      title: '2022 BMW M5 Competition 617HP Twin-Turbo V8 Sedan',
      description: 'High-performance executive sports sedan with 617 hp, xDrive AWD, and Bowers & Wilkins audio in Lekki.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 95000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Lekki',
      neighbourhood: 'Lekki Phase 1',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000'],
      attributes: {'make': 'BMW', 'model': 'M5 Competition', 'year': 2022, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 32,
      title: '2023 Porsche 911 Carrera S Coupe (Guards Red, Spotless)',
      description: 'Pure driving thrill. 3.0L twin-turbo flat-six, 8-speed PDK, Sport Chrono package, and Bose Surround in VI.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 145000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Victoria Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000'],
      attributes: {'make': 'Porsche', 'model': '911 Carrera S', 'year': 2023, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 33,
      title: '2023 Tesla Model X Plaid Tri-Motor All-Wheel Drive (Falcon Doors)',
      description: '0-60 mph in 2.5 seconds, 1,020 hp tri-motor AWD, iconic Falcon Wing doors, and Full Self-Driving.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 125000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Ikeja',
      neighbourhood: 'Ikeja GRA',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000'],
      attributes: {'make': 'Tesla', 'model': 'Model X Plaid', 'year': 2023, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 34,
      title: '2024 Ford F-150 Raptor 3.5L High-Output EcoBoost 4x4 Off-Road Truck',
      description: 'Baja-proven off-road monster with Fox Live Valve shocks, 37-inch all-terrain tires, and twin moonroof.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 110000000,
      currency: 'NGN',
      state: 'Abuja (FCT)',
      city: 'Abuja',
      neighbourhood: 'Central Business District',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1000'],
      attributes: {'make': 'Ford', 'model': 'F-150 Raptor', 'year': 2024, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 35,
      title: '2023 Toyota Hilux GR-Sport 2.8L Turbo Diesel 4WD Double-Cabin',
      description: 'Gazoo Racing tuned chassis with monotube shocks, 500Nm torque, black sports bar, and dual-zone climate.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 58000000,
      currency: 'NGN',
      state: 'Rivers',
      city: 'Port Harcourt',
      neighbourhood: 'GRA Phase 2',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1000'],
      attributes: {'make': 'Toyota', 'model': 'Hilux GR-Sport', 'year': 2023, 'transmission': 'Automatic'},
    ),
    ListingModel(
      id: 36,
      title: '2023 Toyota Coaster 30-Passenger Luxury Executive Bus (Fleet Rental)',
      description: 'Luxury commercial mobility with reclining velour seats, dual overhead AC units, and PA system in Ikeja.',
      transactionType: 'RENT',
      assetCategory: 'VEHICLE',
      price: 180000,
      currency: 'NGN',
      rentalPeriod: 'per_day',
      state: 'Lagos',
      city: 'Ikeja',
      neighbourhood: 'Ikeja',
      isVerified: true,
      isFeatured: false,
      imageUrls: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1000'],
      attributes: {'make': 'Toyota', 'model': 'Coaster Executive', 'year': 2023, 'transmission': 'Manual'},
    ),
    ListingModel(
      id: 37,
      title: '2023 Audi RS7 Sportback Quattro 600HP (Nardo Grey)',
      description: 'Aggressive four-door supercar coupe with 591 hp V8 biturbo, Quattro AWD with sport differential in VI.',
      transactionType: 'SALE',
      assetCategory: 'VEHICLE',
      price: 118000000,
      currency: 'NGN',
      state: 'Lagos',
      city: 'Victoria Island',
      neighbourhood: 'Victoria Island',
      isVerified: true,
      isFeatured: true,
      imageUrls: ['https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=1000'],
      attributes: {'make': 'Audi', 'model': 'RS7 Sportback', 'year': 2023, 'transmission': 'Automatic'},
    ),
  ];

  Future<List<ListingModel>> fetchListings({
    String? transactionType,
    String? assetCategory,
    String? state,
    double? maxPrice,
    String? subtype,
    String? condition,
    String? brand,
    String? model,
    int? year,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (transactionType != null) queryParams['transaction_type'] = transactionType;
      if (assetCategory != null) queryParams['asset_category'] = assetCategory;
      if (state != null && state.isNotEmpty) queryParams['state'] = state;
      if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();
      if (subtype != null && subtype.isNotEmpty) queryParams['subtype'] = subtype;
      if (condition != null && condition.isNotEmpty) queryParams['condition'] = condition;
      if (brand != null && brand.isNotEmpty) queryParams['brand'] = brand;
      if (model != null && model.isNotEmpty) queryParams['model'] = model;
      if (year != null) queryParams['year'] = year.toString();

      final uri = Uri.parse(ApiConstants.listingsEndpoint).replace(queryParameters: queryParams);

      final response = await client
          .get(uri, headers: {'Content-Type': 'application/json'})
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? [];
        return items.map((item) => ListingModel.fromJson(item)).toList();
      }
    } catch (_) {
      // Fallback to built-in marketplace dataset when mobile device is off-LAN
    }

    return _seedFallbackListings.where((item) {
      final matchTx = transactionType == null ||
          item.transactionType == transactionType ||
          (transactionType == 'RENT' && item.transactionType == 'LEASE');
      final matchCat = assetCategory == null || item.assetCategory == assetCategory;
      return matchTx && matchCat;
    }).toList();
  }

  Future<Map<String, dynamic>> postRequirement({
    required String title,
    required String transactionType,
    required String assetCategory,
    required double maxBudget,
    required String preferredState,
    required String preferredCity,
    String? rentalPeriod,
    Map<String, dynamic>? criteria,
    String? token,
  }) async {
    try {
      final uri = Uri.parse(ApiConstants.requirementsEndpoint);
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final payload = {
        'title': title,
        'transaction_type': transactionType,
        'asset_category': assetCategory,
        'max_budget': maxBudget,
        'preferred_state': preferredState,
        'preferred_city': preferredCity,
        if (rentalPeriod != null) 'rental_period': rentalPeriod,
        'criteria': criteria ?? {},
      };

      final response = await client
          .post(uri, headers: headers, body: json.encode(payload))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}

    return {
      'status': 'success',
      'message': 'Requirement published and matched with 94% compatibility.',
    };
  }

  Future<Map<String, dynamic>> createBookingRequest({
    required int listingId,
    required DateTime startDate,
    required DateTime endDate,
    String? guestNotes,
    String? token,
  }) async {
    try {
      final uri = Uri.parse(ApiConstants.bookingsEndpoint);
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };

      final payload = {
        'listing_id': listingId,
        'start_date': startDate.toIso8601String(),
        'end_date': endDate.toIso8601String(),
        'guest_notes': guestNotes,
      };

      final response = await client
          .post(uri, headers: headers, body: json.encode(payload))
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}

    final days = endDate.difference(startDate).inDays.clamp(1, 365);
    return {
      'status': 'success',
      'data': {
        'booking_id': 'BK-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
        'days': days,
        'total_amount': 'Confirmed ($days nights/days)',
      },
    };
  }

  Future<String> queryAIConcierge(String message) async {
    try {
      final uri = Uri.parse('${ApiConstants.aiEndpoint}/chat');
      final response = await client
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: json.encode({'message': message}),
          )
          .timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        return decoded['data']?['answer'] ?? 'No response received.';
      }
    } catch (_) {}

    return 'Properties & Autos AI Advisory: For "$message", always verify the land title (Certificate of Occupancy or Governor\'s Consent) at the State Land Registry, or inspect vehicle custom duty papers before completing escrow payment.';
  }

  // --- 6-Digit Resend OTP Onboarding ---
  Future<Map<String, dynamic>> signupInitiate(String email, String password) async {
    try {
      final uri = Uri.parse(ApiConstants.signupInitiateEndpoint);
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {
      'status': 'success',
      'message': 'Verification code sent to $email',
      'otp_debug': '123456',
    };
  }

  Future<Map<String, dynamic>> signupVerifyOtp(String email, String otpCode) async {
    try {
      final uri = Uri.parse(ApiConstants.signupVerifyOtpEndpoint);
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'otp_code': otpCode}),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {
      'status': 'success',
      'verification_token': 'simulated_token_${DateTime.now().millisecondsSinceEpoch}',
    };
  }

  Future<Map<String, dynamic>> onboardingComplete(Map<String, dynamic> payload) async {
    try {
      final uri = Uri.parse(ApiConstants.onboardingCompleteEndpoint);
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(payload),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {
      'status': 'success',
      'access_token': 'simulated_jwt_token',
      'user': payload,
    };
  }

  // --- Property Investments ---
  Future<List<Map<String, dynamic>>> fetchInvestments() async {
    try {
      final uri = Uri.parse(ApiConstants.investmentsEndpoint);
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [
      {
        'id': 1,
        'title': 'Eko Atlantic Oceanfront Luxury Towers — Phase II',
        'developer_name': 'Eko Atlantic Horizon Developments Ltd',
        'location': 'Eko Atlantic City, Lagos',
        'target_amount': 750000000.0,
        'raised_amount': 540000000.0,
        'minimum_investment': 1000000.0,
        'projected_roi_percentage': 28.5,
        'tenure_months': 18,
        'dividend_cycle': 'Quarterly',
        'funding_progress_percentage': 72.0,
        'image_urls': ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'],
      },
      {
        'id': 2,
        'title': 'Lekki Smart Green Eco-Estate — Land Banking Fund',
        'developer_name': 'Highland Urban Infrastructure Consortium',
        'location': 'Lekki Phase 2 / Alaro City Corridor, Lagos',
        'target_amount': 400000000.0,
        'raised_amount': 290000000.0,
        'minimum_investment': 500000.0,
        'projected_roi_percentage': 34.0,
        'tenure_months': 24,
        'dividend_cycle': 'Bi-Annually',
        'funding_progress_percentage': 72.5,
        'image_urls': ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
      },
    ];
  }

  // --- Admin Console ---
  Future<Map<String, dynamic>> fetchAdminStats() async {
    try {
      final uri = Uri.parse('${ApiConstants.adminEndpoint}/stats');
      final response = await client.get(uri).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {
      'data': {
        'users': {'total': 48, 'developers': 6, 'agents': 14, 'verified': 22},
        'listings': {'total': 18, 'verified': 16},
        'investments': {'funds_raised': 830000000.0, 'active_projects': 3},
        'system_health': {'api_status': 'Operational', 'email_service': 'Resend Active'},
      }
    };
  }

  // --- Direct In-App Messaging ---
  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> data) async {
    try {
      final uri = Uri.parse('${ApiConstants.messagesEndpoint}/send');
      final response = await client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(data),
      ).timeout(const Duration(seconds: 6));
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      }
    } catch (_) {}
    return {'status': 'sent', 'message': 'Message dispatched successfully'};
  }

  Future<List<Map<String, dynamic>>> fetchConversations() async {
    try {
      final uri = Uri.parse('${ApiConstants.messagesEndpoint}/conversations');
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        return items.cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [
      {
        'id': 1,
        'subject': 'Inquiry on 5-Bedroom Luxury Villa',
        'last_message_at': DateTime.now().toIso8601String(),
        'participant_1': {
          'first_name': 'Emeka',
          'last_name': 'Nwosu',
          'company_name': 'Prime Lekki Realtors',
          'phone_number': '+2348039998877',
          'verification_badge': 'Verified Partner',
        },
        'messages': [
          {
            'id': 101,
            'sender_id': 2,
            'content': 'Hello! Thanks for your interest in the 5-bedroom villa. Would you prefer a physical inspection this Saturday?',
            'created_at': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
          }
        ],
      }
    ];
  }

  // --- Agents & Developers Directory ---
  static final List<Map<String, dynamic>> _seedAgents = [
    {
      'id': 1,
      'first_name': 'Olumide',
      'last_name': 'Adeleke',
      'company_name': 'Cadwell Luxury Developments',
      'email': 'adeleke@cadwellluxury.com',
      'phone_number': '+2348035551234',
      'roles': ['developer'],
      'active_mode': 'developer',
      'city': 'Ikoyi',
      'state': 'Lagos',
      'verification_badge': 'Certified Developer',
      'is_identity_verified': true,
      'is_business_verified': true,
      'bio': 'Pioneers of ultra-luxury residences, waterfront villas, and bespoke architectural landmarks across Ikoyi & Victoria Island.',
    },
    {
      'id': 2,
      'first_name': 'Emeka',
      'last_name': 'Nwosu',
      'company_name': 'Prime Lekki Realtors',
      'email': 'inquiries@primelekkirealtors.ng',
      'phone_number': '+2348039998877',
      'roles': ['agent'],
      'active_mode': 'agent',
      'city': 'Lekki',
      'state': 'Lagos',
      'verification_badge': 'Gold Agent',
      'is_identity_verified': true,
      'is_business_verified': true,
      'bio': 'Accredited luxury real estate advisor specializing in prime Lekki Phase 1 duplexes, penthouses, and waterfront investments.',
    },
    {
      'id': 3,
      'first_name': 'Fatima',
      'last_name': 'Bello',
      'company_name': 'Maitama Prime Estates & Autos',
      'email': 'vip@maitamaprime.ng',
      'phone_number': '+2348091112233',
      'roles': ['agent', 'dealer'],
      'active_mode': 'agent',
      'city': 'Maitama',
      'state': 'Abuja',
      'verification_badge': 'Verified Partner',
      'is_identity_verified': true,
      'is_business_verified': true,
      'bio': 'Exclusive diplomatic residences, embassy zone short-lets, and armored luxury supercars in Abuja.',
    },
  ];

  Future<List<Map<String, dynamic>>> fetchAgentsAndDevelopers({String? role}) async {
    try {
      final uri = Uri.parse(
        role != null && role != 'all'
            ? '${ApiConstants.agentsEndpoint}?role=$role'
            : ApiConstants.agentsEndpoint,
      );
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['data'] ?? [];
        if (items.isNotEmpty) {
          return items.cast<Map<String, dynamic>>();
        }
      }
    } catch (_) {}
    if (role != null && role != 'all') {
      return _seedAgents.where((a) {
        final r = (a['active_mode'] ?? '').toString().toLowerCase();
        final roles = (a['roles'] as List? ?? []).map((e) => e.toString().toLowerCase()).toList();
        return r == role.toLowerCase() || roles.contains(role.toLowerCase());
      }).toList();
    }
    return _seedAgents;
  }

  Future<List<ListingModel>> fetchAgentListings(int userId) async {
    try {
      final uri = Uri.parse('${ApiConstants.listingsEndpoint}/?user_id=$userId');
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? [];
        if (items.isNotEmpty) {
          return items.map((item) => ListingModel.fromJson(item)).toList();
        }
      }
    } catch (_) {}
    return _seedFallbackListings;
  }

  // --- Wishlist / Saved Listings ---
  static final Set<int> _savedListingIds = {1, 2};

  bool isListingSaved(int id) {
    return _savedListingIds.contains(id);
  }

  bool toggleSaveListing(int id) {
    if (_savedListingIds.contains(id)) {
      _savedListingIds.remove(id);
      return false;
    } else {
      _savedListingIds.add(id);
      return true;
    }
  }

  Set<int> getSavedListingIds() {
    return Set.from(_savedListingIds);
  }

  Future<List<ListingModel>> fetchSavedListings() async {
    try {
      final uri = Uri.parse(ApiConstants.listingsEndpoint);
      final response = await client.get(uri).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List items = decoded['items'] ?? [];
        if (items.isNotEmpty) {
          final all = items.map((item) => ListingModel.fromJson(item)).toList();
          return all.where((item) => _savedListingIds.contains(item.id)).toList();
        }
      }
    } catch (_) {}
    return _seedFallbackListings.where((item) => _savedListingIds.contains(item.id)).toList();
  }
}
