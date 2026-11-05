import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const PropertyHubApp());
}

class PropertyHubApp extends StatelessWidget {
  const PropertyHubApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PropertyHub',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B0F19),
        primaryColor: const Color(0xFF059669),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF10B981),
          secondary: Color(0xFFF59E0B),
          surface: Color(0xFF111827),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF111827),
          elevation: 0,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}
