import { films } from '/data.js';

// DOM elements
const guessInput = document.getElementById('guess-input');
const messageContainer = document.getElementsByClassName('message-container')[0];
const emojiCluesContainer = document.getElementsByClassName('emoji-clues-container')[0];
const input = document.querySelector('input');
const submitButton = document.querySelector('button');
const formWrapper = document.createElement('div');
formWrapper.className = 'form-wrapper';
guessInput.parentNode.insertBefore(formWrapper, guessInput);
formWrapper.appendChild(guessInput);

// Game state
let availableFilms = [...films];
let currentFilm = null;
let remainingGuesses = 3;
let isWaitingForNextRound = false;

// Enhanced string similarity functions
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }
    return dp[m][n];
}

function soundex(str) {
    const a = str.toLowerCase().split('');
    const codes = {
        a: '', e: '', i: '', o: '', u: '',
        b: 1, f: 1, p: 1, v: 1,
        c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
        d: 3, t: 3,
        l: 4,
        m: 5, n: 5,
        r: 6
    };

    const first = a[0];
    const filtered = a.slice(1).filter(char => codes[char] !== undefined);
    const encoded = filtered.map(char => codes[char]);
    const deduplicated = encoded.filter((num, i) => num !== encoded[i - 1]);

    return (first + deduplicated.join('')).slice(0, 4).padEnd(4, '0');
}

function getWordSimilarity(str1, str2) {
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    let matchCount = 0;

    for (const word1 of words1) {
        for (const word2 of words2) {
            if (word1.length > 2 && word2.length > 2) {
                const distance = levenshteinDistance(word1, word2);
                if (distance <= Math.floor(Math.max(word1.length, word2.length) * 0.3)) {
                    matchCount++;
                    break;
                }
            }
        }
    }
    return matchCount / Math.max(words1.length, words2.length);
}

function checkSimilarity(guess, answer) {
    // Normalize strings
    const normalizedGuess = guess.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const normalizedAnswer = answer.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    // Exact match after normalization
    if (normalizedGuess === normalizedAnswer) return true;

    // Remove articles and check again
    const removeArticles = str => str.replace(/^(the|a|an)\s+/i, '');
    const guessNoArticles = removeArticles(normalizedGuess);
    const answerNoArticles = removeArticles(normalizedAnswer);
    if (guessNoArticles === answerNoArticles) return true;

    // Check individual word similarity
    const wordSimilarity = getWordSimilarity(normalizedGuess, normalizedAnswer);
    if (wordSimilarity >= 0.7) return true;

    // Check Levenshtein distance
    const distance = levenshteinDistance(normalizedGuess, normalizedAnswer);
    const maxAllowedDistance = Math.floor(Math.max(normalizedGuess.length, normalizedAnswer.length) * 0.3);
    if (distance <= maxAllowedDistance) return true;

    // Check phonetic similarity
    const guessSoundex = soundex(normalizedGuess);
    const answerSoundex = soundex(normalizedAnswer);
    if (guessSoundex === answerSoundex) return true;

    return false;
}

// Animation and UI helper functions
function setMessage(text, type = 'neutral') {
    messageContainer.textContent = text;
    messageContainer.className = 'message-container message-' + type;
}

function animateEmojiContainer() {
    emojiCluesContainer.style.animation = 'none';
    emojiCluesContainer.offsetHeight; // Trigger reflow
    emojiCluesContainer.style.animation = 'fadeIn 0.5s ease-out';
}

function disableForm(loading = false) {
    input.disabled = true;
    submitButton.disabled = true;
    formWrapper.classList.add('disabled');
    if (loading) {
        messageContainer.classList.add('loading');
    }
}

function enableForm() {
    input.disabled = false;
    submitButton.disabled = false;
    formWrapper.classList.remove('disabled');
    messageContainer.classList.remove('loading');
}

function displayEmojiClues(film) {
    if (!film) {
        emojiCluesContainer.textContent = '';
        return;
    }
    emojiCluesContainer.textContent = film.emoji.join(' ');
    emojiCluesContainer.setAttribute('aria-label', film.ariaLabel);
    animateEmojiContainer();
}

function getRandomFilm() {
    if (availableFilms.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableFilms.length);
    const film = availableFilms[randomIndex];
    availableFilms.splice(randomIndex, 1);
    return film;
}

function startNewRound() {
    currentFilm = getRandomFilm();
    if (!currentFilm) {
        endGame();
        return;
    }

    remainingGuesses = 3;
    displayEmojiClues(currentFilm);
    setMessage('You have 3 guesses remaining.', 'neutral');
    enableForm();
}

function endGame() {
    setMessage("That's all folks!", 'neutral');
    disableForm();
    document.body.classList.add('game-over');
    emojiCluesContainer.textContent = '🎬 🎲 ✨';
}

function handleGuess(guess) {
    if (isWaitingForNextRound) return;

    const isCorrect = checkSimilarity(guess, currentFilm.title);

    if (isCorrect) {
        setMessage('Correct!', 'success');
        handleCorrectGuess();
    } else {
        remainingGuesses--;
        if (remainingGuesses > 0) {
            setMessage(`Incorrect! You have ${remainingGuesses} more ${remainingGuesses === 1 ? 'guess' : 'guesses'} remaining.`, 'error');
        } else {
            setMessage(`The film was ${currentFilm.title}!`, 'error');
            handleWrongGuess();
        }
    }
}

function handleCorrectGuess() {
    isWaitingForNextRound = true;
    disableForm(true);
    setTimeout(() => {
        isWaitingForNextRound = false;
        startNewRound();
    }, 3000);
}

function handleWrongGuess() {
    isWaitingForNextRound = true;
    disableForm(true);
    setTimeout(() => {
        isWaitingForNextRound = false;
        startNewRound();
    }, 3000);
}

// Event listeners
guessInput.addEventListener('submit', (e) => {
    e.preventDefault();
    const guess = input.value.trim();
    if (!guess) return;

    handleGuess(guess);
    input.value = '';
});

// Initialize the game
startNewRound();