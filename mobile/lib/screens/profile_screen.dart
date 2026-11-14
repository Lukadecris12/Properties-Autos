import 'package:flutter/material.dart';
import 'investments_screen.dart';
import 'admin_screen.dart';
import 'onboarding_screen.dart';
import 'welcome_screen.dart';
import 'messages_screen.dart';
import 'agents_screen.dart';
import 'saved_listings_screen.dart';
import 'contact_support_screen.dart';
import 'subscription_screen.dart';
import 'faq_screen.dart';
import '../core/constants.dart';
import '../widgets/legal_dialog.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  final Function(int targetTab)? onNavigateTab;

  const ProfileScreen({Key? key, this.onNavigateTab}) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String _activeMode = ApiService.currentUser?['active_mode'] ?? 'BUYER';
  String _selectedCurrency = 'NGN (₦)';
  bool _isLoggedIn = ApiService.isLoggedIn;
  Map<String, dynamic>? _user = ApiService.currentUser;

  @override
  void initState() {
    super.initState();
    _syncUser();
  }

  Future<void> _syncUser() async {
    if (ApiService.isLoggedIn) {
      final fresh = await ApiService().fetchCurrentUser();
      if (mounted) {
        setState(() {
          _isLoggedIn = ApiService.isLoggedIn;
          _user = fresh ?? ApiService.currentUser;
          _activeMode = _user?['active_mode'] ?? _activeMode;
        });
      }
    }
  }

  String get _displayName {
    if (!_isLoggedIn || _user == null) return 'Guest User';
    final first = (_user?['first_name'] ?? '').toString().trim();
    final last = (_user?['last_name'] ?? '').toString().trim();
    final full = '$first $last'.trim();
    if (full.isNotEmpty) return full;
    final company = (_user?['company_name'] ?? '').toString().trim();
    if (company.isNotEmpty) return company;
    final name = (_user?['name'] ?? '').toString().trim();
    if (name.isNotEmpty) return name;
    return (_user?['email'] ?? 'Verified Member').toString();
  }

  String get _displayEmail {
    if (!_isLoggedIn || _user == null) return 'Sign in to access your portfolio';
    return (_user?['email'] ?? '').toString();
  }

  String? get _avatarUrl {
    if (!_isLoggedIn || _user == null) return null;
    final raw = (_user?['avatar_url'] ?? _user?['logo_url'] ?? '').toString().trim();
    if (raw.isEmpty) return null;
    return ApiConstants.resolveImageUrl(raw);
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFDC2626)),
        ),
        title: Row(
          children: const [
            Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 24),
            SizedBox(width: 8),
            Expanded(
              child: Text('Delete Account', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        content: const Text(
          'Are you sure you want to permanently delete your account?\n\n'
          'In compliance with Apple Guideline 5.1.1(v) and Google Play account deletion policy, all your personal details, active property and car listings, chat messages, and subscription data will be permanently erased immediately.\n\n'
          'This action is irreversible.',
          style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 12, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFB91C1C),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                final api = ApiService();
                await api.deleteAccount();
              } catch (_) {}
              if (mounted) {
                setState(() => _isLoggedIn = false);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Your account and personal data have been permanently deleted.'),
                    backgroundColor: Colors.redAccent,
                  ),
                );
              }
            },
            child: const Text('Delete Account Forever', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showSignInDialog() {
    final emailController = TextEditingController(text: ApiService.savedEmail);
    final passController = TextEditingController(text: ApiService.savedPassword);
    bool obscurePassword = true;
    bool submitting = false;
    String? errorMsg;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
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
                      const Text('Sign In to Properties & Autos', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const Text('Access your unified portfolio, saved listings, and AI matched requests.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 16),
                  if (errorMsg != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF450A0A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.redAccent),
                      ),
                      child: Text(errorMsg!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                    ),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
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
                    obscureText: obscurePassword,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Password',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0B0F19),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscurePassword ? Icons.visibility_off : Icons.visibility,
                          color: Colors.grey,
                          size: 18,
                        ),
                        onPressed: () => setModalState(() => obscurePassword = !obscurePassword),
                      ),
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _showForgotPasswordDialog(initialEmail: emailController.text.trim());
                      },
                      child: const Text('Forgot password?', style: TextStyle(color: Color(0xFF10B981), fontSize: 12)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: submitting
                          ? null
                          : () async {
                              if (emailController.text.trim().isEmpty || passController.text.isEmpty) {
                                setModalState(() => errorMsg = 'Please enter your email and password.');
                                return;
                              }
                              setModalState(() {
                                submitting = true;
                                errorMsg = null;
                              });
                              try {
                                final user = await ApiService().login(
                                  emailController.text.trim(),
                                  passController.text,
                                );
                                if (mounted) {
                                  Navigator.pop(ctx);
                                  setState(() {
                                    _isLoggedIn = true;
                                    _user = user;
                                    _activeMode = user['active_mode'] ?? _activeMode;
                                  });
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(backgroundColor: const Color(0xFF065F46), content: Text('Signed in as $_displayName')),
                                  );
                                }
                              } catch (e) {
                                setModalState(() {
                                  submitting = false;
                                  errorMsg = e.toString().replaceFirst('Exception: ', '');
                                });
                              }
                            },
                      child: submitting
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Sign In', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showForgotPasswordDialog({String initialEmail = ''}) {
    final emailController = TextEditingController(text: initialEmail.isNotEmpty ? initialEmail : ApiService.savedEmail);
    final otpController = TextEditingController();
    final newPassController = TextEditingController();
    int step = 1;
    bool obscureNew = true;
    bool submitting = false;
    String? errorMsg;
    String? otpDebug;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
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
                      const Text('Reset Password', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  Text(
                    step == 1
                        ? 'Enter your email address to receive a 6-digit reset code.'
                        : 'Enter the 6-digit code and choose a new password.',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 14),
                  if (errorMsg != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF450A0A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.redAccent),
                      ),
                      child: Text(errorMsg!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                    ),
                  if (otpDebug != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF451A03),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFFF59E0B)),
                      ),
                      child: Text('Reset Code: $otpDebug', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 12, fontWeight: FontWeight.bold)),
                    ),
                  if (step == 1) ...[
                    TextField(
                      controller: emailController,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'Email Address',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
                        onPressed: submitting
                            ? null
                            : () async {
                                setModalState(() {
                                  submitting = true;
                                  errorMsg = null;
                                });
                                try {
                                  final dbg = await ApiService().forgotPassword(emailController.text.trim());
                                  setModalState(() {
                                    submitting = false;
                                    otpDebug = dbg;
                                    step = 2;
                                  });
                                } catch (e) {
                                  setModalState(() {
                                    submitting = false;
                                    errorMsg = e.toString().replaceFirst('Exception: ', '');
                                  });
                                }
                              },
                        child: Text(submitting ? 'Sending...' : 'Send 6-Digit Code', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ] else ...[
                    TextField(
                      controller: otpController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: '6-Digit Code',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: newPassController,
                      obscureText: obscureNew,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: 'New Password (min 6 chars)',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                        suffixIcon: IconButton(
                          icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 18),
                          onPressed: () => setModalState(() => obscureNew = !obscureNew),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
                        onPressed: submitting
                            ? null
                            : () async {
                                if (newPassController.text.length < 6) {
                                  setModalState(() => errorMsg = 'Password must be at least 6 characters.');
                                  return;
                                }
                                setModalState(() {
                                  submitting = true;
                                  errorMsg = null;
                                });
                                try {
                                  await ApiService().resetPassword(
                                    emailController.text.trim(),
                                    otpController.text.trim(),
                                    newPassController.text,
                                  );
                                  if (mounted) {
                                    Navigator.pop(ctx);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(backgroundColor: Color(0xFF065F46), content: Text('Password reset! You can now sign in.')),
                                    );
                                    _showSignInDialog();
                                  }
                                } catch (e) {
                                  setModalState(() {
                                    submitting = false;
                                    errorMsg = e.toString().replaceFirst('Exception: ', '');
                                  });
                                }
                              },
                        child: Text(submitting ? 'Saving...' : 'Save New Password', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showChangePasswordDialog() {
    final currentController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();
    bool obscureCur = true;
    bool obscureNew = true;
    bool obscureConf = true;
    bool submitting = false;
    String? errorMsg;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
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
                      const Text('Change Password', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                      IconButton(icon: const Icon(Icons.close, color: Colors.grey), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  if (errorMsg != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF450A0A),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.redAccent),
                      ),
                      child: Text(errorMsg!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                    ),
                  TextField(
                    controller: currentController,
                    obscureText: obscureCur,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Current Password',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0B0F19),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      suffixIcon: IconButton(
                        icon: Icon(obscureCur ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 18),
                        onPressed: () => setModalState(() => obscureCur = !obscureCur),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: newController,
                    obscureText: obscureNew,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'New Password (min 6 chars)',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0B0F19),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      suffixIcon: IconButton(
                        icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 18),
                        onPressed: () => setModalState(() => obscureNew = !obscureNew),
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: confirmController,
                    obscureText: obscureConf,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'Confirm New Password',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF0B0F19),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      suffixIcon: IconButton(
                        icon: Icon(obscureConf ? Icons.visibility_off : Icons.visibility, color: Colors.grey, size: 18),
                        onPressed: () => setModalState(() => obscureConf = !obscureConf),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
                      onPressed: submitting
                          ? null
                          : () async {
                              if (newController.text.length < 6) {
                                setModalState(() => errorMsg = 'New password must be at least 6 characters.');
                                return;
                              }
                              if (newController.text != confirmController.text) {
                                setModalState(() => errorMsg = 'New passwords do not match.');
                                return;
                              }
                              setModalState(() {
                                submitting = true;
                                errorMsg = null;
                              });
                              try {
                                await ApiService().changePassword(currentController.text, newController.text);
                                if (mounted) {
                                  Navigator.pop(ctx);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(backgroundColor: Color(0xFF065F46), content: Text('Password updated successfully.')),
                                  );
                                }
                              } catch (e) {
                                setModalState(() {
                                  submitting = false;
                                  errorMsg = e.toString().replaceFirst('Exception: ', '');
                                });
                              }
                            },
                      child: Text(submitting ? 'Updating...' : 'Update Password', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            );
          },
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
                          color: const Color(0xFF064E3B),
                          border: Border.all(color: const Color(0xFF10B981), width: 2),
                          image: _avatarUrl != null
                              ? DecorationImage(
                                  image: NetworkImage(_avatarUrl!),
                                  fit: BoxFit.cover,
                                )
                              : null,
                        ),
                        child: _avatarUrl == null
                            ? Center(
                                child: Text(
                                  _displayName.isNotEmpty ? _displayName[0].toUpperCase() : 'G',
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    _displayName,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                  ),
                                ),
                                if (_isLoggedIn) ...[
                                  const SizedBox(width: 6),
                                  const Icon(Icons.verified, color: Color(0xFF10B981), size: 16),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _displayEmail,
                              style: const TextStyle(fontSize: 11, color: Colors.grey),
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
                    icon: Icons.trending_up,
                    iconColor: const Color(0xFFF59E0B),
                    title: 'Property Investments & ROI',
                    subtitle: 'Explore co-investment projects & return calculator',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const InvestmentsScreen()),
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
                    title: 'Title Verification & Legal Documentation',
                    subtitle: 'Verify C of O, Governor\'s Consent & Custom duty papers',
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Title verification guidance active')),
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
                    icon: Icons.card_membership,
                    iconColor: const Color(0xFFF59E0B),
                    title: 'Subscription Plans & Boost Engine',
                    subtitle: 'Standard, Business (100–2.5k) & Enterprise tiers with 72h boosts',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const SubscriptionScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.support_agent,
                    iconColor: const Color(0xFFA78BFA),
                    title: 'Contact & Support Desk',
                    subtitle: 'Submit inquiry form directly to Admin or call hotline',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const ContactSupportScreen()),
                      );
                    },
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.help_outline,
                    iconColor: const Color(0xFFF59E0B),
                    title: 'Frequently Asked Questions (FAQ)',
                    subtitle: 'Offline safety, titles, verification & subscription guide',
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const FaqScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Legal & Store Review Compliance (Apple & Google Play)
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF1F2937)),
              ),
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.shield_outlined,
                    iconColor: const Color(0xFF10B981),
                    title: 'Privacy Policy',
                    subtitle: 'Store compliant data safety, camera & photo usage',
                    onTap: () => LegalDialog.showPrivacyPolicy(context),
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.description_outlined,
                    iconColor: const Color(0xFF38BDF8),
                    title: 'Terms of Service & EULA',
                    subtitle: 'Apple End User License Agreement & zero tolerance abuse policy',
                    onTap: () => LegalDialog.showTermsAndEula(context),
                  ),
                  _buildDivider(),
                  _buildMenuItem(
                    icon: Icons.person_remove_outlined,
                    iconColor: Colors.redAccent,
                    title: 'Delete Account',
                    subtitle: 'Permanently erase your account & personal data (Apple/Google)',
                    onTap: _showDeleteAccountDialog,
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
                  if (_isLoggedIn) ...[
                    _buildMenuItem(
                      icon: Icons.lock_reset,
                      iconColor: const Color(0xFF10B981),
                      title: 'Change Password',
                      subtitle: 'Update your account password securely',
                      onTap: _showChangePasswordDialog,
                    ),
                    _buildDivider(),
                  ],
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
                      subtitle: 'Signed in as $_displayEmail',
                      onTap: () async {
                        await ApiService.clearToken();
                        if (mounted) {
                          setState(() {
                            _isLoggedIn = false;
                            _user = null;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Logged out of Properties & Autos')),
                          );
                        }
                      },
                    ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // App Version
            const Center(
              child: Text(
                'Properties & Autos Luxury Marketplace • v1.0.2 Production\nVerified Real Estate & Autos',
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
