import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/listing_model.dart';
import 'listing_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _apiService = ApiService();
  String _selectedTransaction = 'SALE'; // SALE, RENT, LEASE
  String _selectedCategory = 'RESIDENTIAL'; // LAND, RESIDENTIAL, COMMERCIAL, VEHICLE

  late Future<List<ListingModel>> _listingsFuture;

  @override
  void initState() {
    super.initState();
    _loadListings();
  }

  void _loadListings() {
    setState(() {
      _listingsFuture = _apiService.fetchListings(
        transactionType: _selectedTransaction,
        assetCategory: _selectedCategory,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.apartment, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 8),
            RichText(
              text: const TextSpan(
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                children: [
                  TextSpan(text: 'Property'),
                  TextSpan(text: 'Hub', style: TextStyle(color: Color(0xFF10B981))),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.auto_awesome, color: Color(0xFF10B981)),
            tooltip: 'AI Concierge',
            onPressed: () => _showAIDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Transaction Type Selector (BUY | RENT | LEASE)
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            color: const Color(0xFF111827),
            child: Row(
              children: [
                _buildTxTab('SALE', 'BUY'),
                const SizedBox(width: 8),
                _buildTxTab('RENT', 'RENT'),
                const SizedBox(width: 8),
                _buildTxTab('LEASE', 'LEASE'),
              ],
            ),
          ),

          // 2. Category Selector (LAND | RESIDENTIAL | COMMERCIAL | VEHICLE)
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                _buildCategoryChip('RESIDENTIAL', 'Houses & Flats', Icons.home),
                const SizedBox(width: 8),
                _buildCategoryChip('LAND', 'Land', Icons.landscape),
                const SizedBox(width: 8),
                _buildCategoryChip('COMMERCIAL', 'Commercial', Icons.business),
                const SizedBox(width: 8),
                _buildCategoryChip('VEHICLE', 'Cars & Autos', Icons.directions_car),
              ],
            ),
          ),

          // 3. Listings Feed
          Expanded(
            child: FutureBuilder<List<ListingModel>>(
              future: _listingsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)));
                } else if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Error connecting to marketplace API: ${snapshot.error}',
                        style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(
                    child: Text(
                      'No $_selectedTransaction listings found in $_selectedCategory.',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  );
                }

                final listings = snapshot.data!;
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: listings.length,
                  itemBuilder: (context, index) {
                    final item = listings[index];
                    return _buildListingCard(item);
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF059669),
        icon: const Icon(Icons.post_add, color: Colors.white),
        label: const Text('Post Requirement', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Requirement publishing connects to /api/v1/requirements')),
          );
        },
      ),
    );
  }

  Widget _buildTxTab(String tx, String label) {
    final isSelected = _selectedTransaction == tx;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedTransaction = tx;
          });
          _loadListings();
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF059669) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : Colors.grey,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String cat, String label, IconData icon) {
    final isSelected = _selectedCategory == cat;
    return ChoiceChip(
      avatar: Icon(icon, size: 16, color: isSelected ? Colors.white : Colors.grey),
      label: Text(label),
      selected: isSelected,
      selectedColor: const Color(0xFF1E293B),
      backgroundColor: const Color(0xFF111827),
      labelStyle: TextStyle(
        fontSize: 12,
        color: isSelected ? const Color(0xFF10B981) : Colors.grey,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedCategory = cat;
          });
          _loadListings();
        }
      },
    );
  }

  Widget _buildListingCard(ListingModel item) {
    final coverImage = item.imageUrls.isNotEmpty 
        ? item.imageUrls.first 
        : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (ctx) => ListingDetailScreen(listing: item),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF1F2937)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with badges
            Stack(
              children: [
                Image.network(
                  coverImage,
                  height: 180,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, err, stack) => Container(
                    height: 180,
                    color: Colors.black26,
                    child: const Center(child: Icon(Icons.image_not_supported, color: Colors.grey)),
                  ),
                ),
                Positioned(
                  top: 8,
                  left: 8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: item.transactionType == 'SALE' 
                          ? Colors.amber.shade700 
                          : const Color(0xFF059669),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      item.transactionType,
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                if (item.isVerified)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: const Color(0xFF10B981)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified, color: Color(0xFF10B981), size: 12),
                          SizedBox(width: 4),
                          Text('Verified', style: TextStyle(color: Colors.white, fontSize: 10)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),

            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on, color: Color(0xFF10B981), size: 14),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          '${item.city}, ${item.state}',
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    item.title,
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Mandatory formatted price display
                  Text(
                    item.formattedPrice,
                    style: const TextStyle(
                      color: Color(0xFF10B981),
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAIDialog(BuildContext context) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: Color(0xFF10B981)),
            SizedBox(width: 8),
            Text('PropertyHub AI Concierge', style: TextStyle(color: Colors.white, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Ask real-time questions about Nigerian property titles, vehicle rentals, short-let bookings, or formulation advice:',
              style: TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(
                hintText: 'e.g. What is Governor\'s Consent?',
                hintStyle: TextStyle(color: Colors.grey),
                border: OutlineInputBorder(),
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
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
            onPressed: () async {
              final query = controller.text;
              if (query.isNotEmpty) {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Consulting PropertyHub AI layer...')),
                );
                try {
                  final reply = await _apiService.queryAIConcierge(query);
                  showDialog(
                    context: context,
                    builder: (c) => AlertDialog(
                      backgroundColor: const Color(0xFF111827),
                      title: const Text('AI Concierge Response', style: TextStyle(color: Colors.white, fontSize: 15)),
                      content: Text(reply, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(c), child: const Text('OK')),
                      ],
                    ),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Error: $e')),
                  );
                }
              }
            },
            child: const Text('Ask AI', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
