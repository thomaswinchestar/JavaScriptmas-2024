const calendarContainer = document.getElementById('calendar');
const currentDate = new Date();
const currentDay = currentDate.getDate();
const currentMonth = currentDate.getMonth();

// Christmas-themed gifts/treats
const surprises = [
    "🎄 Christmas Tree",
    "🎁 Present Box",
    "🍫 Chocolate",
    "🧦 Christmas Sock",
    "⭐ Star Cookie",
    "🎅 Santa Figure",
    "🦌 Reindeer",
    "🔔 Bell",
    "❄️ Snowflake",
    "🕯️ Candle",
    "🍪 Cookie",
    "🎨 Ornament",
    "🎵 Carol Book",
    "🧣 Scarf",
    "🏠 Gingerbread House",
    "🛷 Sleigh",
    "🤶 Mrs. Claus",
    "📝 Wish List",
    "🦃 Turkey",
    "🥛 Milk & Cookies",
    "🎪 Christmas Fair",
    "🎭 Nutcracker",
    "🎺 Angel",
    "🌟 Star of Bethlehem"
];

const openSound = new Audio('celebrate.mp3');
openSound.volume = 0.5; // Set volume to 50%


// Add confetti function
function createConfetti(x, y) {
    const colors = [
        '#FF3D2D', // Christmas red
        '#F9B7A9', // Christmas pink
        '#F9E9DA', // Christmas cream
        '#F8CA5B', // Christmas yellow
        '#E8AD35'  // Christmas gold
    ];

    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        document.body.appendChild(confetti);

        // Random properties
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 5;
        const rotationSpeed = (Math.random() - 0.5) * 10;
        let rotation = 0;

        // Random shapes
        if (Math.random() < 0.3) {
            confetti.style.borderRadius = '50%';
        } else if (Math.random() < 0.6) {
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.transform = 'rotate(45deg)';
        }

        confetti.style.backgroundColor = color;

        // Initial position
        let currentX = x;
        let currentY = y;
        let startTime = Date.now();

        // Animate confetti
        function updatePosition() {
            const elapsed = (Date.now() - startTime) / 1000;
            currentX += Math.cos(angle) * velocity;
            currentY += Math.sin(angle) * velocity + elapsed * 50; // Add gravity
            rotation += rotationSpeed;

            confetti.style.left = `${currentX}px`;
            confetti.style.top = `${currentY}px`;
            confetti.style.transform = `rotate(${rotation}deg)`;

            // Remove confetti after animation
            if (elapsed < 2) {
                requestAnimationFrame(updatePosition);
            } else {
                confetti.remove();
            }
        }

        requestAnimationFrame(updatePosition);
    }
}

// Load saved state from localStorage
const savedState = JSON.parse(localStorage.getItem('adventCalendarState')) || {};

for (let i = 1; i <= 24; i++) {
    let box = document.createElement('li');
    box.classList.add('calendar-box');

    // Add number
    let number = document.createElement('p');
    number.innerHTML = i;

    // Add gift icon
    const icon = document.createElement('i');
    icon.classList.add('fas', 'fa-gift');

    // Add description
    let description = document.createElement('p');
    description.innerHTML = savedState[i] || "Open me!";

    // Check if this day should be accessible
    const isDecember = currentMonth === 11;
    const isPastDay = currentDay >= i;
    const isOpen = savedState[i] && savedState[i] !== "Open me!";

    if (isOpen) {
        box.classList.add('open');
    }

    if (isDecember && isPastDay || isOpen) {
        box.addEventListener('click', () => {
            if (!box.classList.contains('open')) {
                // Get box position for confetti origin
                const rect = box.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;

                // Add opening animation class
                box.classList.add('opening');

                // Create confetti
                createConfetti(x, y);

                // Play sound
                openSound.currentTime = 0; // Reset sound to start
                openSound.play().catch(error => {
                    console.log("Audio playback failed:", error);
                });

                // Reveal surprise
                const surprise = surprises[i - 1];
                description.innerHTML = surprise;
                box.classList.add('open');

                // Remove opening animation class after animation completes
                setTimeout(() => {
                    box.classList.remove('opening');
                }, 1500);

                // Save state
                savedState[i] = surprise;
                localStorage.setItem('adventCalendarState', JSON.stringify(savedState));

            }
        });
    } else {
        box.classList.add('disabled');
    }

    // Add a simple mute button
    const muteButton = document.createElement('button');
    muteButton.innerHTML = '🔊';
    muteButton.className = 'mute-button';
    document.body.appendChild(muteButton);

    let muted = false;
    muteButton.addEventListener('click', () => {
        muted = !muted;
        muteButton.innerHTML = muted ? '🔇' : '🔊';
        openSound.muted = muted;
    });

    const styles = `
.mute-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: var(--christmas-cream);
    color: var(--christmas-red);
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: transform 0.2s ease;
}

.mute-button:hover {
    transform: scale(1.1);
}

.mute-button:active {
    transform: scale(0.95);
}
`;

// Add styles to document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    box.appendChild(number);
    box.appendChild(icon);
    box.appendChild(description);
    calendarContainer.appendChild(box);
}