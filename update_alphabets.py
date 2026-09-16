import re
import os
import json

backend_file = r'c:\Users\abc\Desktop\Alphabets\backend\main.py'
frontend_file = r'c:\Users\abc\Desktop\Alphabets\frontend\lib\screens\vaila_home_screen.dart'

alphabets = [
    ('a', 'A', 'ah', 'aaa', 'Apple', 'Say Letter A!'),
    ('b', 'B', 'buh', 'bah', 'Ball', 'Say Letter B!'),
    ('c', 'C', 'kuh', 'kah', 'Cat', 'Say Letter C!'),
    ('d', 'D', 'dah', 'da', 'Dog', 'Say Letter D!'),
    ('e', 'E', 'eh', 'aeh', 'Elephant', 'Say Letter E!'),
    ('f', 'F', 'fff', 'fuh', 'Fish', 'Say Letter F!'),
    ('g', 'G', 'guh', 'gah', 'Goat', 'Say Letter G!'),
    ('h', 'H', 'huh', 'hah', 'Hat', 'Say Letter H!'),
    ('i', 'I', 'ih', 'ee', 'Igloo', 'Say Letter I!'),
    ('j', 'J', 'juh', 'jah', 'Jam', 'Say Letter J!'),
    ('k', 'K', 'kuh', 'kah', 'Kite', 'Say Letter K!'),
    ('l', 'L', 'lll', 'luh', 'Lion', 'Say Letter L!'),
    ('m', 'M', 'mmm', 'muh', 'Monkey', 'Say Letter M!'),
    ('n', 'N', 'nnn', 'nuh', 'Nest', 'Say Letter N!'),
    ('o', 'O', 'oh', 'aw', 'Orange', 'Say Letter O!'),
    ('p', 'P', 'puh', 'pah', 'Pig', 'Say Letter P!'),
    ('q', 'Q', 'quh', 'qwa', 'Queen', 'Say Letter Q!'),
    ('r', 'R', 'rrr', 'ruh', 'Rabbit', 'Say Letter R!'),
    ('s', 'S', 'sss', 'suh', 'Sun', 'Say Letter S!'),
    ('t', 'T', 'tuh', 'tah', 'Tiger', 'Say Letter T!'),
    ('u', 'U', 'uh', 'oo', 'Umbrella', 'Say Letter U!'),
    ('v', 'V', 'vvv', 'vuh', 'Van', 'Say Letter V!'),
    ('w', 'W', 'wuh', 'wah', 'Water', 'Say Letter W!'),
    ('x', 'X', 'ks', 'eks', 'Xylophone', 'Say Letter X!'),
    ('y', 'Y', 'yuh', 'yah', 'Yellow', 'Say Letter Y!'),
    ('z', 'Z', 'zzz', 'zuh', 'Zebra', 'Say Letter Z!')
]

# 1. Update Frontend
with open(frontend_file, 'r', encoding='utf-8') as f:
    fc = f.read()

frontend_items = []
for l, U, sound, v, word, tip in alphabets:
    frontend_items.append(f"""    AlphabetItem(
        id: '{l}',
        letter: '{l}',
        sound: '{U}',
        word: '{word}',
        speechText: '{U}',
        tip: '{tip}'),""")

frontend_str = "  final List<AlphabetItem> _alphabets = [\n" + "\n".join(frontend_items) + "\n  ];"
fc = re.sub(r'  final List<AlphabetItem> _alphabets = \[.*?\];', frontend_str, fc, flags=re.DOTALL)

with open(frontend_file, 'w', encoding='utf-8') as f:
    f.write(fc)


# 2. Update Backend
with open(backend_file, 'r', encoding='utf-8') as f:
    bc = f.read()

# DB init
db_items = []
for l, U, sound, v, word, tip in alphabets:
    db_items.append(f'                {{"id": "{l}", "letter": "{l}", "phonetic_sound": "{sound}", "sample_word": "{word}", "repeat_count": 3, "tips": "Press lips together for \'{sound}\'."}},')
db_str = "            initial_alphabets = [\n" + "\n".join(db_items) + "\n            ]"
bc = re.sub(r'            initial_alphabets = \[.*?\]', db_str, bc, flags=re.DOTALL)

# IPA_REFERENCE_WORDS
ipa = []
for l, U, sound, v, word, tip in alphabets:
    ipa.append(f'    "{l}": "{sound}",')
ipa_str = "IPA_REFERENCE_WORDS = {\n" + " ".join(ipa) + "\n    # Numbers"
bc = re.sub(r'IPA_REFERENCE_WORDS = \{.*?\n    # Numbers', ipa_str, bc, flags=re.DOTALL)

# PHONETIC_TARGET_WORDS
ptw = []
for l, U, sound, v, word, tip in alphabets:
    ptw.append(f'    "{l}": "{sound}",')
ptw_str = "PHONETIC_TARGET_WORDS = {\n" + " ".join(ptw) + "\n    # Numbers"
bc = re.sub(r'PHONETIC_TARGET_WORDS = \{.*?\n    # Numbers', ptw_str, bc, flags=re.DOTALL)

# PHONETIC_VARIANTS
pv = []
for l, U, sound, v, word, tip in alphabets:
    pv.append(f'    "{l}": ["{sound}", "{v}", "{l}"],')
pv_str = "PHONETIC_VARIANTS = {\n" + "\n".join(pv) + "\n    # Numbers"
bc = re.sub(r'PHONETIC_VARIANTS = \{.*?\n    # Numbers', pv_str, bc, flags=re.DOTALL)

# target_sounds_map
tsm = []
for l, U, sound, v, word, tip in alphabets:
    tsm.append(f'            "{l}": ["{l}", "letter {l}", "say {l}", "{sound}", "{v}"],')
tsm_str = "        target_sounds_map = {\n" + "\n".join(tsm) + "\n            # Numbers"
bc = re.sub(r'        target_sounds_map = \{.*?\n            # Numbers', tsm_str, bc, flags=re.DOTALL)

# wrong_sounds_map
wsm = []
for l, U, sound, v, word, tip in alphabets:
    wrongs = []
    for ol, oU, osound, ov, oword, otip in alphabets:
        if ol != l:
            wrongs.extend([ol, osound])
    wsm.append(f'            "{l}": {json.dumps(wrongs)},')
wsm_str = "        wrong_sounds_map = {\n" + "\n".join(wsm) + "\n        }"
bc = re.sub(r'        wrong_sounds_map = \{.*?\n        \}', wsm_str, bc, flags=re.DOTALL)

with open(backend_file, 'w', encoding='utf-8') as f:
    f.write(bc)

print("Updated perfectly.")
