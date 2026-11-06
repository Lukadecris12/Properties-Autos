import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/listing_model.dart';
import '../services/api_service.dart';
import 'agent_storefront_screen.dart';

class ListingDetailScreen extends StatefulWidget {
  final ListingModel listing;

  const ListingDetailScreen({Key? key, required this.listing}) : super(key: key);

  @override
  State<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends State<ListingDetailScreen> {
  final ApiService _apiService = ApiService();
  int _activeImageIndex = 0;
  bool _isBooking = false;
  bool _isSaved = false;

  @override
  void initState() {
    super.initState();
    _isSaved = _apiService.isListingSaved(widget.listing.id);
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openWhatsApp(ListingModel item) {
    final phone = item.ownerPhone ?? '+234 803 123 4567';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final waPhone = cleanPhone.startsWith('0') ? '234${cleanPhone.substring(1)}' : (cleanPhone.isNotEmpty ? cleanPhone : '2348031234567');
    final message = Uri.encodeComponent(
      'Hello! I saw your listing on PropertyHub: "${item.title}" (Ref: #${item.id}, ${item.formattedPrice}). I would like to inquire about its inspection and details.',
    );
    _launchUrl('https://wa.me/$waPhone?text=$message');
  }

  void _callAgent(ListingModel item) {
    final phone = item.ownerPhone ?? '+2348031234567';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9+]'), '');
    _launchUrl('tel:$cleanPhone');
  }

  void _showInAppInquiryDialog(BuildContext context, ListingModel item) {
    final controller = TextEditingController(
      text: 'Hello, I am interested in "${item.title}". Can we arrange a viewing or discuss availability?',
    );
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Send In-App Inquiry', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('To: ${item.ownerName ?? "Verified Agent"}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(height: 10),
            TextField(
              controller: controller,
              maxLines: 4,
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF0B0F19),
                hintText: 'Type your message...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF059669),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              final text = controller.text.trim();
              if (text.isEmpty) return;
              Navigator.pop(ctx);
              await _apiService.sendMessage({
                'listing_id': item.id,
                'recipient_id': item.ownerId,
                'content': text,
              });
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    backgroundColor: Color(0xFF064E3B),
                    content: Text('Inquiry delivered to agent inbox!'),
                  ),
                );
              }
            },
            child: const Text('Send Message', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.listing;
    final images = item.imageUrls.isNotEmpty
        ? item.imageUrls
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000'];

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: CustomScrollView(
        slivers: [
          // 1. Collapsible Hero Gallery AppBar
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            backgroundColor: const Color(0xFF111827),
            leading: CircleAvatar(
              backgroundColor: Colors.black.withOpacity(0.6),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            actions: [
              CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.6),
                child: IconButton(
                  icon: const Icon(Icons.share, color: Colors.white),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Sharing listing: ${item.title}')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.6),
                child: IconButton(
                  icon: Icon(
                    _isSaved ? Icons.favorite : Icons.favorite_border,
                    color: _isSaved ? const Color(0xFFF43F5E) : Colors.white,
                  ),
                  onPressed: () {
                    final nowSaved = _apiService.toggleSaveListing(item.id);
                    setState(() => _isSaved = nowSaved);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          nowSaved
                              ? 'Saved "${item.title}" to your Wishlist!'
                              : 'Removed from saved listings.',
                        ),
                        backgroundColor: nowSaved ? const Color(0xFF064E3B) : const Color(0xFF1F2937),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  PageView.builder(
                    itemCount: images.length,
                    onPageChanged: (idx) {
                      setState(() {
                        _activeImageIndex = idx;
                      });
                    },
                    itemBuilder: (ctx, idx) {
                      return Image.network(
                        images[idx],
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) => Container(
                          color: const Color(0xFF1F2937),
                          child: const Center(
                            child: Icon(Icons.image_not_supported, color: Colors.grey, size: 48),
                          ),
                        ),
                      );
                    },
                  ),
                  // Gradient shadow at bottom of image
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 80,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.bottomCenter,
                          end: Alignment.topCenter,
                          colors: [
                            const Color(0xFF0B0F19),
                            const Color(0xFF0B0F19).withOpacity(0.0),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Image pagination counter
                  if (images.length > 1)
                    Positioned(
                      bottom: 16,
                      right: 16,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.7),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${_activeImageIndex + 1} / ${images.length}',
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          // 2. Listing Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges (Transaction Type, Category, Verified)
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: item.transactionType == 'SALE'
                              ? const Color(0xFFD97706)
                              : const Color(0xFF059669),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.transactionType,
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1F2937),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          item.assetCategory,
                          style: const TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                      const Spacer(),
                      if (item.isVerified)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF064E3B),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified, color: Color(0xFF10B981), size: 14),
                              SizedBox(width: 4),
                              Text(
                                'Verified Asset',
                                style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Title
                  Text(
                    item.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 8),

                  // Location
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Color(0xFF10B981), size: 16),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${item.neighbourhood != null ? "${item.neighbourhood}, " : ""}${item.city}, ${item.state}',
                          style: const TextStyle(color: Colors.grey, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Price Box
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1F2937)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Asking Price / Rate',
                          style: TextStyle(color: Colors.grey, fontSize: 11, textBaseline: TextBaseline.alphabetic),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.formattedPrice,
                          style: const TextStyle(
                            color: Color(0xFF10B981),
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Specifications Grid
                  const Text(
                    'Key Specifications',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _buildSpecsGrid(item),
                  const SizedBox(height: 24),

                  // Description
                  const Text(
                    'About this Asset',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.description,
                    style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.6),
                  ),
                  const SizedBox(height: 24),

                  // Verified Publisher & Direct Contact Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF1F2937)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 20,
                              backgroundColor: const Color(0xFF064E3B),
                              child: Text(
                                (item.ownerName != null && item.ownerName!.isNotEmpty)
                                    ? item.ownerName![0].toUpperCase()
                                    : 'A',
                                style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 15),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.ownerName ?? 'Verified Property Partner',
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF064E3B),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          item.ownerBadge?.toUpperCase() ?? 'VERIFIED',
                                          style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      const Text('• Fast Response', style: TextStyle(color: Colors.grey, fontSize: 10)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // WhatsApp Action Button
                        SizedBox(
                          width: double.infinity,
                          height: 44,
                          child: ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF25D366),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.chat, color: Colors.white, size: 18),
                            label: const Text('Chat on WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                            onPressed: () => _openWhatsApp(item),
                          ),
                        ),
                        const SizedBox(height: 8),

                        Row(
                          children: [
                            // Call Agent Button
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Color(0xFF374151)),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                icon: const Icon(Icons.call, color: Color(0xFF10B981), size: 16),
                                label: const Text('Call Agent', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                onPressed: () => _callAgent(item),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // In-App Message Button
                            Expanded(
                              child: OutlinedButton.icon(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.white,
                                  side: const BorderSide(color: Color(0xFF374151)),
                                  padding: const EdgeInsets.symmetric(vertical: 10),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                icon: const Icon(Icons.mail_outline, color: Color(0xFF60A5FA), size: 16),
                                label: const Text('In-App Inquiry', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                                onPressed: () => _showInAppInquiryDialog(context, item),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),

                        // View Storefront & Portfolio Button
                        SizedBox(
                          width: double.infinity,
                          height: 38,
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: const BorderSide(color: Color(0xFF10B981)),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            icon: const Icon(Icons.storefront, color: Color(0xFF10B981), size: 16),
                            label: Text(
                              'View ${item.ownerName ?? "Partner"}\'s Storefront',
                              style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => AgentStorefrontScreen(
                                    agent: {
                                      'id': item.ownerId,
                                      'company_name': item.ownerName,
                                      'phone_number': item.ownerPhone,
                                      'verification_badge': item.ownerBadge,
                                      'avatar_url': item.ownerAvatar,
                                      'city': item.city,
                                      'state': item.state,
                                    },
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Security & Verification Notice
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: const Color(0xFF131C2E),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF1E3A8A)),
                    ),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.shield_outlined, color: Color(0xFF60A5FA), size: 20),
                        SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'PropertyHub Escrow & Safety: Never wire money outside verified transaction terms. All inspections are scheduled with verified partners.',
                            style: TextStyle(color: Color(0xFF93C5FD), fontSize: 11, height: 1.4),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 100), // padding for sticky bottom bar
                ],
              ),
            ),
          ),
        ],
      ),

      // 3. Sticky Bottom Action Bar with Quick WhatsApp
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: Color(0xFF111827),
          border: Border(top: BorderSide(color: Color(0xFF1F2937))),
        ),
        child: Row(
          children: [
            // Quick WhatsApp Icon Button
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF25D366),
                borderRadius: BorderRadius.circular(10),
              ),
              child: IconButton(
                icon: const Icon(Icons.chat, color: Colors.white, size: 20),
                tooltip: 'WhatsApp Agent',
                onPressed: () => _openWhatsApp(item),
              ),
            ),
            const SizedBox(width: 8),

            // Inspection Booking Button
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF10B981),
                  side: const BorderSide(color: Color(0xFF10B981)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.calendar_month, size: 16),
                label: const Text('Inspection', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                onPressed: () => _showInspectionDialog(context),
              ),
            ),
            const SizedBox(width: 8),

            // Book / Reserve or Inquire Button
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.flash_on, color: Colors.white, size: 16),
                label: Text(
                  item.transactionType == 'RENT' ? 'Reserve' : 'Make Offer',
                  style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                ),
                onPressed: () => _showBookingDialog(context),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpecsGrid(ListingModel item) {
    final attrs = item.attributes;
    final List<Map<String, dynamic>> specs = [];

    if (item.assetCategory == 'RESIDENTIAL') {
      if (attrs['bedrooms'] != null) {
        specs.add({'icon': Icons.bed, 'label': 'Bedrooms', 'value': '${attrs['bedrooms']} Beds'});
      }
      if (attrs['bathrooms'] != null) {
        specs.add({'icon': Icons.bathtub, 'label': 'Bathrooms', 'value': '${attrs['bathrooms']} Baths'});
      }
      if (attrs['toilets'] != null) {
        specs.add({'icon': Icons.wc, 'label': 'Toilets', 'value': '${attrs['toilets']} Toilets'});
      }
      if (attrs['is_serviced'] != null) {
        specs.add({'icon': Icons.bolt, 'label': 'Serviced', 'value': attrs['is_serviced'] ? 'Yes' : 'No'});
      }
      if (attrs['title_document'] != null) {
        specs.add({'icon': Icons.description, 'label': 'Title Deed', 'value': attrs['title_document'].toString()});
      }
    } else if (item.assetCategory == 'VEHICLE') {
      if (attrs['make'] != null) {
        specs.add({'icon': Icons.directions_car, 'label': 'Make', 'value': attrs['make'].toString()});
      }
      if (attrs['model'] != null) {
        specs.add({'icon': Icons.branding_watermark, 'label': 'Model', 'value': attrs['model'].toString()});
      }
      if (attrs['year'] != null) {
        specs.add({'icon': Icons.calendar_today, 'label': 'Year', 'value': attrs['year'].toString()});
      }
      if (attrs['transmission'] != null) {
        specs.add({'icon': Icons.settings, 'label': 'Transmission', 'value': attrs['transmission'].toString()});
      }
      if (attrs['condition'] != null) {
        specs.add({'icon': Icons.verified, 'label': 'Condition', 'value': attrs['condition'].toString()});
      }
    } else if (item.assetCategory == 'LAND') {
      if (attrs['land_size_sqm'] != null) {
        specs.add({'icon': Icons.crop_free, 'label': 'Land Size', 'value': '${attrs['land_size_sqm']} SQM'});
      }
      if (attrs['title_document'] != null) {
        specs.add({'icon': Icons.description, 'label': 'Title Deed', 'value': attrs['title_document'].toString()});
      }
      if (attrs['zoning'] != null) {
        specs.add({'icon': Icons.map, 'label': 'Zoning', 'value': attrs['zoning'].toString()});
      }
    } else if (item.assetCategory == 'COMMERCIAL') {
      if (attrs['total_area_sqm'] != null) {
        specs.add({'icon': Icons.domain, 'label': 'Area', 'value': '${attrs['total_area_sqm']} SQM'});
      }
      if (attrs['parking_spaces'] != null) {
        specs.add({'icon': Icons.local_parking, 'label': 'Parking', 'value': '${attrs['parking_spaces']} cars'});
      }
    }

    if (specs.isEmpty) {
      specs.add({'icon': Icons.check_circle_outline, 'label': 'Status', 'value': 'Available'});
    }

    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      shrinkWrap: true,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 2.8,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: specs.length,
      itemBuilder: (ctx, idx) {
        final spec = specs[idx];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFF111827),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF1F2937)),
          ),
          child: Row(
            children: [
              Icon(spec['icon'] as IconData, color: const Color(0xFF10B981), size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      spec['label'] as String,
                      style: const TextStyle(color: Colors.grey, fontSize: 10),
                    ),
                    Text(
                      spec['value'] as String,
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showInspectionDialog(BuildContext context) {
    showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF10B981),
              onPrimary: Colors.white,
              surface: Color(0xFF111827),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    ).then((selectedDate) {
      if (selectedDate != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF059669),
            content: Text(
              'Inspection request scheduled for ${selectedDate.day}/${selectedDate.month}/${selectedDate.year}. An agent will confirm within 2 hours.',
            ),
          ),
        );
      }
    });
  }

  void _showBookingDialog(BuildContext context) {
    final now = DateTime.now();
    DateTimeRange? selectedRange;

    showDateRangePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 180)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: Color(0xFF10B981),
              onPrimary: Colors.white,
              surface: Color(0xFF111827),
              onSurface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    ).then((range) async {
      if (range != null) {
        setState(() => _isBooking = true);
        try {
          final res = await _apiService.createBookingRequest(
            listingId: widget.listing.id,
            startDate: range.start,
            endDate: range.end,
            guestNotes: 'Mobile app reservation request',
          );
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF059669),
              content: Text('Reservation submitted! Total: ₦${res['data']?['total_amount'] ?? "Confirmed"}'),
            ),
          );
        } catch (e) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: Colors.redAccent,
              content: Text('Booking error: $e'),
            ),
          );
        } finally {
          setState(() => _isBooking = false);
        }
      }
    });
  }
}
