document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // DOM Elements
    // ======================
    const pages = {
        welcome: document.getElementById('welcome-page'),
        signup: document.getElementById('signup-page'),
        login: document.getElementById('login-page'),
        profile: document.getElementById('profile-page'),
        levels: document.getElementById('levels-page'),
        game: document.getElementById('game-page')
    };

    const profileElements = {
        username: document.getElementById('profile-username'),
        levelsCompleted: document.getElementById('levels-completed'),
        typingSpeed: document.getElementById('typing-speed'),
        profileImg: document.getElementById('profile-img'),
        playLevelsBtn: document.getElementById('play-levels-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        backToProfile: document.getElementById('back-to-profile'),
        levelsGrid: document.querySelector('.levels-grid')
    };
    
    const buttons = {
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
    };

    const forms = {
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
    };

    const gameElements = {
        currentLevel: document.getElementById('current-level'),
        wpmStat: document.getElementById('wpm-stat'),
        accuracyStat: document.getElementById('accuracy-stat'),
        timeStat: document.getElementById('time-stat'),
        textDisplay: document.getElementById('text-display'),
        textInput: document.getElementById('text-input'),
        progressBar: document.getElementById('progress-bar'),
        backToLevels: document.getElementById('back-to-levels')
    };

    // ======================
    // Game Configuration
    // ======================
    const levelConfigs = [
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
    ];

    const wordBank = [
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
        // ... (include all words from your word bank)
        'write', 'writes', 'wrote', 'written', 'writing'
    ];

    // ======================
    // Game State
    // ======================
    let gameState = {
        currentLevel: 1,
        words: [],
        currentWordIndex: 0,
        currentCharIndex: 0,
        startTime: null,
        correctKeystrokes: 0,
        totalKeystrokes: 0,
        timer: null,
        timeLeft: 0,
        completed: false,
        active: false
    };

    // ======================
    // Initialization
    // ======================
    function init() {
        // Initialize fake user database if it doesn't exist
        if (!localStorage.getItem('fakeUsers')) {
            const fakeUsers = {
                'test': {
                    password: 'test123',
                    levelsCompleted: 3,
                    typingSpeed: 45,
                    profilePicture: 'https://i.imgur.com/JqYeXZk.png'
                },
                'user': {
                    password: 'user123',
                    levelsCompleted: 1,
                    typingSpeed: 32,
                    profilePicture: 'https://i.imgur.com/JqYeXZk.png'
                }
            };
            localStorage.setItem('fakeUsers', JSON.stringify(fakeUsers));
        }

        // Check for existing session
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            handleLoginSuccess(currentUser.username, {
                levelsCompleted: currentUser.levelsCompleted,
                typingSpeed: currentUser.typingSpeed,
                profilePicture: currentUser.profilePicture
            });
        } else {
            showPage('welcome');
        }

        setupEventListeners();
    }

    // ======================
    // Navigation Functions
    // ======================
    function showPage(page) {
        Object.values(pages).forEach(p => p.style.display = 'none');
        pages[page].style.display = 'block';
    }

    function showStatus(element, message, type) {
        element.classList.remove('hidden');
        element.classList.remove('error', 'success');
        element.classList.add(type);
        element.querySelector('.status-text').textContent = message;
    }

    // ======================
    // Event Listeners
    // ======================
    function setupEventListeners() {
        // Navigation
        buttons.welcome.signup.addEventListener('click', () => showPage('signup'));
        buttons.welcome.login.addEventListener('click', () => showPage('login'));
        buttons.signup.back.addEventListener('click', () => showPage('welcome'));
        buttons.login.back.addEventListener('click', () => showPage('welcome'));
        buttons.signup.login.addEventListener('click', () => showPage('login'));
        buttons.login.signup.addEventListener('click', () => showPage('signup'));
        profileElements.playLevelsBtn.addEventListener('click', () => showPage('levels'));
        profileElements.backToProfile.addEventListener('click', () => showPage('profile'));
        profileElements.logoutBtn.addEventListener('click', handleLogout);
        gameElements.backToLevels.addEventListener('click', () => {
            gameState.active = false;
            clearInterval(gameState.timer);
            gameElements.textDisplay.removeEventListener('keydown', handleKeyPress);
            showPage('levels');
        });

        // Form Handling
        buttons.signup.submit.addEventListener('click', handleSignup);
        buttons.login.submit.addEventListener('click', handleLogin);

        // Guest Mode
        buttons.welcome.guest.addEventListener('click', () => {
            handleLoginSuccess('Guest', {
                levelsCompleted: 0,
                typingSpeed: 0,
                profilePicture: 'https://i.imgur.com/JqYeXZk.png'
            });
        });
    }

    // ======================
    // User Authentication
    // ======================
    function handleSignup() {
        forms.signup.status.classList.add('hidden');

        if (forms.signup.password.value !== forms.signup.confirmPassword.value) {
            showStatus(forms.signup.status, "Passwords don't match!", 'error');
            return;
        }

        if (!forms.signup.username.value || !forms.signup.password.value) {
            showStatus(forms.signup.status, "Please fill in all fields", 'error');
            return;
        }

        const fakeUsers = JSON.parse(localStorage.getItem('fakeUsers'));
        if (fakeUsers[forms.signup.username.value]) {
            showStatus(forms.signup.status, "Username already exists", 'error');
            return;
        }

        fakeUsers[forms.signup.username.value] = {
            password: forms.signup.password.value,
            levelsCompleted: 0,
            typingSpeed: 0,
            profilePicture: 'https://i.imgur.com/JqYeXZk.png'
        };
        
        localStorage.setItem('fakeUsers', JSON.stringify(fakeUsers));

        showStatus(forms.signup.status, "Account created! Redirecting...", 'success');
        setTimeout(() => showPage('login'), 2000);
    }

    function handleLogin() {
        forms.login.status.classList.add('hidden');

        if (!forms.login.username.value || !forms.login.password.value) {
            showStatus(forms.login.status, "Please fill in all fields", 'error');
            return;
        }

        const fakeUsers = JSON.parse(localStorage.getItem('fakeUsers'));
        const user = fakeUsers[forms.login.username.value];
        
        if (!user || user.password !== forms.login.password.value) {
            showStatus(forms.login.status, "Invalid username or password", 'error');
            return;
        }

        showStatus(forms.login.status, "Login successful! Redirecting...", 'success');
        setTimeout(() => {
            handleLoginSuccess(forms.login.username.value, {
                levelsCompleted: user.levelsCompleted,
                typingSpeed: user.typingSpeed,
                profilePicture: user.profilePicture
            });
        }, 1500);
    }

    function handleLoginSuccess(username, userData) {
        localStorage.setItem('currentUser', JSON.stringify({
            username: username,
            ...userData
        }));
        updateProfile({
            username: username,
            ...userData
        });
        showPage('profile');
        generateLevels(userData.levelsCompleted);
    }

    function handleLogout() {
        localStorage.removeItem('currentUser');
        showPage('welcome');
    }

    // ======================
    // Profile & Levels
    // ======================
    function updateProfile(userData) {
        profileElements.username.textContent = userData.username;
        profileElements.levelsCompleted.textContent = `${userData.levelsCompleted}/10`;
        profileElements.typingSpeed.textContent = `${userData.typingSpeed} WPM`;
        profileElements.profileImg.src = userData.profilePicture;
    }
    
    function generateLevels(completedLevels) {
        profileElements.levelsGrid.innerHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const levelBtn = document.createElement('button');
            levelBtn.className = `level-btn ${i <= completedLevels ? 'completed' : ''}`;
            levelBtn.innerHTML = `
                <span class="level-number">${i}</span>
                <span class="level-status">${i <= completedLevels ? 'COMPLETED' : 'LOCKED'}</span>
            `;
            
            if (i <= completedLevels + 1) {
                levelBtn.addEventListener('click', () => startLevel(i));
            } else {
                levelBtn.style.opacity = '0.6';
                levelBtn.style.cursor = 'not-allowed';
            }
            
            profileElements.levelsGrid.appendChild(levelBtn);
        }
    }

    // ======================
    // Game Logic (MonkeyType Style)
    // ======================
    function startLevel(levelNumber) {
        gameState.active = true;
        gameState.currentLevel = levelNumber;
        gameState.words = generateWords(levelNumber);
        gameState.fullText = gameState.words.join(' '); // Include spaces between words
        gameState.currentPosition = 0;
        gameState.startTime = null;
        gameState.correctKeystrokes = 0;
        gameState.totalKeystrokes = 0;
        gameState.completed = false;
        gameState.timeLeft = levelConfigs[levelNumber - 1].timeLimit;
    
        gameElements.currentLevel.textContent = levelNumber;
        gameElements.wpmStat.textContent = '0';
        gameElements.accuracyStat.textContent = '100%';
        gameElements.timeStat.textContent = `${gameState.timeLeft}s`;
        
        updateTextDisplay();
        showPage('game');
        
        if (gameState.timer) clearInterval(gameState.timer);
        gameState.timer = setInterval(updateTimer, 1000);
        
        gameElements.textDisplay.tabIndex = 0;
        gameElements.textDisplay.focus();
        gameElements.textDisplay.addEventListener('keydown', handleKeyPress);
    }

    function generateWords(level) {
        const config = levelConfigs[level - 1];
        const filteredWords = wordBank.filter(word => word.length <= config.maxWordLength);
        const words = [];
        
        for (let i = 0; i < config.words; i++) {
            const randomIndex = Math.floor(Math.random() * filteredWords.length);
            words.push(filteredWords[randomIndex]);
        }
        
        return words;
    }

    function updateTextDisplay() {
        let displayHTML = '';
        const text = gameState.fullText;
        const maxWidth = gameElements.textDisplay.clientWidth;
        let currentLine = '';
        let currentLineLength = 0;
        let charIndex = 0;
        
        // Create lines that fit within the container width
        while (charIndex < text.length) {
            const char = text[charIndex];
            const charWidth = getCharWidth(char);
            
            if (currentLineLength + charWidth > maxWidth && currentLine.length > 0) {
                // Add completed line to display
                displayHTML += `<div class="text-line">${currentLine}</div>`;
                currentLine = '';
                currentLineLength = 0;
            }
            
            // Add character to current line with appropriate styling
            let charClass = '';
            if (charIndex < gameState.currentPosition) {
                charClass = gameState.correctChars[charIndex] ? 'correct-char' : 'incorrect-char';
            } else if (charIndex === gameState.currentPosition) {
                charClass = 'current-char';
            }
            
            currentLine += `<span class="${charClass}">${char === ' ' ? '&nbsp;' : char}</span>`;
            currentLineLength += charWidth;
            charIndex++;
        }
        
        // Add the last line if it exists
        if (currentLine.length > 0) {
            displayHTML += `<div class="text-line">${currentLine}</div>`;
        }
        
        gameElements.textDisplay.innerHTML = displayHTML;
        gameElements.progressBar.style.setProperty('--progress', `${(gameState.currentPosition / text.length) * 100}%`);
    }
    
    function getCharWidth(char) {
        // Approximate character widths (adjust as needed)
        if (char === ' ') return 8;
        if (char === 'i' || char === 'l') return 6;
        if (char === 'm' || char === 'w') return 12;
        return 10; // Default width for most characters
    }

    function handleKeyPress(e) {
        if (!gameState.startTime) {
            gameState.startTime = new Date();
            gameState.correctChars = []; // Track correctness of each character
        }
        
        // Ignore modifier keys
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        // Handle backspace
        if (e.key === 'Backspace') {
            if (gameState.currentPosition > 0) {
                gameState.currentPosition--;
                gameState.totalKeystrokes++;
                gameState.correctChars.pop(); // Remove the last correctness record
            }
            updateTextDisplay();
            return;
        }
        
        // Ignore other non-character keys except space
        if (e.key.length !== 1 && e.key !== ' ') return;
        
        const currentChar = gameState.fullText[gameState.currentPosition];
        const isCorrect = e.key === currentChar;
        
        // Record whether this keystroke was correct
        gameState.correctChars[gameState.currentPosition] = isCorrect;
        
        gameState.totalKeystrokes++;
        if (isCorrect) {
            gameState.correctKeystrokes++;
            gameState.currentPosition++;
            
            // Check if level is completed
            if (gameState.currentPosition >= gameState.fullText.length) {
                endGame(true);
                return;
            }
        }
        
        updateTextDisplay();
        updateStats();
    }

    function updateStats() {
        if (!gameState.startTime) return;
        
        const timeElapsed = (new Date() - gameState.startTime) / 60000;
        const wpm = Math.round((gameState.correctKeystrokes / 5) / timeElapsed) || 0;
        const accuracy = gameState.totalKeystrokes > 0 
            ? Math.round((gameState.correctKeystrokes / gameState.totalKeystrokes) * 100)
            : 100;
        
        gameElements.wpmStat.textContent = wpm;
        gameElements.accuracyStat.textContent = `${accuracy}%`;
    }

    function updateTimer() {
        gameState.timeLeft--;
        gameElements.timeStat.textContent = `${gameState.timeLeft}s`;
        
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }

    function endGame(success) {
        if (!gameState.active) return;
        
        gameState.active = false;
        clearInterval(gameState.timer);
        gameState.completed = success;
        
        gameElements.textDisplay.removeEventListener('keydown', handleKeyPress);
        
        if (success) {
            const timeElapsed = (new Date() - gameState.startTime) / 60000;
            const finalWpm = Math.round((gameState.correctKeystrokes / 5) / timeElapsed) || 0;
            const accuracy = gameState.totalKeystrokes > 0 
                ? Math.round((gameState.correctKeystrokes / gameState.totalKeystrokes) * 100)
                : 100;
            
            // Update user progress
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const fakeUsers = JSON.parse(localStorage.getItem('fakeUsers'));
            
            if (gameState.currentLevel === currentUser.levelsCompleted + 1) {
                currentUser.levelsCompleted = gameState.currentLevel;
                currentUser.typingSpeed = finalWpm;
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                
                if (currentUser.username !== 'Guest') {
                    fakeUsers[currentUser.username] = {
                        ...fakeUsers[currentUser.username],
                        levelsCompleted: gameState.currentLevel,
                        typingSpeed: finalWpm
                    };
                    localStorage.setItem('fakeUsers', JSON.stringify(fakeUsers));
                }
            }
            
            // Show stats popup
            showStatsPopup({
                level: gameState.currentLevel,
                wpm: finalWpm,
                accuracy: accuracy,
                time: Math.round(timeElapsed * 60),
                nextLevelUnlocked: gameState.currentLevel === currentUser.levelsCompleted
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
                <h2>Level ${stats.level} Completed!</h2>
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
        
        // Handle continue button
        popup.querySelector('#continue-btn').addEventListener('click', () => {
            popup.remove();
            showPage('levels');
        });
        
        // Close popup when clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
                showPage('levels');
            }
        });
    }

    // Start the application
    init();
});