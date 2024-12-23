/*
This Christmas, you’ve been tasked with running an anagram quiz at
the family gathering.

You have been given a list of anagrams, but you suspect that some
of the anagram pairs might be incorrect.

Your job is to write a JavaScript function to loop through the array
and filter out any pairs that aren’t actually anagrams.

For this challenge, spaces will be ignored, so "Be The Helm" would
be considered a valid anagram of "Bethlehem".
*/

let anagrams = [
    ["Can Assault", "Santa Claus"],
    ["Refreshed Erudite Londoner", "Rudolf the Red Nose Reindeer"],
    ["Frosty The Snowman", "Honesty Warms Front"],
    ["Drastic Charms", "Christmas Cards"],
    ["Congress Liar", "Carol Singers"],
    ["The Tin Glints", "Silent Night"],
    ["Be The Helm", "Betlehem"],
    ["Is Car Thieves", "Christmas Eve"]
];

function findAnagrams(array){
    //Helper function to process string(remove spaces, lowercase, sort)
    const processString = str =>
        str.toLowerCase()   // convert to lowercase
            .replace(/\s+/g, '') // remove all spaces
            .split('') // split into array of characters
            .sort() // sort characters
            .join(''); // join back into string

    //Filter array to keep only valid anagram pairs
    return array.filter(([str1, str2]) => {
        const processed1 = processString(str1);
        const processed2 = processString(str2);
        return processed1 === processed2;
    })
}

//test the function
const validAnagrams = findAnagrams(anagrams);
console.log("Valid anagram pairs:");
validAnagrams.forEach(([str1, str2]) => {
    console.log(`"${str1}" <-> "${str2}"`);
})


