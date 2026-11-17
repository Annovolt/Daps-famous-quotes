import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

QUOTES_FILE = os.path.join(os.path.dirname(__file__), "quotes.json")


def load_quotes():
    """Load quotes from the JSON dataset."""
    try:
        with open(QUOTES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        app.logger.error(f"Error loading quotes: {e}")
        return []


QUOTES = load_quotes()


def filter_quotes(quotes, query=None, author=None, category=None):
    """Filter quotes list by search query, author, and category."""
    filtered = quotes

    if category:
        category_lower = category.strip().lower()
        filtered = [
            q for q in filtered
            if q.get("category", "").strip().lower() == category_lower
        ]

    if author:
        author_lower = author.strip().lower()
        filtered = [
            q for q in filtered
            if author_lower in q.get("author", "").strip().lower()
        ]

    if query:
        q_lower = query.strip().lower()
        filtered = [
            q for q in filtered
            if q_lower in q.get("quote", "").lower()
            or q_lower in q.get("author", "").lower()
            or q_lower in q.get("category", "").lower()
        ]

    return filtered


@app.route("/")
def index():
    """Render the main single-page application."""
    return render_template("index.html")


@app.route("/api/quotes/random", methods=["GET"])
def get_random_quote():
    """
    Return a single random quote.
    Supports optional filters: category, author, search.
    """
    category = request.args.get("category")
    author = request.args.get("author")
    search = request.args.get("search") or request.args.get("q")

    matched = filter_quotes(QUOTES, query=search, author=author, category=category)

    if not matched:
        return jsonify({
            "error": "No quotes found matching the specified criteria.",
            "count": 0
        }), 404

    selected = random.choice(matched)
    return jsonify({
        "quote": selected,
        "total_matched": len(matched)
    })


@app.route("/api/quotes", methods=["GET"])
def get_quotes():
    """
    Return all quotes matching optional filters.
    Query params:
      - search / q: text query
      - author: author name (exact or substring)
      - category: category name
    """
    category = request.args.get("category")
    author = request.args.get("author")
    search = request.args.get("search") or request.args.get("q")

    matched = filter_quotes(QUOTES, query=search, author=author, category=category)

    return jsonify({
        "quotes": matched,
        "count": len(matched),
        "total": len(QUOTES)
    })


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """Return all unique categories sorted alphabetically with occurrence count."""
    category_counts = {}
    for q in QUOTES:
        cat = q.get("category", "Uncategorized").strip()
        category_counts[cat] = category_counts.get(cat, 0) + 1

    sorted_categories = [
        {"name": cat, "count": count}
        for cat, count in sorted(category_counts.items(), key=lambda x: x[0])
    ]

    return jsonify({
        "categories": sorted_categories,
        "total_categories": len(sorted_categories)
    })


@app.route("/api/authors", methods=["GET"])
def get_authors():
    """Return all unique authors sorted alphabetically with occurrence count."""
    author_counts = {}
    for q in QUOTES:
        auth = q.get("author", "Unknown").strip()
        author_counts[auth] = author_counts.get(auth, 0) + 1

    sorted_authors = [
        {"name": auth, "count": count}
        for auth, count in sorted(author_counts.items(), key=lambda x: x[0])
    ]

    return jsonify({
        "authors": sorted_authors,
        "total_authors": len(sorted_authors)
    })


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
