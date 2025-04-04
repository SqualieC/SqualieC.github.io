// Blackjack game JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dealButton = document.getElementById('deal-button');
    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const messageEl = document.getElementById('message');
    const playerCardsEl = document.getElementById('player-cards');
    const dealerCardsEl = document.getElementById('dealer-cards');
    const playerScoreEl = document.getElementById('player-score');
    const dealerScoreEl = document.getElementById('dealer-score');
    
    // Game state
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let playerScore = 0;
    let dealerScore = 0;
    let gameInProgress = false;
    
    // Card values
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Initialize the game
    function initGame() {
        deck = createDeck();
        shuffleDeck(deck);
        resetGame();
        
        dealButton.addEventListener('click', startGame);
        hitButton.addEventListener('click', playerHit);
        standButton.addEventListener('click', playerStand);
    }
    
    // Create a new deck
    function createDeck() {
        let newDeck = [];
        for (let suit of suits) {
            for (let value of values) {
                newDeck.push({ suit, value });
            }
        }
        return newDeck;
    }
    
    // Shuffle the deck
    function shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }
    
    // Reset the game state
    function resetGame() {
        playerCards = [];
        dealerCards = [];
        playerScore = 0;
        dealerScore = 0;
        gameInProgress = false;
        
        playerCardsEl.innerHTML = '';
        dealerCardsEl.innerHTML = '';
        playerScoreEl.textContent = '0';
        dealerScoreEl.textContent = '0';
        messageEl.textContent = '';
        
        hitButton.disabled = true;
        standButton.disabled = true;
        dealButton.disabled = false;
    }
    
    // Start a new game
    function startGame() {
        if (deck.length < 10) {
            deck = createDeck();
            shuffleDeck(deck);
        }
        
        gameInProgress = true;
        dealButton.disabled = true;
        hitButton.disabled = false;
        standButton.disabled = false;
        
        // Deal two cards to player and dealer
        playerCards.push(drawCard(), drawCard());
        dealerCards.push(drawCard(), drawCard());
        
        updateUI();
        
        // Check for blackjack
        if (calculateScore(playerCards) === 21) {
            playerStand();
        }
    }
    
    // Draw a card from the deck
    function drawCard() {
        return deck.pop();
    }
    
    // Calculate the score of a hand
    function calculateScore(cards) {
        let score = 0;
        let aceCount = 0;
        
        for (let card of cards) {
            if (card.value === 'A') {
                aceCount++;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        
        // Adjust for aces
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount--;
        }
        
        return score;
    }
    
    // Player hits
    function playerHit() {
        playerCards.push(drawCard());
        playerScore = calculateScore(playerCards);
        updateUI();
        
        if (playerScore > 21) {
            endGame('You bust! Dealer wins.');
        }
    }
    
    // Player stands
    function playerStand() {
        hitButton.disabled = true;
        standButton.disabled = true;
        
        // Dealer's turn
        dealerTurn();
    }
    
    // Dealer's turn
    function dealerTurn() {
        let dealerFinished = false;
        
        function dealerDraw() {
            if (dealerFinished) return;
            
            dealerScore = calculateScore(dealerCards);
            
            if (dealerScore < 17) {
                dealerCards.push(drawCard());
                updateUI();
                
                // Use setTimeout to create a delay between dealer draws
                setTimeout(dealerDraw, 700);
            } else {
                dealerFinished = true;
                determineWinner();
            }
        }
        
        dealerDraw();
    }
    
    // Determine the winner
    function determineWinner() {
        playerScore = calculateScore(playerCards);
        dealerScore = calculateScore(dealerCards);
        
        if (dealerScore > 21) {
            endGame('Dealer busts! You win!');
        } else if (playerScore > dealerScore) {
            endGame('You win!');
        } else if (dealerScore > playerScore) {
            endGame('Dealer wins.');
        } else {
            endGame('Push! It\'s a tie.');
        }
    }
    
    // End the game
    function endGame(message) {
        messageEl.textContent = message;
        hitButton.disabled = true;
        standButton.disabled = true;
        dealButton.disabled = false;
        gameInProgress = false;
    }
    
    // Update the UI
    function updateUI() {
        // Update player cards and score
        playerCardsEl.innerHTML = '';
        playerScore = calculateScore(playerCards);
        playerScoreEl.textContent = playerScore.toString();
        
        for (let card of playerCards) {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            cardEl.textContent = card.value + card.suit;
            cardEl.style.color = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
            playerCardsEl.appendChild(cardEl);
        }
        
        // Update dealer cards and score
        dealerCardsEl.innerHTML = '';
        dealerScore = calculateScore(dealerCards);
        dealerScoreEl.textContent = gameInProgress && dealerCards.length > 0 ? '?' : dealerScore.toString();
        
        for (let i = 0; i < dealerCards.length; i++) {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            
            // Hide dealer's first card if game is in progress
            if (i === 0 && gameInProgress && dealerCards.length > 1) {
                cardEl.textContent = '?';
            } else {
                const card = dealerCards[i];
                cardEl.textContent = card.value + card.suit;
                cardEl.style.color = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
            }
            
            dealerCardsEl.appendChild(cardEl);
        }
    }
    
    // Initialize the game when the page loads
    initGame();
}); 