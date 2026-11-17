# Quotes100 — 100 Famous Quotes Web Application

An interactive web application built with **Plain Vanilla JavaScript**, **HTML5**, **CSS3**, and **Python Flask** that delivers random quotes from a curated collection of 100 well-known historical and philosophical quotes, with real-time search and filtering by author and categories.

---

## Features

- **🎲 Random Quote Generator**: Displays a featured quote in an editorial spotlight hero card with a smooth fade animation on every "New Random Quote" click.
- **🔍 Real-Time Search**: Instant, debounced full-text search across quote content, author names, and categories.
- **🏷️ Category Filtering**: Filter by categories with live count chips (*Philosophy, Science, Inspiration, Wisdom, Leadership, Life, Literature, Art, Humor*).
- **✍️ Author Filter**: Dropdown with all unique thinkers and thinkers' quote counts.
- **📋 Clipboard & Sharing**: One-click "Copy Quote" with toast feedback and instant Twitter/X sharing.
- **📱 Responsive & Modern UI**: Fluid CSS grid and flexbox, typography, and dark-mode aesthetic without third-party frameworks.
- **⚡ RESTful JSON API**: Clean endpoints for random quote fetching, filtering, and metadata.

---

## Project Structure

```text
famous_quotes_daps/
├── .venv/                  # Python virtual environment
├── app.py                  # Flask backend server & REST API
├── quotes.json             # 100 curated quotes dataset
├── requirements.txt        # Python dependencies (Flask, pytest)
├── static/
│   ├── css/
│   │   └── style.css       # Vanilla CSS3 styling, animations, responsive layout
│   └── js/
│       └── app.js          # Vanilla JavaScript (ES6+), DOM manipulation & API client
├── templates/
│   └── index.html          # Semantic HTML5 Single Page Application template
└── tests/
    └── test_app.py         # 16 automated unit & integration tests
```

---

## Quick Start

### 1. Activate Environment
In PowerShell:
```powershell
cd famous_quotes_daps
.\.venv\Scripts\Activate.ps1
```

*(Or use the python binary directly: `.\.venv\Scripts\python.exe`)*

### 2. Run the Application
```powershell
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## Running Automated Tests

Run the test suite with pytest:
```powershell
.\.venv\Scripts\pytest.exe tests/test_app.py -v
```

All 16 tests verify:
- Complete dataset schema and 100 unique quotes
- Web page rendering
- Random quote generation with and without filters
- Multi-parameter search queries (author, category, keyword)
- Categories and authors aggregation endpoints
