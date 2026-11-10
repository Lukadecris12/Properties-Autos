import 'package:flutter/material.dart';
import 'contact_support_screen.dart';

class FaqScreen extends StatefulWidget {
  const FaqScreen({Key? key}) : super(key: key);

  @override
  State<FaqScreen> createState() => _FaqScreenState();
}

class _FaqScreenState extends State<FaqScreen> {
  String _selectedCategory = 'All';
  String _searchQuery = '';
  final Set<int> _expandedIndices = {0, 1};

  final List<String> _categories = [
    'All',
    'Safety & Verification',
    'Listing & Publishing',
    'Plans & Subscriptions',
    'Inspections & Support',
    'Legal & Title Documents',
  ];

  final List<Map<String, String>> _faqs = [
    {
      'category': 'Safety & Verification',
      'question': 'How does Properties & Autos ensure safety and prevent real estate fraud?',
      'answer': 'Properties & Autos operates strictly as an asset discovery and advertising directory. We enforce physical offline conveyancing: all funds transfer, statutory document signing, and deed exchanges must happen directly at the verified developer or dealership corporate offices. Never transfer funds online without prior physical inspection and statutory due diligence.',
    },
    {
      'category': 'Safety & Verification',
      'question': 'How do I identify a certified Agent or Corporate Developer?',
      'answer': 'Certified partners feature an official green "Verified Agent" or gold "Enterprise Developer" trust badge. These badges indicate that corporate CAC registrations, statutory licenses, and identity credentials have been vetted by our administration.',
    },
    {
      'category': 'Safety & Verification',
      'question': 'Can I pay for a property or vehicle directly through the app?',
      'answer': 'No. To protect all parties and comply with financial trade regulations, our platform has zero in-app card gateways or digital escrow wallets. All monetary settlements must be executed offline directly between the transacting parties after satisfactory legal inspection.',
    },
    {
      'category': 'Listing & Publishing',
      'question': 'Is it free to list properties and vehicles on Properties & Autos?',
      'answer': 'Yes! Every registered member can list up to 2 active properties or autos for free on our Starter Member tier. Professional brokers, high-volume dealerships, and corporate estate builders can subscribe to our Pro or Enterprise plans for higher listing volumes and featured placement.',
    },
    {
      'category': 'Listing & Publishing',
      'question': 'How many images can I upload per listing?',
      'answer': 'You can upload up to 5 high-resolution photos per listing or supply direct image URLs. Images are automatically framed and rendered to fit every screen seamlessly without distortion.',
    },
    {
      'category': 'Listing & Publishing',
      'question': 'How soon does my listing appear on the marketplace?',
      'answer': 'All eligible listings published by registered users are automatically displayed on the Landing Page and Marketplace search immediately upon publication.',
    },
    {
      'category': 'Plans & Subscriptions',
      'question': 'What subscription plans are available for agents and corporate builders?',
      'answer': 'We provide four distinct membership tiers: Starter Member (Free), Verified Agent Pro (₦25,000/mo or ₦250,000/yr), Corporate Developer & Dealer (₦85,000/mo or ₦850,000/yr), and HNI VIP Concierge (₦250,000/mo or ₦2,500,000/yr). Each tier includes elevated listing capacity and dedicated directory placement.',
    },
    {
      'category': 'Plans & Subscriptions',
      'question': 'How do I pay for my subscription plan?',
      'answer': 'When you select an upgraded membership tier, the platform generates a formal corporate pro-forma invoice detailing our designated corporate bank accounts. Upon direct transfer and receipt notification, our administrative desk verifies the remittance and upgrades your account credentials immediately.',
    },
    {
      'category': 'Inspections & Support',
      'question': 'How do I arrange a physical inspection of a property or vehicle?',
      'answer': 'Every listing card and detail page features direct contact buttons to Call or Chat via WhatsApp with the listing owner, agent, or dealership. You can agree on inspection timing directly with the authorized representative.',
    },
    {
      'category': 'Inspections & Support',
      'question': 'How do I contact customer support if I have an issue?',
      'answer': 'You can visit our Contact & Support page to submit a direct ticket into the Admin Dashboard. Our client desk responds to support inquiries within 2 to 4 business hours. You may also contact our WhatsApp desk for fast-track questions.',
    },
    {
      'category': 'Legal & Title Documents',
      'question': 'What land titles are standard for Nigerian real estate listings?',
      'answer': 'Common statutory documents displayed on listings include Certificate of Occupancy (C of O), Governor\'s Consent, Gazette, Court Judgment, and Registered Survey. We strongly advise engaging a certified legal practitioner to conduct a search at the state Land Registry prior to finalizing any land or property purchase.',
    },
    {
      'category': 'Legal & Title Documents',
      'question': 'What papers should I verify before purchasing an imported vehicle?',
      'answer': 'Verify the vehicle VIN, Nigeria Customs Duty documentation, statutory registration papers, and original proof of ownership. Ensure the engine and chassis numbers correspond exactly with the customs papers.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final filteredFaqs = _faqs.where((faq) {
      final matchCategory = _selectedCategory == 'All' || faq['category'] == _selectedCategory;
      final matchSearch = _searchQuery.isEmpty ||
          faq['question']!.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          faq['answer']!.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        title: const Text('Frequently Asked Questions', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF111827),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Search FAQ (e.g. "verification", "offline")...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 20),
                filled: true,
                fillColor: const Color(0xFF0B0F19),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1F2937)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFF1F2937)),
                ),
              ),
            ),
          ),

          // Category Pills
          SizedBox(
            height: 48,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = _selectedCategory == cat;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF059669) : const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1F2937),
                      ),
                    ),
                    child: Text(
                      cat,
                      style: TextStyle(
                        color: isSelected ? Colors.white : Colors.grey,
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          // FAQ List
          Expanded(
            child: filteredFaqs.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: const [
                        Icon(Icons.help_outline, color: Colors.grey, size: 48),
                        SizedBox(height: 12),
                        Text('No FAQ found matching your search', style: TextStyle(color: Colors.grey, fontSize: 13)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredFaqs.length,
                    itemBuilder: (context, index) {
                      final item = filteredFaqs[index];
                      final isExpanded = _expandedIndices.contains(index);

                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF1F2937)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            InkWell(
                              borderRadius: BorderRadius.circular(12),
                              onTap: () {
                                setState(() {
                                  if (isExpanded) {
                                    _expandedIndices.remove(index);
                                  } else {
                                    _expandedIndices.add(index);
                                  }
                                });
                              },
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            item['category']!.toUpperCase(),
                                            style: const TextStyle(
                                              color: Color(0xFF10B981),
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            item['question']!,
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 13,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                      color: isExpanded ? const Color(0xFF10B981) : Colors.grey,
                                      size: 20,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            if (isExpanded) ...[
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                                child: Text(
                                  item['answer']!,
                                  style: const TextStyle(color: Color(0xFFD1D5DB), fontSize: 12, height: 1.4),
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // Bottom Need More Help Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              border: Border(top: BorderSide(color: Color(0xFF1F2937))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Text('Still need help?', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      Text('Dispatch a ticket to our Admin desk', style: TextStyle(color: Colors.grey, fontSize: 11)),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const ContactSupportScreen()),
                    );
                  },
                  child: const Text('Contact Desk', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
