import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/listing_model.dart';
import 'listing_detail_screen.dart';
import 'ai_chat_screen.dart';
import 'requests_screen.dart';
import 'post_listing_screen.dart';
import 'agents_screen.dart';
import 'profile_screen.dart';
import 'investments_screen.dart';
import 'saved_listings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentTabIndex = 0;

  // State for Explore Tab
  final ApiService _apiService = ApiService();
  String _selectedTransaction = 'SALE'; // SALE (BUY) or RENT
  String _selectedCategory = 'RESIDENTIAL'; // RESIDENTIAL (Houses), LAND, VEHICLE (Autos)
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
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

  void _onTabSelected(int index) {
    setState(() {
      _currentTabIndex = index;
    });
  }

  String _getAppBarTitle() {
    switch (_currentTabIndex) {
      case 1:
        return 'Requests';
      case 2:
        return 'Publish Listing';
      case 3:
        return 'Chat AI Advisor';
      case 4:
        return 'Agents & Developers';
      case 5:
        return 'My Account';
      default:
        return 'PropertyHub';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      // Clean, professional native mobile AppBar (No web-like buttons at the top)
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
            if (_currentTabIndex == 0)
              RichText(
                text: const TextSpan(
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  children: [
                    TextSpan(text: 'Properties '),
                    TextSpan(text: '& Autos', style: TextStyle(color: Color(0xFF10B981))),
                  ],
                ),
              )
            else
              Text(
                _getAppBarTitle(),
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite, color: Color(0xFFF43F5E), size: 21),
            tooltip: 'Saved Wishlist',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SavedListingsScreen()),
              ).then((_) => setState(() {}));
            },
          ),
          IconButton(
            icon: const Icon(Icons.trending_up, color: Color(0xFFF59E0B), size: 22),
            tooltip: 'Property Investments',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const InvestmentsScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_none, color: Colors.grey, size: 22),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('No new notifications. All systems operational.')),
              );
            },
          ),
          const SizedBox(width: 4),
        ],
      ),

      // 6 Native Mobile Screens indexed by Bottom Navigation
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          _buildExploreTab(),
          const RequestsScreen(),
          const PostListingScreen(),
          const AIChatScreen(showAppBar: false),
          AgentsScreen(
            showAppBar: false,
            onSelectAgentPortfolio: (agentName) {
              setState(() {
                _searchQuery = agentName.toLowerCase();
                _currentTabIndex = 0;
              });
            },
          ),
          ProfileScreen(
            onNavigateTab: (targetTab) {
              setState(() => _currentTabIndex = targetTab);
            },
          ),
        ],
      ),

      // Smart, Professional Bottom Navigation Bar with 6 Icons
      bottomNavigationBar: _buildLuxuryBottomNav(),
    );
  }

  // --- TAB 0: EXPLORE MARKETPLACE FEED ---
  Widget _buildExploreTab() {
    return Column(
      children: [
        // 1. Mobile Search Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: const Color(0xFF111827),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  height: 42,
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B0F19),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFF374151)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.search, color: Colors.grey, size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(color: Colors.white, fontSize: 13),
                          decoration: const InputDecoration(
                            hintText: 'Search city, location, or keyword...',
                            hintStyle: TextStyle(color: Colors.grey, fontSize: 12),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                          onChanged: (val) {
                            setState(() {
                              _searchQuery = val.trim().toLowerCase();
                            });
                          },
                        ),
                      ),
                      if (_searchQuery.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            _searchController.clear();
                            setState(() {
                              _searchQuery = '';
                            });
                          },
                          child: const Icon(Icons.close, color: Colors.grey, size: 16),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // 2. Transaction Selector (BUY | RENT) - Lease removed
        Container(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          color: const Color(0xFF111827),
          child: Row(
            children: [
              _buildTxTab('SALE', 'BUY'),
              const SizedBox(width: 12),
              _buildTxTab('RENT', 'RENT'),
            ],
          ),
        ),

        // 3. Category Selector (Houses | Land | Autos) - Commercial removed
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              _buildCategoryChip('RESIDENTIAL', 'Houses & Apartments', Icons.home),
              const SizedBox(width: 8),
              _buildCategoryChip('LAND', 'Land', Icons.landscape),
              const SizedBox(width: 8),
              _buildCategoryChip('VEHICLE', 'Autos & Vehicles', Icons.directions_car),
            ],
          ),
        ),

        // 4. Live Marketplace Listings Feed
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
                    'No ${_selectedTransaction == 'SALE' ? 'BUY' : 'RENT'} listings found in this category.',
                    style: const TextStyle(color: Colors.grey),
                  ),
                );
              }

              var listings = snapshot.data!;
              if (_searchQuery.isNotEmpty) {
                listings = listings.where((item) {
                  final title = item.title.toLowerCase();
                  final desc = item.description.toLowerCase();
                  final city = item.city.toLowerCase();
                  final state = item.state.toLowerCase();
                  final neighbourhood = (item.neighbourhood ?? '').toLowerCase();
                  return title.contains(_searchQuery) ||
                      desc.contains(_searchQuery) ||
                      city.contains(_searchQuery) ||
                      state.contains(_searchQuery) ||
                      neighbourhood.contains(_searchQuery);
                }).toList();
              }

              if (listings.isEmpty) {
                return Center(
                  child: Text(
                    'No listings match "$_searchQuery".',
                    style: const TextStyle(color: Colors.grey),
                  ),
                );
              }

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
    );
  }

  // --- 6-ITEM NATIVE MOBILE BOTTOM NAVIGATION BAR ---
  Widget _buildLuxuryBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF111827),
        border: Border(top: BorderSide(color: Color(0xFF1F2937), width: 1)),
      ),
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: SafeArea(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavTabItem(
              index: 0,
              icon: Icons.explore_outlined,
              activeIcon: Icons.explore,
              label: 'Explore',
            ),
            _buildNavTabItem(
              index: 1,
              icon: Icons.assignment_outlined,
              activeIcon: Icons.assignment,
              label: 'Requests',
            ),
            _buildNavTabItem(
              index: 2,
              icon: Icons.add_circle_outline,
              activeIcon: Icons.add_circle,
              label: 'Post',
              isAccent: true,
            ),
            _buildNavTabItem(
              index: 3,
              icon: Icons.auto_awesome_outlined,
              activeIcon: Icons.auto_awesome,
              label: 'Chat AI',
              isGold: true,
            ),
            _buildNavTabItem(
              index: 4,
              icon: Icons.verified_user_outlined,
              activeIcon: Icons.verified_user,
              label: 'Agents',
            ),
            _buildNavTabItem(
              index: 5,
              icon: Icons.person_outline,
              activeIcon: Icons.person,
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavTabItem({
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
    bool isAccent = false,
    bool isGold = false,
  }) {
    final isSelected = _currentTabIndex == index;
    final Color activeColor = isGold 
        ? const Color(0xFFF59E0B) 
        : const Color(0xFF10B981);

    return Expanded(
      child: InkWell(
        onTap: () => _onTabSelected(index),
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isAccent) ...[
              // Special center Post button
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFF059669) : const Color(0xFF1E293B),
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: isSelected ? const Color(0xFF10B981) : const Color(0xFF374151),
                    width: 1.5,
                  ),
                ),
                child: Icon(
                  isSelected ? activeIcon : icon,
                  color: isSelected ? Colors.white : const Color(0xFF10B981),
                  size: 20,
                ),
              ),
              const SizedBox(height: 2),
            ] else ...[
              Icon(
                isSelected ? activeIcon : icon,
                color: isSelected ? activeColor : const Color(0xFF9CA3AF),
                size: 20,
              ),
              const SizedBox(height: 3),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? activeColor : const Color(0xFF9CA3AF),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            // Subtle glowing active indicator dot
            Container(
              width: 4,
              height: 4,
              decoration: BoxDecoration(
                color: isSelected ? activeColor : Colors.transparent,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- SUB-WIDGETS & CARDS ---
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
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF059669) : const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? const Color(0xFF10B981) : Colors.transparent),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 13,
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
                      item.transactionType == 'SALE' ? 'BUY' : 'RENT',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (item.isVerified)
                        Container(
                          margin: const EdgeInsets.only(right: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.7),
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: const Color(0xFF10B981)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.verified, color: Color(0xFF10B981), size: 12),
                              SizedBox(width: 3),
                              Text('Verified', style: TextStyle(color: Colors.white, fontSize: 10)),
                            ],
                          ),
                        ),
                      GestureDetector(
                        onTap: () {
                          final nowSaved = _apiService.toggleSaveListing(item.id);
                          setState(() {});
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                nowSaved
                                    ? 'Saved "${item.title}" to your Wishlist!'
                                    : 'Removed from saved listings.',
                              ),
                              backgroundColor: nowSaved ? const Color(0xFF064E3B) : const Color(0xFF1F2937),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                        },
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.65),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white.withOpacity(0.2)),
                          ),
                          child: Center(
                            child: Icon(
                              _apiService.isListingSaved(item.id) ? Icons.favorite : Icons.favorite_border,
                              color: _apiService.isListingSaved(item.id) ? const Color(0xFFF43F5E) : Colors.white,
                              size: 16,
                            ),
                          ),
                        ),
                      ),
                    ],
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
}
