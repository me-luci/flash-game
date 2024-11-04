document.addEventListener('DOMContentLoaded', () => {
    const flashcardsContainer = document.getElementById('flashcards-container');
    const questionInput = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const addCardButton = document.getElementById('add-card');
    const startGameButton = document.getElementById('start-game');
    const resetGameButton = document.getElementById('reset-game');
    const matchedTableBody = document.getElementById('matched-table-body');
    const scoreDisplay = document.getElementById('score');

    let flashcards = [];
    let score = 0;
    let currentDraggedCard = null;

    // Function to create a flashcard element
    function createFlashcardElement(content, type) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.setAttribute('draggable', true);
        card.dataset.type = type; // 'question' or 'answer'
        card.dataset.content = content; // For matching purposes
        card.innerHTML = content;

        // Add drag event listeners
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);

        flashcardsContainer.appendChild(card);
        randomizeCardPosition(card);
    }

    // Add new flashcard
    addCardButton.onclick = () => {
        const question = questionInput.value.trim();
        const answer = answerInput.value.trim();

        if (question && answer) {
            flashcards.push({ question, answer });
            createFlashcardElement(`<strong>Q:</strong> ${question}`, 'question');
            createFlashcardElement(`<strong>A:</strong> ${answer}`, 'answer');
        }

        questionInput.value = '';
        answerInput.value = '';
    };

    // Start the game
    startGameButton.onclick = () => {
        if (flashcards.length === 0) {
            alert("Please add at least one flashcard!");
            return;
        }

        flashcardsContainer.style.display = 'flex';
        flashcardsContainer.innerHTML = '';

        flashcards.forEach(({ question, answer }) => {
            createFlashcardElement(`<strong>Q:</strong> ${question}`, 'question');
            createFlashcardElement(`<strong>A:</strong> ${answer}`, 'answer');
        });

        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
    };

    // Function to randomize card position
    function randomizeCardPosition(card) {
        const containerWidth = flashcardsContainer.clientWidth;
        const containerHeight = flashcardsContainer.clientHeight;

        // Get the width and height of the card itself
        const cardWidth = card.offsetWidth;
        const cardHeight = card.offsetHeight;

        let positionValid = false;
        let randomX, randomY;

        while (!positionValid) {
            randomX = Math.floor(Math.random() * (containerWidth - cardWidth));
            randomY = Math.floor(Math.random() * (containerHeight - cardHeight));

            // Check for overlap with existing cards
            positionValid = true;
            const existingCards = flashcardsContainer.children;
            for (let i = 0; i < existingCards.length; i++) {
                const existingCard = existingCards[i];
                const rect1 = { x: randomX, y: randomY, width: cardWidth, height: cardHeight };
                const rect2 = {
                    x: existingCard.offsetLeft,
                    y: existingCard.offsetTop,
                    width: existingCard.offsetWidth,
                    height: existingCard.offsetHeight
                };

                // Check if the new card overlaps with any existing card
                if (
                    rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y
                ) {
                    positionValid = false;
                    break;
                }
            }
        }

        card.style.position = 'absolute';
        card.style.left = `${randomX}px`;
        card.style.top = `${randomY}px`;
    }

    // Drag functions
    function dragStart(e) {
        currentDraggedCard = e.target;
        e.dataTransfer.setData('text/plain', currentDraggedCard.dataset.content);
        setTimeout(() => {
            currentDraggedCard.classList.add('hidden');
        }, 0);
    }

    function dragEnd() {
        currentDraggedCard.classList.remove('hidden');
        currentDraggedCard = null;
    }

    // Allow cards to be dropped and matched
    flashcardsContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    flashcardsContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!currentDraggedCard) return;

        const droppedCard = e.target;
        if (droppedCard !== currentDraggedCard && droppedCard.classList.contains('card')) {
            const draggedType = currentDraggedCard.dataset.type;
            const droppedType = droppedCard.dataset.type;

            // Check if they are valid pairs (question/answer)
            if (
                (draggedType === 'question' && droppedType === 'answer') ||
                (draggedType === 'answer' && droppedType === 'question')
            ) {
                const questionText = draggedType === 'question' ? currentDraggedCard.dataset.content : droppedCard.dataset.content;
                const answerText = draggedType === 'answer' ? currentDraggedCard.dataset.content : droppedCard.dataset.content;

                if (isMatchingPair(questionText, answerText)) {
                    matchCards(questionText, answerText);
                }
            }
        }
    });

    // Check if a question and answer match
    function isMatchingPair(questionHTML, answerHTML) {
        const questionText = questionHTML.replace('<strong>Q:</strong> ', '');
        const answerText = answerHTML.replace('<strong>A:</strong> ', '');

        return flashcards.some(flashcard => flashcard.question === questionText && flashcard.answer === answerText);
    }

    function matchCards(questionHTML, answerHTML) {
        const questionText = questionHTML.replace('<strong>Q:</strong> ', '');
        const answerText = answerHTML.replace('<strong>A:</strong> ', '');

        flashcards = flashcards.filter(f => f.question !== questionText || f.answer !== answerText);
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        addMatchedPairToTable(questionText, answerText);

        // Remove the matched cards from the container
        currentDraggedCard.remove();
        const otherCard = [...flashcardsContainer.children].find(card => card.dataset.content === answerHTML || card.dataset.content === questionHTML);
        if (otherCard) otherCard.remove();

        checkWinCondition();
    }

    function addMatchedPairToTable(question, answer) {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${question}</td><td>${answer}</td>`;
        matchedTableBody.appendChild(row);
    }

    function checkWinCondition() {
        if (flashcards.length === 0) {
            alert("Congratulations! You've matched all pairs!");
            flashcardsContainer.style.display = 'none';
            // No need to reset score here, as it stays until reset
            matchedTableBody.innerHTML = '';
        }
    }

    // Reset game functionality
    resetGameButton.onclick = () => {
        flashcards = [];
        score = 0;
        scoreDisplay.textContent = `Score: ${score}`;
        matchedTableBody.innerHTML = '';
        flashcardsContainer.style.display = 'none';
        flashcardsContainer.innerHTML = '';
        questionInput.value = '';
        answerInput.value = '';
    };
});
// nice workedddd
