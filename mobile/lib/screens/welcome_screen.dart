import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'onboarding_screen.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Top Brand Header
              Column(
                children: [
                  const SizedBox(height: 20),
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF059669), Color(0xFF047857)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF059669).withOpacity(0.35),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.apartment, color: Colors.white, size: 38),
                  ),
                  const SizedBox(height: 16),
                  RichText(
                    text: const TextSpan(
                      style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: -0.5),
                      children: [
                        TextSpan(text: 'Properties '),
                        TextSpan(text: '& Autos', style: TextStyle(color: Color(0xFF10B981))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Luxury Real Estate • Exotic Autos',
                    style: TextStyle(fontSize: 12, color: Color(0xFF9CA3AF), letterSpacing: 0.5),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),

              // Feature Highlights Carousel / Cards
              Column(
                children: [
                  _buildFeatureRow(
                    icon: Icons.shield_outlined,
                    iconColor: const Color(0xFF10B981),
                    title: 'Title Verified & Partner Checked',
                    desc: 'C of O, Governor\'s Consent & custom duty papers audited.',
                  ),
                  const SizedBox(height: 14),
                  _buildFeatureRow(
                    icon: Icons.storefront_outlined,
                    iconColor: const Color(0xFFF59E0B),
                    title: 'Verified Partners & Developers',
                    desc: 'Connect directly with accredited builders, realtors & showrooms.',
                  ),
                  const SizedBox(height: 14),
                  _buildFeatureRow(
                    icon: Icons.directions_car_outlined,
                    iconColor: const Color(0xFF60A5FA),
                    title: 'Houses, Land & Exotic Autos',
                    desc: 'Buy, rent or lease verified assets across prime hubs.',
                  ),
                  const SizedBox(height: 14),
                  _buildFeatureRow(
                    icon: Icons.mark_email_read_outlined,
                    iconColor: const Color(0xFFA78BFA),
                    title: '6-Digit OTP Secure Onboarding',
                    desc: 'Instant human verification via Resend email service.',
                  ),
                ],
              ),

              // Action Buttons
              Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF059669),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 6,
                        shadowColor: const Color(0xFF059669).withOpacity(0.4),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => const OnboardingScreen()),
                        );
                      },
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text('Create Account / Sign Up', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Color(0xFF374151)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        backgroundColor: const Color(0xFF111827).withOpacity(0.7),
                      ),
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => const HomeScreen()),
                        );
                      },
                      child: const Text('Explore Marketplace as Guest', style: TextStyle(color: Color(0xFFD1D5DB), fontWeight: FontWeight.w600, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(height: 10),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureRow({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String desc,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
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
              color: iconColor.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: iconColor, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
