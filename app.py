import json
import urllib.request
import urllib.error

from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen3:0.6b"


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(".", filename)


@app.route("/api/generate", methods=["POST"])
def generate_story():
    try:
        data = request.get_json(silent=True) or {}

        idea = str(data.get("prompt", "")).strip()
        genre = str(data.get("genre", "Fantasy")).strip()
        length = str(data.get("length", "Medium")).strip()

        if not idea:
            return jsonify({
                "error": "Please enter a story idea."
            }), 400

        if len(idea) > 1000:
            return jsonify({
                "error": "Please keep your story idea under 1000 characters."
            }), 400

        prompt = f"""
/no_think

You are a creative storyteller.

Write an original fictional story based on this idea:
{idea}

Genre: {genre}
Length: {length}

Requirements:
- Start directly with a creative story title.
- Write the actual story, not an explanation of the user's request.
- Do not describe your planning or thinking process.
- Do not write phrases like "The user wants" or "I should create".
- Include a beginning, middle and satisfying ending.
- Create original characters and events.
- Use engaging and simple language.
- Return only the finished story.
"""

        payload = {
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "think": False
        }

        req = urllib.request.Request(
            OLLAMA_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=180) as response:
            result = json.loads(response.read().decode("utf-8"))

        story = result.get("response", "").strip()

        if not story:
            return jsonify({
                "error": "AI did not return a story. Please try again."
            }), 500

        return jsonify({"story": story})

    except urllib.error.URLError as error:
        print("Ollama connection error:", error)
        return jsonify({
            "error": "Cannot connect to Ollama. Please check whether Ollama is running."
        }), 503

    except Exception as error:
        print("Story generation error:", error)
        return jsonify({
            "error": "Story generation failed. Please try again."
        }), 500


if __name__ == "__main__":
    app.run(debug=True)