"""Generate the checked-in lyric data from the user's exact source text.

Run with ToJyutping available on PYTHONPATH. The generated readings are a
machine draft and should be reviewed by a Cantonese speaker before release.
"""

from pathlib import Path
import json
import re
import ToJyutping

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content" / "歌词原文.txt"
LINES = ROOT / "content" / "歌词分句.txt"
OUTPUT = ROOT / "src" / "data" / "lyrics.json"

original = SOURCE.read_text(encoding="utf-8").strip()
lines = [line.strip() for line in LINES.read_text(encoding="utf-8").splitlines() if line.strip()]
compact = lambda text: re.sub(r"\s+", "", text)
assert compact(original) == compact("".join(lines)), "Line split changed the user's text"

data = []
unknown = set()
for index, line in enumerate(lines):
    pairs = ToJyutping.get_jyutping_list(line)
    assert "".join(char for char, _ in pairs) == line
    chars = []
    for char, jyutping in pairs:
        if not jyutping and char.strip() and char not in "()（）":
            unknown.add(char)
        chars.append({"char": char, "jyutping": jyutping or ""})
    data.append({"id": index + 1, "text": line, "chars": chars})

OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {len(data)} lines; unknown characters: {','.join(sorted(unknown)) or 'none'}")
