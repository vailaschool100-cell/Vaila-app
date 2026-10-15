import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const String apiUrl = 'https://vaila-app.onrender.com';
  static const String fallbackApiUrl = 'https://vaila-app.onrender.com';

  final ImagePicker _picker = ImagePicker();

  String _username = '';
  String _email = '';
  String? _avatarUrl;
  bool _isUploading = false;

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  void _loadUserProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('vaila_user');
    if (userStr != null) {
      final user = jsonDecode(userStr);
      setState(() {
        _username = user['username'] ?? '';
        _email = user['email'] ?? '';
        _avatarUrl = user['avatar_url'];
      });
    }
  }

  void _pickAndUploadAvatar() async {
    final img = await _picker.pickImage(source: ImageSource.gallery);
    if (img == null) return;

    setState(() => _isUploading = true);

    try {
      final targetUrl = kIsWeb ? '$fallbackApiUrl/api/auth/update-profile' : '$apiUrl/api/auth/update-profile';
      final request = http.MultipartRequest('POST', Uri.parse(targetUrl));

      // Username/email are unchanged — this call only ever updates the avatar.
      request.fields['username'] = _username;
      request.fields['email'] = _email;
      request.fields['current_username'] = _username;

      final bytes = await img.readAsBytes();
      request.files.add(
        http.MultipartFile.fromBytes('avatar', bytes, filename: 'avatar.png'),
      );

      final streamedResponse = await request.send().timeout(const Duration(seconds: 15));
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('vaila_user', jsonEncode(data['user']));

        if (!mounted) return;
        setState(() {
          _avatarUrl = data['user']?['avatar_url'];
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Profile picture updated!")),
        );
      }
    } catch (e) {
      print('Avatar upload error: $e');
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }

  void _handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('vaila_token');
    await prefs.remove('vaila_user');

    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasAvatar = _avatarUrl != null && _avatarUrl!.isNotEmpty;
    final avatarNetworkUrl = hasAvatar
        ? (_avatarUrl!.startsWith('http') ? _avatarUrl! : '$apiUrl$_avatarUrl')
        : null;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            children: [
              Text(
                "My Profile",
                style: GoogleFonts.outfit(fontSize: 26, fontWeight: FontWeight.w900, color: const Color(0xFF38BDF8)),
              ),
              const SizedBox(height: 24),

              // Avatar Circle
              GestureDetector(
                onTap: _isUploading ? null : _pickAndUploadAvatar,
                child: Stack(
                  children: [
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF1E293B),
                        border: Border.all(color: const Color(0xFF4361EE), width: 3),
                        image: avatarNetworkUrl != null
                            ? DecorationImage(image: NetworkImage(avatarNetworkUrl), fit: BoxFit.cover)
                            : null,
                      ),
                      child: avatarNetworkUrl == null
                          ? Center(
                              child: Text(
                                _username.isNotEmpty ? _username[0].toUpperCase() : 'V',
                                style: GoogleFonts.outfit(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
                              ),
                            )
                          : null,
                    ),
                    Positioned(
                      bottom: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: const BoxDecoration(color: Color(0xFF4361EE), shape: BoxShape.circle),
                        child: _isUploading
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 18),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              Text(
                _username.isNotEmpty ? _username : 'Learner',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white),
              ),
              const SizedBox(height: 4),
              Text(
                _email,
                style: GoogleFonts.outfit(fontSize: 14, color: const Color(0xFF94A3B8)),
              ),
              const SizedBox(height: 6),
              Text(
                "Tap the avatar to change your profile picture",
                style: GoogleFonts.outfit(fontSize: 12, color: const Color(0xFF64748B)),
              ),

              const SizedBox(height: 32),

              SizedBox(
                width: double.infinity,
                height: 54,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Colors.redAccent),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: _handleLogout,
                  icon: const Icon(Icons.logout_rounded, color: Colors.redAccent),
                  label: Text("Logout Account", style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.redAccent)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
