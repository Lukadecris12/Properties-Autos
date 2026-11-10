import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../services/revenuecat_service.dart';
import '../core/constants.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({Key? key}) : super(key: key);

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  bool _isAnnual = false;
  bool _isLoading = false;
  Offerings? _offerings;

  @override
  void initState() {
    super.initState();
    _fetchOfferings();
  }

  Future<void> _fetchOfferings() async {
    if (RevenueCatService.isConfigured) {
      setState(() => _isLoading = true);
      try {
        final offerings = await RevenueCatService.getOfferings();
        if (mounted) {
          setState(() {
            _offerings = offerings;
            _isLoading = false;
          });
        }
      } catch (_) {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'starter',
      'revenuecat_id': 'starter',
      'name': 'Starter Member',
      'tagline': 'Individual buyers, renters & single-asset owners',
      'monthlyPrice': 0,
      'annualPrice': 0,
      'badge': 'Free Tier',
      'color': const Color(0xFF1F2937),
      'popular': false,
      'entitlement': '',
      'features': [
        'Up to 2 active listings',
        'Standard search & AI matching',
        'Direct inquiry messaging',
        'Standard helpdesk support',
      ],
    },
    {
      'id': 'agent_pro',
      'revenuecat_id': 'agent_pro',
      'name': 'Verified Agent Pro',
      'tagline': 'Certified real estate brokers & auto merchants',
      'monthlyPrice': 25000,
      'annualPrice': 250000,
      'badge': 'Most Popular',
      'color': const Color(0xFF059669),
      'popular': true,
      'entitlement': RevenueCatConstants.entitlementAgentPro,
      'features': [
        'Up to 25 active property & vehicle listings',
        'Official green "Verified Agent" trust badge',
        'Featured priority in Marketplace search',
        'AI Buyer Lead Matching notifications',
        'Direct WhatsApp contact on listing cards',
        'Priority offline inspection scheduling',
        'Profile in Agents & Developers Directory',
      ],
    },
    {
      'id': 'developer_enterprise',
      'revenuecat_id': 'developer_enterprise',
      'name': 'Corporate Developer & Dealer',
      'tagline': 'Master estate builders & major dealerships',
      'monthlyPrice': 85000,
      'annualPrice': 850000,
      'badge': 'Enterprise Gold',
      'color': const Color(0xFFD97706),
      'popular': false,
      'entitlement': RevenueCatConstants.entitlementDeveloperEnterprise,
      'features': [
        'Unlimited active listings & phase releases',
        'Dedicated Corporate Storefront in Directory',
        'Official "Enterprise Developer" gold seal',
        'Top-tier featured banner across search filters',
        'Dedicated Corporate Account Concierge',
        'Physical due diligence & title audit support',
      ],
    },
    {
      'id': 'hni_vip',
      'revenuecat_id': 'vip_concierge',
      'name': 'HNI VIP Concierge',
      'tagline': 'Private advisory for high-net-worth investors',
      'monthlyPrice': 250000,
      'annualPrice': 2500000,
      'badge': 'VIP Club',
      'color': const Color(0xFF7C3AED),
      'popular': false,
      'entitlement': RevenueCatConstants.entitlementVIP,
      'features': [
        'Private off-market luxury estates & exotic autos',
        'Discreet corporate acquisitions concierge',
        'Statutory title verification priority processing',
        'In-person due diligence & title search coordination',
        'Direct consultation with senior real estate counsel',
      ],
    },
  ];

  Future<void> _handleSubscribe(Map<String, dynamic> plan) async {
    final entitlement = plan['entitlement'] as String;

    // Check if user is already subscribed via RevenueCat
    if (entitlement.isNotEmpty && RevenueCatService.hasEntitlement(entitlement)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('You are already subscribed to ${plan['name']}!'),
          backgroundColor: const Color(0xFF059669),
        ),
      );
      return;
    }

    // If RevenueCat is configured with live offerings, attempt native In-App Purchase
    if (RevenueCatService.isConfigured && _offerings?.current != null) {
      final currentOffering = _offerings!.current!;
      Package? packageToBuy;

      for (var pkg in currentOffering.availablePackages) {
        if (pkg.identifier.toLowerCase().contains(plan['revenuecat_id']) ||
            pkg.storeProduct.identifier.toLowerCase().contains(plan['revenuecat_id'])) {
          packageToBuy = pkg;
          break;
        }
      }

      if (packageToBuy != null) {
        setState(() => _isLoading = true);
        try {
          final success = await RevenueCatService.purchasePackage(packageToBuy);
          if (success && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Congratulations! ${plan['name']} activated successfully.'),
                backgroundColor: const Color(0xFF059669),
              ),
            );
            setState(() {});
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Purchase error: $e'), backgroundColor: Colors.red),
            );
          }
        } finally {
          if (mounted) setState(() => _isLoading = false);
        }
        return;
      }
    }

    // Fallback: If RevenueCat API keys are pending setup or user prefers bank transfer
    _showCheckoutOptionsDialog(plan);
  }

  Future<void> _handleRestorePurchases() async {
    setState(() => _isLoading = true);
    try {
      final info = await RevenueCatService.restorePurchases();
      if (mounted) {
        final activeCount = info?.entitlements.active.length ?? 0;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(activeCount > 0
                ? 'Purchases restored! Active memberships: $activeCount'
                : 'No prior active in-app subscriptions found.'),
            backgroundColor: const Color(0xFF059669),
          ),
        );
        setState(() {});
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Restore error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showCheckoutOptionsDialog(Map<String, dynamic> plan) {
    final price = _isAnnual ? plan['annualPrice'] : plan['monthlyPrice'];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF1F2937)),
        ),
        title: Row(
          children: [
            const Icon(Icons.verified, color: Color(0xFF10B981), size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Subscribe to ${plan['name']}',
                style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
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
                  const Text('Payable Amount:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    '₦${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Corporate Bank Clearing Accounts:',
              style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF0B0F19),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('Zenith Bank Plc', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('Properties & Autos Tech Ltd • 1018899223', style: TextStyle(color: Color(0xFF34D399), fontSize: 11)),
                  Divider(color: Colors.white10, height: 12),
                  Text('Stanbic IBTC Bank Plc', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('Properties & Autos Tech Ltd • 0048921849', style: TextStyle(color: Color(0xFF34D399), fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'Note: In-App Purchases via RevenueCat are ready. Supply your RevenueCat live keys in constants.dart to activate App Store and Google Play billing.',
              style: TextStyle(color: Colors.grey, fontSize: 10, height: 1.3),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              final url = Uri.parse(
                'https://wa.me/2348031234567?text=Hello%20Finance%20Desk,%20I%20want%20to%20activate%20the%20${plan['name']}%20plan.',
              );
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.chat, size: 16, color: Colors.white),
            label: const Text('Notify Finance Desk', style: TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        title: const Text('Plans & Memberships', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Billing toggle
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
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: !_isAnnual ? const Color(0xFF059669) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'Monthly Billing',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: !_isAnnual ? Colors.white : Colors.grey,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _isAnnual = true),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _isAnnual ? const Color(0xFF059669) : Colors.transparent,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'Annual (Save 17%)',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(
                                      color: _isAnnual ? Colors.white : Colors.grey,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Plan Cards
                  ..._plans.map((plan) {
                    final price = _isAnnual ? plan['annualPrice'] : plan['monthlyPrice'];
                    final formattedPrice = price == 0
                        ? 'Free'
                        : '₦${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}';
                    final isPopular = plan['popular'] == true;
                    final entitlement = plan['entitlement'] as String;
                    final isSubscribed = entitlement.isNotEmpty && RevenueCatService.hasEntitlement(entitlement);

                    return Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(
                          color: isSubscribed
                              ? const Color(0xFF10B981)
                              : (isPopular ? const Color(0xFF059669) : const Color(0xFF1F2937)),
                          width: isSubscribed || isPopular ? 2 : 1,
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
                                  color: plan['color'].withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: plan['color'].withOpacity(0.5)),
                                ),
                                child: Text(
                                  plan['badge'],
                                  style: TextStyle(color: plan['color'], fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ),
                              if (isSubscribed)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: const Color(0xFF10B981)),
                                  ),
                                  child: const Text('ACTIVE', style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold)),
                                )
                              else if (isPopular)
                                Row(
                                  children: const [
                                    Icon(Icons.star, color: Color(0xFFF59E0B), size: 14),
                                    SizedBox(width: 4),
                                    Text('Recommended', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 11, fontWeight: FontWeight.bold)),
                                  ],
                                ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(plan['name'], style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 2),
                          Text(plan['tagline'], style: const TextStyle(color: Colors.grey, fontSize: 11)),
                          const SizedBox(height: 14),

                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(formattedPrice, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                              if (price > 0)
                                Text(' / ${_isAnnual ? 'year' : 'month'}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                            ],
                          ),
                          const Divider(color: Color(0xFF1F2937), height: 24),

                          ...((plan['features'] as List<String>).map((feat) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 16),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(feat, style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 11)),
                                  ),
                                ],
                              ),
                            );
                          }).toList()),

                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: isSubscribed
                                    ? const Color(0xFF1F2937)
                                    : (plan['id'] == 'starter'
                                        ? const Color(0xFF1F2937)
                                        : (isPopular ? const Color(0xFF059669) : const Color(0xFF1F2937))),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(vertical: 12),
                              ),
                              onPressed: (plan['id'] == 'starter' || isSubscribed) ? null : () => _handleSubscribe(plan),
                              child: Text(
                                isSubscribed
                                    ? 'Active Subscription'
                                    : (plan['id'] == 'starter' ? 'Current Tier' : 'Subscribe to ${plan['name']}'),
                                style: TextStyle(
                                  color: (plan['id'] == 'starter' || isSubscribed) ? Colors.grey : Colors.white,
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
}
