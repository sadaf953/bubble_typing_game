const playArea = document.getElementById("play-area");
const inputBox = document.getElementById("input-box");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");
const levelDisplay = document.getElementById("level");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const finalScoreDisplay = document.getElementById("final-score");
const gameOverModal = document.getElementById("game-over-modal");
const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const themeSelector = document.getElementById("theme-selector");

let score = 0;
let lives = 5;
let level = 1;
let gameInterval;
let words = [];
let letters = "abcdefghijklmnopqrstuvwxyz".split("");
let isGameRunning = false;

// Expanded color palettes with more vibrant and contrasting colors
const colorPalettes = {
  neon: {
    background: 'linear-gradient(135deg, #FF1493 0%, #00FFFF 100%)',
    bubbleColors: [
      '#FF1493',  // Deep Pink
      '#00FFFF',  // Cyan
      '#7FFF00',  // Chartreuse
      '#FF4500',  // Orange Red
      '#9400D3'   // Violet
    ]
  },
  pastel: {
    background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
    bubbleColors: [
      '#FF6B6B',  // Pastel Red
      '#4ECDC4',  // Pastel Teal
      '#45B7D1',  // Pastel Blue
      '#FDCB6E',  // Pastel Yellow
      '#6C5CE7'   // Pastel Purple
    ]
  },
  electric: {
    background: 'linear-gradient(135deg, #00FF00 0%, #1E90FF 100%)',
    bubbleColors: [
      '#00FF00',  // Lime Green
      '#1E90FF',  // Dodger Blue
      '#FF1493',  // Deep Pink
      '#FFD700',  // Gold
      '#7B68EE'   // Medium Slate Blue
    ]
  },
  ocean: {
    background: 'linear-gradient(135deg, #00CED1 0%, #4682B4 100%)',
    bubbleColors: [
      '#00CED1',  // Dark Turquoise
      '#4682B4',  // Steel Blue
      '#20B2AA',  // Light Sea Green
      '#48D1CC',  // Medium Turquoise
      '#5F9EA0'   // Cadet Blue
    ]
  }
};

// Theme selection
let currentTheme = 'neon';

// helper: generate random positions
function getRandomPosition() {
  return Math.floor(Math.random() * (playArea.offsetWidth - 50));
}

// helper: get random color
function getRandomColor(palette) {
  return palette[Math.floor(Math.random() * palette.length)];
}

// Apply theme
function applyTheme(theme) {
  const selectedTheme = colorPalettes[theme];
  
  // Update body background
  document.body.style.background = selectedTheme.background;
  
  // Update start screen and game container
  startScreen.style.background = selectedTheme.background;
  gameContainer.style.background = 'rgba(255, 255, 255, 0.1)';
  
  // Update play area
  playArea.style.background = 'rgba(255, 255, 255, 0.1)';
  
  // Store current theme
  currentTheme = theme;
}

// create bubble
function createBubble(text, type) {
  const bubble = document.createElement("div");
  bubble.className = type === "letter" ? "bubble" : "square-bubble";
  bubble.style.left = `${getRandomPosition()}px`;
  bubble.textContent = text;
  
  // set dynamic colors based on current theme
  const palette = colorPalettes[currentTheme].bubbleColors;
  bubble.style.backgroundColor = getRandomColor(palette);
  
  // Add hover and pop effect
  bubble.addEventListener('mouseenter', () => {
    bubble.style.transform = 'scale(1.1)';
  });
  bubble.addEventListener('mouseleave', () => {
    bubble.style.transform = 'scale(1)';
  });
  
  playArea.appendChild(bubble);

  words.push({ element: bubble, text, y: 0 });
}

// start game
function startGame() {
  if (isGameRunning) return;
  isGameRunning = true;

  // hide start screen
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');

  // reset game state
  score = 0;
  lives = 5;
  level = 1;
  words = [];
  updateUI();

  gameInterval = setInterval(() => {
    if (lives <= 0) {
      endGame();
      return;
    }

    playLevel(level);
    moveBubbles();
  }, 1000);

  inputBox.addEventListener("input", handleInput);
  inputBox.focus();
}

// play specific level
function playLevel(level) {
  if (level === 1) {
    createBubble(letters[Math.floor(Math.random() * letters.length)], "letter");
  } else if (level === 2) {
    createBubble(getRandomWord(3), "square");
  } else if (level === 3) {
    createBubble(getRandomWord(6), "square");
  }
}

// random word generator
function getRandomWord(length) {
  return Array(length)
    .fill()
    .map(() => letters[Math.floor(Math.random() * letters.length)])
    .join("");
}

// move bubbles
function moveBubbles() {
  words.forEach((word) => {
    // increase speed with level
    word.y += 5 + (level * 2);
    word.element.style.top = `${word.y}px`;

    if (word.y > playArea.offsetHeight) {
      loseLife();
      playArea.removeChild(word.element);
      words = words.filter((w) => w !== word);
    }
  });
}

// handle input
function handleInput() {
  const inputValue = inputBox.value.trim().toLowerCase();

  words.forEach((word) => {
    if (word.text === inputValue) {
      score++;
      
      // Add pop animation
      word.element.classList.add('pop');
      
      // Remove bubble after animation
      setTimeout(() => {
        playArea.removeChild(word.element);
        words = words.filter((w) => w !== word);
      }, 500);
      
      inputBox.value = "";
      
      // level progression
      if (score > 0 && score % 10 === 0 && level < 3) {
        level++;
      }
    }
  });

  updateUI();
}

// lose life
function loseLife() {
  lives--;
  updateUI();
}

// update ui
function updateUI() {
  levelDisplay.textContent = level;
  scoreDisplay.textContent = score;
  livesDisplay.textContent = lives;
}

// end game
function endGame() {
  isGameRunning = false;
  clearInterval(gameInterval);
  inputBox.value = "";
  playArea.innerHTML = "";
  
  // show game over modal
  finalScoreDisplay.textContent = score;
  gameOverModal.style.display = 'flex';
}

// restart game
function restartGame() {
  gameOverModal.style.display = 'none';
  startGame();
}

// Theme change listener
themeSelector.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

// Apply default theme on load
applyTheme(currentTheme);

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
