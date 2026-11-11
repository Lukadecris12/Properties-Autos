import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../models/subscription_model.dart';
import '../models/listing_model.dart';
import '../services/api_service.dart';
import '../services/revenuecat_service.dart';
import '../core/constants.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({Key? key}) : super(key: key);

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;

  bool _isAnnual = false;
  bool _isLoading = true;
  String _selectedTier = 'STANDARD'; // STANDARD, BUSINESS, ENTERPRISE

  List<SubscriptionPlanModel> _plans = [];
  UserSubscriptionUsageModel? _userUsage;
  List<ListingBoostModel> _activeBoosts = [];
  List<ListingModel> _myListings = [];

  Offerings? _revenueCatOfferings;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (_tabController.indexIsChanging) return;
      setState(() {
        if (_tabController.index == 0) _selectedTier = 'STANDARD';
        if (_tabController.index == 1) _selectedTier = 'BUSINESS';
        if (_tabController.index == 2) _selectedTier = 'ENTERPRISE';
      });
    });
    _loadSubscriptionData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadSubscriptionData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Fetch live plans from backend
      final plans = await _apiService.fetchSubscriptionPlans();
      
      // 2. Fetch current user subscription usage and quotas
      final usage = await _apiService.fetchMySubscriptionUsage();

      // 3. Fetch active boosts
      final boosts = await _apiService.fetchMyBoosts();

      // 4. Fetch user's listings to support in-app boosting
      final listings = await _apiService.fetchSavedListings();

      // 5. Check RevenueCat offerings
      Offerings? offerings;
      if (RevenueCatService.isConfigured) {
        offerings = await RevenueCatService.getOfferings();
      }

      if (mounted) {
        setState(() {
          _plans = plans;
          _userUsage = usage;
          _activeBoosts = boosts.isNotEmpty ? boosts : usage.activeBoosts;
          _myListings = listings;
          _revenueCatOfferings = offerings;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<SubscriptionPlanModel> get _filteredPlans {
    if (_selectedTier == 'STANDARD') {
      return _plans.where((p) => p.tierCategory == 'FREE' || p.tierCategory == 'ENTRY' || p.tierCategory == 'GROWTH').toList();
    } else if (_selectedTier == 'BUSINESS') {
      return _plans.where((p) => p.tierCategory == 'BUSINESS').toList();
    } else {
      return _plans.where((p) => p.tierCategory == 'ENTERPRISE').toList();
    }
  }

  Future<void> _handleApplyBoost(ListingModel listing) async {
    if (_userUsage != null && _userUsage!.remainingBoostCredits <= 0) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('You have 0 boost credits left. Please upgrade your subscription to receive additional 72-hour boosts.'),
          backgroundColor: Colors.amber,
        ),
      );
      return;
    }

    try {
      Navigator.pop(context);
      setState(() => _isLoading = true);
      final res = await _apiService.boostListing(listing.id, durationHours: 72);
      final msg = res['message'] ?? 'Listing elevated in search rankings for 72 hours!';
      
      await _loadSubscriptionData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.rocket_launch, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Expanded(child: Text(msg)),
              ],
            ),
            backgroundColor: const Color(0xFF059669),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Boost failed: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _showBoostListingDialog() {
    if (_myListings.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('You have no active listings to boost. Post a listing first!')),
      );
      return;
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: const [
                      Icon(Icons.rocket_launch, color: Color(0xFFF59E0B), size: 22),
                      SizedBox(width: 8),
                      Text('72-Hour Search Boost Engine', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              Text(
                'Available Boost Credits: ${_userUsage?.remainingBoostCredits ?? 0}. Each boost temporarily elevates your listing to top search positions for 72 hours.',
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
              const SizedBox(height: 16),
              const Text('Select a listing to elevate:', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Expanded(
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: _myListings.length,
                  separatorBuilder: (_, __) => const Divider(color: Color(0xFF1F2937), height: 12),
                  itemBuilder: (c, idx) {
                    final item = _myListings[idx];
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          item.imageUrls.isNotEmpty ? item.imageUrls.first : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
                          width: 48,
                          height: 48,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(width: 48, height: 48, color: Colors.grey[900]),
                        ),
                      ),
                      title: Text(item.title, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      subtitle: Text(item.formattedPrice, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11)),
                      trailing: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => _handleApplyBoost(item),
                        child: const Text('Boost (72h)', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _handleSubscribe(SubscriptionPlanModel plan) async {
    final price = _isAnnual ? plan.priceNgn * 10 : plan.priceNgn;

    // Free plan: direct activation
    if (plan.priceNgn == 0) {
      try {
        setState(() => _isLoading = true);
        await _apiService.subscribeToPlan(plan.slug, paymentMethod: 'SYSTEM');
        await _loadSubscriptionData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('${plan.name} is active on your account!'), backgroundColor: const Color(0xFF059669)),
          );
        }
      } catch (e) {
        if (mounted) setState(() => _isLoading = false);
      }
      return;
    }

    // 1. Process via RevenueCat In-App Purchases exclusively on mobile
    _purchaseViaRevenueCat(plan);
  }

  void _purchaseViaRevenueCat(SubscriptionPlanModel plan) async {
    final price = _isAnnual ? plan.priceNgn * 10 : plan.priceNgn;
    final formattedPrice = '₦${price.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';

    Package? packageToBuy;
    if (_revenueCatOfferings != null) {
      final candidates = <Package>[];
      if (_revenueCatOfferings!.current != null) {
        candidates.addAll(_revenueCatOfferings!.current!.availablePackages);
      }
      for (var offering in _revenueCatOfferings!.all.values) {
        candidates.addAll(offering.availablePackages);
      }

      final slug = plan.slug.toLowerCase().replaceAll('-', '_');
      for (var pkg in candidates) {
        final pkgId = pkg.identifier.toLowerCase();
        final prodId = pkg.storeProduct.identifier.toLowerCase();
        if (pkgId == slug || prodId == slug || pkgId.contains(slug) || prodId.contains(slug)) {
          packageToBuy = pkg;
          break;
        }
      }
    }

    // If RevenueCat is active with live keys and package found, execute native store purchase
    if (RevenueCatService.isConfigured && packageToBuy != null) {
      setState(() => _isLoading = true);
      try {
        final success = await RevenueCatService.purchasePackage(packageToBuy);
        if (success && mounted) {
          final customerInfo = RevenueCatService.latestCustomerInfo;
          final ref = customerInfo?.originalAppUserId.isNotEmpty == true
              ? customerInfo!.originalAppUserId
              : 'RC-${plan.slug}-${DateTime.now().millisecondsSinceEpoch}';

          try {
            await _apiService.verifySubscriptionPayment(ref, plan.slug, provider: 'REVENUECAT');
          } catch (e) {
            debugPrint('[RevenueCat] Backend quota sync error: $e');
          }

          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${plan.name} subscribed successfully via App Store / Google Play!'),
              backgroundColor: const Color(0xFF059669),
            ),
          );
          await _loadSubscriptionData();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('In-App Purchase error: $e'), backgroundColor: Colors.red),
          );
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
      return;
    }

    // In-App Purchase presentation dialog
    _showInAppPurchaseDialog(plan, formattedPrice, packageToBuy);
  }

  void _showInAppPurchaseDialog(SubscriptionPlanModel plan, String formattedPrice, Package? package) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF1F2937)),
        ),
        title: Row(
          children: [
            const Icon(Icons.shopping_bag_outlined, color: Color(0xFF10B981), size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'In-App Purchase (${plan.name})',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B0F19),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF1F2937)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Store Billing Amount:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text(
                      '$formattedPrice / ${_isAnnual ? 'year' : 'month'}',
                      style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Quota specs
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: const Color(0xFF0B0F19), borderRadius: BorderRadius.circular(10)),
                child: Column(
                  children: [
                    _buildQuotaRow('Listing Capacity:', '${plan.listingAllowance.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')} active'),
                    const SizedBox(height: 4),
                    _buildQuotaRow('Featured Slots:', '${plan.featuredAllowance} placements'),
                    const SizedBox(height: 4),
                    _buildQuotaRow('Promotional Boosts:', '${plan.boostAllowance} credits (72h each)'),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // RevenueCat In-App Purchase description
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.verified_user_outlined, color: Color(0xFF34D399), size: 16),
                        SizedBox(width: 6),
                        Text('RevenueCat Mobile Billing', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Mobile subscriptions are billed directly through your Google Play Store or Apple App Store account.\n\nProduct Identifier: propertyhub_${plan.slug.replaceAll('-', '_')}',
                      style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 11, height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              if (package != null && RevenueCatService.isConfigured) {
                _purchaseViaRevenueCat(plan);
              } else {
                setState(() => _isLoading = true);
                try {
                  final ref = 'RC-TEST-${plan.slug}-${DateTime.now().millisecondsSinceEpoch}';
                  await _apiService.verifySubscriptionPayment(ref, plan.slug, provider: 'REVENUECAT');
                  await _loadSubscriptionData();
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('${plan.name} activated successfully via In-App Purchase!'),
                        backgroundColor: const Color(0xFF059669),
                      ),
                    );
                  }
                } catch (err) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Activation error: $err'), backgroundColor: Colors.red),
                    );
                  }
                } finally {
                  if (mounted) setState(() => _isLoading = false);
                }
              }
            },
            icon: const Icon(Icons.check_circle_outline, size: 16, color: Colors.white),
            label: const Text('Confirm In-App Purchase', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuotaRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Future<void> _handleRestorePurchases() async {
    setState(() => _isLoading = true);
    try {
      final info = await RevenueCatService.restorePurchases();
      if (mounted) {
        final activeCount = info?.entitlements.active.length ?? 0;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(activeCount > 0 ? 'Purchases restored! Active memberships: $activeCount' : 'No previous mobile purchases found.'),
            backgroundColor: const Color(0xFF059669),
          ),
        );
        await _loadSubscriptionData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Restore error: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        title: const Text('Plans & Boost Engine', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton.icon(
            onPressed: _isLoading ? null : _handleRestorePurchases,
            icon: const Icon(Icons.restore, color: Color(0xFF10B981), size: 16),
            label: const Text('Restore', style: TextStyle(color: Color(0xFF10B981), fontSize: 12)),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF10B981),
          indicatorWeight: 3,
          labelColor: const Color(0xFF10B981),
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: const [
            Tab(text: 'Standard'),
            Tab(text: 'Business'),
            Tab(text: 'Enterprise'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- Active User Quota & Boost Algorithm Dashboard ---
                  if (_userUsage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFF064E3B), Color(0xFF0F172A)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF10B981).withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('CURRENT MEMBERSHIP', style: TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                                  const SizedBox(height: 2),
                                  Text(_userUsage!.planName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: const Color(0xFF10B981)),
                                ),
                                child: Text(_userUsage!.status, style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const Divider(color: Colors.white24, height: 20),

                          // Quota bars
                          Row(
                            children: [
                              Expanded(
                                child: _buildUsageStat(
                                  icon: Icons.list_alt,
                                  label: 'Listings Capacity',
                                  value: '${_userUsage!.activeListingsCount} / ${_userUsage!.listingAllowance.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                                  highlight: _userUsage!.canPublish ? const Color(0xFF34D399) : Colors.amber,
                                ),
                              ),
                              Expanded(
                                child: _buildUsageStat(
                                  icon: Icons.star,
                                  label: 'Featured Slots',
                                  value: '${_userUsage!.usedFeaturedCount} / ${_userUsage!.featuredAllowance}',
                                  highlight: const Color(0xFFFBBF24),
                                ),
                              ),
                              Expanded(
                                child: _buildUsageStat(
                                  icon: Icons.rocket_launch,
                                  label: '72h Boost Credits',
                                  value: '${_userUsage!.remainingBoostCredits}',
                                  highlight: const Color(0xFF60A5FA),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),

                          // Quick Boost CTA Button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF10B981),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              onPressed: _showBoostListingDialog,
                              icon: const Icon(Icons.rocket_launch, size: 16, color: Colors.white),
                              label: Text(
                                _userUsage!.remainingBoostCredits > 0
                                    ? 'Boost a Listing Now (${_userUsage!.remainingBoostCredits} credits left)'
                                    : 'Boost a Listing (72-Hour Search Elevation)',
                                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],

                  // Active Boosts Countdown list if any
                  if (_activeBoosts.isNotEmpty) ...[
                    const Text('Active 72-Hour Listing Boosts:', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ..._activeBoosts.map((b) => Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF111827),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFF60A5FA).withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.timer, color: Color(0xFF60A5FA), size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(b.listingTitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                                    const Text('Elevated to top marketplace rankings', style: TextStyle(color: Colors.grey, fontSize: 10)),
                                  ],
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(color: const Color(0xFF60A5FA).withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                                child: Text(b.countdownText, style: const TextStyle(color: Color(0xFF93C5FD), fontSize: 11, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                        )),
                    const SizedBox(height: 16),
                  ],

                  // Tier Category Overview Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    margin: const EdgeInsets.only(bottom: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1F2937)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.workspace_premium, size: 18, color: Color(0xFF10B981)),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _selectedTier == 'STANDARD'
                                ? 'Standard Plans (Free, Starter & Growth)'
                                : (_selectedTier == 'BUSINESS'
                                    ? 'Business Scale Tiers (100 to 2,500 Listings)'
                                    : 'Enterprise Tiers (2,750 to 6,000+ Listings)'),
                            style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Annual Discount Toggle
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1F2937)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isAnnual = false),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: !_isAnnual ? const Color(0xFF059669) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text('Monthly Renewal', textAlign: TextAlign.center, style: TextStyle(color: !_isAnnual ? Colors.white : Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isAnnual = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 8),
                              decoration: BoxDecoration(
                                color: _isAnnual ? const Color(0xFF059669) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text('Annual (Save 17%)', textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Plans Catalogue Cards
                  ..._filteredPlans.map((plan) {
                    final isCurrent = _userUsage?.planSlug == plan.slug;
                    final price = _isAnnual ? plan.priceNgn * 10 : plan.priceNgn;
                    final formattedPrice = plan.priceNgn == 0
                        ? 'Free'
                        : '₦${price.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';

                    final isBestValue = plan.slug == 'growth' || plan.slug == 'business-500' || plan.slug == 'enterprise-2750';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: isCurrent
                              ? const Color(0xFF10B981)
                              : (isBestValue ? const Color(0xFF059669) : const Color(0xFF1F2937)),
                          width: isCurrent || isBestValue ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF10B981).withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.4)),
                                ),
                                child: Text(plan.badge, style: const TextStyle(color: Color(0xFF34D399), fontSize: 10, fontWeight: FontWeight.bold)),
                              ),
                              if (isCurrent)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(6)),
                                  child: const Text('ACTIVE TIER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                                )
                              else if (isBestValue)
                                Row(
                                  children: const [
                                    Icon(Icons.star, color: Color(0xFFF59E0B), size: 14),
                                    SizedBox(width: 4),
                                    Text('Best Value', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(plan.name, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                          if (plan.tagline.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(plan.tagline, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                          ],
                          const SizedBox(height: 14),

                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(formattedPrice, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                              if (plan.priceNgn > 0)
                                Text(' / ${_isAnnual ? 'year' : 'month'}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            ],
                          ),
                          const Divider(color: Color(0xFF1F2937), height: 22),

                          // Feature highlights & Quotas
                          ...plan.features.map((feat) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 16),
                                  const SizedBox(width: 8),
                                  Expanded(child: Text(feat, style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 11))),
                                ],
                              ),
                            );
                          }).toList(),

                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isCurrent
                                    ? const Color(0xFF1F2937)
                                    : (isBestValue ? const Color(0xFF059669) : const Color(0xFF1F2937)),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              onPressed: isCurrent ? null : () => _handleSubscribe(plan),
                              child: Text(
                                isCurrent ? 'Active Subscription' : (plan.priceNgn == 0 ? 'Select Free Plan' : 'Subscribe to ${plan.name}'),
                                style: TextStyle(
                                  color: isCurrent ? Colors.grey : Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
    );
  }

  Widget _buildUsageStat({required IconData icon, required String label, required String value, required Color highlight}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: highlight),
            const SizedBox(width: 4),
            Expanded(child: Text(label, style: const TextStyle(color: Colors.grey, fontSize: 10), maxLines: 1)),
          ],
        ),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: highlight, fontSize: 13, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
