"""Create static Cantonese speech files using the macOS Sinji voice."""

from pathlib import Path
import json
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
LINES = json.loads((ROOT / "src/data/lyrics.json").read_text(encoding="utf-8"))
TARGET = ROOT / "public/audio/pronunciation"
TARGET.mkdir(parents=True, exist_ok=True)

def make(name: str, text: str) -> None:
    output = TARGET / name
    if output.exists() and output.stat().st_size > 1000:
        return
    with tempfile.TemporaryDirectory() as directory:
        aiff = Path(directory) / "voice.aiff"
        subprocess.run(["say", "-v", "Sinji", "-o", str(aiff), text], check=True)
        if aiff.stat().st_size < 5000:
            raise RuntimeError(f"No audible data generated for {name}")
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@22050", str(aiff), str(output)], check=True)
    print(name, flush=True)

for line in LINES:
    make(f"line-{line['id']:03d}.wav", line["text"].replace("(", "").replace(")", ""))

unique = {entry["char"] for line in LINES for entry in line["chars"] if entry["jyutping"]}
for char in sorted(unique):
    make(f"char-{ord(char):04x}.wav", char)

print(f"Finished: {len(LINES)} lines and {len(unique)} characters", flush=True)
