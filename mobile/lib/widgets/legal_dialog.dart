import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/constants.dart';

class LegalDialog {
  static void showPrivacyPolicy(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF1F2937)),
        ),
        title: Row(
          children: const [
            Icon(Icons.shield_outlined, color: Color(0xFF10B981), size: 22),
            SizedBox(width: 8),
            Text('Privacy Policy', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Properties & Autos Technologies Ltd values your privacy and strictly adheres to Google Play and Apple App Store data policies.\n',
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                ),
                Text(
                  '1. Information We Collect\n'
                  '• Account details: Name, email, phone number, and optional profile picture.\n'
                  '• Marketplace listings: Property and vehicle specs, photos, videos, and pricing.\n'
                  '• Device info: Anonymous crash reports to optimize stability.\n',
                  style: TextStyle(color: Colors.grey, fontSize: 11, height: 1.4),
                ),
                Text(
                  '2. Device Permissions\n'
                  '• Camera & Photos: Used solely when you take or attach photos for listing a property or vehicle.\n'
                  '• Location: Optional, used to display nearby real estate and dealerships.\n',
                  style: TextStyle(color: Colors.grey, fontSize: 11, height: 1.4),
                ),
                Text(
                  '3. Payments & Subscriptions\n'
                  '• Mobile in-app purchases are handled securely via Apple StoreKit and Google Play Billing (RevenueCat).\n'
                  '• We never store credit card numbers on mobile devices.\n',
                  style: TextStyle(color: Colors.grey, fontSize: 11, height: 1.4),
                ),
                Text(
                  '4. Mandatory Account Deletion\n'
                  'You may permanently delete your account and all associated personal records at any time directly in Profile > Delete Account.\n',
                  style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold, height: 1.4),
                ),
                Text(
                  'Contact: privacy@propertiesandautos.com',
                  style: TextStyle(color: Colors.white54, fontSize: 10),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final url = Uri.parse('${ApiConstants.baseUrl.replaceAll('/api/v1', '')}/privacy');
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            child: const Text('Open Web Version', style: TextStyle(color: Color(0xFF10B981), fontSize: 12)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1F2937),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
    );
  }

  static void showTermsAndEula(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111827),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF1F2937)),
        ),
        title: Row(
          children: const [
            Icon(Icons.description_outlined, color: Color(0xFF38BDF8), size: 22),
            SizedBox(width: 8),
            Expanded(
              child: Text('Terms of Service & EULA', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Properties & Autos End User License Agreement (EULA):\n',
                  style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                ),
                Text(
                  '1. Zero Tolerance for Objectionable Content (Apple Guideline 1.2)\n'
                  '• Users are strictly prohibited from posting fraudulent listings, stolen vehicles, fake land deeds, explicit material, or abusive messages.\n'
                  '• Any user can flag offensive content via the "Report Listing" button.\n'
                  '• Reported violations are investigated and removed within 24 hours.\n'
                  '• Accounts violating safety standards will be immediately terminated.\n',
                  style: TextStyle(color: Colors.grey, fontSize: 11, height: 1.4),
                ),
                Text(
                  '2. In-App Subscriptions & Renewals\n'
                  '• Payment is charged to your Apple ID or Google Play account at confirmation.\n'
                  '• Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current billing cycle.\n'
                  '• Subscriptions can be managed or cancelled anytime in your store account settings.\n',
                  style: TextStyle(color: Colors.grey, fontSize: 11, height: 1.4),
                ),
                Text(
                  '3. Listing Verification Disclaimer\n'
                  'Asset owners and dealers are solely responsible for listing titles and VIN accuracy. Land registry confirmation is recommended before completing statutory transactions.\n',
                  style: TextStyle(color: Colors.grey, fontSize: 11, height: 1.4),
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () async {
              final url = Uri.parse('${ApiConstants.baseUrl.replaceAll('/api/v1', '')}/terms');
              if (await canLaunchUrl(url)) {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              }
            },
            child: const Text('Open Web Version', style: TextStyle(color: Color(0xFF38BDF8), fontSize: 12)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1F2937),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}
