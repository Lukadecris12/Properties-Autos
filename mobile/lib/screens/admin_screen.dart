import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({Key? key}) : super(key: key);

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final ApiService _apiService = ApiService();
  late Future<Map<String, dynamic>> _adminStatsFuture;

  final List<Map<String, dynamic>> _mockUsers = [
    {
      'id': 1,
      'name': 'David Adeyemi',
      'email': 'david.apex@propertyhub.ng',
      'role': 'AGENT',
      'location': 'Lekki Phase 1, Lagos',
      'verified': true,
      'active': true,
    },
    {
      'id': 2,
      'name': 'Victoria Chen-Okeke',
      'email': 'victoria@ekoatlantic.com',
      'role': 'DEVELOPER',
      'location': 'Victoria Island, Lagos',
      'verified': true,
      'active': true,
    },
    {
      'id': 3,
      'name': 'Senator Aliyu Bello',
      'email': 'bello.invest@vip.ng',
      'role': 'BUYER',
      'location': 'Maitama, Abuja',
      'verified': true,
      'active': true,
    },
    {
      'id': 4,
      'name': 'Emeka Okafor Motors',
      'email': 'emeka.motors@autos.ng',
      'role': 'DEALER',
      'location': 'Ikeja GRA, Lagos',
      'verified': false,
      'active': true,
    },
  ];

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  void _loadStats() {
    setState(() {
      _adminStatsFuture = _apiService.fetchAdminStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.admin_panel_settings, color: Colors.redAccent, size: 20),
            SizedBox(width: 8),
            Text('Admin Console', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // KPI Summary
            FutureBuilder<Map<String, dynamic>>(
              future: _adminStatsFuture,
              builder: (context, snapshot) {
                final stats = snapshot.data?['data'] ?? {};
                final users = stats['users'] ?? {};
                final investments = stats['investments'] ?? {};

                return Column(
                  children: [
                    Row(
                      children: [
                        _buildStatBox('Total Users', '${users['total'] ?? 48}', Icons.people, const Color(0xFF10B981)),
                        const SizedBox(width: 10),
                        _buildStatBox('Developers', '${users['developers'] ?? 6}', Icons.domain, const Color(0xFFF59E0B)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _buildStatBox('Active Listings', '18 Verified', Icons.home_work, const Color(0xFF60A5FA)),
                        const SizedBox(width: 10),
                        _buildStatBox('Co-Investments', '₦830M Raised', Icons.trending_up, const Color(0xFFA78BFA)),
                      ],
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 20),

            // User & Entity Management Section
            const Text(
              'User & Entity Moderation',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 10),

            ..._mockUsers.map((u) => _buildUserCard(u)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBox(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF1F2937)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 2),
            Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildUserCard(Map<String, dynamic> user) {
    final bool isVerified = user['verified'] == true;
    final bool isActive = user['active'] == true;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF111827),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF1F2937)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user['name'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text(user['email'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(user['role'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(user['location'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: isVerified ? Colors.grey : const Color(0xFF10B981)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  setState(() {
                    user['verified'] = !isVerified;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Toggled verification for ${user['name']}')),
                  );
                },
                child: Text(
                  isVerified ? 'Revoke Verify' : 'Approve Verify',
                  style: TextStyle(fontSize: 11, color: isVerified ? Colors.grey : const Color(0xFF10B981)),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                  side: BorderSide(color: isActive ? Colors.redAccent : const Color(0xFF10B981)),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  setState(() {
                    user['active'] = !isActive;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Toggled status for ${user['name']}')),
                  );
                },
                child: Text(
                  isActive ? 'Suspend' : 'Activate',
                  style: TextStyle(fontSize: 11, color: isActive ? Colors.redAccent : const Color(0xFF10B981)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
