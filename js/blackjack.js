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
    const betInput = document.getElementById('bet-amount');
    const betButton = document.getElementById('place-bet-button');
    const balanceEl = document.getElementById('player-balance');
    const loginButton = document.getElementById('login-button');
    const loginSection = document.getElementById('login-section');
    const gameSection = document.getElementById('game-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Game state
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let playerScore = 0;
    let dealerScore = 0;
    let gameInProgress = false;
    let currentBet = 0;
    let playerBalance = 100;
    let gameHistory = [];
    let currentUser = null;
    let users = JSON.parse(localStorage.getItem('blackjackUsers')) || {};
    
    // Card values
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // Initialize the game
    function initGame() {
        deck = createDeck();
        shuffleDeck(deck);
        resetGame();
        
        updateBalance();
        
        // Event listeners
        dealButton.addEventListener('click', startGame);
        hitButton.addEventListener('click', playerHit);
        standButton.addEventListener('click', playerStand);
        betButton.addEventListener('click', placeBet);
        
        // Setup login system
        if (loginButton) {
            loginButton.addEventListener('click', toggleLoginSection);
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
        }
        
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('currentBlackjackUser');
        if (savedUser) {
            currentUser = savedUser;
            const userData = users[currentUser];
            if (userData) {
                playerBalance = userData.balance;
                gameHistory = userData.history || [];
                updateBalance();
                showGameSection();
                
                // Show welcome back message
                messageEl.textContent = `Welcome back, ${currentUser}!`;
            }
        }
    }
    
    // User login and registration functions
    function toggleLoginSection() {
        if (loginSection.style.display === 'none') {
            loginSection.style.display = 'block';
            gameSection.style.display = 'none';
        } else {
            loginSection.style.display = 'none';
            gameSection.style.display = 'block';
        }
    }
    
    function showGameSection() {
        if (loginSection) loginSection.style.display = 'none';
        if (gameSection) gameSection.style.display = 'block';
        
        // Update user info display
        const userInfoEl = document.getElementById('user-info');
        if (userInfoEl && currentUser) {
            userInfoEl.textContent = `Logged in as: ${currentUser}`;
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        if (users[username] && users[username].password === password) {
            currentUser = username;
            playerBalance = users[username].balance;
            gameHistory = users[username].history || [];
            
            // Save current user to localStorage
            localStorage.setItem('currentBlackjackUser', username);
            
            updateBalance();
            showGameSection();
            messageEl.textContent = `Welcome back, ${username}!`;
        } else {
            alert('Invalid username or password');
        }
    }
    
    function handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        
        if (users[username]) {
            alert('Username already exists');
            return;
        }
        
        // Create new user
        users[username] = {
            password: password,
            balance: 100,
            history: []
        };
        
        // Save to localStorage
        localStorage.setItem('blackjackUsers', JSON.stringify(users));
        
        // Auto login
        currentUser = username;
        playerBalance = 100;
        gameHistory = [];
        
        // Save current user to localStorage
        localStorage.setItem('currentBlackjackUser', username);
        
        updateBalance();
        showGameSection();
        messageEl.textContent = `Welcome, ${username}!`;
    }
    
    function saveUserData() {
        if (currentUser) {
            users[currentUser] = {
                ...users[currentUser],
                balance: playerBalance,
                history: gameHistory
            };
            localStorage.setItem('blackjackUsers', JSON.stringify(users));
        }
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
    
    // Place a bet
    function placeBet() {
        const betAmount = parseInt(betInput.value);
        
        if (isNaN(betAmount) || betAmount <= 0) {
            messageEl.textContent = 'Please enter a valid bet amount';
            return;
        }
        
        if (betAmount > playerBalance) {
            messageEl.textContent = 'You don\'t have enough money';
            return;
        }
        
        if (playerBalance - betAmount < 10 && playerBalance > 10) {
            messageEl.textContent = 'You must keep at least $10 in your balance';
            return;
        }
        
        currentBet = betAmount;
        playerBalance -= betAmount;
        updateBalance();
        
        betInput.disabled = true;
        betButton.disabled = true;
        dealButton.disabled = false;
        messageEl.textContent = `Bet placed: $${betAmount}`;
    }
    
    // Update balance display
    function updateBalance() {
        if (balanceEl) {
            balanceEl.textContent = playerBalance;
            
            // Disable betting if balance is too low
            if (playerBalance < 10) {
                betInput.disabled = true;
                betButton.disabled = true;
                messageEl.textContent = 'Game over! You don\'t have enough money.';
                
                // Add option to reset balance
                const resetButton = document.createElement('button');
                resetButton.textContent = 'Reset Balance';
                resetButton.className = 'btn btn-primary';
                resetButton.addEventListener('click', function() {
                    playerBalance = 100;
                    updateBalance();
                    messageEl.textContent = 'Your balance has been reset to $100';
                    this.remove();
                });
                
                // Only add the reset button if it doesn't exist already
                if (!document.getElementById('reset-balance-button')) {
                    resetButton.id = 'reset-balance-button';
                    messageEl.parentNode.appendChild(resetButton);
                }
            }
        }
        
        saveUserData();
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
        dealButton.disabled = currentBet === 0;
        
        if (betInput) {
            betInput.disabled = false;
        }
        
        if (betButton) {
            betButton.disabled = false;
        }
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
        
        // Deal two cards to player and dealer with animations
        playerCards = [];
        dealerCards = [];
        playerCardsEl.innerHTML = '';
        dealerCardsEl.innerHTML = '';
        
        const dealPlayerCard1 = () => {
            const card = drawCard();
            playerCards.push(card);
            displayCard(card, playerCardsEl, 0);
        };
        
        const dealDealerCard1 = () => {
            const card = drawCard();
            dealerCards.push(card);
            displayCard(card, dealerCardsEl, 0, true);
        };
        
        const dealPlayerCard2 = () => {
            const card = drawCard();
            playerCards.push(card);
            displayCard(card, playerCardsEl, 1);
        };
        
        const dealDealerCard2 = () => {
            const card = drawCard();
            dealerCards.push(card);
            displayCard(card, dealerCardsEl, 1, false);
            
            // After all cards are dealt, check for blackjack
            updateUI();
            if (calculateScore(playerCards) === 21) {
                playerStand();
            }
        };
        
        // Deal with animation timing
        setTimeout(dealPlayerCard1, 300);
        setTimeout(dealDealerCard1, 600);
        setTimeout(dealPlayerCard2, 900);
        setTimeout(dealDealerCard2, 1200);
    }
    
    // Display a card with animation
    function displayCard(card, container, index, hidden = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.style.animationDelay = `${index * 0.2}s`;
        
        if (hidden) {
            cardEl.textContent = '?';
            cardEl.dataset.value = card.value;
            cardEl.dataset.suit = card.suit;
        } else {
            cardEl.textContent = card.value + card.suit;
            cardEl.style.color = ['♥', '♦'].includes(card.suit) ? 'red' : 'black';
        }
        
        container.appendChild(cardEl);
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
        const card = drawCard();
        playerCards.push(card);
        displayCard(card, playerCardsEl, playerCards.length - 1);
        
        playerScore = calculateScore(playerCards);
        playerScoreEl.textContent = playerScore.toString();
        
        if (playerScore > 21) {
            setTimeout(() => {
                endGame('You bust! Dealer wins.', false);
            }, 500);
        }
    }
    
    // Player stands
    function playerStand() {
        hitButton.disabled = true;
        standButton.disabled = true;
        
        // Reveal dealer's hidden card
        const hiddenCard = dealerCardsEl.querySelector('.card:first-child');
        if (hiddenCard && hiddenCard.textContent === '?') {
            const value = hiddenCard.dataset.value;
            const suit = hiddenCard.dataset.suit;
            hiddenCard.textContent = value + suit;
            hiddenCard.style.color = ['♥', '♦'].includes(suit) ? 'red' : 'black';
        }
        
        // Update dealer score display
        dealerScore = calculateScore(dealerCards);
        dealerScoreEl.textContent = dealerScore.toString();
        
        // Dealer's turn
        setTimeout(dealerTurn, 500);
    }
    
    // Dealer's turn
    function dealerTurn() {
        dealerScore = calculateScore(dealerCards);
        dealerScoreEl.textContent = dealerScore.toString();
        
        if (dealerScore < 17) {
            const card = drawCard();
            dealerCards.push(card);
            displayCard(card, dealerCardsEl, dealerCards.length - 1);
            
            // Use setTimeout to create a delay between dealer draws
            setTimeout(dealerTurn, 700);
        } else {
            setTimeout(determineWinner, 500);
        }
    }
    
    // Determine the winner
    function determineWinner() {
        playerScore = calculateScore(playerCards);
        dealerScore = calculateScore(dealerCards);
        
        let playerWins = false;
        let message = '';
        
        if (dealerScore > 21) {
            message = 'Dealer busts! You win!';
            playerWins = true;
        } else if (playerScore > dealerScore) {
            message = 'You win!';
            playerWins = true;
        } else if (dealerScore > playerScore) {
            message = 'Dealer wins.';
            playerWins = false;
        } else {
            message = 'Push! It\'s a tie.';
            // In case of tie, return the bet
            playerBalance += currentBet;
            updateBalance();
        }
        
        endGame(message, playerWins);
    }
    
    // End the game
    function endGame(message, playerWins) {
        messageEl.textContent = message;
        hitButton.disabled = true;
        standButton.disabled = true;
        dealButton.disabled = true;
        gameInProgress = false;
        
        // Handle bet payout
        if (message !== 'Push! It\'s a tie.') {
            if (playerWins) {
                // Check for blackjack (21 with first two cards)
                if (playerScore === 21 && playerCards.length === 2) {
                    // Blackjack pays 3:2
                    const winnings = currentBet * 2.5;
                    playerBalance += winnings;
                    messageEl.textContent += ` Blackjack! You won $${winnings.toFixed(2)}!`;
                } else {
                    // Regular win pays 1:1
                    const winnings = currentBet * 2;
                    playerBalance += winnings;
                    messageEl.textContent += ` You won $${winnings.toFixed(2)}!`;
                }
            } else {
                messageEl.textContent += ` You lost $${currentBet.toFixed(2)}.`;
            }
            
            // Record game in history
            const gameResult = {
                date: new Date().toLocaleString(),
                bet: currentBet,
                playerCards: playerCards.map(card => card.value + card.suit),
                dealerCards: dealerCards.map(card => card.value + card.suit),
                playerScore: playerScore,
                dealerScore: dealerScore,
                result: playerWins ? 'win' : 'loss',
                balanceChange: playerWins ? 
                    (playerScore === 21 && playerCards.length === 2 ? currentBet * 1.5 : currentBet) : 
                    -currentBet
            };
            
            gameHistory.push(gameResult);
        }
        
        updateBalance();
        saveUserData();
        
        // Reset for next game
        currentBet = 0;
        if (betInput) {
            betInput.disabled = false;
            betInput.value = '';
        }
        if (betButton) {
            betButton.disabled = false;
        }
        
        // Enable deal button after a short delay if player has enough money
        setTimeout(() => {
            dealButton.disabled = playerBalance < 10;
        }, 1500);
    }
    
    // Update the UI
    function updateUI() {
        // Update player score
        playerScore = calculateScore(playerCards);
        playerScoreEl.textContent = playerScore.toString();
        
        // Update dealer score - show ? during gameplay or actual score otherwise
        dealerScore = calculateScore(dealerCards);
        dealerScoreEl.textContent = gameInProgress && dealerCards.length > 0 ? '?' : dealerScore.toString();
    }
    
    // Initialize the game when the page loads
    initGame();
}); 