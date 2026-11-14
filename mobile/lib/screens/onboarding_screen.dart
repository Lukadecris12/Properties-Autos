import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../core/constants.dart';
import '../core/geo_data.dart';
import '../services/api_service.dart';
import 'home_screen.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({Key? key}) : super(key: key);

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final ApiService _apiService = ApiService();
  final ImagePicker _imagePicker = ImagePicker();

  // Steps:
  // 1 = Email & Password
  // 2 = Seeker or Seller
  // 3 = Category pull-down
  // 4 = Role pull-down (based on category)
  // 5 = First & Last Names
  // 6 = Phone Code + Number, Country + State + City, Optional Profile Picture
  int _step = 1;

  // Step 1
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  String _verificationToken = '';

  // Steps 2-4
  String _accountIntent = 'seeker'; // 'seeker' | 'seller'
  String _selectedAsset = 'residential'; // 'residential' | 'land' | 'vehicle'
  String _selectedRole = 'seeker'; // 'seeker' | 'owner' | 'agent' | 'developer' | 'dealer'

  // Step 5
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _companyNameController = TextEditingController();

  // Step 6
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  CountryGeoData _selectedCountryData = allCountries.first;
  String _countryCode = allCountries.first.dialCode;
  String _countryFlag = allCountries.first.flag;
  String _selectedCountry = allCountries.first.name;
  String _selectedState = allCountries.first.states.first;
  String _avatarUrl = '';
  bool _uploadingAvatar = false;

  bool _loading = false;
  String? _errorMsg;

  static const List<Map<String, String>> _assetOptions = [
    {'value': 'residential', 'label': 'Houses & Apartment'},
    {'value': 'land', 'label': 'Land'},
    {'value': 'vehicle', 'label': 'Vehicles (cars, trucks, buses, motorcycles)'},
  ];

  List<Map<String, String>> get _roleOptions {
    if (_selectedAsset == 'vehicle') {
      return const [
        {'value': 'seeker', 'label': 'Seeker'},
        {'value': 'owner', 'label': 'Owner'},
        {'value': 'agent', 'label': 'Agent'},
        {'value': 'dealer', 'label': 'Auto/Car Dealer'},
      ];
    }
    return const [
      {'value': 'seeker', 'label': 'Seeker'},
      {'value': 'owner', 'label': 'Owner'},
      {'value': 'agent', 'label': 'Agent'},
      {'value': 'developer', 'label': 'Property Developer'},
    ];
  }

  Future<void> _showSearchablePicker<T>({
    required String title,
    required String searchHint,
    required List<T> items,
    required String Function(T) labelBuilder,
    required String Function(T) searchKeyBuilder,
    required void Function(T) onSelected,
  }) async {
    String query = '';
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1F2937),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final filtered = query.isEmpty
                ? items
                : items
                    .where((item) => searchKeyBuilder(item).toLowerCase().contains(query.toLowerCase()))
                    .toList();
            return DraggableScrollableSheet(
              expand: false,
              initialChildSize: 0.72,
              minChildSize: 0.45,
              maxChildSize: 0.9,
              builder: (_, scrollController) {
                return Padding(
                  padding: EdgeInsets.only(
                    left: 16,
                    right: 16,
                    top: 16,
                    bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        autofocus: true,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          hintText: searchHint,
                          hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                          prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 18),
                          filled: true,
                          fillColor: const Color(0xFF111827),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFF374151)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFF374151)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                            borderSide: const BorderSide(color: Color(0xFF38BDF8)),
                          ),
                        ),
                        onChanged: (val) => setModalState(() => query = val.trim()),
                      ),
                      const SizedBox(height: 10),
                      Expanded(
                        child: filtered.isEmpty
                            ? const Center(
                                child: Text('No matches found', style: TextStyle(color: Colors.grey, fontSize: 13)),
                              )
                            : ListView.builder(
                                controller: scrollController,
                                itemCount: filtered.length,
                                itemBuilder: (_, idx) {
                                  final item = filtered[idx];
                                  return ListTile(
                                    dense: true,
                                    title: Text(
                                      labelBuilder(item),
                                      style: const TextStyle(color: Colors.white, fontSize: 14),
                                    ),
                                    onTap: () {
                                      onSelected(item);
                                      Navigator.of(sheetCtx).pop();
                                    },
                                  );
                                },
                              ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildPickerField({
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 48,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF111827),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFF374151)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                label,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
            const Icon(Icons.arrow_drop_down, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }

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
      _step = 2;
    });
  }

  Future<void> _pickAndUploadAvatar() async {
    try {
      final picked = await _imagePicker.pickImage(source: ImageSource.gallery, imageQuality: 85);
      if (picked == null) return;
      setState(() {
        _uploadingAvatar = true;
        _errorMsg = null;
      });
      final url = await _apiService.uploadMediaFile(picked.path);
      setState(() {
        _avatarUrl = url;
        _uploadingAvatar = false;
      });
    } catch (e) {
      setState(() {
        _uploadingAvatar = false;
        _errorMsg = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  void _completeOnboarding() async {
    if (_firstNameController.text.trim().isEmpty || _lastNameController.text.trim().isEmpty) {
      setState(() => _errorMsg = 'First and Last name are required.');
      return;
    }
    if (_phoneController.text.trim().isEmpty) {
      setState(() => _errorMsg = 'Phone number is required.');
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
      'user_type': _selectedRole == 'seeker' ? 'buyer' : 'seller',
      'entity_type': _selectedRole,
      'asset_interests': [_selectedAsset],
      'first_name': _firstNameController.text.trim(),
      'last_name': _lastNameController.text.trim(),
      'company_name': _companyNameController.text.trim(),
      'country_code': _countryCode,
      'phone_number': _phoneController.text.trim(),
      'country': _selectedCountry,
      'state': _selectedState,
      'city': _cityController.text.trim(),
      if (_avatarUrl.isNotEmpty) 'avatar_url': _avatarUrl,
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
        _errorMsg = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('Create Account', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {
            if (_step > 1) {
              setState(() {
                _errorMsg = null;
                _step -= 1;
              });
            } else {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 6-Step Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Step $_step of 6', style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w600)),
                Text(
                  _step == 1
                      ? 'Credentials'
                      : _step == 2
                          ? 'Seeker or Seller'
                          : _step == 3
                              ? 'Category'
                              : _step == 4
                                  ? 'Account Role'
                                  : _step == 5
                                      ? 'Full Name'
                                      : 'Contact & Photo',
                  style: const TextStyle(color: Color(0xFF34D399), fontSize: 12, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: _step / 6,
                minHeight: 6,
                backgroundColor: const Color(0xFF1F2937),
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
              ),
            ),
            const SizedBox(height: 20),

            if (_errorMsg != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFF7F1D1D).withOpacity(0.4),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.redAccent),
                ),
                child: Text(_errorMsg!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
              ),

            AnimatedSwitcher(
              duration: const Duration(milliseconds: 300),
              transitionBuilder: (child, anim) {
                final slide = Tween<Offset>(begin: const Offset(0, 0.08), end: Offset.zero).animate(anim);
                return FadeTransition(
                  opacity: anim,
                  child: SlideTransition(position: slide, child: child),
                );
              },
              child: KeyedSubtree(
                key: ValueKey<int>(_step),
                child: _buildCurrentStep(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrentStep() {
    switch (_step) {
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Get Started with Properties & Autos',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            const Text(
              'Enter your email and password to begin onboarding.',
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
            _buildTextField(
              'Confirm Password',
              _confirmPasswordController,
              Icons.lock_outline,
              obscure: _obscureConfirmPassword,
              onToggleObscure: () => setState(() => _obscureConfirmPassword = !_obscureConfirmPassword),
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
                onPressed: _loading ? null : _initiateSignup,
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        );

      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Are you a Seeker or a Seller?',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            const Text(
              'Select how you would like to use Properties & Autos.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            _buildIntentCard(
              title: 'Seeker',
              subtitle: 'Looking to buy, rent, or lease houses, land, or vehicles.',
              icon: Icons.person_search,
              selected: _accountIntent == 'seeker',
              onTap: () => setState(() {
                _accountIntent = 'seeker';
                _selectedRole = 'seeker';
                _step = 3;
              }),
            ),
            const SizedBox(height: 14),
            _buildIntentCard(
              title: 'Seller',
              subtitle: 'Owner, agent, developer, or dealer listing properties or vehicles.',
              icon: Icons.storefront,
              selected: _accountIntent == 'seller',
              onTap: () => setState(() {
                _accountIntent = 'seller';
                _selectedRole = 'owner';
                _step = 3;
              }),
            ),
          ],
        );

      case 3:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Category',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            const Text(
              'Choose what you are interested in from the pull-down list.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            const Text('Category *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF374151)),
              ),
              child: DropdownButton<String>(
                isExpanded: true,
                value: _selectedAsset,
                dropdownColor: const Color(0xFF1F2937),
                style: const TextStyle(color: Colors.white, fontSize: 13),
                underline: const SizedBox(),
                items: _assetOptions
                    .map((opt) => DropdownMenuItem(value: opt['value'], child: Text(opt['label']!)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _selectedAsset = val;
                      final valid = _roleOptions.map((r) => r['value']).toList();
                      if (!valid.contains(_selectedRole)) {
                        _selectedRole = _accountIntent == 'seeker' ? 'seeker' : 'owner';
                      }
                    });
                  }
                },
              ),
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
                onPressed: () => setState(() => _step = 4),
                child: const Text('Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        );

      case 4:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Your Role',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              'Options for ${_assetOptions.firstWhere((e) => e['value'] == _selectedAsset)['label']}',
              style: const TextStyle(fontSize: 12, color: Color(0xFF34D399)),
            ),
            const SizedBox(height: 20),
            const Text('Registration Type *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF374151)),
              ),
              child: DropdownButton<String>(
                isExpanded: true,
                value: _roleOptions.any((r) => r['value'] == _selectedRole) ? _selectedRole : _roleOptions.first['value'],
                dropdownColor: const Color(0xFF1F2937),
                style: const TextStyle(color: Colors.white, fontSize: 13),
                underline: const SizedBox(),
                items: _roleOptions
                    .map((opt) => DropdownMenuItem(value: opt['value'], child: Text(opt['label']!)))
                    .toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedRole = val);
                },
              ),
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
                onPressed: () => setState(() => _step = 5),
                child: const Text('Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        );

      case 5:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Your Personal Details',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            const Text(
              'Enter your first and last name.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Expanded(child: _buildTextField('First Name *', _firstNameController, Icons.person)),
                const SizedBox(width: 10),
                Expanded(child: _buildTextField('Last Name *', _lastNameController, Icons.person_outline)),
              ],
            ),
            if (_selectedRole == 'agent' || _selectedRole == 'developer' || _selectedRole == 'dealer') ...[
              const SizedBox(height: 14),
              _buildTextField(
                _selectedRole == 'dealer'
                    ? 'Dealership / Showroom Name (Optional)'
                    : _selectedRole == 'developer'
                        ? 'Development Company Name (Optional)'
                        : 'Agency / Brokerage Name (Optional)',
                _companyNameController,
                Icons.business,
              ),
            ],
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  if (_firstNameController.text.trim().isEmpty || _lastNameController.text.trim().isEmpty) {
                    setState(() => _errorMsg = 'Please enter both your First Name and Last Name.');
                    return;
                  }
                  setState(() {
                    _errorMsg = null;
                    _step = 6;
                  });
                },
                child: const Text('Continue', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        );

      case 6:
      default:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Contact, Location & Photo',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 6),
            const Text(
              'Select your country code, phone number, location, and optional profile picture.',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
            const SizedBox(height: 18),

            // Phone Code + Number
            const Text('Phone Number *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 6),
            Row(
              children: [
                SizedBox(
                  width: 112,
                  child: _buildPickerField(
                    label: '$_countryFlag $_countryCode',
                    onTap: () => _showSearchablePicker<CountryGeoData>(
                      title: 'Select Phone Code',
                      searchHint: 'Search country or code (e.g. +234, Nigeria)...',
                      items: allCountries,
                      labelBuilder: (c) => '${c.flag}  ${c.name} (${c.dialCode})',
                      searchKeyBuilder: (c) => '${c.name} ${c.dialCode} ${c.code}',
                      onSelected: (c) {
                        setState(() {
                          _countryCode = c.dialCode;
                          _countryFlag = c.flag;
                        });
                      },
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildTextField('e.g. 803 123 4567', _phoneController, Icons.phone, keyboardType: TextInputType.phone),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Country & Dynamic State
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Country *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                      const SizedBox(height: 6),
                      _buildPickerField(
                        label: '${_selectedCountryData.flag} $_selectedCountry',
                        onTap: () => _showSearchablePicker<CountryGeoData>(
                          title: 'Select Country',
                          searchHint: 'Type country name...',
                          items: allCountries,
                          labelBuilder: (c) => '${c.flag}  ${c.name}',
                          searchKeyBuilder: (c) => '${c.name} ${c.code}',
                          onSelected: (c) {
                            setState(() {
                              _selectedCountryData = c;
                              _selectedCountry = c.name;
                              _selectedState = c.states.isNotEmpty ? c.states.first : 'Other';
                              _countryCode = c.dialCode;
                              _countryFlag = c.flag;
                            });
                          },
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('State / Region *', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
                      const SizedBox(height: 6),
                      _buildPickerField(
                        label: _selectedState,
                        onTap: () => _showSearchablePicker<String>(
                          title: 'Select State / Region',
                          searchHint: 'Type state or region...',
                          items: _selectedCountryData.states.isNotEmpty ? _selectedCountryData.states : ['Other'],
                          labelBuilder: (st) => st,
                          searchKeyBuilder: (st) => st,
                          onSelected: (st) {
                            setState(() => _selectedState = st);
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Manual City / Town
            _buildTextField('City / Town *', _cityController, Icons.location_city),
            const SizedBox(height: 16),

            // Optional Profile Picture Upload
            const Text('Profile Picture (Optional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF374151)),
              ),
              child: Row(
                children: [
                  if (_avatarUrl.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        ApiConstants.resolveImageUrl(_avatarUrl),
                        width: 52,
                        height: 52,
                        fit: BoxFit.cover,
                      ),
                    )
                  else
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: const Color(0xFF1F2937),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.camera_alt, color: Colors.grey, size: 22),
                    ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1F2937),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          onPressed: _uploadingAvatar ? null : _pickAndUploadAvatar,
                          icon: _uploadingAvatar
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.upload, size: 16),
                          label: Text(
                            _uploadingAvatar
                                ? 'Uploading...'
                                : _avatarUrl.isNotEmpty
                                    ? 'Change Picture'
                                    : 'Upload Profile Picture',
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                        if (_avatarUrl.isNotEmpty)
                          TextButton(
                            onPressed: () => setState(() => _avatarUrl = ''),
                            style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 24)),
                            child: const Text('Remove', style: TextStyle(color: Colors.redAccent, fontSize: 11)),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
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
                onPressed: _loading ? null : _completeOnboarding,
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Complete Onboarding & Enter', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        );
    }
  }

  Widget _buildIntentCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF064E3B).withOpacity(0.55) : const Color(0xFF111827),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: selected ? const Color(0xFF10B981) : const Color(0xFF374151)),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.18),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: const Color(0xFF34D399), size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey),
          ],
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
