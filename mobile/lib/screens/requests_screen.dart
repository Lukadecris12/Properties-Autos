import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RequestsScreen extends StatefulWidget {
  const RequestsScreen({Key? key}) : super(key: key);

  @override
  State<RequestsScreen> createState() => _RequestsScreenState();
}

class _RequestsScreenState extends State<RequestsScreen> {
  final ApiService _apiService = ApiService();
  String _selectedCategory = 'ALL';

  final List<Map<String, dynamic>> _mockRequests = [
    {
      'id': 1,
      'title': 'Need 4-Bedroom Fully Detached Duplex with Swimming Pool',
      'category': 'RESIDENTIAL',
      'transaction': 'BUY',
      'budget': '₦350,000,000',
      'location': 'Lekki Phase 1, Lagos',
      'requester': 'Tunde B. (Pre-Approved High-Net-Worth Buyer)',
      'time': '2 hours ago',
      'verified': true,
      'criteria': 'Governor\'s Consent or C of O, 2 BQ rooms, minimum 500sqm compound',
    },
    {
      'id': 2,
      'title': 'Looking for 3-Bedroom Serviced Waterfront Apartment for Rent',
      'category': 'RESIDENTIAL',
      'transaction': 'RENT',
      'budget': '₦18,000,000 / year',
      'location': 'Old Ikoyi, Lagos',
      'requester': 'Chevron Expatriate Executive',
      'time': '4 hours ago',
      'verified': true,
      'criteria': '24/7 power, swimming pool, gym, elevator, 2 parking slots',
    },
    {
      'id': 3,
      'title': 'Urgent: 1,000sqm Dry Commercial/Residential Plot',
      'category': 'LAND',
      'transaction': 'BUY',
      'budget': '₦160,000,000',
      'location': 'Epe Expressway / Alaro City axis',
      'requester': 'Apex Prime Real Estate Fund',
      'time': 'Yesterday',
      'verified': true,
      'criteria': 'Registered Survey & Gazette/C of O. Immediate physical inspection',
    },
    {
      'id': 4,
      'title': 'Want to Rent Toyota Land Cruiser LC300 (Bulletproof Preferred)',
      'category': 'VEHICLE',
      'transaction': 'RENT',
      'budget': '₦350,000 / day',
      'location': 'Abuja Central / Maitama',
      'requester': 'Diplomatic Protocol Team',
      'time': 'Yesterday',
      'verified': true,
      'criteria': '2023-2024 model, experienced protocol driver included, 7 days duration',
    },
    {
      'id': 5,
      'title': 'Direct Purchase: Mercedes-Benz G63 AMG (2022+ Clean Title)',
      'category': 'VEHICLE',
      'transaction': 'BUY',
      'budget': '₦240,000,000',
      'location': 'Victoria Island, Lagos',
      'requester': 'Private Tech Founder',
      'time': '2 days ago',
      'verified': true,
      'criteria': 'Full custom duty paid, under 15,000km, clean vin history',
    },
  ];

  void _showPostRequestDialog() {
    final titleController = TextEditingController();
    final budgetController = TextEditingController();
    final cityController = TextEditingController(text: 'Lagos');
    final criteriaController = TextEditingController();
    String txType = 'BUY';
    String cat = 'RESIDENTIAL';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Post a Request',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    const Text(
                      'Let verified agents and property owners find you directly.',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),

                    // Transaction Type
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setModalState(() => txType = 'BUY'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: txType == 'BUY' ? const Color(0xFF059669) : const Color(0xFF1F2937),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Center(
                                child: Text('I Want to BUY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setModalState(() => txType = 'RENT'),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: txType == 'RENT' ? const Color(0xFF059669) : const Color(0xFF1F2937),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Center(
                                child: Text('I Want to RENT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Category
                    DropdownButtonFormField<String>(
                      value: cat,
                      dropdownColor: const Color(0xFF1F2937),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Category',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'RESIDENTIAL', child: Text('Houses & Apartments')),
                        DropdownMenuItem(value: 'LAND', child: Text('Land')),
                        DropdownMenuItem(value: 'VEHICLE', child: Text('Autos & Vehicles')),
                      ],
                      onChanged: (val) {
                        if (val != null) setModalState(() => cat = val);
                      },
                    ),
                    const SizedBox(height: 12),

                    // Title
                    TextField(
                      controller: titleController,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'e.g. Need 4-Bedroom Duplex in Lekki Phase 1',
                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        labelText: 'Request Title',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Budget
                    TextField(
                      controller: budgetController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'e.g. 250000000',
                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        labelText: 'Maximum Budget (NGN)',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Criteria / Specific Details
                    TextField(
                      controller: criteriaController,
                      maxLines: 3,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Specify title document, amenities, preferred estate or car year/condition...',
                        hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        labelText: 'Key Preferences & Specifications',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Submit Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: const Icon(Icons.send, color: Colors.white, size: 18),
                        label: const Text('Publish Request', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        onPressed: () async {
                          if (titleController.text.trim().isEmpty) return;
                          final budget = double.tryParse(budgetController.text.trim()) ?? 10000000;
                          
                          await _apiService.postRequirement(
                            title: titleController.text.trim(),
                            transactionType: txType == 'BUY' ? 'SALE' : 'RENT',
                            assetCategory: cat,
                            maxBudget: budget,
                            preferredState: 'Lagos',
                            preferredCity: cityController.text.trim(),
                          );

                          if (mounted) {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                backgroundColor: Color(0xFF065F46),
                                content: Text('Request posted successfully! PropertyHub AI will notify matching agents.'),
                              ),
                            );
                          }
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _selectedCategory == 'ALL'
        ? _mockRequests
        : _mockRequests.where((r) => r['category'] == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: Column(
        children: [
          // Top AI Matching Banner
          Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF0F172A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF059669).withOpacity(0.4)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.auto_awesome, color: Color(0xFF10B981), size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'AI Smart Matching',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Post what you want to buy or rent. Verified agents will match your exact budget & location.',
                        style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _showPostRequestDialog,
                  child: const Text('Post', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12)),
                ),
              ],
            ),
          ),

          // Category Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _buildCategoryFilter('ALL', 'All Requests'),
                const SizedBox(width: 8),
                _buildCategoryFilter('RESIDENTIAL', 'Houses & Apartments'),
                const SizedBox(width: 8),
                _buildCategoryFilter('LAND', 'Land'),
                const SizedBox(width: 8),
                _buildCategoryFilter('VEHICLE', 'Autos & Vehicles'),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Requests List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final req = filtered[index];
                return _buildRequestCard(req);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter(String key, String label) {
    final isSelected = _selectedCategory == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : const Color(0xFF1F2937),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : const Color(0xFF374151),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildRequestCard(Map<String, dynamic> req) {
    final isBuy = req['transaction'] == 'BUY';
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isBuy ? const Color(0xFF064E3B) : const Color(0xFF1E3A8A),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  req['transaction'],
                  style: TextStyle(
                    color: isBuy ? const Color(0xFF34D399) : const Color(0xFF60A5FA),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Text(
                req['time'],
                style: const TextStyle(color: Color(0xFF6B7280), fontSize: 11),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            req['title'],
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.payments, size: 14, color: Color(0xFFF59E0B)),
              const SizedBox(width: 4),
              Text(
                'Budget: ${req['budget']}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B)),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.location_on, size: 14, color: Colors.grey),
              const SizedBox(width: 4),
              Text(
                req['location'],
                style: const TextStyle(fontSize: 11, color: Colors.grey),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Specs: ${req['criteria']}',
            style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.verified, size: 14, color: Color(0xFF10B981)),
                  const SizedBox(width: 4),
                  Text(
                    req['requester'],
                    style: const TextStyle(fontSize: 11, color: Color(0xFF10B981)),
                  ),
                ],
              ),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Color(0xFF059669)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Opening direct proposal link for ${req['requester']}')),
                  );
                },
                child: const Text('Offer Property', style: TextStyle(color: Color(0xFF10B981), fontSize: 11)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
