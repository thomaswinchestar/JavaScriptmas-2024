/*
Grandpa has a Christmas wish list to keep track of all the gifts he wants to ask for. But there’s a problem: if he forgets he’s already added something, the list gets clogged up with duplicates. This happened last year, and he ended up with 8 talking picture frames on Christmas Day!

Your task is to complete the `checkDuplicate()` function 👇 to ensure no duplicates are added to the list. But here’s the tricky part: Grandpa sometimes hits the spacebar more than once, making it harder to spot duplicates.

For example, only one of these entries should be added to the list — the others should be flagged as duplicates:

- "talking picture frames"
- "talking  picture frames"
- "talking picture    frames"
- " talking picture frames "

**Your tasks:**
1. Ensure no duplicates can be added to the list.
2. Account for extra spaces at the beginning/end and between words.
 
**Stretch Goals:**
1. Case Sensitivity: Handle cases where capitalization differs. For example:
   - `"Cat Hammock"` should be flagged as a duplicate of `"cat hammock"`.
   - Preserve Grandpa’s original capitalization (e.g., if `"Cat Hammock"` is added first, that should be added to the list). Do not simply convert all entries to lower case - Grandpa might well want to capitalize some words. 

2. Additional Features: Add functionality to delete or edit items on the list.
*/

// Get references to DOM elements
const itemInput = document.getElementById('item-input')
const addItemButton = document.getElementById('add-item-button')
const shoppingList = document.getElementById('shopping-list')
const listArr = []
const normalizedSet = new Set()

// Function to check item is not duplicate
function checkDuplicate() {
    const itemText = itemInput.value
    const cleanedText = itemText.trim().replace(/\s+/g, ' ')
    const normalizedText = cleanedText.toLowerCase()

    if (normalizedSet.has(normalizedText)) {
        alert('Duplicate Item')
    } else {
        listArr.push(cleanedText)
        normalizedSet.add(normalizedText)
        renderList()
    }

    itemInput.value = '' // Clear the input field

}

// Function to add an item to the shopping list
function renderList() {
    shoppingList.innerHTML = ''
    listArr.forEach((gift, index) => {
        const listItem = document.createElement('li')
        listItem.textContent = gift

        // Add delete button to each list item
        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'Delete'
        deleteButton.style.marginLeft = '10px'

        deleteButton.addEventListener('click', () => {
            //remove item from listArr
            listArr.splice(index, 1)

            // remove item from normalizedSet
            const normalizedText = gift.trim().replace(/\s+/g, ' ').toLowerCase()
            normalizedSet.delete(normalizedText)

            renderList()
        })

        // Create edit button
        const editButton = document.createElement('button')
        editButton.textContent = 'Edit'
        editButton.style.marginLeft = '5px'

        editButton.addEventListener('click', () => {
            // Create input field for editing
            const editInput = document.createElement('input')
            editInput.type = 'text'
            editInput.value = gift;

            // Create Save Button
            const saveButton = document.createElement('button')
            saveButton.textContent = 'Save'
            saveButton.style.margin = '5px'

            // Create cancel button
            const cancelButton = document.createElement('button')
            cancelButton.textContent = 'Cancel'

            //Clear the list item and append the input and buttons
            listItem.textContent = ''
            listItem.appendChild(editInput)
            listItem.appendChild(saveButton)
            listItem.appendChild(cancelButton)

            saveButton.addEventListener('click', () => {
                const newItemText = editInput.value.trim().replace(/\s+/g, ' ')
                const newNormalizedText = newItemText.toLowerCase()

                //Check for duplicate
                const originalNormalizedText = gift.trim().replace(/\s+/g, ' ').toLowerCase()
                if (normalizedSet.has(newNormalizedText) && newNormalizedText !== originalNormalizedText) {
                    alert('Duplicate Item')
                } else {
                    //update listArr
                    listArr[index] = newItemText

                    //update normalizedSet
                    normalizedSet.delete(originalNormalizedText)
                    normalizedSet.add(newNormalizedText)

                    //Re-render the list
                    renderList()
                }
            })

            cancelButton.addEventListener('click', () => {
                //Re-render the list
                renderList()
            })
        })

        // Append buttons to list item
        listItem.appendChild(deleteButton)
        listItem.appendChild(editButton)

        shoppingList.appendChild(listItem)
    })
}

// Add event listener to button
addItemButton.addEventListener('click', checkDuplicate)

// Allow adding items by pressing Enter key
itemInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        checkDuplicate()
    }
})