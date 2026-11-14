import 'package:flutter/material.dart';
import '../widgets/auto_hide_app_bar_scaffold.dart';
import '../services/api_service.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({Key? key}) : super(key: key);

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  final ApiService _apiService = ApiService();
  late Future<Map<String, dynamic>> _adminStatsFuture;
  late Future<List<Map<String, dynamic>>> _usersFuture;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  void _loadStats() {
    setState(() {
      _adminStatsFuture = _apiService.fetchAdminStats();
      _usersFuture = _apiService.fetchAdminUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = ApiService.isLoggedIn && ApiService.currentUser?['is_superuser'] == true;
    if (!isAdmin) {
      return AutoHideAppBarScaffold(
        backgroundColor: const Color(0xFF0B0F19),
        appBar: AppBar(
          backgroundColor: const Color(0xFF111827),
          title: const Text('Admin Console', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        ),
        body: const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_outline, color: Colors.redAccent, size: 48),
                SizedBox(height: 12),
                Text('Administrator Access Required', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                SizedBox(height: 6),
                Text('Sign in with a platform administrator account to view this console.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        ),
      );
    }

    return AutoHideAppBarScaffold(
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
                final listings = stats['listings'] ?? {};
                final investments = stats['investments'] ?? {};

                return Column(
                  children: [
                    Row(
                      children: [
                        _buildStatBox('Total Users', '${users['total'] ?? 0}', Icons.people, const Color(0xFF10B981)),
                        const SizedBox(width: 10),
                        _buildStatBox('Developers', '${users['developers'] ?? 0}', Icons.domain, const Color(0xFFF59E0B)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        _buildStatBox('Active Listings', '${listings['total'] ?? 0}', Icons.home_work, const Color(0xFF60A5FA)),
                        const SizedBox(width: 10),
                        _buildStatBox('Investments', '${investments['active_projects'] ?? 0}', Icons.trending_up, const Color(0xFFA78BFA)),
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

            FutureBuilder<List<Map<String, dynamic>>>(
              future: _usersFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: CircularProgressIndicator(color: Color(0xFF10B981)),
                    ),
                  );
                }
                final usersList = snapshot.data ?? [];
                if (usersList.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text('No registered users found.', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  );
                }
                return Column(
                  children: usersList.map((u) => _buildUserCard(u)).toList(),
                );
              },
            ),
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
    final bool isVerified = user['is_identity_verified'] == true || user['verified'] == true;
    final bool isActive = user['is_active'] ?? (user['active'] == true);
    final String name = (user['company_name']?.toString().isNotEmpty == true)
        ? user['company_name'].toString()
        : '${user['first_name'] ?? ''} ${user['last_name'] ?? ''}'.trim();
    final String displayName = name.isNotEmpty ? name : (user['email']?.toString() ?? 'User #${user['id']}');
    final String roleLabel = (user['active_mode'] ?? user['role'] ?? 'BUYER').toString().toUpperCase();
    final String locationLabel = [user['city'], user['state']].where((e) => e != null && e.toString().isNotEmpty).join(', ');

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
                    Text(displayName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                    Text(user['email']?.toString() ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF064E3B),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(roleLabel, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399))),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(locationLabel.isNotEmpty ? locationLabel : 'Nigeria', style: const TextStyle(fontSize: 11, color: Colors.grey)),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                isVerified ? 'Verified' : 'Unverified',
                style: TextStyle(fontSize: 11, color: isVerified ? const Color(0xFF10B981) : Colors.grey),
              ),
              const SizedBox(width: 12),
              Text(
                isActive ? 'Active' : 'Suspended',
                style: TextStyle(fontSize: 11, color: isActive ? const Color(0xFF10B981) : Colors.redAccent),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
