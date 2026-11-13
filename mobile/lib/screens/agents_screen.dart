import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';
import 'agent_storefront_screen.dart';

class AgentsScreen extends StatefulWidget {
  final Function(String)? onSelectAgentPortfolio;
  final bool showAppBar;

  const AgentsScreen({
    Key? key,
    this.onSelectAgentPortfolio,
    this.showAppBar = true,
  }) : super(key: key);

  @override
  State<AgentsScreen> createState() => _AgentsScreenState();
}

class _AgentsScreenState extends State<AgentsScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _agents = [];
  bool _loading = true;
  String _selectedRole = 'all';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadAgents();
  }

  void _loadAgents() async {
    setState(() => _loading = true);
    final list = await _apiService.fetchAgentsAndDevelopers(
      role: _selectedRole == 'all' ? null : _selectedRole,
    );
    if (mounted) {
      setState(() {
        _agents = list;
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

  void _openWhatsApp(Map<String, dynamic> ag) {
    final phone = ag['phone_number'] ?? '+234 803 123 4567';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final waPhone = cleanPhone.startsWith('0') ? '234${cleanPhone.substring(1)}' : (cleanPhone.isNotEmpty ? cleanPhone : '2348031234567');
    final name = ag['company_name'] ?? '${ag['first_name'] ?? ''} ${ag['last_name'] ?? ''}'.trim();
    final message = 'Hello $name, I found your agency profile on Properties & Autos and would like to inquire about your property listings.';
    final waUrl = 'https://wa.me/$waPhone?text=${Uri.encodeComponent(message)}';
    _launchUrl(waUrl);
  }

  @override
  Widget build(BuildContext context) {
    final filteredAgents = _agents.where((ag) {
      if (_searchQuery.isEmpty) return true;
      final q = _searchQuery.toLowerCase();
      final name = '${ag['first_name'] ?? ''} ${ag['last_name'] ?? ''}'.toLowerCase();
      final company = (ag['company_name'] ?? '').toString().toLowerCase();
      final city = (ag['city'] ?? '').toString().toLowerCase();
      final state = (ag['state'] ?? '').toString().toLowerCase();
      return name.contains(q) || company.contains(q) || city.contains(q) || state.contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: widget.showAppBar
          ? AppBar(
              backgroundColor: const Color(0xFF0B0F19),
              elevation: 0,
              title: const Text(
                'Agents & Developers',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
              ),
              leading: Navigator.canPop(context)
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    )
                  : null,
            )
          : null,
      body: Column(
        children: [
          // Search & Filter Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              children: [
                // Search Bar
                TextField(
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  onChanged: (val) => setState(() => _searchQuery = val),
                  decoration: InputDecoration(
                    hintText: 'Search by agency, developer, auto dealer, or city...',
                    hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF10B981), size: 20),
                    filled: true,
                    fillColor: const Color(0xFF111827),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF1F2937)),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFF1F2937)),
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Role Filter Tabs
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('all', 'All Partners'),
                      _buildFilterChip('agent', 'Real Estate Agents'),
                      _buildFilterChip('developer', 'Certified Developers'),
                      _buildFilterChip('dealer', 'Cars & Vehicles Dealers'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Agents List
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF10B981)),
                  )
                : filteredAgents.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.business_center_outlined, size: 48, color: Colors.grey),
                            const SizedBox(height: 12),
                            const Text(
                              'No professionals found',
                              style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _searchQuery.isNotEmpty
                                  ? 'Try searching for a different name or location'
                                  : 'No verified partners in this category',
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        itemCount: filteredAgents.length,
                        itemBuilder: (context, index) {
                          final ag = filteredAgents[index];
                          return _buildAgentCard(ag);
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String role, String label) {
    final isSelected = _selectedRole == role;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedRole = role);
        _loadAgents();
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF10B981) : const Color(0xFF111827),
          borderRadius: BorderRadius.circular(12),
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

  Widget _buildAgentCard(Map<String, dynamic> ag) {
    final name = ag['company_name'] ?? '${ag['first_name'] ?? ''} ${ag['last_name'] ?? ''}'.trim();
    final displayName = name.isNotEmpty ? name : 'Verified Partner';
    final initial = (ag['company_name'] ?? ag['first_name'] ?? 'P')[0].toUpperCase();
    final badge = ag['verification_badge'] ?? 'Verified';
    final role = ag['active_mode'] ?? 'Partner';
    final location = '${ag['city'] != null && ag['city'].toString().isNotEmpty ? "${ag['city']}, " : ""}${ag['state'] ?? "Nigeria"}';
    final bio = ag['bio'];

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              // Logo / Avatar
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF10B981), Color(0xFF047857)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Center(
                  child: Text(
                    initial,
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
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
                            displayName,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.verified, color: Color(0xFF10B981), size: 14),
                      ],
                    ),
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF064E3B),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            badge.toString().toUpperCase(),
                            style: const TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          role.toString().toUpperCase(),
                          style: const TextStyle(color: Color(0xFFF59E0B), fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.grey, size: 12),
                        const SizedBox(width: 3),
                        Text(
                          location,
                          style: const TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (bio != null && bio.toString().isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              bio.toString(),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 11, height: 1.4),
            ),
          ],

          const SizedBox(height: 14),
          const Divider(color: Color(0xFF1F2937), height: 1),
          const SizedBox(height: 10),

          // Action Buttons
          Row(
            children: [
              // WhatsApp Direct Button
              Expanded(
                child: SizedBox(
                  height: 36,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    icon: const Icon(Icons.chat, color: Colors.white, size: 15),
                    label: const Text(
                      'WhatsApp',
                      style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () => _openWhatsApp(ag),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // View Storefront Button
              Expanded(
                child: SizedBox(
                  height: 36,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: const BorderSide(color: Color(0xFF10B981)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    icon: const Icon(Icons.storefront, color: Color(0xFF10B981), size: 15),
                    label: const Text(
                      'Storefront',
                      style: TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => AgentStorefrontScreen(agent: ag)),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
