import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_screen.dart';
import 'signup_screen.dart';
import 'vaila_home_screen.dart';

// First 4 items of each module's list (mirrors ALPHABETS/NUMBERS/URDU.slice(0,4)
// in the web app's lib/content/index.ts getDemoItems()), combined into one
// 12-item trial list for anonymous visitors.
final List<AlphabetItem> _demoItems = [
  AlphabetItem(id: 'a', letter: 'a', sound: 'A', word: 'Apple', speechText: 'A', tip: 'Say Letter A!'),
  AlphabetItem(id: 'b', letter: 'b', sound: 'B', word: 'Ball', speechText: 'B', tip: 'Say Letter B!'),
  AlphabetItem(id: 'c', letter: 'c', sound: 'C', word: 'Cat', speechText: 'C', tip: 'Say Letter C!'),
  AlphabetItem(id: 'd', letter: 'd', sound: 'D', word: 'Dog', speechText: 'D', tip: 'Say Letter D!'),
  AlphabetItem(id: '1', letter: '1', sound: 'One', word: 'One', speechText: 'One', tip: 'Say One!'),
  AlphabetItem(id: '2', letter: '2', sound: 'Two', word: 'Two', speechText: 'Two', tip: 'Say Two!'),
  AlphabetItem(id: '3', letter: '3', sound: 'Three', word: 'Three', speechText: 'Three', tip: 'Say Three!'),
  AlphabetItem(id: '4', letter: '4', sound: 'Four', word: 'Four', speechText: 'Four', tip: 'Say Four!'),
  AlphabetItem(id: 'ال', letter: 'ال', sound: 'Al', word: 'ال', speechText: 'ال', tip: 'Say Al!'),
  AlphabetItem(id: 'آل', letter: 'آل', sound: 'Aal', word: 'آل', speechText: 'آل', tip: 'Say Aal!'),
  AlphabetItem(id: 'بال', letter: 'بال', sound: 'Baal', word: 'بال', speechText: 'بال', tip: 'Say Baal!'),
  AlphabetItem(id: 'پال', letter: 'پال', sound: 'Paal', word: 'پال', speechText: 'پال', tip: 'Say Paal!'),
];

class DemoScreen extends StatelessWidget {
  const DemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFBF8F1),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/logo.jpg',
                height: 150,
                errorBuilder: (ctx, err, stack) => const Icon(Icons.hearing, color: Color(0xFF1E3A8A), size: 64),
              ),
              const SizedBox(height: 20),
              Text(
                "Try Vaila Free",
                style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: const Color(0xFF1E3A8A)),
              ),
              const SizedBox(height: 8),
              Text(
                "Practice 4 words from every module — English letters, numbers, and Urdu — before you sign up.",
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(fontSize: 14, color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => VailaHomeScreen(
                          mode: 'alphabets',
                          isDemo: true,
                          demoItems: _demoItems,
                        ),
                      ),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1E3A8A),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.play_circle_outline),
                  label: Text("Start a Demo", style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 16)),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                    ),
                    child: Text("Login", style: GoogleFonts.outfit(color: const Color(0xFF1E3A8A), fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SignupScreen()),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1E3A8A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text("Sign Up", style: GoogleFonts.outfit(fontWeight: FontWeight.w700)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
