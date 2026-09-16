import re
import os

filepath = r'c:\Users\abc\Desktop\Alphabets\frontend\lib\screens\vaila_home_screen.dart'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Center the Scrollable content
# Current:
#             Expanded(
#               child: SingleChildScrollView(
#                 padding: const EdgeInsets.symmetric(horizontal: 22),
#                 child: Column(
#                   children: [
#                     const SizedBox(height: 28),

new_scrollable = """            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  return SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 22),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(minHeight: constraints.maxHeight),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(height: 10),"""

content = re.sub(r'            Expanded\(\s*child: SingleChildScrollView\(\s*padding: const EdgeInsets.symmetric\(horizontal: 22\),\s*child: Column\(\s*children: \[\s*const SizedBox\(height: 28\),', new_scrollable, content)

# 2. Add closing brackets for LayoutBuilder and ConstrainedBox before BOTTOM BAR
# Current:
#                     const SizedBox(height: 20),
#                   ],
#                 ),
#               ),
#             ),
# 
#             // ───── BOTTOM BAR: Progress ─────

close_brackets = """                    const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            // ───── BOTTOM BAR: Progress ─────"""

content = re.sub(r'                    const SizedBox\(height: 20\),\s*\],\s*\),\s*\),\s*\),\s*// ───── BOTTOM BAR: Progress ─────', close_brackets, content)


# 3. Fix the Progress Bar Overflow
# For numbers mode, the list length is 1000. For alphabets it's 26.
# I will replace the progress bar `Row` with a safer widget.
old_progress_bar_regex = r'// Progress dots A–E with connecting lines.*?Icon\(\s*Icons\.emoji_events_rounded'
new_progress_bar = """// Safe Progress Bar
                            Expanded(
                              child: _isNumbersMode
                                ? Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text("${_currentIndex} / ${_items.length}", style: TextStyle(fontSize: 10, color: Color(0xFF1E3A8A), fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 4),
                                      LinearProgressIndicator(
                                        value: _items.isEmpty ? 0 : _currentIndex / _items.length,
                                        backgroundColor: Color(0xFFE2E8F0),
                                        color: Color(0xFF1E3A8A),
                                        minHeight: 6,
                                        borderRadius: BorderRadius.circular(3),
                                      ),
                                    ],
                                  )
                                : SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: List.generate(_items.length, (index) {
                                        final bool isCompleted = index < _currentIndex;
                                        final bool isCurrent = index == _currentIndex;
                                        final bool isActive = isCompleted || isCurrent;
                                        return Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            if (index > 0)
                                              Container(
                                                width: 12,
                                                height: 2.5,
                                                color: isCompleted ? const Color(0xFF1E3A8A) : const Color(0xFFE2E8F0),
                                              ),
                                            Column(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Container(
                                                  width: isCurrent ? 14 : 10,
                                                  height: isCurrent ? 14 : 10,
                                                  decoration: BoxDecoration(
                                                    shape: BoxShape.circle,
                                                    color: isActive ? const Color(0xFF1E3A8A) : const Color(0xFFE2E8F0),
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  _items[index].letter.toUpperCase(),
                                                  style: GoogleFonts.outfit(
                                                    fontSize: 9,
                                                    fontWeight: FontWeight.w700,
                                                    color: isActive ? const Color(0xFF1E3A8A) : const Color(0xFF9CA3AF),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        );
                                      }),
                                    ),
                                  ),
                            ),
                            const SizedBox(width: 10),
                            Icon(
                              Icons.emoji_events_rounded"""

content = re.sub(old_progress_bar_regex, new_progress_bar, content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("vaila_home_screen layout fixed.")
