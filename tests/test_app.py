import os
import sys
import json
import pytest

# Add parent directory to sys.path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, QUOTES, QUOTES_FILE


@pytest.fixture
def client():
    """Create a Flask test client."""
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestQuotesData:
    """Validate the quotes dataset integrity."""

    def test_quotes_file_exists(self):
        assert os.path.exists(QUOTES_FILE), "quotes.json file must exist"

    def test_total_quotes_count(self):
        assert len(QUOTES) == 100, f"Expected 100 quotes, found {len(QUOTES)}"

    def test_quote_fields_and_types(self):
        ids = set()
        for q in QUOTES:
            assert "id" in q and isinstance(q["id"], int)
            assert "quote" in q and isinstance(q["quote"], str) and len(q["quote"].strip()) > 0
            assert "author" in q and isinstance(q["author"], str) and len(q["author"].strip()) > 0
            assert "category" in q and isinstance(q["category"], str) and len(q["category"].strip()) > 0
            assert q["id"] not in ids, f"Duplicate quote id: {q['id']}"
            ids.add(q["id"])

        assert len(ids) == 100


class TestWebRoutes:
    """Validate web endpoints and pages."""

    def test_index_page(self, client):
        response = client.get("/")
        assert response.status_code == 200
        html = response.get_data(as_text=True)
        assert "Quotes100" in html
        assert "New Random Quote" in html
        assert "Search &amp; Filter Quotes" in html or "Search & Filter Quotes" in html


class TestApiRandomQuote:
    """Validate /api/quotes/random endpoint."""

    def test_random_quote_success(self, client):
        response = client.get("/api/quotes/random")
        assert response.status_code == 200
        data = response.get_json()
        assert "quote" in data
        assert "id" in data["quote"]
        assert "author" in data["quote"]
        assert "quote" in data["quote"]
        assert "category" in data["quote"]

    def test_random_quote_with_category_filter(self, client):
        response = client.get("/api/quotes/random?category=Science")
        assert response.status_code == 200
        data = response.get_json()
        assert data["quote"]["category"].lower() == "science"

    def test_random_quote_with_author_filter(self, client):
        response = client.get("/api/quotes/random?author=Einstein")
        assert response.status_code == 200
        data = response.get_json()
        assert "Einstein" in data["quote"]["author"]

    def test_random_quote_not_found(self, client):
        response = client.get("/api/quotes/random?author=NonExistentPersonXYZ")
        assert response.status_code == 404
        data = response.get_json()
        assert "error" in data


class TestApiQuotesList:
    """Validate /api/quotes listing and filtering endpoint."""

    def test_get_all_quotes(self, client):
        response = client.get("/api/quotes")
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] == 100
        assert data["total"] == 100
        assert len(data["quotes"]) == 100

    def test_filter_by_author(self, client):
        response = client.get("/api/quotes?author=Shakespeare")
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] >= 1
        for q in data["quotes"]:
            assert "Shakespeare" in q["author"]

    def test_filter_by_category(self, client):
        response = client.get("/api/quotes?category=Philosophy")
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] >= 1
        for q in data["quotes"]:
            assert q["category"].lower() == "philosophy"

    def test_search_by_keyword(self, client):
        response = client.get("/api/quotes?q=courage")
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] >= 1
        for q in data["quotes"]:
            match = ("courage" in q["quote"].lower() or 
                     "courage" in q["author"].lower() or 
                     "courage" in q["category"].lower())
            assert match

    def test_combined_search_filters(self, client):
        response = client.get("/api/quotes?category=Science&author=Einstein")
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] >= 1
        for q in data["quotes"]:
            assert q["category"].lower() == "science"
            assert "einstein" in q["author"].lower()

    def test_no_matches_empty_list(self, client):
        response = client.get("/api/quotes?q=completelyunmatchedterm12345")
        assert response.status_code == 200
        data = response.get_json()
        assert data["count"] == 0
        assert data["quotes"] == []


class TestApiCategoriesAndAuthors:
    """Validate /api/categories and /api/authors endpoints."""

    def test_get_categories(self, client):
        response = client.get("/api/categories")
        assert response.status_code == 200
        data = response.get_json()
        assert "categories" in data
        assert len(data["categories"]) > 0

        total_counted = sum(item["count"] for item in data["categories"])
        assert total_counted == 100

    def test_get_authors(self, client):
        response = client.get("/api/authors")
        assert response.status_code == 200
        data = response.get_json()
        assert "authors" in data
        assert len(data["authors"]) > 0

        total_counted = sum(item["count"] for item in data["authors"])
        assert total_counted == 100


class TestApiExportCsv:
    """Validate /api/quotes/export CSV endpoint."""

    def test_export_all_quotes_csv(self, client):
        response = client.get("/api/quotes/export")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("Content-Type", "")
        assert "attachment; filename=quotes.csv" in response.headers.get("Content-Disposition", "")

        csv_text = response.get_data(as_text=True)
        # Check UTF-8 BOM
        assert csv_text.startswith("\ufeff")
        lines = csv_text.strip().splitlines()
        # 1 header line + 100 data rows
        assert len(lines) == 101
        assert "id,quote,author,category,year" in lines[0]

    def test_export_filtered_quotes_csv(self, client):
        response = client.get("/api/quotes/export?category=Science")
        assert response.status_code == 200
        csv_text = response.get_data(as_text=True)
        lines = csv_text.strip().splitlines()
        # Header + science quotes
        assert len(lines) > 1
        for row in lines[1:]:
            assert "Science" in row
