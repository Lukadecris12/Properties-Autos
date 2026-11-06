import 'package:flutter/material.dart';

class AgentsScreen extends StatefulWidget {
  final Function(String agentName)? onSelectAgentPortfolio;

  const AgentsScreen({Key? key, this.onSelectAgentPortfolio}) : super(key: key);

  @override
  State<AgentsScreen> createState() => _AgentsScreenState();
}

class _AgentsScreenState extends State<AgentsScreen> {
  String _roleFilter = 'ALL';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, dynamic>> _agentsAndDevelopers = [
    {
      'id': 1,
      'name': 'David Adeyemi',
      'company': 'Apex Prime Realty & Estates',
      'role': 'AGENT',
      'roleTitle': 'Verified Property Broker',
      'location': 'Lekki Phase 1 & Ikoyi, Lagos',
      'listingsCount': 28,
      'trustScore': '99%',
      'license': 'LSRR/2024/0981',
      'phone': '+234 803 123 4567',
      'whatsapp': '+234 803 123 4567',
      'specialty': 'Luxury Detached Duplexes & Waterfront Plots',
      'avatar': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    },
    {
      'id': 2,
      'name': 'Victoria Chen-Okeke',
      'company': 'Eko Atlantic Horizon Developments',
      'role': 'DEVELOPER',
      'roleTitle': 'Master Property Developer',
      'location': 'Victoria Island & Eko Atlantic City, Lagos',
      'listingsCount': 42,
      'trustScore': '98%',
      'license': 'CAC-RC 1948210',
      'phone': '+234 812 987 6543',
      'whatsapp': '+234 812 987 6543',
      'specialty': 'High-Rise Towers, Waterfront Smart Penthouses',
      'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    },
    {
      'id': 3,
      'name': 'Alhaji Ibrahim Danjuma',
      'company': 'Northern Crest Luxury Real Estate',
      'role': 'AGENT',
      'roleTitle': 'Senior Commercial & Residential Agent',
      'location': 'Maitama, Asokoro & Guzape, Abuja',
      'listingsCount': 19,
      'trustScore': '96%',
      'license': 'ABJ-EST-4402',
      'phone': '+234 802 345 6789',
      'whatsapp': '+234 802 345 6789',
      'specialty': 'Diplomatic Residences & Government Zone Commercials',
      'avatar': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
    {
      'id': 4,
      'name': 'Highland Homes Consortium',
      'company': 'Highland Global Urban Developers Ltd',
      'role': 'DEVELOPER',
      'roleTitle': 'Estate Developer & Infrastructure Builder',
      'location': 'Banana Island, Ikoyi & Lekki, Lagos',
      'listingsCount': 56,
      'trustScore': '99%',
      'license': 'CAC-RC 883019',
      'phone': '+234 809 555 1212',
      'whatsapp': '+234 809 555 1212',
      'specialty': 'Gated Eco-Estates, Turnkey Luxury Villas',
      'avatar': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    },
    {
      'id': 5,
      'name': 'Chief Emeka Okafor',
      'company': 'Prestige Luxury Motors & Properties',
      'role': 'AGENT',
      'roleTitle': 'Certified Auto Dealer & Real Estate Broker',
      'location': 'Ikeja GRA & Victoria Island, Lagos',
      'listingsCount': 31,
      'trustScore': '97%',
      'license': 'NADDC-DL-2023',
      'phone': '+234 805 777 8899',
      'whatsapp': '+234 805 777 8899',
      'specialty': 'Exotic Armored Vehicles & Industrial Land Plots',
      'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  ];

  void _showAgentPortfolio(Map<String, dynamic> agent) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Container(
          padding: const EdgeInsets.all(20),
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.75,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundImage: NetworkImage(agent['avatar']),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            agent['name'],
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            agent['company'],
                            style: const TextStyle(fontSize: 12, color: Color(0xFF10B981)),
                          ),
                        ],
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.grey),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B0F19),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF1F2937)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Text('${agent['listingsCount']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                        const Text('Active Listings', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                    Column(
                      children: [
                        Text(agent['trustScore'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF10B981))),
                        const Text('Trust Rating', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                    Column(
                      children: [
                        const Icon(Icons.shield, color: Color(0xFFF59E0B), size: 18),
                        Text(agent['license'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Featured Active Listings Portfolio',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 10),
              Expanded(
                child: ListView(
                  children: [
                    _buildPortfolioItem('5-Bedroom Luxury Detached Villa', 'Lekki Phase 1, Lagos', '₦450,000,000', 'SALE'),
                    _buildPortfolioItem('Waterfront Serviced Penthouse', 'Old Ikoyi, Lagos', '₦18,000,000 / yr', 'RENT'),
                    _buildPortfolioItem('1,200sqm Prime Commercial Corner Plot', 'Victoria Island, Lagos', '₦600,000,000', 'SALE'),
                    _buildPortfolioItem('2023 Mercedes-Benz G63 AMG BiTurbo', 'Ikeja GRA, Lagos', '₦240,000,000', 'SALE'),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      icon: const Icon(Icons.phone, color: Colors.white, size: 16),
                      label: const Text('Call Office', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Dialing ${agent['phone']}')),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      icon: const Icon(Icons.chat, color: Colors.white, size: 16),
                      label: const Text('WhatsApp', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      onPressed: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Opening WhatsApp for ${agent['name']}')),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildPortfolioItem(String title, String location, String price, String tx) {
    final isSale = tx == 'SALE';
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0B0F19),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                const SizedBox(height: 2),
                Text(location, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                const SizedBox(height: 4),
                Text(price, style: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: isSale ? const Color(0xFF064E3B) : const Color(0xFF1E3A8A),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              isSale ? 'BUY' : 'RENT',
              style: TextStyle(
                color: isSale ? const Color(0xFF34D399) : const Color(0xFF60A5FA),
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    var filtered = _agentsAndDevelopers;
    if (_roleFilter != 'ALL') {
      filtered = filtered.where((a) => a['role'] == _roleFilter).toList();
    }
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((a) {
        final name = (a['name'] as String).toLowerCase();
        final company = (a['company'] as String).toLowerCase();
        final loc = (a['location'] as String).toLowerCase();
        return name.contains(_searchQuery) || company.contains(_searchQuery) || loc.contains(_searchQuery);
      }).toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: Column(
        children: [
          // Search & Filter Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: const Color(0xFF111827),
            child: Column(
              children: [
                // Search Input
                Container(
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
                            hintText: 'Search agent, developer, or firm name...',
                            hintStyle: TextStyle(color: Colors.grey, fontSize: 12),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                          onChanged: (val) {
                            setState(() => _searchQuery = val.trim().toLowerCase());
                          },
                        ),
                      ),
                      if (_searchQuery.isNotEmpty)
                        GestureDetector(
                          onTap: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                          child: const Icon(Icons.close, color: Colors.grey, size: 16),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                // Filter Buttons (All / Property Agents / Property Developers)
                Row(
                  children: [
                    _buildFilterChip('ALL', 'All'),
                    const SizedBox(width: 8),
                    _buildFilterChip('AGENT', 'Property Agents'),
                    const SizedBox(width: 8),
                    _buildFilterChip('DEVELOPER', 'Property Developers'),
                  ],
                ),
              ],
            ),
          ),

          // Agents List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final agent = filtered[index];
                return _buildAgentCard(agent);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _roleFilter == key;
    return GestureDetector(
      onTap: () => setState(() => _roleFilter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : const Color(0xFF1F2937),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFF10B981) : const Color(0xFF374151),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildAgentCard(Map<String, dynamic> agent) {
    final isDeveloper = agent['role'] == 'DEVELOPER';

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
            children: [
              CircleAvatar(
                radius: 26,
                backgroundImage: NetworkImage(agent['avatar']),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            agent['name'],
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.verified, color: Color(0xFF10B981), size: 16),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      agent['company'],
                      style: const TextStyle(fontSize: 12, color: Color(0xFF10B981), fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: isDeveloper ? const Color(0xFF78350F) : const Color(0xFF064E3B),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        agent['roleTitle'],
                        style: TextStyle(
                          color: isDeveloper ? const Color(0xFFFBBF24) : const Color(0xFF34D399),
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Specialty: ${agent['specialty']}',
            style: const TextStyle(fontSize: 11, color: Color(0xFFD1D5DB)),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.location_on, size: 13, color: Colors.grey),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  agent['location'],
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Color(0xFF1F2937), height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${agent['listingsCount']} Active Properties',
                style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF), fontWeight: FontWeight.w600),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                icon: const Icon(Icons.visibility, color: Colors.white, size: 14),
                label: const Text('View Portfolio', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                onPressed: () => _showAgentPortfolio(agent),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
