let quotes = [];

window.onload = function () {
  const storedQuotes = localStorage.getItem('quotes');
  const storedFilter = localStorage.getItem('selectedCategory');

  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    ];
    saveQuotes();
  }

  populateCategories();

  // Restore filter if it was saved
  if (storedFilter) {
    document.getElementById('categoryFilter').value = storedFilter;
    filterQuotes();
  }
};

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  let filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    document.getElementById('quoteDisplay').innerText = "No quotes in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  document.getElementById('quoteDisplay').innerText = `"${quote.text}" (${quote.category})`;

  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    alert('Quote added!');
  } else {
    alert('Please enter both quote text and category.');
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON structure.');
      }
    } catch (err) {
      alert('Failed to import. Invalid JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// 🔁 Populate dropdown with unique categories
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const currentValue = select.value;
  select.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });

  // Restore previous selection if it exists
  if (categories.includes(currentValue)) {
    select.value = currentValue;
  }
}

// 🧠 Filter quotes by category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote(); // Show a quote from the selected category
}
// --- Task 3: Server Sync Simulation and Conflict Resolution ---

// Fake sync URL (this could be replaced with a real API in the future)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Fetch quotes from "server" every 15 seconds
setInterval(syncWithServer, 15000);

function syncWithServer() {
  fetch(SERVER_URL)
    .then(res => res.json())
    .then(serverData => {
      // Simulate converting posts to quotes (limit to first 5)
      const serverQuotes = serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "ServerSync"
      }));

      const localString = JSON.stringify(quotes.slice(0, 5));
      const serverString = JSON.stringify(serverQuotes);

      if (localString !== serverString) {
        quotes = [...quotes, ...serverQuotes];
        saveQuotes();
        populateCategories();
        notifyUser("Quotes synced with server. Server data took precedence.");
      }
    })
    .catch(err => {
      console.error("Sync failed:", err);
    });
}

function notifyUser(message) {
  const existing = document.getElementById('syncNotification');
  if (existing) existing.remove();

  const alertBox = document.createElement('div');
  alertBox.id = 'syncNotification';
  alertBox.textContent = message;
  alertBox.style = "background: #ffc; padding: 10px; border: 1px solid #cc0; margin: 10px 0;";
  document.body.prepend(alertBox);

  setTimeout(() => alertBox.remove(), 5000);
}
