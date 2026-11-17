/**
 * Quotes100 - Vanilla JavaScript Application
 * Handles API calls, state management, search/filter interactions, and UI animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Hero
  const heroCard = document.getElementById('hero-card');
  const heroQuoteText = document.getElementById('hero-quote-text');
  const heroAuthor = document.getElementById('hero-author');
  const heroCategory = document.getElementById('hero-category');
  const heroYear = document.getElementById('hero-year');
  const btnNewQuote = document.getElementById('btn-new-quote');
  const btnCopyHero = document.getElementById('btn-copy-hero');
  const btnTweetHero = document.getElementById('btn-tweet-hero');

  // DOM Elements - Search & Filters
  const searchInput = document.getElementById('search-input');
  const btnClearSearch = document.getElementById('btn-clear-search');
  const authorSelect = document.getElementById('author-select');
  const categoryPills = document.getElementById('category-pills');
  const btnResetFilters = document.getElementById('btn-reset-filters');
  const btnEmptyReset = document.getElementById('btn-empty-reset');

  // DOM Elements - Results & Meta
  const quotesGrid = document.getElementById('quotes-grid');
  const emptyState = document.getElementById('empty-state');
  const resultsCount = document.getElementById('results-count');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const toast = document.getElementById('toast');

  // Application State
  const state = {
    currentHeroQuote: null,
    search: '',
    category: '',
    author: '',
    quotes: [],
    categories: [],
    authors: [],
    debounceTimer: null,
    toastTimer: null
  };

  /* ==========================================================================
     API Calls
     ========================================================================== */

  /**
   * Fetch a random quote from the server.
   * If a category is selected, optionally bias or search within category.
   */
  async function fetchRandomQuote() {
    try {
      btnNewQuote.disabled = true;
      btnNewQuote.classList.add('loading');

      let url = '/api/quotes/random';
      const params = new URLSearchParams();
      if (state.category) {
        params.append('category', state.category);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      let res = await fetch(url);
      if (!res.ok) {
        // Fallback to purely random if category has no quotes
        res = await fetch('/api/quotes/random');
      }

      const data = await res.json();
      if (data && data.quote) {
        setHeroQuote(data.quote);
      }
    } catch (err) {
      console.error('Failed to load random quote:', err);
      showToast('Could not load random quote. Please try again.');
    } finally {
      btnNewQuote.disabled = false;
      btnNewQuote.classList.remove('loading');
    }
  }

  /**
   * Fetch categories from backend API and render category pills.
   */
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      state.categories = data.categories || [];
      renderCategoryPills();
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  /**
   * Fetch authors from backend API and populate author dropdown.
   */
  async function fetchAuthors() {
    try {
      const res = await fetch('/api/authors');
      if (!res.ok) throw new Error('Failed to fetch authors');
      const data = await res.json();
      state.authors = data.authors || [];
      populateAuthorSelect();
    } catch (err) {
      console.error('Error fetching authors:', err);
    }
  }

  /**
   * Fetch filtered quotes according to active search, author, and category filters.
   */
  async function fetchQuotes() {
    try {
      const params = new URLSearchParams();
      if (state.search.trim()) {
        params.append('search', state.search.trim());
      }
      if (state.author) {
        params.append('author', state.author);
      }
      if (state.category) {
        params.append('category', state.category);
      }

      const url = `/api/quotes?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const data = await res.json();

      state.quotes = data.quotes || [];
      renderQuotesGrid(state.quotes, data.total || 100);
    } catch (err) {
      console.error('Error fetching quotes:', err);
      showToast('Error loading quotes.');
    }
  }

  /* ==========================================================================
     Render Functions
     ========================================================================== */

  /**
   * Set and animate the hero spotlight quote.
   */
  function setHeroQuote(quoteObj) {
    if (!quoteObj) return;
    state.currentHeroQuote = quoteObj;

    // Smooth fade effect
    heroQuoteText.style.opacity = '0';
    heroAuthor.style.opacity = '0';

    setTimeout(() => {
      heroQuoteText.textContent = quoteObj.quote;
      heroAuthor.textContent = quoteObj.author;
      heroCategory.textContent = quoteObj.category || 'General';
      heroYear.textContent = quoteObj.year ? `${quoteObj.year}` : '';

      // Update Twitter share link
      const tweetText = `"${quoteObj.quote}" — ${quoteObj.author}`;
      btnTweetHero.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

      heroQuoteText.style.opacity = '1';
      heroAuthor.style.opacity = '1';
    }, 150);
  }

  /**
   * Render category filter pills.
   */
  function renderCategoryPills() {
    // Preserve "All" button
    const allPill = document.createElement('button');
    allPill.type = 'button';
    allPill.className = `pill ${state.category === '' ? 'active' : ''}`;
    allPill.dataset.category = '';
    allPill.textContent = 'All';

    categoryPills.innerHTML = '';
    categoryPills.appendChild(allPill);

    state.categories.forEach(cat => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `pill ${state.category.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`;
      pill.dataset.category = cat.name;
      pill.textContent = `${cat.name} (${cat.count})`;
      categoryPills.appendChild(pill);
    });
  }

  /**
   * Populate author dropdown.
   */
  function populateAuthorSelect() {
    const currentVal = state.author;
    authorSelect.innerHTML = '<option value="">All Authors</option>';

    state.authors.forEach(auth => {
      const opt = document.createElement('option');
      opt.value = auth.name;
      opt.textContent = `${auth.name} (${auth.count})`;
      if (auth.name.toLowerCase() === currentVal.toLowerCase()) {
        opt.selected = true;
      }
      authorSelect.appendChild(opt);
    });
  }

  /**
   * Render the quotes grid cards.
   */
  function renderQuotesGrid(quotes, total) {
    quotesGrid.innerHTML = '';

    if (!quotes || quotes.length === 0) {
      quotesGrid.style.display = 'none';
      emptyState.style.display = 'block';
      resultsCount.textContent = 'Showing 0 quotes';
      return;
    }

    quotesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    resultsCount.textContent = `Showing ${quotes.length} of ${total} quotes`;

    quotes.forEach((q, index) => {
      const card = document.createElement('article');
      card.className = 'quote-card fade-in';
      card.style.animationDelay = `${Math.min(index * 20, 300)}ms`;
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Quote by ${q.author}`);

      card.innerHTML = `
        <div class="card-top">
          <span class="card-category-tag">${escapeHtml(q.category || 'General')}</span>
          <span class="card-year">${q.year ? escapeHtml(q.year) : ''}</span>
        </div>
        <p class="card-quote-text">${escapeHtml(q.quote)}</p>
        <div class="card-footer">
          <span class="card-author">${escapeHtml(q.author)}</span>
          <button type="button" class="card-copy-btn" title="Copy quote to clipboard" aria-label="Copy quote to clipboard" data-id="${q.id}">
            <span class="btn-copy-icon">📋</span> <span class="btn-copy-text">Copy</span>
          </button>
        </div>
      `;

      // Spotlight quote when card is clicked
      card.addEventListener('click', (e) => {
        // If copy button was clicked, don't spotlight
        if (e.target.closest('.card-copy-btn')) return;
        setHeroQuote(q);
        heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Accessible enter/space key
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!e.target.closest('.card-copy-btn')) {
            e.preventDefault();
            setHeroQuote(q);
            heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });

      // Copy button inside card with in-place visual feedback
      const copyBtn = card.querySelector('.card-copy-btn');
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await copyQuoteToClipboard(q);
        const iconSpan = copyBtn.querySelector('.btn-copy-icon');
        const textSpan = copyBtn.querySelector('.btn-copy-text');
        copyBtn.classList.add('copied');
        if (iconSpan) iconSpan.textContent = '✓';
        if (textSpan) textSpan.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          if (iconSpan) iconSpan.textContent = '📋';
          if (textSpan) textSpan.textContent = 'Copy';
        }, 2000);
      });

      quotesGrid.appendChild(card);
    });
  }

  /* ==========================================================================
     Helper Functions
     ========================================================================== */

  /**
   * Escape HTML entities to prevent XSS.
   */
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Copy quote text and attribution to clipboard.
   */
  async function copyQuoteToClipboard(quoteObj) {
    if (!quoteObj) return;
    const textToCopy = `"${quoteObj.quote}" — ${quoteObj.author}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Quote copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy quote:', err);
      showToast('Could not copy to clipboard.');
    }
  }

  /**
   * Show toast notification message.
   */
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  /**
   * Reset all search and filter controls.
   */
  function resetAllFilters() {
    state.search = '';
    state.category = '';
    state.author = '';
    searchInput.value = '';
    btnClearSearch.style.display = 'none';
    authorSelect.value = '';

    // Update active pill
    const pills = categoryPills.querySelectorAll('.pill');
    pills.forEach(p => {
      if (p.dataset.category === '') {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    fetchQuotes();
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  // Hero Actions
  btnNewQuote.addEventListener('click', () => {
    fetchRandomQuote();
  });

  btnCopyHero.addEventListener('click', () => {
    if (state.currentHeroQuote) {
      copyQuoteToClipboard(state.currentHeroQuote);
    }
  });

  // Search input with debounce
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    btnClearSearch.style.display = state.search ? 'block' : 'none';

    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(() => {
      fetchQuotes();
    }, 250);
  });

  // Clear search button
  btnClearSearch.addEventListener('click', () => {
    state.search = '';
    searchInput.value = '';
    btnClearSearch.style.display = 'none';
    fetchQuotes();
    searchInput.focus();
  });

  // Author Select
  authorSelect.addEventListener('change', (e) => {
    state.author = e.target.value;
    fetchQuotes();
  });

  // Category Pills (delegation)
  categoryPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    const category = pill.dataset.category;
    state.category = category;

    // Update visual active state
    categoryPills.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    fetchQuotes();
  });

  // Reset Buttons
  btnResetFilters.addEventListener('click', resetAllFilters);
  btnEmptyReset.addEventListener('click', resetAllFilters);

  // Export to CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportQuotesToCsv);
  }

  /**
   * Export currently filtered quotes to a CSV file.
   */
  function exportQuotesToCsv() {
    if (!state.quotes || state.quotes.length === 0) {
      showToast('No quotes available to export.');
      return;
    }

    const params = new URLSearchParams();
    if (state.search.trim()) {
      params.append('search', state.search.trim());
    }
    if (state.author) {
      params.append('author', state.author);
    }
    if (state.category) {
      params.append('category', state.category);
    }

    const url = `/api/quotes/export${params.toString() ? '?' + params.toString() : ''}`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'quotes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${state.quotes.length} quote${state.quotes.length === 1 ? '' : 's'} to CSV!`);
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */
  fetchRandomQuote();
  fetchCategories();
  fetchAuthors();
  fetchQuotes();
});
