import 'package:flutter/material.dart';

class PostListingScreen extends StatefulWidget {
  const PostListingScreen({Key? key}) : super(key: key);

  @override
  State<PostListingScreen> createState() => _PostListingScreenState();
}

class _PostListingScreenState extends State<PostListingScreen> {
  String _assetType = 'PROPERTY'; // PROPERTY or AUTO
  String _transactionType = 'SALE'; // SALE (BUY) or RENT
  String _category = 'RESIDENTIAL'; // RESIDENTIAL, LAND, VEHICLE

  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _cityController = TextEditingController(text: 'Lekki, Lagos');
  final _stateController = TextEditingController(text: 'Lagos');
  final _descController = TextEditingController();
  final _specsController = TextEditingController();
  final _imageUrlController = TextEditingController();
  bool _submitting = false;

  void _submitListing() async {
    final title = _titleController.text.trim();
    final price = _priceController.text.trim();

    if (title.isEmpty || price.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please provide at least a title and price.')),
      );
      return;
    }

    setState(() => _submitting = true);
    await Future.delayed(const Duration(seconds: 1)); // simulated post

    if (mounted) {
      setState(() => _submitting = false);
      _titleController.clear();
      _priceController.clear();
      _descController.clear();
      _specsController.clear();
      _imageUrlController.clear();

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: const Color(0xFF111827),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: Color(0xFF10B981), size: 28),
              SizedBox(width: 8),
              Text('Listing Published!', style: TextStyle(color: Colors.white, fontSize: 18)),
            ],
          ),
          content: const Text(
            'Your asset has been published and submitted for AI Title Verification & Escrow Protection. It is now live in the Properties & Autos marketplace.',
            style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 13),
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669)),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('View in Marketplace', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111827),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF1F2937)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.add_business, color: Color(0xFF10B981), size: 24),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Publish New Listing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                        SizedBox(height: 2),
                        Text('Reach thousands of verified buyers, tenants, and investors.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Asset Type Switcher (Property vs Automobile)
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _assetType = 'PROPERTY';
                        _category = 'RESIDENTIAL';
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _assetType == 'PROPERTY' ? const Color(0xFF059669) : const Color(0xFF1F2937),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _assetType == 'PROPERTY' ? const Color(0xFF10B981) : const Color(0xFF374151),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.home_work, color: Colors.white, size: 18),
                          SizedBox(width: 8),
                          Text('Real Estate', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _assetType = 'AUTO';
                        _category = 'VEHICLE';
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: _assetType == 'AUTO' ? const Color(0xFF059669) : const Color(0xFF1F2937),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _assetType == 'AUTO' ? const Color(0xFF10B981) : const Color(0xFF374151),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.directions_car, color: Colors.white, size: 18),
                          SizedBox(width: 8),
                          Text('Automobiles', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Transaction Type (BUY vs RENT)
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _transactionType = 'SALE'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _transactionType == 'SALE' ? const Color(0xFF064E3B) : const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _transactionType == 'SALE' ? const Color(0xFF10B981) : const Color(0xFF1F2937),
                        ),
                      ),
                      child: const Center(
                        child: Text('For Sale (BUY)', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _transactionType = 'RENT'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _transactionType == 'RENT' ? const Color(0xFF064E3B) : const Color(0xFF111827),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _transactionType == 'RENT' ? const Color(0xFF10B981) : const Color(0xFF1F2937),
                        ),
                      ),
                      child: const Center(
                        child: Text('For Rent / Lease', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // If Property, Category Selector (Houses vs Land)
            if (_assetType == 'PROPERTY') ...[
              DropdownButtonFormField<String>(
                value: _category == 'VEHICLE' ? 'RESIDENTIAL' : _category,
                dropdownColor: const Color(0xFF1F2937),
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: 'Property Category',
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF111827),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
                ),
                items: const [
                  DropdownMenuItem(value: 'RESIDENTIAL', child: Text('Houses & Apartments (Duplexes, Flats, Villas)')),
                  DropdownMenuItem(value: 'LAND', child: Text('Land & Commercial Plots')),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _category = val);
                },
              ),
              const SizedBox(height: 14),
            ],

            // Title
            TextField(
              controller: _titleController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Listing Title',
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                hintText: _assetType == 'PROPERTY'
                    ? 'e.g. 5-Bedroom Detached Villa with Pool'
                    : 'e.g. 2023 Mercedes-Benz G63 AMG BiTurbo',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF111827),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
              ),
            ),
            const SizedBox(height: 14),

            // Price & Currency
            TextField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Price in NGN (₦)',
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                hintText: 'e.g. 350000000',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF111827),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
              ),
            ),
            const SizedBox(height: 14),

            // Location: City & State
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _cityController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'City / Area',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF111827),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: _stateController,
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: InputDecoration(
                      labelText: 'State',
                      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: const Color(0xFF111827),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Key Specs
            TextField(
              controller: _specsController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: _assetType == 'PROPERTY'
                    ? 'Specifications (Bedrooms, Bathrooms, Title)'
                    : 'Vehicle Specs (Year, Mileage, Fuel, Transmission)',
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                hintText: _assetType == 'PROPERTY'
                    ? 'e.g. 5 beds, 6 baths, Governor\'s Consent'
                    : 'e.g. 2023, 12,000km, Petrol, Automatic',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF111827),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
              ),
            ),
            const SizedBox(height: 14),

            // Image URL
            TextField(
              controller: _imageUrlController,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Photo Link / Image URL',
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                hintText: 'https://images.unsplash.com/...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF111827),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
              ),
            ),
            const SizedBox(height: 14),

            // Description
            TextField(
              controller: _descController,
              maxLines: 4,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Comprehensive Description',
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                hintText: 'Detail architectural features, luxury finishes, security estate parameters, or vehicle service history...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: const Color(0xFF111827),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1F2937))),
              ),
            ),
            const SizedBox(height: 20),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _submitting
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.rocket_launch, color: Colors.white, size: 20),
                label: Text(
                  _submitting ? 'Publishing...' : 'Publish Listing to Marketplace',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
                onPressed: _submitting ? null : _submitListing,
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
