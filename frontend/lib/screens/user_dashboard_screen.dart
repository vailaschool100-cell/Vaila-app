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
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Hello, $_username 👋",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.outfit(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: const Color(0xFF38BDF8),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Ready for phonetics practice?",
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: const Color(0xFF94A3B8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        onPressed: _handleLogout,
                        icon: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 22),
                        tooltip: "Logout",
                      ),
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF4361EE)),
                        ),
                        child: const Icon(Icons.star_rounded, color: Colors.amber, size: 20),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Learning Modules Header
              Text(
                "Your Learning Modules",
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                "Choose a module to practice",
                style: GoogleFonts.outfit(
                  fontSize: 13,
                  color: const Color(0xFF94A3B8),
                ),
              ),

              const SizedBox(height: 20),

              // ── Two Module Cards ──
              Row(
                children: [
                  // Phonics A–E Card
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(builder: (_) => const VailaHomeScreen()),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF4361EE), Color(0xFF3A0CA3)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4361EE).withOpacity(0.35),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(Icons.abc_rounded, color: Colors.white, size: 30),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                "RECOMMENDED",
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "Phonics\nA – E",
                              style: GoogleFonts.outfit(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Practice letter sounds with AI speech evaluation",
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                color: Colors.white.withOpacity(0.8),
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    "Start",
                                    style: GoogleFonts.outfit(
                                      color: const Color(0xFF3A0CA3),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.arrow_forward_rounded, color: Color(0xFF3A0CA3), size: 16),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 14),

                  // Numbers 1–1000 Card
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const VailaHomeScreen(mode: 'numbers'),
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF10B981), Color(0xFF047857)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withOpacity(0.35),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(Icons.numbers_rounded, color: Colors.white, size: 30),
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                "NEW MODULE",
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "Numbers\n1 – 1000",
                              style: GoogleFonts.outfit(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              "Learn to speak numbers clearly with voice AI",
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                color: Colors.white.withOpacity(0.8),
                                height: 1.3,
                              ),
                            ),
                            const SizedBox(height: 14),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    "Start",
                                    style: GoogleFonts.outfit(
                                      color: const Color(0xFF047857),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.arrow_forward_rounded, color: Color(0xFF047857), size: 16),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),

              // Progress Overview Box
              Text(
                "Your Learning Stats",
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Expanded(
                    child: _buildStatCard("Mastered Sounds", "5 Letters", Icons.volume_up_rounded, const Color(0xFF06B6D4)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: _buildStatCard("Speech Accuracy", "94.5%", Icons.verified_rounded, const Color(0xFF10B981)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 12),
          Text(value, style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
          Text(title, style: GoogleFonts.outfit(fontSize: 12, color: const Color(0xFF94A3B8))),
        ],
      ),
    );
  }
}
