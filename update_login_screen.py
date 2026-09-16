import re

filepath = r'c:\Users\abc\Desktop\Alphabets\frontend\lib\screens\login_screen.dart'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace background color
content = content.replace("backgroundColor: const Color(0xFF0F172A),", "backgroundColor: const Color(0xFFFBF8F1),")

# 2. Replace the old "V" circle logo with the new Image.asset logo
old_logo_regex = r'Center\(\s*child: Container\(\s*width: 80,\s*height: 80,.*?decoration: const BoxDecoration\(.*?\),\s*child: Center\(.*?\),\s*\),\s*\),'
new_logo = """Center(
                    child: Image.asset(
                      'assets/logo.png',
                      height: 120,
                      errorBuilder: (ctx, err, stack) => const Icon(Icons.hearing, color: Color(0xFF1E3A8A), size: 80),
                    ),
                  ),"""
content = re.sub(old_logo_regex, new_logo, content, flags=re.DOTALL)

# 3. Text colors
content = content.replace("color: const Color(0xFF38BDF8)", "color: const Color(0xFF1E3A8A)")
content = content.replace("color: const Color(0xFF94A3B8)", "color: Colors.grey.shade600")

# 4. TextFields
content = content.replace("style: const TextStyle(color: Colors.white)", "style: const TextStyle(color: Colors.black87)")
content = content.replace("fillColor: const Color(0xFF1E293B)", "fillColor: Colors.white")
content = content.replace("borderSide: BorderSide.none", "borderSide: BorderSide(color: Colors.black12)")

# 5. Buttons
content = content.replace("backgroundColor: const Color(0xFF4361EE)", "backgroundColor: const Color(0xFF1E3A8A)")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("login_screen updated.")
