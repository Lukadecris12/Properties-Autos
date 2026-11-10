import 'package:intl/intl.dart';

class SubscriptionPlanModel {
  final int id;
  final String slug;
  final String name;
  final String tierCategory; // FREE, ENTRY, GROWTH, BUSINESS, ENTERPRISE
  final double priceNgn;
  final int listingAllowance;
  final int featuredAllowance;
  final int boostAllowance;
  final int durationDays;
  final int displayOrder;
  final String badge;
  final String tagline;
  final List<String> features;
  final bool isActive;

  SubscriptionPlanModel({
    required this.id,
    required this.slug,
    required this.name,
    required this.tierCategory,
    required this.priceNgn,
    required this.listingAllowance,
    required this.featuredAllowance,
    required this.boostAllowance,
    required this.durationDays,
    required this.displayOrder,
    required this.badge,
    required this.tagline,
    required this.features,
    this.isActive = true,
  });

  factory SubscriptionPlanModel.fromJson(Map<String, dynamic> json) {
    List<String> featList = [];
    if (json['features'] != null && json['features'] is List) {
      featList = (json['features'] as List).map((e) => e.toString()).toList();
    }

    return SubscriptionPlanModel(
      id: json['id'] ?? 0,
      slug: json['slug'] ?? 'free',
      name: json['name'] ?? 'Plan',
      tierCategory: json['tier_category'] ?? 'ENTRY',
      priceNgn: (json['price_ngn'] != null) ? double.parse(json['price_ngn'].toString()) : 0.0,
      listingAllowance: json['listing_allowance'] ?? 1,
      featuredAllowance: json['featured_allowance'] ?? 0,
      boostAllowance: json['boost_allowance'] ?? 0,
      durationDays: json['duration_days'] ?? 30,
      displayOrder: json['display_order'] ?? 1,
      badge: json['badge'] ?? 'Standard',
      tagline: json['tagline'] ?? '',
      features: featList,
      isActive: json['is_active'] ?? true,
    );
  }

  String get formattedPrice {
    if (priceNgn == 0) return 'Free';
    final format = NumberFormat.currency(locale: 'en_NG', symbol: '₦', decimalDigits: 0);
    return format.format(priceNgn);
  }
}

class ListingBoostModel {
  final int id;
  final int listingId;
  final String listingTitle;
  final DateTime startedAt;
  final DateTime expiresAt;
  final int durationHours;
  final bool isActive;

  ListingBoostModel({
    required this.id,
    required this.listingId,
    required this.listingTitle,
    required this.startedAt,
    required this.expiresAt,
    required this.durationHours,
    required this.isActive,
  });

  factory ListingBoostModel.fromJson(Map<String, dynamic> json) {
    return ListingBoostModel(
      id: json['id'] ?? 0,
      listingId: json['listing_id'] ?? 0,
      listingTitle: json['listing_title'] ?? 'Listing',
      startedAt: DateTime.tryParse(json['started_at'] ?? '') ?? DateTime.now(),
      expiresAt: DateTime.tryParse(json['expires_at'] ?? '') ?? DateTime.now().add(const Duration(hours: 72)),
      durationHours: json['duration_hours'] ?? 72,
      isActive: json['is_active'] ?? true,
    );
  }

  int get remainingHours {
    final diff = expiresAt.difference(DateTime.now()).inHours;
    return diff > 0 ? diff : 0;
  }

  String get countdownText {
    final diff = expiresAt.difference(DateTime.now());
    if (diff.isNegative) return 'Expired';
    final hours = diff.inHours;
    final minutes = diff.inMinutes % 60;
    return '${hours}h ${minutes}m left';
  }
}

class UserSubscriptionUsageModel {
  final int planId;
  final String planSlug;
  final String planName;
  final String tierCategory;
  final double priceNgn;
  final String status;
  final DateTime currentPeriodStart;
  final DateTime currentPeriodEnd;
  final bool autoRenew;

  // Quota & Algorithmic tracking
  final int listingAllowance;
  final int activeListingsCount;
  final int remainingListings;
  final int excessListingsCount;

  final int featuredAllowance;
  final int usedFeaturedCount;
  final int remainingFeatured;

  final int monthlyBoostAllowance;
  final int remainingBoostCredits;
  final int usedBoostCredits;
  final int activeBoostsCount;
  final List<ListingBoostModel> activeBoosts;

  UserSubscriptionUsageModel({
    required this.planId,
    required this.planSlug,
    required this.planName,
    required this.tierCategory,
    required this.priceNgn,
    required this.status,
    required this.currentPeriodStart,
    required this.currentPeriodEnd,
    required this.autoRenew,
    required this.listingAllowance,
    required this.activeListingsCount,
    required this.remainingListings,
    required this.excessListingsCount,
    required this.featuredAllowance,
    required this.usedFeaturedCount,
    required this.remainingFeatured,
    required this.monthlyBoostAllowance,
    required this.remainingBoostCredits,
    required this.usedBoostCredits,
    required this.activeBoostsCount,
    required this.activeBoosts,
  });

  factory UserSubscriptionUsageModel.fromJson(Map<String, dynamic> json) {
    List<ListingBoostModel> boosts = [];
    if (json['active_boosts'] != null && json['active_boosts'] is List) {
      boosts = (json['active_boosts'] as List).map((b) => ListingBoostModel.fromJson(b)).toList();
    }

    return UserSubscriptionUsageModel(
      planId: json['plan_id'] ?? 0,
      planSlug: json['plan_slug'] ?? 'free',
      planName: json['plan_name'] ?? 'Free Plan',
      tierCategory: json['tier_category'] ?? 'FREE',
      priceNgn: (json['price_ngn'] != null) ? double.parse(json['price_ngn'].toString()) : 0.0,
      status: json['status'] ?? 'ACTIVE',
      currentPeriodStart: DateTime.tryParse(json['current_period_start'] ?? '') ?? DateTime.now(),
      currentPeriodEnd: DateTime.tryParse(json['current_period_end'] ?? '') ?? DateTime.now().add(const Duration(days: 30)),
      autoRenew: json['auto_renew'] ?? false,
      listingAllowance: json['listing_allowance'] ?? 1,
      activeListingsCount: json['active_listings_count'] ?? 0,
      remainingListings: json['remaining_listings'] ?? 1,
      excessListingsCount: json['excess_listings_count'] ?? 0,
      featuredAllowance: json['featured_allowance'] ?? 0,
      usedFeaturedCount: json['used_featured_count'] ?? 0,
      remainingFeatured: json['remaining_featured'] ?? 0,
      monthlyBoostAllowance: json['monthly_boost_allowance'] ?? 0,
      remainingBoostCredits: json['remaining_boost_credits'] ?? 0,
      usedBoostCredits: json['used_boost_credits'] ?? 0,
      activeBoostsCount: json['active_boosts_count'] ?? boosts.length,
      activeBoosts: boosts,
    );
  }

  bool get hasRemainingBoosts => remainingBoostCredits > 0;
  bool get canPublish => remainingListings > 0;
  bool get canFeature => remainingFeatured > 0;
}
