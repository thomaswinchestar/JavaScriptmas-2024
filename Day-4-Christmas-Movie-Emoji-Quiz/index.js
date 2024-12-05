import { films } from '/data.js';

// Get DOM elements
const guessInput = document.getElementById('guess-input');
const messageContainer = document.getElementsByClassName('message-container')[0];
const emojiCluesContainer = document.getElementsByClassName('emoji-clues-container')[0];

// Game state
let availableFilms = [...films];
let currentFilm = null;
let guessesRemaining = 3;
let isWaiting = false;

// AI answer checking function
async function checkAnswerSimilarity(guess, correctAnswer) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'YOUR_API_KEY',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: `Compare these two movie titles and respond with only "true" if they refer to the same movie, or "false" if they don't:
                    Title 1: "${guess}"
                    Title 2: "${correctAnswer}"
                    Consider common variations, abbreviations, and whether including or excluding "The" matters.`
                }],
                model: 'claude-3-haiku-20240307',
                max_tokens: 1
            })
        });

        const data = await response.json();
        return data.content.toLowerCase().includes('true');
    } catch (error) {
        console.error('AI comparison failed:', error);
        // Fallback to string similarity
        return calculateStringSimilarity(guess, correctAnswer) >= 0.8;
    }
}

// Calculate string similarity as fallback
function calculateStringSimilarity(str1, str2) {
    const normalize = (str) => {
        return str.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const s1 = normalize(str1);
    const s2 = normalize(str2);

    // Perfect match after normalization
    if (s1 === s2) return 1;

    // Handle "The" prefix
    const removeThe = (str) => str.replace(/^the\s+/, '');
    if (removeThe(s1) === removeThe(s2)) return 1;

    // Word-level similarity
    const words1 = new Set(s1.split(' '));
    const words2 = new Set(s2.split(' '));
    const matchingWords = [...words1].filter(word => words2.has(word)).length;
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    const wordSimilarity = matchingWords / totalUniqueWords;

    // Character-level similarity
    const maxLength = Math.max(s1.length, s2.length);
    let matchingChars = 0;
    const minLength = Math.min(s1.length, s2.length);

    for (let i = 0; i < minLength; i++) {
        if (s1[i] === s2[i]) matchingChars++;
    }

    const charSimilarity = matchingChars / maxLength;

    return (wordSimilarity * 0.6) + (charSimilarity * 0.4);
}

// Initialize game
function initializeGame() {
    if (!guessInput) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'guess-input';
        input.placeholder = 'Enter your guess...';
        document.querySelector('form').appendChild(input);
    }

    setupFormSubmission();
    selectNewFilm();
}

// Set up form submission
function setupFormSubmission() {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.style.transition = 'opacity 0.3s ease';
    }

    guessInput.addEventListener('input', () => {
        if (submitButton) {
            submitButton.disabled = !guessInput.value.trim() || isWaiting;
        }
    });
}

// Select new film
function selectNewFilm() {
    if (availableFilms.length === 0) {
        endGame();
        return;
    }

    const randomIndex = Math.floor(Math.random() * availableFilms.length);
    currentFilm = availableFilms[randomIndex];
    availableFilms = availableFilms.filter((_, index) => index !== randomIndex);

    displayEmoji(currentFilm);
    guessesRemaining = 3;
    updateMessage(`You have ${guessesRemaining} guesses remaining.`);
    enableGameControls();
}

// Display emoji
function displayEmoji(film) {
    if (!film) return;

    emojiCluesContainer.innerHTML = film.emoji.join(' ');
    emojiCluesContainer.setAttribute('aria-label', film.ariaLabel);
}

// Update message
function updateMessage(message, type = 'neutral') {
    messageContainer.textContent = message;
    messageContainer.className = 'message-container ' + type;
}

// End game
function endGame() {
    updateMessage("That's all folks!", 'game-over');
    emojiCluesContainer.innerHTML = '🎬';
    disableGameControls(true);
}

// Disable/enable controls
function disableGameControls(disabled = true) {
    const form = document.querySelector('form');
    const submitButton = form.querySelector('button[type="submit"]');

    if (guessInput) {
        guessInput.disabled = disabled;
        guessInput.style.opacity = disabled ? '0.6' : '1';
    }

    if (submitButton) {
        submitButton.disabled = disabled;
        submitButton.style.opacity = disabled ? '0.6' : '1';
    }
}

function enableGameControls() {
    disableGameControls(false);
}

// Handle guess submission
async function handleGuess(event) {
    event.preventDefault();

    if (isWaiting || !currentFilm) return;

    const guess = guessInput.value.trim();
    if (!guess) return;

    disableGameControls(true);
    updateMessage('Checking your answer...', 'checking');

    try {
        const isCorrect = await checkAnswerSimilarity(guess, currentFilm.title);

        if (isCorrect) {
            updateMessage('Correct!', 'correct');
            isWaiting = true;

            setTimeout(() => {
                isWaiting = false;
                guessInput.value = '';
                selectNewFilm();
            }, 3000);
        } else {
            guessesRemaining--;
            guessInput.value = '';

            if (guessesRemaining > 0) {
                updateMessage(
                    `Incorrect! You have ${guessesRemaining} more ${guessesRemaining === 1 ? 'guess' : 'guesses'} remaining.`,
                    'incorrect'
                );
                disableGameControls(false);
            } else {
                updateMessage(`The film was ${currentFilm.title}!`, 'game-over');
                isWaiting = true;

                setTimeout(() => {
                    isWaiting = false;
                    selectNewFilm();
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Error checking answer:', error);
        updateMessage('Sorry, there was an error checking your answer. Please try again.', 'error');
        disableGameControls(false);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', handleGuess);
    }

    initializeGame();
});