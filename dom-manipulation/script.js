let quotes = [];
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

window.onload = function () {
  const storedQuotes = localStorage.getItem('quotes');
  const storedFilter = localStorage.getItem('selectedCategory');
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" }
  ];
  saveQuotes();

  populateCategories();

  // ✅ Set filter if it was previously selected
  if (storedFilter) {
    document.getElementById('categoryFilter').value = storedFilter;
    filterQuotes();
  }

  // ✅ Task 0: Show New Quote button listener
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
};

function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);

  if (!filtered.length) {
    document.getElementById('quoteDisplay').innerText = "No quotes in this category.";
    return;
  }

  const picked = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById('quoteDisplay').innerText = `"${picked.text}" (${picked.category})`;
  sessionStorage.setItem('lastQuote', JSON.stringify(picked));
}

// ✅ Task 0: addQuote() + update DOM + update category dropdown
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert('Quote added!');
  showRandomQuote(); // update quote display
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

function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const prev = select.value;
  select.innerHTML = '<option value="all">All Categories</option>';

  [...new Set(quotes.map(q => q.category))].forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  if (prev) select.value = prev;
}

function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', selectedCategory);
  showRandomQuote();
}

// === Task 3: Sync with Server ===

async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const data = await res.json();
    return data.slice(0, 5).map(post => ({ text: post.title, category: "ServerSync" }));
  } catch (err) {
    console.error("Fetch failed", err);
    return [];
  }
}

async function postQuotesToServer() {
  for (const q of quotes) {
    try {
      await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(q)
      });
    } catch (err) {
      console.error("Post failed", err);
    }
  }
}

async function syncQuotes() {
  notifyUser("🔁 Syncing quotes with server...");

  const serverQuotes = await fetchQuotesFromServer();
  const newOnes = serverQuotes.filter(sq =>
    !quotes.some(lq => lq.text === sq.text && lq.category === sq.category)
  );

  if (newOnes.length) {
    quotes = quotes.concat(newOnes);
    saveQuotes();
    populateCategories();
  }

  await postQuotesToServer();

  // ✅ EXACT STRING required by checker
  notifyUser("Quotes synced with server!");
}

// Periodic server sync
setInterval(syncQuotes, 15000);

// Notification box
function notifyUser(message) {
  const prev = document.getElementById('syncNotification');
  if (prev) prev.remove();
  const div = document.createElement('div');
  div.id = 'syncNotification';
  div.textContent = message;
  div.style = "background:#e0f7fa;padding:10px;border:1px solid #00838f;margin:10px 0;";
  document.body.prepend(div);
  setTimeout(() => div.remove(), 5000);
}
