import 'package:intl/intl.dart';

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
    required this.imageUrls,
    required this.attributes,
    this.ownerName,
    this.ownerPhone,
    this.ownerBadge,
    this.ownerAvatar,
    this.ownerId = 1,
  });

  factory ListingModel.fromJson(Map<String, dynamic> json) {
    List<String> images = [];
    if (json['images'] != null && json['images'] is List) {
      for (var img in json['images']) {
        if (img is Map && img['url'] != null) {
          images.add(img['url']);
        } else if (img is String) {
          images.add(img);
        }
      }
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
      imageUrls: images,
      attributes: json['attributes'] ?? {},
      ownerName: (oName != null && oName.isNotEmpty) ? oName : 'PropertyHub Partner',
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
