import 'package:flutter/material.dart';
import 'investments_screen.dart';
import 'admin_screen.dart';
import 'onboarding_screen.dart';
import 'welcome_screen.dart';
import 'messages_screen.dart';
import 'agents_screen.dart';
import 'saved_listings_screen.dart';

class ProfileScreen extends StatefulWidget {
  final Function(int targetTab)? onNavigateTab;

  const ProfileScreen({Key? key, this.onNavigateTab}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String _activeMode = 'BUYER'; // BUYER, SELLER, AGENT, DEVELOPER
  String _selectedCurrency = 'NGN (₦)';
  bool _isLoggedIn = true;

  void _showSignInDialog() {
    final emailController = TextEditingController();
    final passController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Sign In to PropertyHub', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const Text('Access your unified portfolio, escrow orders, and AI matched requests.', style: TextStyle(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 16),
              TextField(
                controller: emailController,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF0B0F19),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: passController,
                obscureText: true,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Password',
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF0B0F19),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: () {
                    Navigator.pop(ctx);
                    setState(() => _isLoggedIn = true);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(backgroundColor: Color(0xFF065F46), content: Text('Signed in successfully as Verified User')),
                    );
                  },
                  child: const Text('Sign In', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // User Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF111827), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1F2937)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF10B981), width: 2),
                          image: const DecorationImage(
                            image: NetworkImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: const [
                                Text(
                                  'Senator / Investor',
                                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                                SizedBox(width: 6),
                                Icon(Icons.verified, color: Color(0xFF10B981), size: 16),
                              ],
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              'investor.prime@propertyhub.ng',
                              style: TextStyle(fontSize: 11, color: Colors.grey),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF064E3B),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                'Active: $_activeMode Mode',
                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF34D399)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Divider(color: Color(0xFF1F2937), height: 1),
                  const SizedBox(height: 16),

                  // Mode Switcher (Unified Account: One user can buy, rent, or sell without logging out)
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text('Unified Account Mode', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey)),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildModeChip('BUYER', 'Buyer'),
                      const SizedBox(width: 8),
                      _buildModeChip('SELLER', 'Seller / Landlord'),
                      const SizedBox(width: 8),
                      _buildModeChip('AGENT', 'Agent'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Quick Menu Items
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1F2937)),
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.trending_up,
                    iconColor: const Color(0xFFF59E0B),
                    title: 'Property Co-Investments',
                    subtitle: 'Earn 24% - 34% annual ROI with master developers',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const InvestmentsScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.admin_panel_settings,
                    iconColor: Colors.redAccent,
                    title: 'Admin Console & Moderation',
                    subtitle: 'User approvals, platform metrics & audit stream',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AdminScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.forum_outlined,
                    iconColor: const Color(0xFF10B981),
                    title: 'Direct Messages Inbox',
                    subtitle: 'Chat with property agents & developers',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const MessagesScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.storefront,
                    iconColor: const Color(0xFF10B981),
                    title: 'Agents & Developers Directory',
                    subtitle: 'Browse certified developers & verified real estate partners',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const AgentsScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.favorite_border,
                    iconColor: const Color(0xFFF43F5E),
                    title: 'Saved Listings & Wishlist',
                    subtitle: 'Quick access to your saved properties & exotic autos',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const SavedListingsScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.gavel,
                    iconColor: const Color(0xFF10B981),
                    title: 'Title Verification & Escrow Services',
                    subtitle: 'Verify C of O, Governor\'s Consent & Custom duty papers',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('AI Escrow & Title verification engine active')),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.calendar_month,
                    iconColor: const Color(0xFF60A5FA),
                    title: 'My Bookings & Inspection Schedule',
                    subtitle: 'Manage upcoming physical & virtual inspections',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('You have 2 upcoming property inspections in Lekki & Ikoyi')),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.currency_exchange,
                    iconColor: const Color(0xFFFBBF24),
                    title: 'Marketplace Currency',
                    subtitle: _selectedCurrency,
                    onTap: () {
                      setState(() {
                        if (_selectedCurrency.contains('NGN')) {
                          _selectedCurrency = 'USD (\$)';
                        } else if (_selectedCurrency.contains('USD')) {
                          _selectedCurrency = 'GBP (£)';
                        } else {
                          _selectedCurrency = 'NGN (₦)';
                        }
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Currency display switched to $_selectedCurrency')),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.support_agent,
                    iconColor: const Color(0xFFA78BFA),
                    title: '24/7 VIP Concierge & WhatsApp Support',
                    subtitle: 'Instant assistance for high-value acquisitions',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Connecting to PropertyHub VIP Concierge Desk')),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Authentication & Logout
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1F2937)),
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.person_add_alt_1,
                    iconColor: const Color(0xFF10B981),
                    title: 'New Account Onboarding (OTP)',
                    subtitle: 'Multi-role onboarding with 6-digit Resend OTP',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const OnboardingScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.explore,
                    iconColor: const Color(0xFF60A5FA),
                    title: 'Welcome Screen & Tour',
                    subtitle: 'View luxury intro & onboarding walkthrough',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const WelcomeScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  if (!_isLoggedIn)
                    _buildMenuItem(
                      icon: Icons.login,
                      iconColor: const Color(0xFF10B981),
                      title: 'Sign In',
                      subtitle: 'Access full marketplace features',
                      onTap: _showSignInDialog,
                    )
                  else
                    _buildMenuItem(
                      icon: Icons.logout,
                      iconColor: Colors.redAccent,
                      title: 'Log Out',
                      subtitle: 'Signed in as investor.prime@propertyhub.ng',
                      onTap: () {
                        setState(() => _isLoggedIn = false);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Logged out of PropertyHub')),
                        );
                      },
                    ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // App Version
            const Center(
              child: Text(
                'PropertyHub Luxury Marketplace • v1.0.2 Production\nAI Escrow • Real Estate & Autos',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, color: Color(0xFF6B7280), height: 1.5),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildModeChip(String mode, String label) {
    final isSelected = _activeMode == mode;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _activeMode = mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF059669) : const Color(0xFF0B0F19),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? const Color(0xFF10B981) : const Color(0xFF374151),
            ),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF9CA3AF),
                fontSize: 11,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: iconColor.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: iconColor, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 11, color: Colors.grey)),
      trailing: const Icon(Icons.chevron_right, color: Colors.grey, size: 18),
    );
  }

  Widget _buildDivider() {
    return const Divider(color: Color(0xFF1F2937), height: 1, indent: 56);
  }
}
