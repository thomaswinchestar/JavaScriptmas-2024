// index.js
const snowGlobe = document.querySelector('.snow-globe')

// Create and add the button
const snowButton = document.createElement('button')
snowButton.textContent = 'Let it Snow!'
snowButton.classList.add('snow-button')
document.querySelector('main').prepend(snowButton)

let isSnowing = false
let snowInterval
let snowFrequency = 100 // Starting frequency (ms)

function createSnowflake() {
    // Create snowflake element
    const snowflake = document.createElement('div')
    snowflake.classList.add('snowflake')

    // Random properties
    const size = Math.random() * 20 + 10 // 10-30px
    const startingPosition = Math.random() * 380 // Within globe width
    const duration = Math.random() * 3 + 2 // 2-5 seconds
    const isSpecial = Math.floor(Math.random() * 25) === 0 // 1 in 25 chance for snowman
    const rotation = Math.random() * 360 // Random rotation
    const sway = Math.random() * 40 - 20 // Random sway -20px to +20px

    // Set snowflake properties
    snowflake.style.cssText = `
        left: ${startingPosition}px;
        font-size: ${size}px;
        animation-duration: ${duration}s;
        transform: rotate(${rotation}deg);
    `

    // Add custom sway animation
    snowflake.style.setProperty('--sway-amount', `${sway}px`)

    // Set content (snowflake variations or snowman)
    const snowflakes = ['❄️']
    snowflake.textContent = isSpecial ? '☃️' : snowflakes[Math.floor(Math.random() * snowflakes.length)]

    // Add to snow globe
    snowGlobe.appendChild(snowflake)

    // Remove after animation
    setTimeout(() => {
        if (snowflake.parentNode === snowGlobe) {
            snowGlobe.removeChild(snowflake)
        }
    }, duration * 1000)
}

function startSnow() {
    if (isSnowing) return
    isSnowing = true
    snowFrequency = 100 // Reset frequency
    snowButton.textContent = 'Stop Snow'

    // Add shake animation
    snowGlobe.classList.add('shake')
    setTimeout(() => {
        snowGlobe.classList.remove('shake')
    }, 500)

    createSnowflakes()
}

function stopSnow() {
    isSnowing = false
    snowButton.textContent = 'Let it Snow!'
    clearInterval(snowInterval)

    // Gradual slowdown
    const slowdown = setInterval(() => {
        snowFrequency += 50
        if (snowFrequency > 500) {
            clearInterval(slowdown)
            return
        }
        clearInterval(snowInterval)
        if (isSnowing) {
            createSnowflakes()
        }
    }, 1000)
}

function createSnowflakes() {
    snowInterval = setInterval(createSnowflake, snowFrequency)
}

// Toggle snow on button click
snowButton.addEventListener('click', () => {
    if (isSnowing) {
        stopSnow()
    } else {
        startSnow()
    }
})