import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final ApiService _apiService = ApiService();

  int _step = 1; // 1 = credentials, 2 = 6-digit OTP, 3 = onboarding details
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  final _confirmPasswordController = TextEditingController();

  // OTP
  final List<TextEditingController> _otpControllers = List.generate(6, (_) => TextEditingController());
  String? _otpDebug;
  String _verificationToken = '';
  bool _resending = false;

  // Step 3 Fields
  String _userType = 'buyer'; // 'buyer' or 'seller'
  String _entityType = 'individual'; // 'individual', 'agent', 'company', 'developer'
  final List<String> _assetInterests = ['residential', 'land'];

  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _companyNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  final _logoUrlController = TextEditingController();

  String _countryCode = '+234';
  String _selectedCountry = 'Nigeria';
  String _selectedState = 'Lagos';

  final Map<String, List<String>> _countryStates = {
    'Nigeria': [
      'Lagos', 'Abuja FCT', 'Rivers', 'Ogun', 'Oyo', 'Kano', 'Kaduna', 'Delta', 'Edo', 'Enugu', 'Anambra', 'Akwa Ibom'
    ],
    'United States': [
      'California', 'New York', 'Texas', 'Florida', 'Washington', 'Illinois', 'Georgia', 'Virginia'
    ],
    'United Kingdom': [
      'Greater London', 'Greater Manchester', 'West Midlands', 'Scotland', 'Wales'
    ],
    'United Arab Emirates': [
      'Dubai', 'Abu Dhabi', 'Sharjah'
    ],
    'Canada': [
      'Ontario', 'British Columbia', 'Quebec', 'Alberta'
    ],
    'Ghana': [
      'Greater Accra', 'Ashanti', 'Western'
    ],
    'South Africa': [
      'Gauteng (Johannesburg)', 'Western Cape (Cape Town)', 'KwaZulu-Natal'
    ],
  };

  bool _loading = false;
  String? _errorMsg;

  void _initiateSignup() async {
    final email = _emailController.text.trim();
    final pass = _passwordController.text.trim();
    final confirm = _confirmPasswordController.text.trim();

    if (email.isEmpty || pass.isEmpty) {
      setState(() => _errorMsg = 'Please enter both email and password.');
      return;
    }
    if (pass.length < 6) {
      setState(() => _errorMsg = 'Password must be at least 6 characters.');
      return;
    }
    if (pass != confirm) {
      setState(() => _errorMsg = 'Passwords do not match.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMsg = null;
    });

    final res = await _apiService.signupInitiate(email, pass);
    setState(() {
      _loading = false;
      _verificationToken = res['verification_token'] ?? 'direct_onboarding';
      _step = 3; // Direct transition to detailed onboarding profile
    });
  }

  void _verifyOtp() async {
    final code = _otpControllers.map((c) => c.text.trim()).join();
    if (code.length != 6) {
      setState(() => _errorMsg = 'Please enter all 6 digits of the code.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMsg = null;
    });

    final res = await _apiService.signupVerifyOtp(_emailController.text.trim(), code);
    setState(() {
      _loading = false;
      _verificationToken = res['verification_token'] ?? 'token_verified';
      _step = 3;
    });
  }

  void _resendOtp() async {
    setState(() => _resending = true);
    final res = await _apiService.signupInitiate(_emailController.text.trim(), _passwordController.text.trim());
    setState(() {
      _resending = false;
      _otpDebug = res['otp_debug'];
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('A fresh verification code has been dispatched.')),
    );
  }

  void _completeOnboarding() async {
    final isIndOrAgent = _entityType == 'individual' || _entityType == 'agent';

    if (isIndOrAgent) {
      if (_firstNameController.text.trim().isEmpty || _lastNameController.text.trim().isEmpty) {
        setState(() => _errorMsg = 'First and Last name are required.');
        return;
      }
    } else {
      if (_companyNameController.text.trim().isEmpty) {
        setState(() => _errorMsg = 'Company or Developer name is required.');
        return;
      }
    }

    if (_phoneController.text.trim().isEmpty) {
      setState(() => _errorMsg = 'Authenticated phone number is required.');
      return;
    }
    if (_cityController.text.trim().isEmpty) {
      setState(() => _errorMsg = 'City or town is required.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMsg = null;
    });

    final payload = {
      'email': _emailController.text.trim(),
      'verification_token': _verificationToken,
      'user_type': _userType,
      'entity_type': _entityType,
      'asset_interests': _assetInterests,
      'first_name': _firstNameController.text.trim(),
      'last_name': _lastNameController.text.trim(),
      'company_name': _companyNameController.text.trim(),
      'country_code': _countryCode,
      'phone_number': _phoneController.text.trim(),
      'country': _selectedCountry,
      'state': _selectedState,
      'city': _cityController.text.trim(),
      'logo_url': _logoUrlController.text.trim(),
    };

    try {
      await _apiService.onboardingComplete(
        payload,
        password: _passwordController.text.trim(),
      );

      setState(() => _loading = false);

      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const HomeScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      setState(() {
        _loading = false;
        _errorMsg = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: Text(
          _step == 1 ? 'Create Account' : 'Complete Onboarding',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Error Alert
            if (_errorMsg != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade900.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.shade800),
                ),
                child: Text(_errorMsg!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
              ),

            // Step 1: Email & Password
            if (_step == 1) ...[
              const Text(
                'Get Started with Properties & Autos',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              const Text(
                'Enter your email and password to begin creating your account profile.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 20),

              _buildTextField('Email Address', _emailController, Icons.email, keyboardType: TextInputType.emailAddress),
              const SizedBox(height: 14),
              _buildTextField(
                'Password (min 6 characters)',
                _passwordController,
                Icons.lock,
                obscure: _obscurePassword,
                onToggleObscure: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
              const SizedBox(height: 14),
              _buildTextField('Confirm Password', _confirmPasswordController, Icons.lock_outline, obscure: true),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _loading ? null : _initiateSignup,
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Continue to Onboarding Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],

            // Step 2: 6-Digit OTP Box
            if (_step == 2) ...[
              const Center(
                child: Icon(Icons.mark_email_read, size: 54, color: Color(0xFF10B981)),
              ),
              const SizedBox(height: 14),
              const Center(
                child: Text(
                  'Enter 6-Digit Verification Code',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                ),
              ),
              const SizedBox(height: 6),
              Center(
                child: Text(
                  'Dispatched via Resend to ${_emailController.text.trim()}',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 14),

              if (_otpDebug != null)
                Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF78350F),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('Debug Code: $_otpDebug', style: const TextStyle(color: Color(0xFFFBBF24), fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ),
              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (idx) {
                  return SizedBox(
                    width: 44,
                    height: 52,
                    child: TextField(
                      controller: _otpControllers[idx],
                      keyboardType: TextInputType.number,
                      textAlign: TextAlign.center,
                      maxLength: 1,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      decoration: InputDecoration(
                        counterText: '',
                        filled: true,
                        fillColor: const Color(0xFF111827),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                      onChanged: (val) {
                        if (val.isNotEmpty && idx < 5) {
                          FocusScope.of(context).nextFocus();
                        }
                      },
                    ),
                  );
                }),
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _loading ? null : _verifyOtp,
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Verify Code & Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
              const SizedBox(height: 14),

              Center(
                child: TextButton(
                  onPressed: _resending ? null : _resendOtp,
                  child: const Text('Resend 6-Digit Code', style: TextStyle(color: Color(0xFF10B981))),
                ),
              ),
            ],

            // Step 3: Complete Detailed Onboarding
            if (_step == 3) ...[
              const Text(
                'Complete Your Onboarding Profile',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 6),
              const Text(
                'Please fill out all required fields to enter your dashboard.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),

              // 1. Seller or Buyer Tab
              const Text('1. Are you a Seller or Buyer? *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _userType = 'buyer';
                          _entityType = 'individual';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _userType == 'buyer' ? const Color(0xFF059669) : const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _userType == 'buyer' ? const Color(0xFF10B981) : const Color(0xFF374151)),
                        ),
                        child: const Center(
                          child: Text('BUY / RENT', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _userType = 'seller';
                          _entityType = 'agent';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        decoration: BoxDecoration(
                          color: _userType == 'seller' ? const Color(0xFF059669) : const Color(0xFF111827),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _userType == 'seller' ? const Color(0xFF10B981) : const Color(0xFF374151)),
                        ),
                        child: const Center(
                          child: Text('SELL / LIST', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // 2. Entity Type
              const Text('2. Entity Classification *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 8),
              if (_userType == 'seller')
                Row(
                  children: [
                    _buildSubRoleChip('agent', 'Agent'),
                    const SizedBox(width: 8),
                    _buildSubRoleChip('developer', 'Developer'),
                    const SizedBox(width: 8),
                    _buildSubRoleChip('company', 'Company'),
                  ],
                )
              else
                Row(
                  children: [
                    _buildSubRoleChip('individual', 'Individual'),
                    const SizedBox(width: 8),
                    _buildSubRoleChip('company', 'Corporate Buyer'),
                  ],
                ),
              const SizedBox(height: 16),

              // 3. Name fields
              if (_entityType == 'individual' || _entityType == 'agent') ...[
                Row(
                  children: [
                    Expanded(child: _buildTextField('First Name *', _firstNameController, Icons.person)),
                    const SizedBox(width: 10),
                    Expanded(child: _buildTextField('Last Name *', _lastNameController, Icons.person_outline)),
                  ],
                ),
              ] else ...[
                _buildTextField('Registered Company / Developer Name *', _companyNameController, Icons.business),
              ],
              const SizedBox(height: 14),

              // 4. Phone with Country Code
              const Text('Phone Number *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111827),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF374151)),
                    ),
                    child: DropdownButton<String>(
                      value: _countryCode,
                      dropdownColor: const Color(0xFF1F2937),
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      underline: const SizedBox(),
                      items: const [
                        DropdownMenuItem(value: '+234', child: Text('🇳🇬 +234')),
                        DropdownMenuItem(value: '+1', child: Text('🇺🇸 +1')),
                        DropdownMenuItem(value: '+44', child: Text('🇬🇧 +44')),
                        DropdownMenuItem(value: '+971', child: Text('🇦🇪 +971')),
                        DropdownMenuItem(value: '+233', child: Text('🇬🇭 +233')),
                        DropdownMenuItem(value: '+27', child: Text('🇿🇦 +27')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _countryCode = val);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField('e.g. 803 123 4567', _phoneController, Icons.phone, keyboardType: TextInputType.phone),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // 5. Country & Dynamic State
              Row(
                children: [
                  // Country Dropdown
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Country *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF111827),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF374151)),
                          ),
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _selectedCountry,
                            dropdownColor: const Color(0xFF1F2937),
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            underline: const SizedBox(),
                            items: _countryStates.keys.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                setState(() {
                                  _selectedCountry = val;
                                  _selectedState = _countryStates[val]!.first;
                                });
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),

                  // State Dropdown (Dynamically Populated)
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('State / Region *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF111827),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF374151)),
                          ),
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _selectedState,
                            dropdownColor: const Color(0xFF1F2937),
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            underline: const SizedBox(),
                            items: (_countryStates[_selectedCountry] ?? ['Other']).map((st) => DropdownMenuItem(value: st, child: Text(st))).toList(),
                            onChanged: (val) {
                              if (val != null) setState(() => _selectedState = val);
                            },
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // City
              _buildTextField('City / Town *', _cityController, Icons.location_city),
              const SizedBox(height: 14),

              // Optional Logo / Avatar URL
              _buildTextField('Profile Picture or Logo URL (Optional)', _logoUrlController, Icons.image),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: _loading ? null : _completeOnboarding,
                  child: _loading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Complete Onboarding & Enter', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSubRoleChip(String id, String label) {
    final isSelected = _entityType == id;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _entityType = id),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF064E3B) : const Color(0xFF111827),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSelected ? const Color(0xFF10B981) : const Color(0xFF374151)),
          ),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: isSelected ? const Color(0xFF34D399) : Colors.grey,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                fontSize: 11,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    String label,
    TextEditingController controller,
    IconData icon, {
    bool obscure = false,
    VoidCallback? onToggleObscure,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
        prefixIcon: Icon(icon, color: Colors.grey, size: 18),
        suffixIcon: onToggleObscure != null
            ? IconButton(
                icon: Icon(
                  obscure ? Icons.visibility_off : Icons.visibility,
                  color: Colors.grey,
                  size: 18,
                ),
                onPressed: onToggleObscure,
              )
            : null,
        filled: true,
        fillColor: const Color(0xFF111827),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
    );
  }
}
