import os
from typing import Optional


class ImageCaptionGenerator:
    """Generate a simple caption from an uploaded image filename and optional prompt."""

    def __init__(self, model: Optional[str] = None):
        self.model = model

    def generate_caption(self, image_path: str, prompt: Optional[str] = None) -> str:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        cleaned_name = base_name.replace("_", " ").replace("-", " ").strip()
        if not cleaned_name:
            cleaned_name = "uploaded image"

        if prompt and prompt.strip():
            return f"{prompt.strip()} — {cleaned_name.title()}"

        return f"A vivid scene featuring {cleaned_name.title()}"
