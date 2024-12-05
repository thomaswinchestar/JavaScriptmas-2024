const hackedEmojis = {
    "angry": "🎁", // 😠
    "thumbsdown": "👏", // 👎  
    "man_facepalming": "🎅", // 🤦‍♂️
    "cry": "‍😄", // 😭
    "puke": "🤩" // 🤮
}

function emojifyWord(word) {
    // Check if word starts and ends with colon
    if (word.startsWith(':') && word.endsWith(':')) {
        // Remove colons and get the shortcode
        const shortcode = word.slice(1, -1);

        // Return the hacked emoji if it exists, otherwise return original word
        return hackedEmojis[shortcode] || word;
    }
    return word;
}

function emojifyPhrase(phrase) {
    // Split the phrase into words
    const words = phrase.split(' ');

    // Map over each word and emojify if needed
    const emojifiedWords = words.map(word => emojifyWord(word));

    // Join the words back together
    return emojifiedWords.join(' ');
}

// Stretch goal solution: Also handle direct emoji replacements
function emojifyPhraseAdvanced(phrase) {
    // First handle shortcodes
    let result = emojifyPhrase(phrase);

    // Create a reverse mapping for direct emoji replacement
    const emojiMap = {
        '😠': '🎁',
        '👎': '👏',
        '🤦‍♂️': '🎅',
        '😭': '😄',
        '🤮': '🤩'
    };

    // Replace any direct emojis
    for (const [negative, positive] of Object.entries(emojiMap)) {
        result = result.replace(new RegExp(negative, 'g'), positive);
    }

    return result;
}

// Test cases
console.log(emojifyWord(":angry:")); // 🎁
console.log(emojifyWord(":notanemoji:")); // :notanemoji:
console.log(emojifyPhrase("Those shoes :puke:")); // Those shoes 🤩
console.log(emojifyPhrase("Just read your article :thumbsdown:")); // Just read your article 👏
console.log(emojifyPhraseAdvanced("I'm so 😠 and 😭")); // I'm so 🎁 and 😄