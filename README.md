# Quotes100 — 100 Famous Quotes Web Application

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-black.svg)](https://flask.palletsprojects.com/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed-brightgreen.svg)]()
[![Code Style](https://img.shields.io/badge/JavaScript-Vanilla%20ES6%2B-yellow.svg)]()
[![Repository](https://img.shields.io/badge/GitHub-Daps--famous--quotes-blue?logo=github)](https://github.com/Annovolt/Daps-famous-quotes)

An interactive, responsive Single-Page Application (SPA) built with **Plain Vanilla JavaScript (ES6+)**, **HTML5**, **CSS3**, and **Python Flask**. The application delivers random and curated quotes from a collection of 100 historical, philosophical, and scientific thinkers, featuring real-time search, multi-faceted filtering, and a clean RESTful API.

---

## 🌟 Key Features

- **🎲 Spotlight Hero Quote**: Features a highlighted quote with smooth CSS fade transitions, one-click clipboard copying (with toast notifications), and instant Twitter/X sharing.
- **📋 Copy to Clipboard on Every Quote**: Interactive copy button on each quote card with instant in-place visual confirmation (`✓ Copied!`) and toast feedback.
- **📥 Export to CSV**: One-click export of matching/filtered quotes to an Excel-ready UTF-8 CSV file.
- **🔍 Debounced Real-Time Search**: Instant full-text filtering across quotes, authors, and categories with a 300ms debounce to optimize performance.
- **🏷️ Interactive Category Pills**: Visual filter tags displaying live quote counts for each category (*Philosophy, Science, Inspiration, Wisdom, Leadership, Life, Literature, Art, Humor*).
- **✍️ Author Filter Dropdown**: Easily explore quotes by specific historical figures and philosophers.
- **📱 Responsive & Modern UI**: Fluid CSS grid and flexbox layout with custom typography, dark-mode styling, and zero heavy frontend dependencies.
- **⚡ RESTful JSON & CSV API**: Clean, documented endpoints for random quotes, filtering, CSV exports, and metadata aggregation.
- **🧪 Comprehensive Test Suite**: 18 automated unit and integration tests covering the dataset, web routes, CSV exports, and API endpoints.

---

## 🏗️ Architecture: Server vs. Client

```
┌─────────────────────────────────────────────────────────────┐
│                 Client-Side (Browser)                       │
│  index.html  ◄──►  style.css  ◄──►  app.js (State & Fetch)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API
┌──────────────────────────────▼──────────────────────────────┐
│                  Server-Side (Flask)                        │
│  app.py (Routing & Filtering) ◄──► quotes.json (Dataset)    │
└─────────────────────────────────────────────────────────────┘
```

- **Server-Side (`app.py`)**: Flask backend handles HTTP requests, serves the single-page HTML, loads `quotes.json` into memory, and exposes RESTful JSON endpoints with multi-criteria filtering logic.
- **Client-Side (`app.js`)**: Manages UI state, triggers asynchronous `fetch()` calls to the backend, handles user input debouncing, and dynamically updates the DOM.

---

## 🚀 Quick Start & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Annovolt/Daps-famous-quotes.git
cd Daps-famous-quotes
```

### 2. Create and Activate Virtual Environment

**On Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**On macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 📚 API Reference

All API responses return JSON with standard HTTP status codes.

### 1. Get a Random Quote
`GET /api/quotes/random`

Returns a single randomly selected quote. Supports optional query parameters to filter before picking.

- **Query Parameters**:
  - `category` *(optional)*: Filter by category (e.g. `Science`)
  - `author` *(optional)*: Filter by author name (e.g. `Einstein`)
  - `search` or `q` *(optional)*: Full-text search keyword

**Sample Response (`200 OK`):**
```json
{
  "quote": {
    "id": 2,
    "quote": "In the middle of difficulty lies opportunity.",
    "author": "Albert Einstein",
    "category": "Science",
    "year": "1940"
  },
  "total_matched": 12
}
```

---

### 2. Get All Quotes (with Filtering)
`GET /api/quotes`

Returns an array of quotes matching the filter criteria.

- **Query Parameters**:
  - `search` or `q` *(optional)*: Substring match across quote, author, and category
  - `author` *(optional)*: Case-insensitive author search
  - `category` *(optional)*: Exact category match

**Sample Response (`200 OK`):**
```json
{
  "count": 2,
  "total": 100,
  "quotes": [
    {
      "id": 2,
      "quote": "In the middle of difficulty lies opportunity.",
      "author": "Albert Einstein",
      "category": "Science",
      "year": "1940"
    },
    {
      "id": 14,
      "quote": "Imagination is more important than knowledge.",
      "author": "Albert Einstein",
      "category": "Science",
      "year": "1929"
    }
  ]
}
```

---

### 3. Export Quotes to CSV
`GET /api/quotes/export`

Exports matching quotes as a downloadable CSV file formatted with UTF-8 BOM for Microsoft Excel / Google Sheets compatibility.

- **Query Parameters**: Same optional filters as `/api/quotes` (`search`, `category`, `author`).
- **Response Headers**: `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename=quotes.csv`

---

### 4. Get Categories
`GET /api/categories`

Returns all unique categories sorted alphabetically with quote counts.

**Sample Response (`200 OK`):**
```json
{
  "total_categories": 9,
  "categories": [
    { "name": "Art", "count": 6 },
    { "name": "Inspiration", "count": 22 },
    { "name": "Philosophy", "count": 28 },
    { "name": "Science", "count": 12 }
  ]
}
```

---

### 4. Get Authors
`GET /api/authors`

Returns all unique authors sorted alphabetically with individual quote counts.

**Sample Response (`200 OK`):**
```json
{
  "total_authors": 62,
  "authors": [
    { "name": "Albert Einstein", "count": 4 },
    { "name": "Aristotle", "count": 3 },
    { "name": "Maya Angelou", "count": 2 },
    { "name": "Socrates", "count": 3 }
  ]
}
```

---

## 🧪 Running Automated Tests

The project includes automated unit and integration tests using `pytest`.

```powershell
pytest -v
```

### Test Coverage Summary (18 Tests):
- **`TestQuotesData`**: Validates `quotes.json` schema, non-empty fields, IDs, and 100 total quote count.
- **`TestWebRoutes`**: Verifies `/` route returns HTML and HTTP 200.
- **`TestApiRandomQuote`**: Tests random selection, category filtering, author filtering, and 404 behavior.
- **`TestApiQuotesList`**: Tests list retrieval, keyword search, multi-filter combinations, and empty match handling.
- **`TestApiCategoriesAndAuthors`**: Validates category and author aggregation and sorting.
- **`TestApiExportCsv`**: Validates CSV exports for all quotes and filtered views, headers, UTF-8 BOM, and line counts.

---

## 📁 Project Structure

```text
famous_quotes_daps/
├── .gitignore             # Git ignore configuration for Python, Flask, OS, & IDEs
├── app.py                 # Flask server, route definitions, and API logic
├── quotes.json            # Curated dataset containing 100 famous quotes
├── README.md              # Project documentation
├── requirements.txt       # Python dependencies (Flask, pytest)
├── static/
│   ├── css/
│   │   └── style.css      # Vanilla CSS3 styles (grid, flexbox, transitions, dark theme)
│   └── js/
│       └── app.js         # Vanilla ES6+ JS (state, fetch API client, debounce, DOM)
├── templates/
│   └── index.html         # Semantic HTML5 Single-Page Application template
└── tests/
    └── test_app.py        # 16 automated pytest unit & integration tests
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, Flask 3.0+
- **Frontend**: Vanilla JavaScript (ES6+), Semantic HTML5, CSS3
- **Testing**: pytest 8.0+
- **Data Format**: JSON

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
