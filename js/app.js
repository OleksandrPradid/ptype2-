// ======================
// Game Configuration
// ======================
const config = {
    levelConfigs: [
        { words: 10, maxWordLength: 4, timeLimit: 120 },  // Level 1
        { words: 15, maxWordLength: 4, timeLimit: 120 },  // Level 2
        { words: 20, maxWordLength: 5, timeLimit: 100 },  // Level 3
        { words: 25, maxWordLength: 5, timeLimit: 100 },  // Level 4
        { words: 30, maxWordLength: 6, timeLimit: 90 },   // Level 5
        { words: 35, maxWordLength: 6, timeLimit: 90 },   // Level 6
        { words: 40, maxWordLength: 7, timeLimit: 80 },   // Level 7
        { words: 45, maxWordLength: 7, timeLimit: 80 },   // Level 8
        { words: 50, maxWordLength: 8, timeLimit: 70 },   // Level 9
        { words: 60, maxWordLength: 8, timeLimit: 70 }    // Level 10
    ],
    wordBank: [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
        'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
        'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
        'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
        'write', 'writes', 'wrote', 'written', 'writing'
    ],
    guestProfile: {
        username: 'Guest',
        levelsCompleted: 0,
        typingSpeed: 0,
        profilePicture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'
    }
};

// ======================
// Game State
// ======================
const state = {
    currentLevel: 1,
    words: [],
    fullText: '',
    currentPosition: 0,
    correctChars: [],
    startTime: null,
    correctKeystrokes: 0,
    totalKeystrokes: 0,
    timer: null,
    timeLeft: 0,
    completed: false,
    active: false,
    isGuest: false
};

// ======================
// DOM Elements
// ======================
const elements = {
    pages: {
        welcome: document.getElementById('welcome-page'),
        signup: document.getElementById('signup-page'),
        login: document.getElementById('login-page'),
        profile: document.getElementById('profile-page'),
        levels: document.getElementById('levels-page'),
        game: document.getElementById('game-page')
    },
    profile: {
        username: document.getElementById('profile-username'),
        levelsCompleted: document.getElementById('levels-completed'),
        typingSpeed: document.getElementById('typing-speed'),
        profileImg: document.getElementById('profile-img'),
        playLevelsBtn: document.getElementById('play-levels-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        backToProfile: document.getElementById('back-to-profile'),
        levelsGrid: document.querySelector('.levels-grid')
    },
    buttons: {
        welcome: {
            signup: document.getElementById('signup-btn'),
            login: document.getElementById('login-btn'),
            guest: document.getElementById('guest-btn')
        },
        signup: {
            submit: document.getElementById('signup-submit'),
            back: document.getElementById('back-btn'),
            login: document.getElementById('go-to-login')
        },
        login: {
            submit: document.getElementById('login-submit'),
            back: document.getElementById('back-btn-login'),
            signup: document.getElementById('go-to-signup')
        }
    },
    forms: {
        signup: {
            username: document.getElementById('signup-username'),
            password: document.getElementById('signup-password'),
            confirmPassword: document.getElementById('signup-password-confirm'),
            status: document.getElementById('signup-status')
        },
        login: {
            username: document.getElementById('login-username'),
            password: document.getElementById('login-password'),
            status: document.getElementById('login-status')
        }
    },
    game: {
        currentLevel: document.getElementById('current-level'),
        wpmStat: document.getElementById('wpm-stat'),
        accuracyStat: document.getElementById('accuracy-stat'),
        timeStat: document.getElementById('time-stat'),
        textDisplay: document.getElementById('text-display'),
        progressBar: document.getElementById('progress-bar'),
        backToLevels: document.getElementById('back-to-levels')
    }
};

// ======================
// Core Functions
// ======================
function init() {
    setupEventListeners();
    showPage('welcome');
}

function showPage(page) {
    Object.values(elements.pages).forEach(p => p.style.display = 'none');
    elements.pages[page].style.display = 'block';
    
    // Special cases
    if (page === 'game' && state.active) {
        elements.game.textDisplay.focus();
    }
}

function showStatus(element, message, type) {
    element.classList.remove('hidden');
    element.classList.remove('error', 'success');
    element.classList.add(type);
    element.querySelector('.status-text').textContent = message;
}

// ======================
// Navigation & UI
// ======================
function setupEventListeners() {
    // Navigation
    elements.buttons.welcome.signup.addEventListener('click', () => showPage('signup'));
    elements.buttons.welcome.login.addEventListener('click', () => showPage('login'));
    elements.buttons.welcome.guest.addEventListener('click', handleGuestLogin);
    
    elements.buttons.signup.back.addEventListener('click', () => showPage('welcome'));
    elements.buttons.login.back.addEventListener('click', () => showPage('welcome'));
    elements.buttons.signup.login.addEventListener('click', () => showPage('login'));
    elements.buttons.login.signup.addEventListener('click', () => showPage('signup'));
    
    elements.profile.playLevelsBtn.addEventListener('click', () => showPage('levels'));
    elements.profile.backToProfile.addEventListener('click', () => showPage('profile'));
    elements.game.backToLevels.addEventListener('click', () => {
        state.active = false;
        clearInterval(state.timer);
        elements.game.textDisplay.removeEventListener('keydown', handleKeyPress);
        showPage('levels');
    });

    // Game input
    elements.game.textDisplay.addEventListener('keydown', handleKeyPress);
}

function handleGuestLogin() {
    state.isGuest = true;
    updateProfile(config.guestProfile);
    generateLevels(config.guestProfile.levelsCompleted);
    showPage('profile');
}

// ======================
// Profile & Levels
// ======================
function updateProfile(userData) {
    elements.profile.username.textContent = userData.username;
    elements.profile.levelsCompleted.textContent = `${userData.levelsCompleted}/10`;
    elements.profile.typingSpeed.textContent = `${userData.typingSpeed} WPM`;
    elements.profile.profileImg.src = userData.profilePicture;
    
    if (userData.profilePicture) {
        elements.profile.profileImg.style.display = 'block';
        document.getElementById('profile-emoji').style.display = 'none';
    }
}

function generateLevels(completedLevels) {
    elements.profile.levelsGrid.innerHTML = '';
    
    for (let i = 1; i <= 10; i++) {
        const levelBtn = document.createElement('button');
        levelBtn.className = `level-btn ${i <= completedLevels ? 'completed' : ''}`;
        
        let statusText = '';
        if (i <= completedLevels) {
            statusText = '<span class="level-status" data-status="completed">COMPLETED</span>';
        } else if (i === completedLevels + 1) {
            statusText = '<span class="level-status" data-status="start">START</span>';
        } else {
            statusText = '<span class="level-status" data-status="locked">LOCKED</span>';
        }
        
        levelBtn.innerHTML = `
            <span class="level-number">${i}</span>
            ${statusText}
        `;
        
        if (i <= completedLevels + 1) {
            levelBtn.addEventListener('click', () => startLevel(i));
        } else {
            levelBtn.style.opacity = '0.6';
            levelBtn.style.cursor = 'not-allowed';
        }
        
        elements.profile.levelsGrid.appendChild(levelBtn);
    }
}

// ======================
// Game Logic
// ======================
function startLevel(levelNumber) {
    state.active = true;
    state.currentLevel = levelNumber;
    state.words = generateWords(levelNumber);
    state.fullText = state.words.join(' ');
    state.currentPosition = 0;
    state.correctChars = [];
    state.startTime = null;
    state.correctKeystrokes = 0;
    state.totalKeystrokes = 0;
    state.completed = false;
    state.timeLeft = config.levelConfigs[levelNumber - 1].timeLimit;

    elements.game.currentLevel.textContent = levelNumber;
    elements.game.wpmStat.textContent = '0';
    elements.game.accuracyStat.textContent = '100%';
    elements.game.timeStat.textContent = `${state.timeLeft}s`;
    
    updateTextDisplay();
    showPage('game');
    
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(updateTimer, 1000);
    
    elements.game.textDisplay.focus();
}

function generateWords(level) {
    const levelConfig = config.levelConfigs[level - 1];
    const filteredWords = config.wordBank.filter(word => word.length <= levelConfig.maxWordLength);
    const words = [];
    
    for (let i = 0; i < levelConfig.words; i++) {
        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        words.push(filteredWords[randomIndex]);
    }
    
    return words;
}

function updateTextDisplay() {
    let displayHTML = '';
    const text = state.fullText;
    
    for (let i = 0; i < text.length; i++) {
        let charClass = '';
        
        if (i < state.currentPosition) {
            charClass = state.correctChars[i] ? 'correct-char' : 'incorrect-char';
        } else if (i === state.currentPosition) {
            charClass = 'current-char';
        }
        
        if (text[i] === ' ') {
            displayHTML += `<span class="${charClass} space-char"> </span>`;
        } else {
            displayHTML += `<span class="${charClass}">${text[i]}</span>`;
        }
    }
    
    elements.game.textDisplay.innerHTML = displayHTML;
    
    const progressPercent = (state.currentPosition / text.length) * 100;
    elements.game.progressBar.style.setProperty('--progress', `${progressPercent}%`);
    
    const currentCharElement = elements.game.textDisplay.querySelector('.current-char');
    if (currentCharElement) {
        currentCharElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
}

function handleKeyPress(e) {
    if (!state.active) return;
    
    if (!state.startTime) {
        state.startTime = new Date();
        state.correctChars = new Array(state.fullText.length).fill(false);
    }
    
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    
    e.preventDefault();
    
    if (e.key === 'Backspace') {
        if (state.currentPosition > 0) {
            state.currentPosition--;
            state.totalKeystrokes++;
        }
        updateTextDisplay();
        return;
    }
    
    if (e.key.length !== 1 && e.key !== ' ') return;
    
    const currentChar = state.fullText[state.currentPosition];
    const isCorrect = e.key === currentChar;
    
    state.correctChars[state.currentPosition] = isCorrect;
    state.totalKeystrokes++;
    
    if (isCorrect) {
        state.correctKeystrokes++;
        state.currentPosition++;
        
        if (state.currentPosition >= state.fullText.length) {
            endGame(true);
            return;
        }
    }
    
    updateTextDisplay();
    updateStats();
}

function updateStats() {
    if (!state.startTime) return;
    
    const timeElapsed = (new Date() - state.startTime) / 60000;
    const wpm = Math.round((state.correctKeystrokes / 5) / timeElapsed) || 0;
    const accuracy = state.totalKeystrokes > 0 
        ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
        : 100;
    
    elements.game.wpmStat.textContent = wpm;
    elements.game.accuracyStat.textContent = `${accuracy}%`;
}

function updateTimer() {
    state.timeLeft--;
    elements.game.timeStat.textContent = `${state.timeLeft}s`;
    
    if (state.timeLeft <= 0) {
        endGame(false);
    }
}

function endGame(success) {
    if (!state.active) return;
    
    state.active = false;
    clearInterval(state.timer);
    state.completed = success;
    
    if (success) {
        const timeElapsed = (new Date() - state.startTime) / 60000;
        const finalWpm = Math.round((state.correctKeystrokes / 5) / timeElapsed) || 0;
        const accuracy = state.totalKeystrokes > 0 
            ? Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100)
            : 100;
        
        if (state.isGuest) {
            const currentLevel = state.currentLevel;
            const levelsCompleted = parseInt(elements.profile.levelsCompleted.textContent.split('/')[0]);
            
            if (currentLevel === levelsCompleted + 1) {
                config.guestProfile.levelsCompleted = currentLevel;
                config.guestProfile.typingSpeed = finalWpm;
                
                elements.profile.levelsCompleted.textContent = `${currentLevel}/10`;
                elements.profile.typingSpeed.textContent = `${finalWpm} WPM`;
                generateLevels(currentLevel);
            }
        }
        
        showStatsPopup({
            level: state.currentLevel,
            wpm: finalWpm,
            accuracy: accuracy,
            time: Math.round(timeElapsed * 60),
            nextLevelUnlocked: state.currentLevel === config.guestProfile.levelsCompleted
        });
    } else {
        showPage('levels');
    }
}

function showStatsPopup(stats) {
    const popup = document.createElement('div');
    popup.className = 'stats-popup';
    popup.innerHTML = `
        <div class="stats-content">
            <h2>Level ${stats.level} ${stats.level < 10 ? 'Completed!' : 'Mastered!'}</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">WPM</div>
                    <div class="stat-value">${stats.wpm}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Accuracy</div>
                    <div class="stat-value">${stats.accuracy}%</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Time</div>
                    <div class="stat-value">${stats.time}s</div>
                </div>
            </div>
            ${stats.nextLevelUnlocked ? '<div class="unlocked-message">Level ' + (stats.level + 1) + ' Unlocked!</div>' : ''}
            <button id="continue-btn" class="btn">Continue</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    popup.querySelector('#continue-btn').addEventListener('click', () => {
        popup.remove();
        showPage('levels');
    });
    
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
            showPage('levels');
        }
    });
}

// Initialize the game
init();