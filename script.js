const translations = {
  en: {
    title: "🎯 Design Eye Challenge",
    instruction: "Select the design that looks most correct",
    score: "Score",
    nameLabel: "👤 Enter your name",
    completed: "🎉 Challenge Complete!",
    yourName: "👤 Name",
    date: "📅 Date",
    download: "Download Score Screenshot",
    playAgain: "🔁 Play Again",
    correct: "✅ Correct!",
    wrong: "❌ Wrong!",
    press: 'Press',
    explanationPrefix: '💡'
  },
  th: {
    title: "🎯 ทดสอบสายตาด้านการออกแบบ",
    instruction: "เลือกการออกแบบที่ดูถูกต้องที่สุด",
    score: "คะแนน",
    nameLabel: "👤 กรอกชื่อของคุณ",
    completed: "🎉 ทำภารกิจสำเร็จ!",
    yourName: "👤 ชื่อ",
    date: "📅 วันที่",
    download: "ดาวน์โหลดภาพคะแนน",
    playAgain: "🔁 เล่นอีกครั้ง",
    correct: "✅ ถูกต้อง!",
    wrong: "❌ ผิด!",
    press: 'กด',
    explanationPrefix: '💡'
  }
};

let currentLang = 'en'; // default language


const levels = [
  {
    images: ['levels/level1-a.png', 'levels/level1-b.png'],
    correctIndex: 0,
    description: {
      en: "A has better alignment and spacing than B.",
      th: "A จัดวางตำแหน่งและระยะห่างได้ดีกว่า B"
    }
  },
  {
    images: ['levels/level2-a.png', 'levels/level2-b.png'],
    correctIndex: 1,
    description: {
      en: "B uses consistent padding, while A is cramped.",
      th: "B มีระยะห่างที่สม่ำเสมอ ขณะที่ A ดูแน่นเกินไป"
    }
  },
  {
    images: ['levels/level3-a.png', 'levels/level3-b.png'],
    correctIndex: 0,
    description: {
      en: "A follows visual hierarchy with a clear focal point.",
      th: "A จัดลำดับความสำคัญทางสายตาได้ชัดเจน"
    }
  },
  {
    images: ['levels/level4-a.png', 'levels/level4-b.png'],
    correctIndex: 1,
    description: {
      en: "B aligns content properly, avoiding visual clutter.",
      th: "B จัดตำแหน่งเนื้อหาได้ดีและไม่ดูรก"
    }
  },
  {
    images: ['levels/level5-a.png', 'levels/level5-b.png'],
    correctIndex: 0,
    description: {
      en: "A uses better typography contrast and spacing.",
      th: "A ใช้การจัดตัวอักษรที่มีความคมชัดและระยะห่างที่เหมาะสม"
    }
  },
  {
    images: ['levels/level6-a.png', 'levels/level6-b.png'],
    correctIndex: 1,
    description: {
      en: "B has consistent button sizing and visual balance.",
      th: "B มีขนาดปุ่มที่สม่ำเสมอและมีความสมดุล"
    }
  },
  {
    images: ['levels/level7-a.png', 'levels/level7-b.png'],
    correctIndex: 1,
    description: {
      en: "B keeps color harmony and avoids harsh clashes.",
      th: "B ใช้โทนสีที่กลมกลืนและไม่ขัดแย้ง"
    }
  },
  {
    images: ['levels/level8-a.png', 'levels/level8-b.png'],
    correctIndex: 0,
    description: {
      en: "A groups related content better than B.",
      th: "A จัดกลุ่มเนื้อหาที่เกี่ยวข้องได้ชัดเจนกว่า B"
    }
  },
  {
    images: ['levels/level9-a.png', 'levels/level9-b.png'],
    correctIndex: 0,
    description: {
      en: "A uses white space more effectively.",
      th: "A ใช้พื้นที่ว่างได้อย่างมีประสิทธิภาพมากกว่า"
    }
  },
  {
    images: ['levels/level10-a.png', 'levels/level10-b.png'],
    correctIndex: 1,
    description: {
      en: "B has clearer navigation hierarchy.",
      th: "B มีลำดับการนำทางที่ชัดเจนกว่า"
    }
  }
];


let currentLevel = 0;
let score = 0;
let username = '';
let timerDuration = 15;  // seconds per level
let timerInterval = null;


// 🔊 Load background music
const bgMusic = new Audio('sounds/music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;
let musicStarted = false;
let isMusicMuted = false;

function startMusic() {
  if (!musicStarted) {
    bgMusic.play().then(() => {
      musicStarted = true;
      bgMusic.muted = isMusicMuted;  // apply mute state if toggled early
    }).catch(e => {
      console.log("Music playback prevented:", e);
    });
    window.removeEventListener('click', startMusic);
  }
}

window.addEventListener('click', startMusic);

function toggleMusic() {
  if (!musicStarted) {
    alert("Please click anywhere to start the music first!");
    return;
  }

  isMusicMuted = !isMusicMuted;
  bgMusic.muted = isMusicMuted;

  const btn = document.getElementById('toggle-music');
  if (btn) {
    btn.innerText = isMusicMuted ? '🔇 Unmute Music' : '🔈 Mute Music';
  }
}



// 🎧 Load Sound Effects
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');

function setUsername(value) {
  username = value.trim();
}

function updateScore(showPopup = false) {
  const scoreBox = document.getElementById('score');
  scoreBox.innerText = `${translations[currentLang].score}: ${score}`;

  if (showPopup) {
    const popup = document.createElement('div');
    popup.className = 'score-pop';
    popup.innerText = '+1';
    scoreBox.appendChild(popup);

    setTimeout(() => popup.remove(), 800);
  }
}

function loadLevel() {
  const container = document.getElementById('images');
  const title = document.getElementById('level-title');
  const feedback = document.getElementById('feedback');
  const progress = document.getElementById('progress');
  const explanationBox = document.getElementById('explanation');

  // Update UI text based on current language
  document.querySelector('h1').innerText = translations[currentLang].title;
  document.querySelector('p').innerText = translations[currentLang].instruction;
  document.getElementById('score').innerText = `${translations[currentLang].score}: ${score}`;

  const nameInput = document.getElementById('username-input');
  if (nameInput) {
    nameInput.placeholder = translations[currentLang].nameLabel;
  }

  if (currentLevel >= levels.length) {
    const today = new Date().toLocaleDateString();

    document.getElementById('game-container').innerHTML = `
      <div id="result-card" class="p-6 bg-white rounded shadow-xl max-w-xl mx-auto animate-fade-in">
        <h2 class="text-2xl font-bold mb-2 text-green-700">${translations[currentLang].completed}</h2>
        <p class="text-lg mb-1">${translations[currentLang].yourName}: <strong>${username || 'Anonymous'}</strong></p>
        <p class="text-lg mb-1">${translations[currentLang].date}: <strong>${today}</strong></p>
        <p class="text-xl mb-4">✅ ${translations[currentLang].score}: <strong>${score} / ${levels.length}</strong></p>
        <button onclick="captureScore()" class="bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:from-green-500 hover:to-green-700 transition">
          ${translations[currentLang].download}
        </button>
        <button onclick="restartGame()" class="ml-4 mt-4 bg-blue-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-blue-600 transition">
          ${translations[currentLang].playAgain}
        </button>
      </div>
    `;
	
	// Trigger confetti 🎉
    confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
  
    return;
  }

  const level = levels[currentLevel];
  const originalImages = level.images.map((src, i) => ({
    src,
    isCorrect: i === level.correctIndex
  }));

  // Shuffle images
  const shuffled = originalImages.sort(() => Math.random() - 0.5);
  container.innerHTML = '';
  feedback.innerText = '';
  if (explanationBox) explanationBox.innerText = '';
  title.innerText = `Level ${currentLevel + 1} of ${levels.length}`;

  // Build images
  shuffled.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = `Option ${index === 0 ? 'A' : 'B'} - Level ${currentLevel + 1}`;
    img.className = 'w-full max-w-xs sm:max-w-sm md:max-w-md rounded-lg shadow-lg cursor-pointer';

    img.onclick = () => checkAnswer(item.isCorrect);
    //img.addEventListener('touchstart', () => checkAnswer(item.isCorrect));

    const keyLabel = index === 0 ? 'A' : 'B';
    keyImageMap[keyLabel] = img;

    const label = document.createElement('span');
    label.innerText = keyLabel;
    label.className = 'mt-2 font-semibold text-lg';

    const shortcutHint = document.createElement('span');
    shortcutHint.innerText = `${translations[currentLang].press} "${keyLabel}"`;
    shortcutHint.className = 'text-sm text-gray-500';

    wrapper.appendChild(img);
    wrapper.appendChild(label);
    wrapper.appendChild(shortcutHint);
    container.appendChild(wrapper);
  });

  progress.style.width = `${(currentLevel / levels.length) * 100}%`;
  
  // Clear any existing timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

// Start new timer for this level
startTimer();


  // Fade out previous explanation
  if (explanationBox && explanationBox.innerText.trim() !== '') {
    explanationBox.classList.add('fade-out');
    setTimeout(() => {
      explanationBox.innerText = '';
      explanationBox.classList.remove('fade-out');
    }, 500);
  }
}

function checkAnswer(isCorrect) {
  const feedback = document.getElementById('feedback');
  const explanationBox = document.getElementById('explanation') || createExplanationBox();
  const levelInfo = levels[currentLevel];

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  if (isCorrect) {
    score++;
    correctSound.currentTime = 0;  // rewind in case it overlaps
    correctSound.play();
    feedback.innerText = "✅ Correct!";
    feedback.className = "text-green-600 font-bold mb-4";
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play();
    feedback.innerText = "❌ Wrong!";
    feedback.className = "text-red-600 font-bold mb-4";
  }

  explanationBox.innerText = `${translations[currentLang].explanationPrefix} ${levelInfo.description[currentLang]}`;
  updateScore();

  setTimeout(() => {
    currentLevel++;
    loadLevel();
  }, 1500);
}

function createExplanationBox() {
  const box = document.createElement('div');
  box.id = "explanation";
  box.className = "text-sm text-gray-700 italic mb-6";
  document.getElementById('game-container').appendChild(box);
  return box;
}

function captureScore() {
  const resultElement = document.getElementById('result-card');

  // 🧼 Hide buttons before capture
  const buttons = resultElement.querySelectorAll('button');
  buttons.forEach(btn => btn.style.display = 'none');

  html2canvas(resultElement).then(canvas => {
    // 📸 Restore buttons after capture
    buttons.forEach(btn => btn.style.display = '');

    const namePart = username ? username.trim().toLowerCase().replace(/\s+/g, '-') : 'anonymous';
    const scorePart = `score-${score}`;
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
    const fileName = `${namePart}-${scorePart}-${timestamp}.png`;

    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL();
    link.click();
  });
}

function restartGame() {
  currentLevel = 0;
  score = 0;
  updateScore();

  // Restore the original game container layout (same as your initial HTML inside #game-container)
  document.getElementById('game-container').innerHTML = `
    <div id="level-title" class="text-xl font-semibold mb-6 text-indigo-700"></div>
    <div class="flex justify-center gap-8 flex-wrap mb-6" id="images"></div>
    <div id="feedback" class="text-lg font-bold mb-6"></div>
    <div id="explanation" class="text-sm text-gray-700 mb-6"></div>
	<div id="timer" class="text-lg font-semibold text-red-600 mb-4"></div>
    <div class="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
      <div id="progress" class="bg-green-500 h-4 rounded-full transition-all duration-300 ease-in-out" style="width: 0%"></div>
    </div>
  `;
  
  loadLevel();
}

function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'th' : 'en';

  // Update button text
  const langBtn = document.getElementById('toggle-lang');
  if (langBtn) {
    langBtn.innerText = currentLang === 'en' ? '🌐 ภาษาไทย' : '🌐 English';
  }

  // Rerender current level
  loadLevel();
}

function startTimer() {
  let timeLeft = timerDuration;
  const timerEl = document.getElementById('timer');
  timerEl.innerText = `⏳ Time left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.innerText = `⏳ Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      handleTimeUp();
    }
  }, 1000);
}

function handleTimeUp() {
  const feedback = document.getElementById('feedback');
  feedback.innerText = "⌛ Time's up!";
  feedback.className = "text-red-700 font-bold mb-4";

  wrongSound.currentTime = 0;
  wrongSound.play();

  setTimeout(() => {
    currentLevel++;
    loadLevel();
  }, 1500);
}


let keyImageMap = {}; // stores current image options

document.addEventListener('keydown', (e) => {
  const activeElement = document.activeElement;
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    // Ignore key presses if typing in input or textarea
    return;
  }
  
  if (e.key.toLowerCase() === 'a' && keyImageMap.A) {
    keyImageMap.A.click();
  } else if (e.key.toLowerCase() === 'b' && keyImageMap.B) {
    keyImageMap.B.click();
  }
});


window.onload = () => {
  // Show welcome screen, hide main game
  document.getElementById('welcome-screen').classList.remove('hidden');
  document.getElementById('game-wrapper').classList.add('hidden');

  // Start button click event
  document.getElementById('start-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('welcome-username-input');
    const enteredName = nameInput.value.trim();
    if (!enteredName) {
      alert('Please enter your name to start!');
      return;
    }
    username = enteredName;

    // Hide welcome, show game UI
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('game-wrapper').classList.remove('hidden');

    // Start music playback now that user interacted
    startMusic();

    // Load the first level
    loadLevel();
  });
};


