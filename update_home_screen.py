import re
import os

filepath = r'c:\Users\abc\Desktop\Alphabets\frontend\lib\screens\vaila_home_screen.dart'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. We need to add _showExitPopup() method before the build method
exit_popup_code = """
  void _showExitPopup() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF333333),
        title: const Text(
          "Exit this lesson and choose another?",
          style: TextStyle(color: Colors.white, fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text("Cancel", style: TextStyle(color: Colors.lightGreenAccent)),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              _cancelTtsLoop = true;
              try { _flutterTts.stop(); } catch (_) {}
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              }
            },
            child: const Text("OK", style: TextStyle(color: Colors.lightGreenAccent)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {"""
content = content.replace("  @override\n  Widget build(BuildContext context) {", exit_popup_code)

# 2. Replace the top bar inside build() method
# Current top bar starts at "// ───── TOP BAR: Camera + Title + Star ─────"
# Ends before "// ───── MAIN SCROLLABLE CONTENT ─────"
top_bar_new = """            // ───── TOP BAR: Mirror, Logo, Exit ─────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Camera Mirror (Top Left)
                  GestureDetector(
                    onTap: _toggleCamera,
                    child: Container(
                      width: 90,
                      height: 70,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        color: const Color(0xFFE0E7FF),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            if (_isCameraInitialized &&
                                _cameraController != null &&
                                _cameraController!.value.isInitialized)
                              FittedBox(
                                fit: BoxFit.cover,
                                child: SizedBox(
                                  width: _cameraController!.value.previewSize!.height,
                                  height: _cameraController!.value.previewSize!.width,
                                  child: CameraPreview(_cameraController!),
                                ),
                              )
                            else
                              const Center(child: Icon(Icons.person, color: Colors.grey)),
                            const Positioned(
                              bottom: 2,
                              left: 0,
                              right: 0,
                              child: Text(
                                "Mirror",
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Color(0xFF1E3A8A),
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Title / Logo Section (Center)
                  Expanded(
                    child: Column(
                      children: [
                        Image.asset(
                          'assets/logo.png',
                          height: 50,
                          errorBuilder: (ctx, err, stack) => const Icon(Icons.hearing, color: Color(0xFF1E3A8A), size: 40),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E3A8A),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Text(
                            "VSCI&HI",
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          "For Children with Hearing Aid\\n& Cochlear Implant",
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 8, color: Colors.grey),
                        ),
                        const SizedBox(height: 6),
                        const Text(
                          "VAILA'S Speech\\nTrainer",
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Color(0xFF1E3A8A), fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _isNumbersMode ? "NUMBERS" : "PHONICS",
                          style: const TextStyle(color: Color(0xFFD32F2F), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                        ),
                        const SizedBox(height: 4),
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.star, color: Colors.amber, size: 12),
                            SizedBox(width: 4),
                            Text(
                              "Inclusive Learning\\nFor Every Child",
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Color(0xFF1E3A8A), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.star, color: Colors.amber, size: 12),
                          ],
                        )
                      ],
                    ),
                  ),

                  const SizedBox(width: 10),

                  // Exit and Guidance Buttons (Top Right)
                  Column(
                    children: [
                      GestureDetector(
                        onTap: _showExitPopup,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.close_rounded, color: Color(0xFFD32F2F), size: 24),
                              Text("Exit", style: TextStyle(color: Color(0xFFD32F2F), fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      GestureDetector(
                        onTap: _showInstructionsPopup,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4)],
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.lightbulb_outline, color: Colors.purple, size: 24),
                              Text("Guidance", style: TextStyle(color: Colors.purple, fontSize: 10, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),"""
content = re.sub(r'// ───── TOP BAR: Camera \+ Title \+ Star ─────.*?// ───── MAIN SCROLLABLE CONTENT ─────', top_bar_new + '\n            // ───── MAIN SCROLLABLE CONTENT ─────', content, flags=re.DOTALL)

# 3. Change Background Color from 0xFFF5F7FF to 0xFFF9F6EE
content = content.replace("backgroundColor: const Color(0xFFF5F7FF),", "backgroundColor: const Color(0xFFFBF8F1),")

# 4. Remove the old Instructions button from the bottom bar
# The Bottom bar is at "// ───── BOTTOM BAR: Progress + Instructions ─────"
# We just need to remove the instructions button section inside it
remove_instructions = """                  // Instructions Button
                  GestureDetector(
                    onTap: _showInstructionsPopup,"""
# Since the bottom bar has the Progress UI, I will just keep the Progress UI but remove the instructions button.
# Let's replace the whole Bottom Bar block.
bottom_bar_regex = r'// ───── BOTTOM BAR: Progress \+ Instructions ─────(.*?)// ═══════════════════════════════════════════════════════════════════'
new_bottom_bar = """// ───── BOTTOM BAR: Progress ─────
            Container(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(26),
                  topRight: Radius.circular(26),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 12,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Progress Section
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          "Your Progress",
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            // Progress dots A–E with connecting lines
                            ...List.generate(_items.length, (index) {
                              final bool isCompleted = index < _currentIndex;
                              final bool isCurrent = index == _currentIndex;
                              final bool isActive = isCompleted || isCurrent;

                              if (_isNumbersMode) {
                                return Expanded(
                                  child: Row(
                                    children: [
                                      if (index > 0)
                                        Expanded(
                                          child: Container(
                                            height: 2.5,
                                            decoration: BoxDecoration(
                                              color: isCompleted
                                                  ? const Color(0xFF1E3A8A)
                                                  : const Color(0xFFE2E8F0),
                                              borderRadius: BorderRadius.circular(2),
                                            ),
                                          ),
                                        ),
                                      if (isCurrent || index == 0 || index == _items.length - 1)
                                        Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Container(
                                              width: isCurrent ? 14 : 8,
                                              height: isCurrent ? 14 : 8,
                                              decoration: BoxDecoration(
                                                shape: BoxShape.circle,
                                                color: isActive
                                                    ? const Color(0xFF1E3A8A)
                                                    : const Color(0xFFE2E8F0),
                                              ),
                                            ),
                                            const SizedBox(height: 3),
                                            if (isCurrent)
                                              Text(
                                                _items[index].letter,
                                                style: GoogleFonts.outfit(
                                                  fontSize: 8,
                                                  fontWeight: FontWeight.w700,
                                                  color: const Color(0xFF1E3A8A),
                                                ),
                                              ),
                                          ],
                                        ),
                                    ],
                                  ),
                                );
                              }

                              return Expanded(
                                child: Row(
                                  children: [
                                    if (index > 0)
                                      Expanded(
                                        child: Container(
                                          height: 2.5,
                                          decoration: BoxDecoration(
                                            color: isCompleted
                                                ? const Color(0xFF1E3A8A)
                                                : const Color(0xFFE2E8F0),
                                            borderRadius: BorderRadius.circular(2),
                                          ),
                                        ),
                                      ),
                                    Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Container(
                                          width: isCurrent ? 16 : 12,
                                          height: isCurrent ? 16 : 12,
                                          decoration: BoxDecoration(
                                            shape: BoxShape.circle,
                                            color: isActive
                                                ? const Color(0xFF1E3A8A)
                                                : const Color(0xFFE2E8F0),
                                          ),
                                        ),
                                        const SizedBox(height: 5),
                                        Text(
                                          _items[index].letter.toUpperCase(),
                                          style: GoogleFonts.outfit(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w700,
                                            color: isActive
                                                ? const Color(0xFF1E3A8A)
                                                : const Color(0xFF9CA3AF),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            }),
                            const SizedBox(width: 10),
                            Icon(
                              Icons.emoji_events_rounded,
                              color: _currentIndex >= _items.length
                                  ? Colors.amber
                                  : const Color(0xFFD1D5DB),
                              size: 24,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

// ═══════════════════════════════════════════════════════════════════"""
content = re.sub(bottom_bar_regex, new_bottom_bar, content, flags=re.DOTALL)

# 5. Make Listen and Speak buttons Green and Orange
listen_btn_regex = r'color: const Color\(0xFF7C5CFC\),'
content = re.sub(listen_btn_regex, 'color: const Color(0xFF388E3C),', content, count=1) # First one is Listen button

speak_btn_regex = r'color: const Color\(0xFF10B981\),'
content = re.sub(speak_btn_regex, 'color: const Color(0xFFF57C00),', content, count=1) # Second one is Speak button

# We must ensure we don't accidentally replace other buttons, so we target the exact Listen and Speak button text styles
content = content.replace('color: const Color(0xFF7C5CFC)', 'color: const Color(0xFF1E3A8A)') # Replace remaining purple with Deep Blue

# 6. Center letter Color
content = content.replace("color: const Color(0xFF1E293B)", "color: const Color(0xFF1E3A8A)")
content = content.replace("Current Word", " ")
content = content.replace("Let's practice this sound", _currentAlphabet_sound_var := "${_currentAlphabet.sound}") # Actually we need the word here, the subtitle "One" from Image 2
content = content.replace("${_currentAlphabet.sound}", "${_currentAlphabet.word}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("vaila_home_screen updated.")
