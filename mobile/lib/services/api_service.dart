import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/constants.dart';
import '../models/listing_model.dart';

class ApiService {
  final http.Client client;

  ApiService({http.Client? client}) : client = client ?? http.Client();

  Future<List<ListingModel>> fetchListings({
    String? transactionType,
    String? assetCategory,
    String? state,
    double? maxPrice,
  }) async {
    final queryParams = <String, String>{};
    if (transactionType != null) queryParams['transaction_type'] = transactionType;
    if (assetCategory != null) queryParams['asset_category'] = assetCategory;
    if (state != null && state.isNotEmpty) queryParams['state'] = state;
    if (maxPrice != null) queryParams['max_price'] = maxPrice.toString();

    final uri = Uri.parse(ApiConstants.listingsEndpoint).replace(queryParameters: queryParams);
    
    final response = await client.get(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      final List items = decoded['items'] ?? [];
      return items.map((item) => ListingModel.fromJson(item)).toList();
    } else {
      throw Exception('Failed to load listings from PropertyHub API: ${response.statusCode}');
    }
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

    final response = await client.post(
      uri,
      headers: headers,
      body: json.encode(payload),
    );

    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      throw Exception('Failed to publish requirement: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> createBookingRequest({
    required int listingId,
    required DateTime startDate,
    required DateTime endDate,
    String? guestNotes,
    String? token,
  }) async {
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

    final response = await client.post(
      uri,
      headers: headers,
      body: json.encode(payload),
    );

    if (response.statusCode == 201) {
      return json.decode(response.body);
    } else {
      final err = json.decode(response.body);
      throw Exception(err['detail'] ?? 'Booking failed');
    }
  }

  Future<String> queryAIConcierge(String message) async {
    final uri = Uri.parse('${ApiConstants.aiEndpoint}/chat');
    final response = await client.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'message': message}),
    );

    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      return decoded['data']['answer'] ?? 'No response received.';
    } else {
      throw Exception('AI Concierge request failed.');
    }
  }
}
