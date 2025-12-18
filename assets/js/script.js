const mainBtn = document.querySelector('.mainBtn');
const cardsWrappers = document.querySelectorAll('.card-wrapper');
const cards = document.querySelectorAll('.card');
const selectBtnsWrappers = document.querySelectorAll('.select-btn-wrapper');
const finish = document.querySelector('.finish');
const balanceElement = document.querySelector('.balance span');
const betInput = document.querySelector('#bet-input');

let balance = +balanceElement.textContent;
let currentBet = null;

// Исходный массив карт (не изменяемый)
const initialCards = [
    '2C', '2D', '2H', '2S',
    '3C', '3D', '3H', '3S',
    '4C', '4D', '4H', '4S',
    '5C', '5D', '5H', '5S',
    '6C', '6D', '6H', '6S',
    '7C', '7D', '7H', '7S',
    '8C', '8D', '8H', '8S',
    '9C', '9D', '9H', '9S',
    'TC', 'TD', 'TH', 'TS',
    'JC', 'JD', 'JH', 'JS',
    'QC', 'QD', 'QH', 'QS',
    'KC', 'KD', 'KH', 'KS',
    'AC', 'AD', 'AH', 'AS',
];

// Массив карт, который будет изменяться
let allCards = [...initialCards];

calculateCombination = () => {
    // 1. Собираем текущие карты
    const cardValues = [];
    cards.forEach(card => {
        const backgroundImage = card.style.backgroundImage;
        const cardName = backgroundImage.match(/assets\/img\/(.+)\.svg/)[1]; // Извлекаем имя карты из URL
        cardValues.push(cardName);
    });

    // 2. Разделяем значения карт на масти и ранги
    const suits = cardValues.map(card => card[card.length - 1]); // Последний символ — масть (C, D, H, S)
    const ranks = cardValues.map(card => card.slice(0, -1)); // Все символы, кроме последнего — ранг

    // Преобразуем буквенные обозначения рангов в числа для удобства сравнения
    const rankValues = ranks.map(rank => {
        if (rank === 'T') return 10; // Десятка
        if (rank === 'J') return 11; // Валет
        if (rank === 'Q') return 12; // Дама
        if (rank === 'K') return 13; // Король
        if (rank === 'A') return 14; // Туз
        return parseInt(rank); // Числовые ранги
    });

    // 3. Определяем комбинацию
    const isFlush = new Set(suits).size === 1; // Все масти одинаковые
    const sortedRanks = rankValues.slice().sort((a, b) => a - b); // Сортируем ранги по возрастанию
    const isStraight = sortedRanks.every((rank, i) => i === 0 || rank === sortedRanks[i - 1] + 1); // Ранги идут подряд

    // Подсчитываем количество повторяющихся рангов
    const rankCounts = {};
    rankValues.forEach(rank => {
        rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a); // Сортируем частоты по убыванию

    // 4. Проверяем комбинации
    if (isFlush && isStraight && sortedRanks[0] === 10) return 'Royal Flush'; // Старшая комбинация
    if (isFlush && isStraight) return 'Straight Flush';
    if (counts[0] === 4) return 'Four of a Kind';
    if (counts[0] === 3 && counts[1] === 2) return 'Full House';
    if (isFlush) return 'Flush';
    if (isStraight) return 'Straight';
    if (counts[0] === 3) return 'Three of a Kind';
    if (counts[0] === 2 && counts[1] === 2) return 'Two Pair';
    if (counts[0] === 2) return 'One Pair';
    return 'High Card'; // Если ни одна комбинация не найдена
}

play = () => {
    switch (mainBtn.textContent) {
        case 'PLAY':
            const betValue = parseInt(betInput.value);

            if (betValue > balance || betValue <= 0) {
                return
            }

            // Подтверждаем ставку
            currentBet = betValue;

            // Уменьшаем баланс на сумму ставки
            balance -= currentBet;
            balanceElement.textContent = balance;

            // Восстанавливаем массив карт
            allCards = [...initialCards];

            cards.forEach(card => {
                // Получаем рандомную карту
                const randomIndex = Math.floor(Math.random() * allCards.length);
                const currentCard = allCards.splice(randomIndex, 1)[0];
                card.style.backgroundImage = `url(assets/img/${currentCard}.svg)`;
            });

            selectBtnsWrappers.forEach(selectBtnWrapper => {
                selectBtnWrapper.innerHTML = '<button>Select</button>';
            });

            mainBtn.textContent = 'REPLACE';
            finish.textContent = ''; // Очищаем текст с результатом
            return;

        case 'REPLACE':
            cardsWrappers.forEach(cardWrapper => {
                const selectBtn = cardWrapper
                    .querySelector('.select-btn-wrapper')
                    .querySelector('button');

                if (selectBtn.style.backgroundColor !== 'grey') return;

                const card = cardWrapper.querySelector('.card');

                const randomIndex = Math.floor(Math.random() * allCards.length);
                const currentCard = allCards.splice(randomIndex, 1)[0];

                card.style.backgroundImage = `url(assets/img/${currentCard}.svg)`;
            });

            const combination = calculateCombination();
            finish.textContent = `Your combination is ${combination}`;

            // Увеличиваем баланс в зависимости от комбинации
            const winAmount = calculateWin(currentBet, combination);
            balance += winAmount;
            balanceElement.textContent = balance;

            mainBtn.textContent = 'PLAY AGAIN?';
            return;

        case 'PLAY AGAIN?':
            cardsWrappers.forEach(cardWrapper => {
                // делаем дефолтные карты
                const card = cardWrapper.querySelector('.card');
                card.style.backgroundImage = 'url(assets/img/B.svg)';

                // дефолтные кнопки (не selected)
                const selectBtnWrapper = cardWrapper
                    .querySelector('.select-btn-wrapper');
                selectBtnWrapper.innerHTML = '';
            });

            mainBtn.textContent = 'PLAY';
            finish.textContent = '';
            return;
    }
};

// Функция для расчета выигрыша
function calculateWin(bet, combination) {
    const payouts = {
        'Royal Flush': bet * 250,
        'Straight Flush': bet * 50,
        'Four of a Kind': bet * 25,
        'Full House': bet * 9,
        'Flush': bet * 6,
        'Straight': bet * 4,
        'Three of a Kind': bet * 3,
        'Two Pair': bet * 2,
        'One Pair': bet * 1,
        'High Card': 0,
    };

    return payouts[combination] || 0;
}

mainBtn.addEventListener('click', play);
selectBtnsWrappers.forEach(selectBtnWrapper => {
    selectBtnWrapper.addEventListener('click', () => {
        const selectButton = selectBtnWrapper?.querySelector('button');
        if (!selectButton) return;
        selectButton.style.backgroundColor === 'grey'
            ? selectButton.style.backgroundColor = 'white'
            : selectButton.style.backgroundColor = 'grey';
    });
});