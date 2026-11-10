import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:purchases_flutter/purchases_flutter.dart';
import '../core/constants.dart';

/// RevenueCat Mobile In-App Purchases & Subscriptions Service
/// Handles Apple App Store and Google Play Store transactions,
/// entitlement verification, restoring purchases, and user synchronization.
class RevenueCatService {
  static bool _isConfigured = false;
  static bool get isConfigured => _isConfigured;

  static CustomerInfo? _latestCustomerInfo;
  static CustomerInfo? get latestCustomerInfo => _latestCustomerInfo;

  /// Initializes the RevenueCat SDK with the platform-specific API key.
  static Future<void> init({String? appUserId}) async {
    try {
      String apiKey = '';
      if (kIsWeb) {
        debugPrint('[RevenueCat] In-App Purchases are not supported on Web. Use Paystack.');
        return;
      } else if (Platform.isAndroid) {
        apiKey = RevenueCatConstants.apiKeyAndroid;
      } else if (Platform.isIOS || Platform.isMacOS) {
        apiKey = RevenueCatConstants.apiKeyIOS;
      }

      // Check if placeholders are still present
      if (apiKey.contains('YOUR_REVENUECAT')) {
        debugPrint(
          '[RevenueCat] API Key not set yet. Replace RevenueCatConstants.apiKeyAndroid and apiKeyIOS '
          'with your live keys from https://app.revenuecat.com to activate Google Play & App Store billing.',
        );
        _isConfigured = false;
        return;
      }

      if (kDebugMode) {
        await Purchases.setLogLevel(LogLevel.debug);
      }

      final configuration = PurchasesConfiguration(apiKey);
      if (appUserId != null && appUserId.isNotEmpty) {
        configuration.appUserID = appUserId;
      }

      await Purchases.configure(configuration);
      _isConfigured = true;
      debugPrint('[RevenueCat] SDK successfully initialized on ${Platform.operatingSystem}');

      // Fetch initial customer info & listen for subscription renewals/changes
      _latestCustomerInfo = await Purchases.getCustomerInfo();
      Purchases.addCustomerInfoUpdateListener((customerInfo) {
        _latestCustomerInfo = customerInfo;
        debugPrint('[RevenueCat] CustomerInfo updated: active entitlements: ${customerInfo.entitlements.active.keys}');
      });
    } catch (e) {
      debugPrint('[RevenueCat] Initialization error: $e');
      _isConfigured = false;
    }
  }

  /// Logs in an authenticated PropertyHub user to tie their subscription across devices
  static Future<void> loginUser(String userId) async {
    if (!_isConfigured) return;
    try {
      final logInResult = await Purchases.logIn(userId);
      _latestCustomerInfo = logInResult.customerInfo;
    } catch (e) {
      debugPrint('[RevenueCat] Login error: $e');
    }
  }

  /// Logs out the current user when they sign out of PropertyHub
  static Future<void> logoutUser() async {
    if (!_isConfigured) return;
    try {
      _latestCustomerInfo = await Purchases.logOut();
    } catch (e) {
      debugPrint('[RevenueCat] Logout error: $e');
    }
  }

  /// Retrieves the active offerings configured in the RevenueCat dashboard
  static Future<Offerings?> getOfferings() async {
    if (!_isConfigured) {
      debugPrint('[RevenueCat] Cannot fetch offerings: SDK not configured with live API keys.');
      return null;
    }
    try {
      final offerings = await Purchases.getOfferings();
      return offerings;
    } catch (e) {
      debugPrint('[RevenueCat] Error fetching offerings: $e');
      return null;
    }
  }

  /// Purchases a subscription package via Google Play or Apple App Store
  static Future<bool> purchasePackage(Package package) async {
    if (!_isConfigured) {
      throw Exception('RevenueCat is not configured. Please supply live API keys in RevenueCatConstants.');
    }
    try {
      final purchaseResult = await Purchases.purchasePackage(package);
      _latestCustomerInfo = purchaseResult;
      return true;
    } catch (e) {
      debugPrint('[RevenueCat] Purchase failed or cancelled: $e');
      rethrow;
    }
  }

  /// Restores previous in-app purchases (Mandatory for Apple App Store compliance)
  static Future<CustomerInfo?> restorePurchases() async {
    if (!_isConfigured) {
      throw Exception('RevenueCat is not configured. Please supply live API keys in RevenueCatConstants.');
    }
    try {
      final restoredInfo = await Purchases.restorePurchases();
      _latestCustomerInfo = restoredInfo;
      return restoredInfo;
    } catch (e) {
      debugPrint('[RevenueCat] Restore purchases error: $e');
      rethrow;
    }
  }

  /// Checks if the current user holds an active entitlement
  static bool hasEntitlement(String entitlementId) {
    if (_latestCustomerInfo == null) return false;
    final entitlement = _latestCustomerInfo!.entitlements.active[entitlementId];
    return entitlement != null && entitlement.isActive;
  }

  /// Quick entitlement helpers
  static bool get isAgentPro => hasEntitlement(RevenueCatConstants.entitlementAgentPro);
  static bool get isDeveloperEnterprise => hasEntitlement(RevenueCatConstants.entitlementDeveloperEnterprise);
  static bool get isVIP => hasEntitlement(RevenueCatConstants.entitlementVIP);
}
