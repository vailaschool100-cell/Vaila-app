import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'vaila_home_screen.dart';
import 'login_screen.dart';

class UserDashboardScreen extends StatefulWidget {
  const UserDashboardScreen({super.key});

  @override
  State<UserDashboardScreen> createState() => _UserDashboardScreenState();
}

class _UserDashboardScreenState extends State<UserDashboardScreen> {
  String _username = 'Student';

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  void _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('vaila_user');
    if (userStr != null) {
      final user = jsonDecode(userStr);
      setState(() {
        _username = user['username'] ?? 'Student';
      });
    }
  }

  void _handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();

    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F1), // Cream background
      body: SafeArea(
        child: Stack(
          children: [
            // Exit Button
            Positioned(
              top: 16,
              right: 16,
              child: GestureDetector(
                onTap: _handleLogout,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      const Icon(Icons.close_rounded, color: Color(0xFFD32F2F), size: 28),
                      Text(
                        "Exit",
                        style: GoogleFonts.outfit(
                          color: const Color(0xFFD32F2F),
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),
            
            // Main Content
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Logo Image
                    Image.asset(
                      'assets/logo.jpg',
                      height: 120,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          height: 100,
                          width: 100,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFF1E3A8A), width: 2),
                          ),
                          child: const Icon(Icons.hearing, size: 50, color: Color(0xFF1E3A8A)),
                        );
                      },
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Title
                    Text(
                      "VAILA'S Speech Trainer",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFF1E3A8A), // Deep Blue
                      ),
                    ),
                    
                    const SizedBox(height: 8),
                    
                    Text(
                      "CHOOSE A LESSON",
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: const Color(0xFFD32F2F), // Red
                        letterSpacing: 1.2,
                      ),
                    ),
                    
                    const SizedBox(height: 12),
                    
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          "Inclusive Learning For Every Child",
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF1E3A8A),
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Icon(Icons.star, color: Colors.amber, size: 16),
                      ],
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Numbers Card
                    _buildLessonCard(
                      title: "Numbers 1-1000",
                      titleColor: const Color(0xFFD32F2F),
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const VailaHomeScreen(mode: 'numbers'),
                          ),
                        );
                      },
                    ),
                    
                    const SizedBox(height: 20),
                    
                    // Phonics A-Z Card
                    _buildLessonCard(
                      title: "Phonics A-Z",
                      titleColor: const Color(0xFF1E3A8A),
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const VailaHomeScreen(mode: 'alphabets'),
                          ),
                        );
                      },
                    ),
                    
                    const SizedBox(height: 60),
                    
                    // Footer
                    Text(
                      "© VAILA'S School for Hearing Impaired Students",
                      style: GoogleFonts.outfit(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLessonCard({required String title, required Color titleColor, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 28),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 15,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Center(
          child: Text(
            title,
            style: GoogleFonts.outfit(
              fontSize: 26,
              fontWeight: FontWeight.w900,
              color: titleColor,
            ),
          ),
        ),
      ),
    );
  }
}
