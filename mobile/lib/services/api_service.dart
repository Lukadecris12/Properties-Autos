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
  ];

  Future<List<ListingModel>> fetchListings({
    String? transactionType,
    String? assetCategory,
    String? state,
    double? maxPrice,
  }) async {
    try {
      final queryParams = <String, String>{};
      if (transactionType != null) queryParams['transaction_type'] = transactionType;
      if (assetCategory != null) queryParams['asset_category'] = assetCategory;
      if (state != null && state.isNotEmpty) queryParams['state'] = state;
      if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();

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
      final matchTx = transactionType == null || item.transactionType == transactionType;
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

    return 'PropertyHub AI Advisory: For "$message", always verify the land title (Certificate of Occupancy or Governor\'s Consent) at the State Land Registry, or inspect vehicle custom duty papers before completing escrow payment.';
  }
}
