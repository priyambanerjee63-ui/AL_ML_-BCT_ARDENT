import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from utils.caption_generator import ImageCaptionGenerator


def test_generate_caption_from_filename_and_prompt():
    generator = ImageCaptionGenerator()
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp.write(b"fake-image")
        image_path = tmp.name

    try:
        caption = generator.generate_caption(image_path, prompt="A bright, modern city skyline")
        assert "city skyline" in caption.lower()
        assert "uploaded" not in caption.lower()
    finally:
        os.unlink(image_path)
