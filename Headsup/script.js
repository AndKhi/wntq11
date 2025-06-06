class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
    }

    toString() {
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suits = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return `${values[this.value]}${suits[this.suit]}`;
    }

    isRed() {
        return this.suit === 'hearts' || this.suit === 'diamonds';
    }

    getValue() {
        return this.value;
    }

    getSuit() {
        return this.suit;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        this.cards = [];
        for (let suit of suits) {
            for (let value = 0; value < 13; value++) {
                this.cards.push(new Card(suit, value));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }
}

class PokerGame {
    constructor() {
        this.deck = new Deck();
        this.playerCards = [];
        this.dealerCards = [];
        this.communityCards = [];
        this.playerScore = 0;
        this.dealerScore = 0;
        this.isPlaying = false;
        this.setupEventListeners();
        this.showWaitingState();
    }

    setupEventListeners() {
        document.getElementById('all-in').addEventListener('click', () => this.handleAllIn());
        document.getElementById('pass').addEventListener('click', () => this.handlePass());
        document.getElementById('play').addEventListener('click', () => this.startNewHand());
    }

    showWaitingState() {
        this.isPlaying = false;
        document.getElementById('all-in').disabled = true;
        document.getElementById('pass').disabled = true;
        document.getElementById('play').disabled = false;
        
        // Очищаем карты
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            card.innerHTML = '';
            card.classList.add('empty');
            card.classList.remove('back', 'visible', 'winner');
        });

        // Скрываем сообщение о результате
        const resultMessage = document.querySelector('.result-message');
        resultMessage.classList.remove('visible');
        resultMessage.textContent = '';
        
        // Показываем кнопки
        const controls = document.querySelector('.controls');
        controls.classList.remove('hidden');
    }

    async startNewHand() {
        this.isPlaying = true;
        document.getElementById('all-in').disabled = false;
        document.getElementById('pass').disabled = false;
        document.getElementById('play').disabled = true;

        this.deck.reset();
        this.deck.shuffle();
        this.playerCards = [];
        this.dealerCards = [];
        this.communityCards = [];
        
        // Раздача карт с анимацией
        for (let i = 0; i < 2; i++) {
            this.playerCards.push(this.deck.deal());
            this.dealerCards.push(this.deck.deal());
            await this.delay(300);
            this.updateDisplay();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    createCardElement(card) {
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const suits = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };

        const colorClass = card.isRed() ? 'red' : 'black';
        return `
            <div class="corner top-left">
                <span class="value ${colorClass}">${values[card.value]}</span>
                <span class="suit ${colorClass}">${suits[card.suit]}</span>
            </div>
            <div class="suit ${colorClass}">${suits[card.suit]}</div>
            <div class="corner bottom-right">
                <span class="value ${colorClass}">${values[card.value]}</span>
                <span class="suit ${colorClass}">${suits[card.suit]}</span>
            </div>
        `;
    }

    updateDisplay() {
        // Обновление карт игрока
        const playerCardElements = document.querySelectorAll('.player-cards .card');
        playerCardElements.forEach((element, index) => {
            if (this.playerCards[index]) {
                element.innerHTML = this.createCardElement(this.playerCards[index]);
                element.classList.remove('empty');
                element.classList.add('visible');
            } else {
                element.innerHTML = '';
                element.classList.add('empty');
                element.classList.remove('visible');
            }
        });

        // Обновление карт дилера
        const dealerCardElements = document.querySelectorAll('.dealer-cards .card');
        dealerCardElements.forEach((element, index) => {
            if (this.dealerCards[index]) {
                if (this.isPlaying && !this.communityCards.length) {
                    // Если игра идет и нет общих карт (не было ставки), показываем рубашку
                    element.innerHTML = '';
                    element.classList.add('back');
                    element.classList.remove('empty');
                    element.classList.add('visible');
                } else {
                    // Показываем карту
                    element.innerHTML = this.createCardElement(this.dealerCards[index]);
                    element.classList.remove('back');
                    element.classList.remove('empty');
                    element.classList.add('visible');
                }
            } else {
                element.innerHTML = '';
                element.classList.add('empty');
                element.classList.remove('back', 'visible');
            }
        });

        // Обновление общих карт
        const communityCardElements = document.querySelectorAll('.community-cards .card');
        communityCardElements.forEach((element, index) => {
            if (this.communityCards[index]) {
                element.innerHTML = this.createCardElement(this.communityCards[index]);
                element.classList.remove('empty');
                element.classList.add('visible');
            } else {
                element.innerHTML = '';
                element.classList.add('empty');
                element.classList.remove('visible');
            }
        });

        // Обновление счета
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('dealer-score').textContent = this.dealerScore;
    }

    getHandRank(cards) {
        const values = cards.map(card => card.value);
        const suits = cards.map(card => card.suit);
        
        // Сортировка значений по убыванию
        values.sort((a, b) => b - a);
        
        // Подсчет количества карт каждого значения
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });

        // Проверка на стрит
        const isStraight = () => {
            const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
            if (uniqueValues.length < 5) return false;
            
            // Проверка на обычный стрит
            for (let i = 0; i <= uniqueValues.length - 5; i++) {
                if (uniqueValues[i] - uniqueValues[i + 4] === 4) {
                    return true;
                }
            }
            
            // Проверка на стрит с тузом внизу (A-5)
            if (uniqueValues.includes(12) && // A
                uniqueValues.includes(3) && // 5
                uniqueValues.includes(2) && // 4
                uniqueValues.includes(1) && // 3
                uniqueValues.includes(0)) { // 2
                return true;
            }
            
            return false;
        };

        // Проверка на флеш
        const isFlush = () => {
            return new Set(suits).size === 1;
        };

        // Подсчет пар, троек и каре
        const pairs = Object.values(valueCounts).filter(count => count === 2).length;
        const threeOfAKind = Object.values(valueCounts).some(count => count === 3);
        const fourOfAKind = Object.values(valueCounts).some(count => count === 4);

        // Определение комбинации
        if (isStraight() && isFlush()) {
            if (values[0] === 12 && values[4] === 8) { // A-K-Q-J-10
                return { name: 'Роял-флеш', rank: 9, cards: cards };
            }
            return { name: 'Стрит-флеш', rank: 8, cards: cards };
        }
        if (fourOfAKind) {
            const fourValue = Object.entries(valueCounts).find(([_, count]) => count === 4)[0];
            const kicker = Object.entries(valueCounts).find(([_, count]) => count === 1)[0];
            const fourCards = cards.filter(card => card.value === parseInt(fourValue));
            const kickerCard = cards.find(card => card.value === parseInt(kicker));
            return { 
                name: 'Каре', 
                rank: 7, 
                cards: [...fourCards, kickerCard]
            };
        }
        if (threeOfAKind && pairs > 0) {
            const threeValue = Object.entries(valueCounts).find(([_, count]) => count === 3)[0];
            const pairValue = Object.entries(valueCounts).find(([_, count]) => count === 2)[0];
            const threeCards = cards.filter(card => card.value === parseInt(threeValue));
            const pairCards = cards.filter(card => card.value === parseInt(pairValue));
            return { 
                name: 'Фулл-хаус', 
                rank: 6, 
                cards: [...threeCards, ...pairCards]
            };
        }
        if (isFlush()) {
            return { name: 'Флеш', rank: 5, cards: cards };
        }
        if (isStraight()) {
            return { name: 'Стрит', rank: 4, cards: cards };
        }
        if (threeOfAKind) {
            const threeValue = Object.entries(valueCounts).find(([_, count]) => count === 3)[0];
            const threeCards = cards.filter(card => card.value === parseInt(threeValue));
            const kickers = cards
                .filter(card => card.value !== parseInt(threeValue))
                .sort((a, b) => b.value - a.value)
                .slice(0, 2);
            return { 
                name: 'Тройка', 
                rank: 3, 
                cards: [...threeCards, ...kickers]
            };
        }
        if (pairs === 2) {
            const pairValues = Object.entries(valueCounts)
                .filter(([_, count]) => count === 2)
                .map(([value, _]) => parseInt(value))
                .sort((a, b) => b - a);
            const pairCards = cards.filter(card => pairValues.includes(card.value));
            const kicker = cards
                .find(card => !pairValues.includes(card.value));
            return { 
                name: 'Две пары', 
                rank: 2, 
                cards: [...pairCards, kicker]
            };
        }
        if (pairs === 1) {
            const pairValue = Object.entries(valueCounts).find(([_, count]) => count === 2)[0];
            const pairCards = cards.filter(card => card.value === parseInt(pairValue));
            const kickers = cards
                .filter(card => card.value !== parseInt(pairValue))
                .sort((a, b) => b.value - a.value)
                .slice(0, 3);
            return { 
                name: 'Пара', 
                rank: 1, 
                cards: [...pairCards, ...kickers]
            };
        }
        // Старшая карта - берем 5 старших карт
        const highCards = cards.sort((a, b) => b.value - a.value).slice(0, 5);
        return { name: 'Старшая карта', rank: 0, cards: highCards };
    }

    async handleAllIn() {
        if (!this.isPlaying) return;

        // Скрываем кнопки
        const controls = document.querySelector('.controls');
        controls.classList.add('hidden');

        // Раздача общих карт с анимацией
        for (let i = 0; i < 5; i++) {
            this.communityCards.push(this.deck.deal());
            await this.delay(300);
            this.updateDisplay();
        }

        // Определение победителя
        const playerHand = [...this.playerCards, ...this.communityCards];
        const dealerHand = [...this.dealerCards, ...this.communityCards];
        
        const playerRank = this.getHandRank(playerHand);
        const dealerRank = this.getHandRank(dealerHand);

        const winner = playerRank.rank > dealerRank.rank ? 'player' : 'dealer';
        
        // Подсветка выигрышных карт
        const winnerRank = winner === 'player' ? playerRank : dealerRank;
        const allCards = document.querySelectorAll('.card');
        allCards.forEach(card => card.classList.remove('winner'));
        
        // Получаем все элементы карт
        const communityCardElements = document.querySelectorAll('.community-cards .card');
        const playerCardElements = document.querySelectorAll('.player-cards .card');
        const dealerCardElements = document.querySelectorAll('.dealer-cards .card');

        // Создаем мапу для быстрого поиска карт
        const cardMap = new Map();
        const allTableCards = [...this.playerCards, ...this.dealerCards, ...this.communityCards];
        allTableCards.forEach((card, index) => {
            const key = `${card.value}-${card.suit}`;
            cardMap.set(key, index);
        });

        // Подсвечиваем только карты выигрышной комбинации
        const winningCards = winnerRank.cards;
        winningCards.forEach(winningCard => {
            const key = `${winningCard.value}-${winningCard.suit}`;
            const index = cardMap.get(key);
            
            if (index !== undefined) {
                if (index < 2) {
                    // Карты игрока
                    playerCardElements[index].classList.add('winner');
                } else if (index < 4) {
                    // Карты дилера
                    dealerCardElements[index - 2].classList.add('winner');
                } else {
                    // Общие карты
                    communityCardElements[index - 4].classList.add('winner');
                }
            }
        });

        // Показ сообщения о результате
        const resultMessage = document.querySelector('.result-message');
        resultMessage.textContent = `${winner === 'player' ? 'Игрок' : 'Диллер'} выиграл с комбинацией ${winner === 'player' ? playerRank.name : dealerRank.name}`;
        resultMessage.classList.add('visible');

        if (winner === 'player') {
            this.playerScore++;
            this.dealerScore--;
        } else {
            this.dealerScore++;
            this.playerScore--;
        }

        this.updateDisplay();
        await this.delay(5000);
        
        // Скрываем сообщение о результате
        resultMessage.classList.remove('visible');
        
        // Показываем кнопки
        controls.classList.remove('hidden');
        
        this.showWaitingState();
    }

    handlePass() {
        if (!this.isPlaying) return;
        this.showWaitingState();
    }
}

// Запуск игры
const game = new PokerGame(); 