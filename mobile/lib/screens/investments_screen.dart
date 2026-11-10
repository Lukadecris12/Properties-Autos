import 'package:flutter/material.dart';
import '../services/api_service.dart';

class InvestmentsScreen extends StatefulWidget {
  const InvestmentsScreen({Key? key}) : super(key: key);

  @override
  State<InvestmentsScreen> createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<Map<String, dynamic>>> _investmentsFuture;

  @override
  void initState() {
    super.initState();
    _loadInvestments();
  }

  void _loadInvestments() {
    setState(() {
      _investmentsFuture = _apiService.fetchInvestments();
    });
  }

  void _showReturnCalculator(Map<String, dynamic> inv) {
    final double minAmount = (inv['minimum_investment'] as num?)?.toDouble() ?? 500000.0;
    final double roiPercent = (inv['projected_roi_percentage'] as num?)?.toDouble() ?? 28.0;
    final int tenure = (inv['tenure_months'] as num?)?.toInt() ?? 12;
    final String cycle = inv['dividend_cycle'] ?? 'Quarterly';

    final amountController = TextEditingController(text: minAmount.toInt().toString());
    double investedAmount = minAmount;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            final double profit = investedAmount * (roiPercent / 100.0);
            final double totalReturn = investedAmount + profit;
            final int cyclesCount = cycle == 'Quarterly' ? (tenure / 3).floor().clamp(1, 12) : 1;
            final double periodicDividend = profit / cyclesCount;

            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.trending_up, color: Color(0xFFF59E0B), size: 20),
                            SizedBox(width: 8),
                            Text('ROI Return Calculator', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.close, color: Colors.grey),
                          onPressed: () => Navigator.pop(ctx),
                        ),
                      ],
                    ),
                    Text(
                      inv['title'],
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                    const SizedBox(height: 16),

                    // Amount Input
                    TextField(
                      controller: amountController,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        labelText: 'Investment Amount (NGN)',
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                        prefixText: '₦ ',
                        prefixStyle: const TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold),
                        filled: true,
                        fillColor: const Color(0xFF0B0F19),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF374151))),
                      ),
                      onChanged: (val) {
                        final parsed = double.tryParse(val) ?? minAmount;
                        setModalState(() {
                          investedAmount = parsed;
                        });
                      },
                    ),
                    const SizedBox(height: 16),

                    // Projection Breakdown Box
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B0F19),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF1F2937)),
                      ),
                      child: Column(
                        children: [
                          _buildCalcRow('Annual Projected ROI:', '$roiPercent% p.a.', color: const Color(0xFFF59E0B)),
                          const SizedBox(height: 8),
                          _buildCalcRow('Project Tenure:', '$tenure Months'),
                          const SizedBox(height: 8),
                          _buildCalcRow('$cycle Payout:', '₦${periodicDividend.toInt()} / cycle', color: const Color(0xFF10B981)),
                          const Divider(color: Color(0xFF1F2937), height: 18),
                          _buildCalcRow('Total Expected Return:', '₦${totalReturn.toInt()}', isTotal: true, color: const Color(0xFFF59E0B)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Offline Inquiries Store Compliance Notice
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1F2937),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF374151)),
                      ),
                      child: const Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.info_outline, color: Color(0xFFF59E0B), size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'No payments are processed in this app. To participate or review legal title deeds, please visit the developer\'s corporate office directly.',
                              style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 11, height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Contact Developer Office Button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.location_on, color: Colors.white, size: 18),
                        onPressed: () {
                          Navigator.pop(ctx);
                          showDialog(
                            context: context,
                            builder: (dCtx) => AlertDialog(
                              backgroundColor: const Color(0xFF111827),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              title: Row(
                                children: [
                                  const Icon(Icons.business, color: Color(0xFF10B981), size: 22),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      '${inv['developer_name']} Office',
                                      style: const TextStyle(color: Colors.white, fontSize: 16),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              content: Column(
                                mainAxisSize: MainAxisSize.min,
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Corporate Office Address:', style: TextStyle(color: Colors.grey, fontSize: 12)),
                                  const SizedBox(height: 4),
                                  const Text(
                                    'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
                                    style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 12),
                                  const Text('Contact Hotline: +234 803 123 4567', style: TextStyle(color: Color(0xFF34D399), fontSize: 13)),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Please visit their registered corporate office during working hours (Mon-Fri 8am - 5pm) to conduct due diligence, title review, and offline agreement execution.',
                                    style: TextStyle(color: Colors.grey, fontSize: 11),
                                  ),
                                ],
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(dCtx),
                                  child: const Text('Close', style: TextStyle(color: Colors.white)),
                                ),
                              ],
                            ),
                          );
                        },
                        label: const Text('Developer Corporate Office & Inquiries', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildCalcRow(String label, String value, {bool isTotal = false, Color? color}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: TextStyle(fontSize: isTotal ? 13 : 12, color: Colors.grey, fontWeight: isTotal ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(fontSize: isTotal ? 15 : 12, fontWeight: FontWeight.bold, color: color ?? Colors.white)),
      ],
    );
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
            Icon(Icons.trending_up, color: Color(0xFFF59E0B), size: 20),
            SizedBox(width: 8),
            Text('Property Investments', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _investmentsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFFF59E0B)));
          }

          final items = snapshot.data ?? [];
          if (items.isEmpty) {
            return const Center(child: Text('No active investment projects found.', style: TextStyle(color: Colors.grey)));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final inv = items[index];
              return _buildInvestmentCard(inv);
            },
          );
        },
      ),
    );
  }

  Widget _buildInvestmentCard(Map<String, dynamic> inv) {
    final double progress = (inv['funding_progress_percentage'] as num?)?.toDouble() ?? 50.0;
    final images = (inv['image_urls'] as List?) ?? [];
    final String cover = images.isNotEmpty
        ? images.first
        : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600';

    return Container(
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
          // Image with ROI Tag
          Stack(
            children: [
              Image.network(
                cover,
                height: 160,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(height: 160, color: Colors.black26),
              ),
              Positioned(
                top: 8,
                left: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${inv['projected_roi_percentage']}% Annual ROI',
                    style: const TextStyle(color: Colors.black, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${inv['tenure_months']} Mos Tenure',
                    style: const TextStyle(color: Colors.white, fontSize: 10),
                  ),
                ),
              ),
            ],
          ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.verified, color: Color(0xFF10B981), size: 14),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        inv['developer_name'] ?? 'Master Developer',
                        style: const TextStyle(fontSize: 11, color: Color(0xFF10B981), fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  inv['title'] ?? '',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),

                // Progress Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Funding Progress', style: TextStyle(fontSize: 11, color: Colors.grey)),
                    Text('${progress.toInt()}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFFF59E0B))),
                  ],
                ),
                const SizedBox(height: 6),
                LinearProgressIndicator(
                  value: (progress / 100.0).clamp(0.0, 1.0),
                  backgroundColor: const Color(0xFF1F2937),
                  color: const Color(0xFFF59E0B),
                  minHeight: 6,
                  borderRadius: BorderRadius.circular(3),
                ),
                const SizedBox(height: 12),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Min. Investment', style: TextStyle(fontSize: 10, color: Colors.grey)),
                        Text('₦${((inv['minimum_investment'] as num?)?.toInt() ?? 500000)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                      ],
                    ),
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      icon: const Icon(Icons.calculate, color: Colors.black, size: 16),
                      label: const Text('View Yield & Office Inquiries', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                      onPressed: () => _showReturnCalculator(inv),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
