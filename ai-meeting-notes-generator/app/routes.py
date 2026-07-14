import os
from pathlib import Path
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename

from utils.caption_generator import ImageCaptionGenerator


def register_routes(app: Flask) -> None:
    app.config.setdefault("UPLOAD_FOLDER", "uploads")
    app.config.setdefault("MAX_CONTENT_LENGTH", 16 * 1024 * 1024)

    @app.route("/", methods=["GET", "POST"])
    def index():
        if request.method == "POST":
            if "image" not in request.files:
                return render_template("index.html", error="Please upload an image.")

            image_file = request.files["image"]
            if image_file.filename == "":
                return render_template("index.html", error="Please upload an image.")

            prompt = request.form.get("prompt", "")
            filename = secure_filename(image_file.filename)
            upload_dir = Path(app.config["UPLOAD_FOLDER"])
            upload_dir.mkdir(exist_ok=True)
            save_path = upload_dir / filename
            image_file.save(save_path)

            generator = ImageCaptionGenerator()
            caption = generator.generate_caption(str(save_path), prompt=prompt)
            return redirect(url_for("result", caption=caption, image_name=filename))

        return render_template("index.html")

    @app.route("/result")
    def result():
        caption = request.args.get("caption", "A generated image caption")
        image_name = request.args.get("image_name", "")
        return render_template("result.html", caption=caption, image_name=image_name)
