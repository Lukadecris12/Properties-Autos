import 'package:intl/intl.dart';
import '../core/constants.dart';

class ListingModel {
  final int id;
  final String title;
  final String description;
  final String transactionType; // SALE, RENT, LEASE
  final String assetCategory;   // LAND, RESIDENTIAL, COMMERCIAL, VEHICLE
  final double price;
  final String currency;
  final String? rentalPeriod;   // per_night, per_day, per_month, per_year
  final String state;
  final String city;
  final String? neighbourhood;
  final bool isVerified;
  final bool isFeatured;
  final bool isBoosted;
  final DateTime? boostedUntil;
  final List<String> imageUrls;
  final Map<String, dynamic> attributes;
  final String? ownerName;
  final String? ownerPhone;
  final String? ownerBadge;
  final String? ownerAvatar;
  final int ownerId;

  ListingModel({
    required this.id,
    required this.title,
    required this.description,
    required this.transactionType,
    required this.assetCategory,
    required this.price,
    required this.currency,
    this.rentalPeriod,
    required this.state,
    required this.city,
    this.neighbourhood,
    required this.isVerified,
    required this.isFeatured,
    this.isBoosted = false,
    this.boostedUntil,
    required this.imageUrls,
    required this.attributes,
    this.ownerName,
    this.ownerPhone,
    this.ownerBadge,
    this.ownerAvatar,
    this.ownerId = 1,
  });

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    final category = json['asset_category']?.toString() ?? 'RESIDENTIAL';
    List<String> images = [];
    if (json['images'] != null && json['images'] is List) {
      for (var img in json['images']) {
        if (img is Map && img['url'] != null) {
          final resolved = ApiConstants.resolveImageUrl(img['url'].toString(), category: category);
          if (img['is_cover'] == true) {
            images.insert(0, resolved);
          } else {
            images.add(resolved);
          }
        } else if (img is String) {
          images.add(ApiConstants.resolveImageUrl(img, category: category));
        }
      }
    }
    if (images.isEmpty) {
      images.add(ApiConstants.resolveImageUrl(null, category: category));
    }

    final owner = json['owner'];
    String? oName;
    String? oPhone;
    String? oBadge;
    String? oAvatar;
    if (owner != null && owner is Map) {
      oName = owner['company_name'] ?? '${owner['first_name'] ?? ''} ${owner['last_name'] ?? ''}'.trim();
      oPhone = owner['phone_number'];
      oBadge = owner['verification_badge'];
      oAvatar = owner['avatar_url'] ?? owner['logo_url'];
    }

    return ListingModel(
      id: json['id'],
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      transactionType: json['transaction_type'] ?? 'SALE',
      assetCategory: json['asset_category'] ?? 'RESIDENTIAL',
      price: (json['price'] != null) ? double.parse(json['price'].toString()) : 0.0,
      currency: json['currency'] ?? 'NGN',
      rentalPeriod: json['rental_period'],
      state: json['state'] ?? '',
      city: json['city'] ?? '',
      neighbourhood: json['neighbourhood'],
      isVerified: json['is_verified_asset'] ?? false,
      isFeatured: json['is_featured'] ?? false,
      isBoosted: json['is_boosted'] ?? false,
      boostedUntil: json['boosted_until'] != null ? DateTime.tryParse(json['boosted_until']) : null,
      imageUrls: images,
      attributes: json['attributes'] ?? {},
      ownerName: (oName != null && oName.isNotEmpty) ? oName : 'Properties & Autos Partner',
      ownerPhone: oPhone ?? '+234 803 123 4567',
      ownerBadge: oBadge ?? 'Verified',
      ownerAvatar: oAvatar,
      ownerId: json['user_id'] ?? 1,
    );
  }

  String get formattedPrice {
    final format = NumberFormat.currency(
      locale: 'en_NG', 
      symbol: currency == 'NGN' ? '₦' : '$currency ',
      decimalDigits: 0
    );
    String base = format.format(price);
    
    // Mandatory rental period display
    if (transactionType == 'RENT' || transactionType == 'LEASE') {
      switch (rentalPeriod) {
        case 'per_night': return '$base / night';
        case 'per_day': return '$base / day';
        case 'per_week': return '$base / week';
        case 'per_month': return '$base / month';
        case 'per_year': return '$base / year';
        default: return base;
      }
    }
    return base;
  }
}
