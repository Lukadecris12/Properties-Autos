import 'package:flutter/material.dart';
import '../models/listing_model.dart';
import '../services/api_service.dart';

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
                  icon: const Icon(Icons.favorite_border, color: Colors.white),
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Saved to your saved listings.')),
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
                            'PropertyHub Escrow & Safety: Never wire money outside the PropertyHub verified transaction flow. All inspections are scheduled with verified agents.',
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

      // 3. Sticky Bottom Action Bar
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: const BoxDecoration(
          color: Color(0xFF111827),
          border: Border(top: BorderSide(color: Color(0xFF1F2937))),
        ),
        child: Row(
          children: [
            // Inspection Booking Button
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF10B981),
                  side: const BorderSide(color: Color(0xFF10B981)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.calendar_month, size: 18),
                label: const Text('Schedule Inspection', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                onPressed: () => _showInspectionDialog(context),
              ),
            ),
            const SizedBox(width: 12),

            // Book / Reserve or Inquire Button
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.flash_on, color: Colors.white, size: 18),
                label: Text(
                  item.transactionType == 'RENT' ? 'Reserve Now' : 'Make Offer',
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
