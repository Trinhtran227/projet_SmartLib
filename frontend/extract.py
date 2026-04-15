import os
import re
import json

directories = ['src/pages', 'src/components']
pattern_vi = re.compile(r'[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]')

# We want to match:
# 1. JSX text: > Text <
# 2. JSX attributes: placeholder="Text"
# 3. String literals: "Text" or 'Text' or `Text`

def extract_strings_from_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    results = []

    # JSX Text: between > and <
    # We find all texts between > and <
    jsx_text_matches = re.finditer(r'>([^<]+)<', content)
    for match in jsx_text_matches:
        text = match.group(1).strip()
        if pattern_vi.search(text):
            results.append(text)

    # String literals (double, single, backtick)
    # This might have false positives, but we only catch if there is Vietnamese
    str_matches = re.finditer(r'''(["'`])((?:\\\1|(?!\1).)*)\1''', content)
    for match in str_matches:
        text = match.group(2).strip()
        if pattern_vi.search(text):
            results.append(text)

    return results

all_strings = set()
for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                res = extract_strings_from_file(os.path.join(root, file))
                for r in res:
                    # Clean up the string to minimize whitespace issues
                    r = re.sub(r'\s+', ' ', r).strip()
                    if r:
                        all_strings.add(r)

with open('extracted.json', 'w', encoding='utf-8') as f:
    json.dump(sorted(list(all_strings)), f, ensure_ascii=False, indent=2)
print(f"Extracted {len(all_strings)} unique strings.")
