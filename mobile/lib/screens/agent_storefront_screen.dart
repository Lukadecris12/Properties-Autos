import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/listing_model.dart';
import '../services/api_service.dart';
import 'listing_detail_screen.dart';

class AgentStorefrontScreen extends StatefulWidget {
  final Map<String, dynamic> agent;

  const AgentStorefrontScreen({Key? key, required this.agent}) : super(key: key);

  @override
  State<AgentStorefrontScreen> createState() => _AgentStorefrontScreenState();
}

class _AgentStorefrontScreenState extends State<AgentStorefrontScreen> {
  final ApiService _apiService = ApiService();
  List<ListingModel> _listings = [];
  bool _loading = true;
  String _selectedCategory = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadListings();
  }

  void _loadListings() async {
    setState(() => _loading = true);
    final agentId = widget.agent['id'] is int ? widget.agent['id'] : int.tryParse(widget.agent['id'].toString()) ?? 1;
    final items = await _apiService.fetchAgentListings(agentId);
    if (mounted) {
      setState(() {
        _listings = items;
        _loading = false;
      });
    }
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openWhatsApp() {
    final phone = widget.agent['phone_number'] ?? '+234 803 123 4567';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final waPhone = cleanPhone.startsWith('0') ? '234${cleanPhone.substring(1)}' : (cleanPhone.isNotEmpty ? cleanPhone : '2348031234567');
    final name = widget.agent['company_name'] ?? '${widget.agent['first_name'] ?? ''} ${widget.agent['last_name'] ?? ''}'.trim();
    final message = 'Hello $name, I am viewing your storefront portfolio on Properties & Autos and would like to inquire about your available listings.';
    final waUrl = 'https://wa.me/$waPhone?text=${Uri.encodeComponent(message)}';
    _launchUrl(waUrl);
  }

  void _callAgent() {
    final phone = widget.agent['phone_number'] ?? '+234 803 123 4567';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    _launchUrl('tel:$cleanPhone');
  }

  void _showInAppInquiryDialog() {
    final controller = TextEditingController();
    final name = widget.agent['company_name'] ?? '${widget.agent['first_name'] ?? ''} ${widget.agent['last_name'] ?? ''}'.trim();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Message $name',
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.grey, size: 20),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              maxLines: 4,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'Type your inquiry here...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF1F2937),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 46,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  if (controller.text.trim().isEmpty) return;
                  Navigator.pop(ctx);
                  await _apiService.sendMessage({
                    'recipient_id': widget.agent['id'] ?? 1,
                    'content': controller.text.trim(),
                  });
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Inquiry sent directly to partner inbox!'),
                        backgroundColor: Color(0xFF064E3B),
                      ),
                    );
                  }
                },
                child: const Text('Send Instant Inquiry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final ag = widget.agent;
    final name = ag['company_name'] ?? '${ag['first_name'] ?? ''} ${ag['last_name'] ?? ''}'.trim();
    final displayName = name.isNotEmpty ? name : 'Verified Property Partner';
    final initial = (ag['company_name'] ?? ag['first_name'] ?? 'P')[0].toUpperCase();
    final badge = ag['verification_badge'] ?? (ag['is_business_verified'] == true ? 'Certified Partner' : 'Verified');
    final role = ag['active_mode'] ?? (ag['roles'] is List && ag['roles'].isNotEmpty ? ag['roles'][0] : 'agent');
    final location = '${ag['city'] != null && ag['city'].toString().isNotEmpty ? "${ag['city']}, " : ""}${ag['state'] ?? "Nigeria"}';
    final bio = ag['bio'] ?? 'Accredited real estate professional and property developer on the Properties & Autos marketplace.';

    final filteredListings = _selectedCategory == 'ALL'
        ? _listings
        : _listings.where((l) => l.assetCategory.toUpperCase() == _selectedCategory).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: CustomScrollView(
        slivers: [
          // App Bar with Banner
          SliverAppBar(
            expandedHeight: 180,
            pinned: true,
            backgroundColor: const Color(0xFF0B0F19),
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.pop(context),
            ),
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF064E3B), Color(0xFF111827), Color(0xFF0B0F19)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Stack(
                  children: [
                    Positioned(
                      top: 60,
                      right: 20,
                      child: Opacity(
                        opacity: 0.1,
                        child: const Icon(Icons.business, size: 140, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Main Profile & Inventory Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Storefront Header Card
                  Transform.translate(
                    offset: const Offset(0, -50),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF1F2937)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Avatar / Logo
                              Container(
                                width: 64,
                                height: 64,
                                decoration: BoxDecoration(
                                  gradient: const LinearGradient(
                                    colors: [Color(0xFF10B981), Color(0xFF047857)],
                                    begin: Alignment.topLeft,
                                    end: Alignment.bottomRight,
                                  ),
                                  borderRadius: BorderRadius.circular(18),
                                  boxShadow: [
                                    BoxShadow(
                                      color: const Color(0xFF10B981).withOpacity(0.3),
                                      blurRadius: 12,
                                    ),
                                  ],
                                ),
                                child: Center(
                                  child: Text(
                                    initial,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 26,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      displayName,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF064E3B),
                                            borderRadius: BorderRadius.circular(6),
                                            border: Border.all(color: const Color(0xFF10B981)),
                                          ),
                                          child: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              const Icon(Icons.verified, color: Color(0xFF10B981), size: 12),
                                              const SizedBox(width: 4),
                                              Text(
                                                badge.toString().toUpperCase(),
                                                style: const TextStyle(
                                                  color: Color(0xFF10B981),
                                                  fontSize: 10,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          role.toString().toUpperCase(),
                                          style: const TextStyle(
                                            color: Color(0xFFF59E0B),
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on, color: Colors.grey, size: 14),
                                        const SizedBox(width: 4),
                                        Text(
                                          location,
                                          style: const TextStyle(color: Colors.grey, fontSize: 12),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 16),
                          Text(
                            bio,
                            style: const TextStyle(
                              color: Color(0xFFD1D5DB),
                              fontSize: 12,
                              height: 1.5,
                            ),
                          ),

                          const SizedBox(height: 18),
                          const Divider(color: Color(0xFF1F2937)),
                          const SizedBox(height: 12),

                          // Contact Action Buttons Row
                          Row(
                            children: [
                              // WhatsApp 1-Click Connect
                              Expanded(
                                flex: 3,
                                child: SizedBox(
                                  height: 42,
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF25D366),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                      padding: const EdgeInsets.symmetric(horizontal: 10),
                                    ),
                                    icon: const Icon(Icons.chat, color: Colors.white, size: 16),
                                    label: const Text(
                                      'WhatsApp',
                                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                    onPressed: _openWhatsApp,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // Call Phone
                              Expanded(
                                flex: 2,
                                child: SizedBox(
                                  height: 42,
                                  child: OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: Colors.white,
                                      side: const BorderSide(color: Color(0xFF374151)),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    icon: const Icon(Icons.call, color: Color(0xFF10B981), size: 16),
                                    label: const Text('Call', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                    onPressed: _callAgent,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),

                              // In-App Inquiry
                              SizedBox(
                                height: 42,
                                width: 42,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF1F2937),
                                    padding: EdgeInsets.zero,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                      side: const BorderSide(color: Color(0xFF374151)),
                                    ),
                                  ),
                                  onPressed: _showInAppInquiryDialog,
                                  child: const Icon(Icons.mail_outline, color: Colors.white, size: 18),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Portfolio Section Header
                  Transform.translate(
                    offset: const Offset(0, -30),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Verified Inventory (${_listings.length})',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1F2937),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Text(
                                'Direct Publisher',
                                style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),

                        // Filter Chips (All, Residential, Land, Commercial, Vehicle)
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildCategoryChip('ALL', 'All Assets'),
                              _buildCategoryChip('RESIDENTIAL', 'Houses & Flats'),
                              _buildCategoryChip('LAND', 'Land & Plots'),
                              _buildCategoryChip('COMMERCIAL', 'Commercial'),
                              _buildCategoryChip('VEHICLE', 'Autos & Cars'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Listings Grid / Loading State
          _loading
              ? const SliverToBoxAdapter(
                  child: Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: CircularProgressIndicator(color: Color(0xFF10B981)),
                    ),
                  ),
                )
              : filteredListings.isEmpty
                  ? SliverToBoxAdapter(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                        padding: const EdgeInsets.all(32),
                        decoration: BoxDecoration(
                          color: const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF1F2937)),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.home_work_outlined, size: 48, color: Colors.grey),
                            const SizedBox(height: 12),
                            const Text(
                              'No listings in this category',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 6),
                            const Text(
                              'This partner has no published assets under this specific category at the moment.',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    )
                  : SliverPadding(
                      padding: const EdgeInsets.only(left: 16, right: 16, bottom: 40),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final item = filteredListings[index];
                            return _buildListingCard(item);
                          },
                          childCount: filteredListings.length,
                        ),
                      ),
                    ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String cat, String label) {
    final isSelected = _selectedCategory == cat;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategory = cat),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF111827),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : const Color(0xFF1F2937),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.grey.shade400,
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildListingCard(ListingModel item) {
    final image = item.imageUrls.isNotEmpty
        ? item.imageUrls.first
        : ApiConstants.resolveImageUrl(null, category: item.assetCategory);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ListingDetailScreen(listing: item)),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFF1F2937)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Stack
            Stack(
              children: [
                Image.network(
                  image,
                  height: 195,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  alignment: Alignment.center,
                  errorBuilder: (_, __, ___) => Container(
                    height: 195,
                    color: const Color(0xFF1F2937),
                    child: const Center(child: Icon(Icons.broken_image_outlined, color: Colors.grey, size: 36)),
                  ),
                ),
                // Transaction Badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: item.transactionType == 'SALE' ? const Color(0xFF10B981) : const Color(0xFF3B82F6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.transactionType,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                // Price Badge
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.75),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      item.formattedPrice,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            // Card Body
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Color(0xFF10B981), size: 14),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${item.city}, ${item.state}',
                          style: const TextStyle(color: Colors.grey, fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.arrow_forward_ios, color: Colors.grey, size: 12),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
