// Dark mode toggle
function toggleDark() {
  const isDark = document.body.classList.toggle('dark-mode');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('fc-dark', isDark ? '1' : '0');
}

// Persist dark mode across page loads
if (localStorage.getItem('fc-dark') === '1') {
  document.body.classList.add('dark-mode');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = '☀️';
}

// Only run flashcard-specific code if we're on the flashcards page
if (document.getElementById('flashcard')) {

// Card search
let searchQuery = '';
function searchCards(val) {
  searchQuery = val.trim().toLowerCase();
  if (!searchQuery) {
    renderDeckList();
    return;
  }
  const list = document.getElementById('deckList');
  const filtered = cards
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.q.toLowerCase().includes(searchQuery) || c.a.toLowerCase().includes(searchQuery));
  if (filtered.length === 0) {
    list.innerHTML = '<div style="font-size:0.82rem;color:#aaa;padding:8px 12px;">No cards match your search.</div>';
    return;
  }
  list.innerHTML = filtered.map(({ c, i }) => {
    let cls = 'fc-deck-item';
    if (i === currentIndex) cls += ' active';
    else if (knowSet.has(i)) cls += ' done';
    const label = c.q.length > 34 ? c.q.slice(0, 34) + '…' : c.q;
    return `<div class="${cls}" onclick="goToCard(${i})">
      <span>${label}</span>
      <span class="fc-deck-item-num">${i + 1}</span>
    </div>`;
  }).join('');
}

const decks = {
  webdev: [
    { q: 'What does HTML stand for?', a: 'HyperText Markup Language — the standard language for creating web pages.' },
    { q: 'What is the CSS Box Model?', a: 'A box that wraps every HTML element: Content → Padding → Border → Margin.' },
    { q: 'What is the difference between id and class in CSS?', a: 'An id is unique (one per page); a class can be reused on multiple elements.' },
    { q: 'What does "responsive design" mean?', a: 'A design approach where a page adapts its layout to different screen sizes using fluid grids, flexible images, and media queries.' },
    { q: 'What is Flexbox?', a: 'A CSS layout model that arranges items in a row or column, distributing space and aligning content efficiently.' },
    { q: 'What is the DOM?', a: 'The Document Object Model — a tree-like representation of an HTML page that JavaScript can read and manipulate.' },
    { q: 'What is the difference between == and === in JavaScript?', a: '== checks value equality with type coercion; === checks both value and type (strict equality).' },
    { q: 'What is a REST API?', a: 'An architectural style for web services that uses HTTP methods (GET, POST, PUT, DELETE) to perform operations on resources.' },
  ],
  python: [
    { q: 'What is a Python list?', a: 'An ordered, mutable collection of items enclosed in square brackets, e.g. [1, 2, 3].' },
    { q: 'What is the difference between a list and a tuple?', a: 'Lists are mutable (can be changed); tuples are immutable (cannot be changed after creation).' },
    { q: 'What does the "def" keyword do?', a: 'It defines a new function in Python.' },
    { q: 'What is a dictionary in Python?', a: 'An unordered collection of key-value pairs enclosed in curly braces, e.g. {"name": "Alice"}.' },
    { q: 'What is a list comprehension?', a: 'A concise way to create a list: [expression for item in iterable if condition].' },
    { q: 'What does "self" refer to in a class method?', a: 'It refers to the current instance of the class, allowing access to its attributes and methods.' },
    { q: 'What is a Python decorator?', a: 'A function that wraps another function to extend its behavior without modifying it directly.' },
    { q: 'What is the difference between append() and extend()?', a: 'append() adds a single item to a list; extend() adds all items from an iterable.' },
  ],
  uiux: [
    { q: 'What is a wireframe?', a: 'A low-fidelity blueprint of a UI layout that shows structure and placement without visual design details.' },
    { q: 'What is the difference between UX and UI?', a: 'UX (User Experience) focuses on the overall feel and usability; UI (User Interface) focuses on the visual design and interaction elements.' },
    { q: 'What is a user persona?', a: 'A fictional character based on research that represents a key segment of your target audience.' },
    { q: 'What is Fitts\'s Law?', a: 'The time to reach a target depends on the distance to it and its size — bigger, closer targets are easier to click.' },
    { q: 'What is the 8pt grid system?', a: 'A spacing system where all UI elements and spacing are sized in multiples of 8px for consistency.' },
    { q: 'What is a style guide?', a: 'A document that defines the visual language of a product — typography, colors, spacing, and component patterns.' },
    { q: 'What is usability testing?', a: 'Observing real users as they interact with a product to identify friction points and areas for improvement.' },
  ],
  ml: [
    { q: 'What is supervised learning?', a: 'A type of ML where a model is trained on labeled data — inputs paired with correct outputs.' },
    { q: 'What is overfitting?', a: 'When a model learns the training data too well, including noise, and performs poorly on new unseen data.' },
    { q: 'What is a neural network?', a: 'A computational model inspired by the brain, made of layers of interconnected nodes (neurons) that learn from data.' },
    { q: 'What is gradient descent?', a: 'An optimization algorithm that iteratively adjusts model parameters in the direction that minimizes the loss function.' },
    { q: 'What is the difference between classification and regression?', a: 'Classification predicts a discrete category (e.g. spam/not spam); regression predicts a continuous value (e.g. house price).' },
    { q: 'What is a training/validation/test split?', a: 'Dividing data into three sets: training (model learns), validation (tune hyperparameters), test (final evaluation).' },
    { q: 'What is a confusion matrix?', a: 'A table showing true positives, false positives, true negatives, and false negatives to evaluate a classifier.' },
  ],
};

const deckNames = { webdev: 'Web Development', python: 'Python Basics', uiux: 'UI/UX Design', ml: 'Machine Learning' };

let currentDeck = 'webdev';
let cards = [];
let currentIndex = 0;
let knowSet = new Set();
let reviewSet = new Set();
let isFlipped = false;

function loadDeck(deckKey) {
  currentDeck = deckKey;
  cards = decks[deckKey];
  currentIndex = 0;
  knowSet.clear();
  reviewSet.clear();
  isFlipped = false;
  document.getElementById('completeModal').style.display = 'none';
  renderCard();
  renderDeckList();
  updateProgress();
}

function renderCard() {
  const card = cards[currentIndex];
  document.getElementById('cardCategory').textContent = deckNames[currentDeck];
  document.getElementById('cardQuestion').textContent = card.q;
  document.getElementById('cardAnswer').textContent = card.a;

  // reset flip
  isFlipped = false;
  const inner = document.getElementById('cardInner');
  inner.classList.remove('flipped');

  // hide verdict buttons until flipped
  document.getElementById('verdictBtns').style.display = 'none';

  renderDeckList();
  updateProgress();
}

function flipCard() {
  isFlipped = !isFlipped;
  const inner = document.getElementById('cardInner');
  inner.classList.toggle('flipped', isFlipped);
  document.getElementById('verdictBtns').style.display = isFlipped ? 'flex' : 'none';
}

function nextCard() {
  if (currentIndex < cards.length - 1) {
    currentIndex++;
    renderCard();
  } else {
    showComplete();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  }
}

function markCard(type) {
  if (type === 'know') {
    knowSet.add(currentIndex);
    reviewSet.delete(currentIndex);
  } else {
    reviewSet.add(currentIndex);
    knowSet.delete(currentIndex);
  }
  updateProgress();
  renderDeckList();
  // auto-advance
  setTimeout(() => nextCard(), 300);
}

function updateProgress() {
  const total = cards.length;
  const current = currentIndex + 1;
  document.getElementById('currentNum').textContent = current;
  document.getElementById('totalNum').textContent = total;
  document.getElementById('progressFill').style.width = ((current / total) * 100) + '%';
  document.getElementById('knowCount').textContent = knowSet.size;
  document.getElementById('reviewCount').textContent = reviewSet.size;
}

function renderDeckList() {
  const list = document.getElementById('deckList');
  list.innerHTML = cards.map((c, i) => {
    let cls = 'fc-deck-item';
    if (i === currentIndex) cls += ' active';
    else if (knowSet.has(i)) cls += ' done';
    const label = c.q.length > 34 ? c.q.slice(0, 34) + '…' : c.q;
    return `<div class="${cls}" onclick="goToCard(${i})">
      <span>${label}</span>
      <span class="fc-deck-item-num">${i + 1}</span>
    </div>`;
  }).join('');
}

function goToCard(index) {
  currentIndex = index;
  renderCard();
}

function showComplete() {
  document.getElementById('modalTotal').textContent = cards.length;
  document.getElementById('modalKnow').textContent = knowSet.size;
  document.getElementById('modalReview').textContent = reviewSet.size;
  document.getElementById('completeModal').style.display = 'flex';
}

function restartDeck() {
  loadDeck(currentDeck);
}

function reviewWeak() {
  if (reviewSet.size === 0) {
    restartDeck();
    return;
  }
  // Build a sub-deck of only review cards
  const weakIndices = [...reviewSet];
  const originalCards = cards;
  cards = weakIndices.map(i => originalCards[i]);
  currentIndex = 0;
  knowSet.clear();
  reviewSet.clear();
  document.getElementById('completeModal').style.display = 'none';
  renderCard();
  renderDeckList();
  updateProgress();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'SELECT') return;
  switch(e.key) {
    case ' ':
      e.preventDefault();
      flipCard();
      break;
    case 'ArrowRight':
      nextCard();
      break;
    case 'ArrowLeft':
      prevCard();
      break;
    case 'k': case 'K':
      if (isFlipped) markCard('know');
      break;
    case 'r': case 'R':
      if (isFlipped) markCard('review');
      break;
  }
});

// Init
loadDeck('webdev');

} // End of flashcard-specific code
