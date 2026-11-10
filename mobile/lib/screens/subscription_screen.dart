import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class SubscriptionScreen extends StatefulWidget {
  const SubscriptionScreen({Key? key}) : super(key: key);

  @override
  State<SubscriptionScreen> createState() => _SubscriptionScreenState();
}

class _SubscriptionScreenState extends State<SubscriptionScreen> {
  bool _isAnnual = false;

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'starter',
      'name': 'Starter Member',
      'tagline': 'Individual buyers, renters & single-asset owners',
      'monthlyPrice': 0,
      'annualPrice': 0,
      'badge': 'Free Tier',
      'color': const Color(0xFF1F2937),
      'popular': false,
      'features': [
        'Up to 2 active listings',
        'Standard search & AI matching',
        'Direct inquiry messaging',
        'Standard helpdesk support',
      ],
    },
    {
      'id': 'agent_pro',
      'name': 'Verified Agent Pro',
      'tagline': 'Certified real estate brokers & auto merchants',
      'monthlyPrice': 25000,
      'annualPrice': 250000,
      'badge': 'Most Popular',
      'color': const Color(0xFF059669),
      'popular': true,
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
      'name': 'Corporate Developer & Dealer',
      'tagline': 'Master estate builders & major dealerships',
      'monthlyPrice': 85000,
      'annualPrice': 850000,
      'badge': 'Enterprise Gold',
      'color': const Color(0xFFD97706),
      'popular': false,
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
      'name': 'HNI VIP Concierge',
      'tagline': 'Private advisory for high-net-worth investors',
      'monthlyPrice': 250000,
      'annualPrice': 2500000,
      'badge': 'VIP Club',
      'color': const Color(0xFF7C3AED),
      'popular': false,
      'features': [
        'Private off-market luxury estates & exotic autos',
        'Discreet corporate acquisitions concierge',
        'Statutory title verification priority processing',
        'In-person due diligence & title search coordination',
        'Direct consultation with senior real estate counsel',
      ],
    },
  ];

  void _showOfflineInvoiceDialog(Map<String, dynamic> plan) {
    final price = _isAnnual ? plan['annualPrice'] : plan['monthlyPrice'];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Color(0xFF1F2937))),
        title: Row(
          children: [
            const Icon(Icons.receipt_long, color: Color(0xFF10B981), size: 24),
            const SizedBox(width: 8),
            Expanded(
              child: Text('${plan['name']} Invoice', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
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
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text('Payable Total:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    '₦${price.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}',
                    style: const TextStyle(color: Color(0xFF10B981), fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Designated Corporate Bank Accounts:',
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
                  Text('Stanbic IBTC Bank Plc', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('Properties & Autos Tech Ltd • 0048921849', style: TextStyle(color: Color(0xFF34D399), fontSize: 11)),
                  Divider(color: Colors.white10, height: 12),
                  Text('Zenith Bank Plc', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                  Text('Properties & Autos Tech Ltd • 1018942103', style: TextStyle(color: Color(0xFF34D399), fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              'In accordance with store guidelines, no in-app card payments are taken. Please notify our finance desk after offline transfer to activate your membership.',
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
                'https://wa.me/2348031234567?text=Hello%20Finance%20Desk,%20I%20have%20transferred%20funds%20to%20activate%20the%20${plan['name']}%20plan.',
              );
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.chat, size: 16, color: Colors.white),
            label: const Text('Notify on WhatsApp', style: TextStyle(color: Colors.white, fontSize: 12)),
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
      ),
      body: SingleChildScrollView(
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
                        padding: const EdgeInsets.symmetric(vertical: 8),
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
                        padding: const EdgeInsets.symmetric(vertical: 8),
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

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: const Color(0xFF111827),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(
                    color: isPopular ? const Color(0xFF059669) : const Color(0xFF1F2937),
                    width: isPopular ? 2 : 1,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
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
                        if (isPopular)
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
                        Text(formattedPrice, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.extrabold)),
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
                          backgroundColor: plan['id'] == 'starter' 
                              ? const Color(0xFF1F2937) 
                              : (isPopular ? const Color(0xFF059669) : const Color(0xFF1F2937)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        onPressed: plan['id'] == 'starter' ? null : () => _showOfflineInvoiceDialog(plan),
                        child: Text(
                          plan['id'] == 'starter' ? 'Current Tier' : 'Select ${plan['name']}',
                          style: TextStyle(
                            color: plan['id'] == 'starter' ? Colors.grey : Colors.white,
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
