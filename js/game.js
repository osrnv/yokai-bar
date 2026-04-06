// ============================================
// ДАННЫЕ
// ============================================

const INGREDIENTS = [
    { id: 'sake',    name: 'Сакэ',    emoji: '🍶' },
    { id: 'umeshu',  name: 'Умэсю',   emoji: '🍾' },
    { id: 'yuzu',    name: 'Юдзу',    emoji: '🍋' },
    { id: 'persim',  name: 'Хурма',   emoji: '🟠' },
    { id: 'ginger',  name: 'Имбирь',  emoji: '🥔' },
    { id: 'sakura',  name: 'Сакура',  emoji: '🌸' },
    { id: 'matcha',  name: 'Матча',   emoji: '🍵' },
    { id: 'soda',    name: 'Содовая', emoji: '🥤' },
];

const COCKTAILS = [
    {
        name: 'Слеза Кицунэ',
        recipe: ['umeshu', 'sakura', 'yuzu', 'soda'],
        legend: 'Говорят, лис плачет раз в сто лет. Никто не знает почему.',
        emoji: '🦊'
    },
    {
        name: 'Гнев Они',
        recipe: ['sake', 'ginger', 'persim', 'soda'],
        legend: 'Чистая ярость. Бармен рекомендует не задерживать во рту.',
        emoji: '👹'
    },
    {
        name: 'Последний Апрель',
        recipe: ['sakura', 'yuzu', 'sake', 'soda'],
        legend: 'Некоторые призраки появляются только когда цветёт сакура.',
        emoji: '🌸'
    },
    {
        name: 'Ухмылка Бакэнэко',
        recipe: ['matcha', 'ginger', 'umeshu', 'persim'],
        legend: 'Кошка прожила слишком долго. Теперь она пьёт за стойкой.',
        emoji: '🐱'
    },
    {
        name: 'Фонарь О-Бон',
        recipe: ['sake', 'persim', 'sakura', 'umeshu'],
        legend: 'Каждый август мёртвые возвращаются. Им тоже хочется выпить.',
        emoji: '🏮'
    },
    {
        name: 'Дыхание Леса',
        recipe: ['matcha', 'soda', 'yuzu', 'ginger'],
        legend: 'В бамбуковой роще нет эха. Только шёпот.',
        emoji: '🎋'
    },
    {
        name: 'Крыло Цуру',
        recipe: ['sake', 'yuzu', 'soda', 'matcha'],
        legend: 'Журавль сложил крылья и стал женщиной. Утром она исчезнет.',
        emoji: '🦢'
    },
    {
        name: 'Тропа Тэнгу',
        recipe: ['ginger', 'persim', 'umeshu', 'sakura'],
        legend: 'Горный демон не спускается к людям. Люди поднимаются к нему.',
        emoji: '⛰️'
    },
    {
        name: 'Маска Но',
        recipe: ['sake', 'umeshu', 'soda', 'ginger'],
        legend: 'В театре Но маска не скрывает лицо. Она показывает настоящее.',
        emoji: '🎭'
    },
    {
        name: 'Тёмный Тории',
        recipe: ['matcha', 'umeshu', 'persim', 'ginger'],
        legend: 'За каждыми воротами — другой мир. За этими — темнее обычного.',
        emoji: '⛩️'
    },
    {
        name: 'Нить Дзёрогумо',
        recipe: ['umeshu', 'matcha', 'sakura', 'yuzu'],
        legend: 'Женщина-паук плетёт паутину из шёлка и обещаний.',
        emoji: '🕸️'
    },
    {
        name: 'Дыхание Рю',
        recipe: ['sake', 'ginger', 'matcha', 'yuzu'],
        legend: 'Дракон не дышит огнём. Он дышит туманом.',
        emoji: '🐉'
    },
];

const BARMAN_MONOLOGUE = 'Добро пожаловать. Я бармен этого заведения.\n\nУ меня есть коктейль, рецепт которого тебе предстоит разгадать. В нём четыре ингредиента — все разные. Порядок имеет значение.\n\nПосле каждой попытки я дам подсказку:\n🌕 — ингредиент угадан и стоит на своём месте.\n🌙 — ингредиент есть в рецепте, но место не то.\n\nУ тебя девять попыток. Удачи.';

const MAX_ATTEMPTS = 9;
const CODE_LENGTH = 4;

// ============================================
// СОСТОЯНИЕ
// ============================================

var state = {
    cocktail: null,
    currentGuess: [],
    history: [],
    attemptNumber: 1,
    gameOver: false,
    playedCocktails: [],
    lastCocktailIndex: -1
};

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function getIngredient(id) {
    for (var i = 0; i < INGREDIENTS.length; i++) {
        if (INGREDIENTS[i].id === id) return INGREDIENTS[i];
    }
    return null;
}

function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

// ============================================
// НАВИГАЦИЯ
// ============================================

function goToScreen(screenId) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
        screens[i].classList.remove('active');
    }
    document.getElementById(screenId).classList.add('active');

    if (screenId === 'screen-barman') {
        startBarmanDialogue();
    }
}

// ============================================
// ЭКРАН 2: ДИАЛОГ БАРМЕНА
// ============================================

var typingInterval = null;
var typingDone = false;

function startBarmanDialogue() {
    var textEl = document.getElementById('barman-text');
    var btnAccept = document.getElementById('btn-accept');

    btnAccept.classList.remove('visible');
    textEl.innerHTML = '';
    typingDone = false;

    var fullText = BARMAN_MONOLOGUE;
    var charIndex = 0;

    if (typingInterval) {
        clearInterval(typingInterval);
        typingInterval = null;
    }

    typingInterval = setInterval(function() {
        if (charIndex >= fullText.length) {
            clearInterval(typingInterval);
            typingInterval = null;
            typingDone = true;
            textEl.innerHTML = formatBarmanText(fullText);
            btnAccept.classList.add('visible');
            return;
        }

        charIndex++;
        var current = fullText.substring(0, charIndex);
        textEl.innerHTML = formatBarmanText(current) + '<span class="typing-cursor"></span>';
    }, 30);

    var barmanScreen = document.getElementById('screen-barman');
    barmanScreen.onclick = function(e) {
        if (e.target.closest('.btn')) return;
        if (typingDone) return;

        if (typingInterval) {
            clearInterval(typingInterval);
            typingInterval = null;
        }
        typingDone = true;
        textEl.innerHTML = formatBarmanText(fullText);
        btnAccept.classList.add('visible');
    };
}

function formatBarmanText(text) {
    return text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

// ============================================
// НАЧАЛО ИГРЫ
// ============================================

function acceptChallenge() {
    pickCocktail(false);
    startGameScreen();
}

function pickCocktail(excludePrevious) {
    var available = [];
    var i;

    if (excludePrevious) {
        for (i = 0; i < COCKTAILS.length; i++) {
            if (state.playedCocktails.indexOf(i) === -1) {
                available.push(i);
            }
        }
        if (available.length === 0) {
            state.playedCocktails = [];
            for (i = 0; i < COCKTAILS.length; i++) {
                available.push(i);
            }
        }
    } else {
        for (i = 0; i < COCKTAILS.length; i++) {
            available.push(i);
        }
    }

    var randomIndex = available[Math.floor(Math.random() * available.length)];
    state.cocktail = COCKTAILS[randomIndex];
    state.lastCocktailIndex = randomIndex;
    state.playedCocktails.push(randomIndex);

    console.log('Секретный рецепт (отладка):', state.cocktail.name, state.cocktail.recipe);
}

function startGameScreen() {
    state.currentGuess = [];
    state.history = [];
    state.attemptNumber = 1;
    state.gameOver = false;

    goToScreen('screen-game');
    renderGame();
}

// ============================================
// РЕНДЕР ИГРОВОГО ЭКРАНА
// ============================================

function renderGame() {
    renderAttemptCounter();
    renderHistory();
    renderCurrentSlots();
    renderPalette();
    renderConfirmButton();
}

function renderAttemptCounter() {
    document.getElementById('current-attempt').textContent = state.attemptNumber;
}

function renderHistory() {
    var container = document.getElementById('history');
    container.innerHTML = '';

    for (var i = 0; i < state.history.length; i++) {
        var entry = state.history[i];

        var row = document.createElement('div');
        row.className = 'history-row';

        var num = document.createElement('div');
        num.className = 'history-num';
        num.textContent = i + 1;
        row.appendChild(num);

        var ingredients = document.createElement('div');
        ingredients.className = 'history-ingredients';

        for (var j = 0; j < entry.guess.length; j++) {
            var ing = getIngredient(entry.guess[j]);
            var cell = document.createElement('div');
            cell.className = 'history-ingredient';
            cell.innerHTML = '<span style="font-size:1.6em">' + ing.emoji + '</span>';
            ingredients.appendChild(cell);
        }
        row.appendChild(ingredients);

        var hints = document.createElement('div');
        hints.className = 'history-hints';

        var fullGroup = document.createElement('div');
        fullGroup.className = 'hint-group hint-full';
        fullGroup.innerHTML = '<span class="moon">🌕</span><span class="count">' + entry.bulls + '</span>';
        hints.appendChild(fullGroup);

        var halfGroup = document.createElement('div');
        halfGroup.className = 'hint-group hint-half';
        halfGroup.innerHTML = '<span class="moon">🌙</span><span class="count">' + entry.cows + '</span>';
        hints.appendChild(halfGroup);

        row.appendChild(hints);
        container.appendChild(row);
    }

    container.scrollTop = container.scrollHeight;
}

function renderCurrentSlots() {
    var container = document.getElementById('current-slots');
    container.innerHTML = '';

    for (var i = 0; i < CODE_LENGTH; i++) {
        var slot = document.createElement('div');
        slot.className = 'slot';

        if (state.currentGuess[i]) {
            var ing = getIngredient(state.currentGuess[i]);
            slot.classList.add('filled');
            slot.innerHTML = '<span style="font-size:1.8em">' + ing.emoji + '</span>';
            (function(index) {
                slot.onclick = function() {
                    removeFromSlot(index);
                };
            })(i);
        } else {
            slot.innerHTML = '<span style="color:#3a3535; font-size:0.8em">' + (i + 1) + '</span>';
        }

        container.appendChild(slot);
    }
}

function renderPalette() {
    var container = document.getElementById('palette');
    container.innerHTML = '';

    for (var i = 0; i < INGREDIENTS.length; i++) {
        var ing = INGREDIENTS[i];
        var item = document.createElement('div');
        item.className = 'palette-item';

        var isUsed = state.currentGuess.indexOf(ing.id) !== -1;
        if (isUsed) {
            item.classList.add('disabled');
        }

        item.innerHTML = '<span class="palette-emoji">' + ing.emoji + '</span><span class="palette-name">' + ing.name + '</span>';

        if (!isUsed) {
            (function(id) {
                item.onclick = function() {
                    addIngredient(id);
                };
            })(ing.id);
        }

        container.appendChild(item);
    }
}

function renderConfirmButton() {
    var btn = document.getElementById('btn-confirm');
    btn.disabled = state.currentGuess.length < CODE_LENGTH || state.gameOver;
}

// ============================================
// ВЗАИМОДЕЙСТВИЕ
// ============================================

function addIngredient(id) {
    if (state.gameOver) return;
    if (state.currentGuess.length >= CODE_LENGTH) return;
    if (state.currentGuess.indexOf(id) !== -1) return;

    state.currentGuess.push(id);
    vibrate(15);
    renderCurrentSlots();
    renderPalette();
    renderConfirmButton();
}

function removeFromSlot(index) {
    if (state.gameOver) return;

    state.currentGuess.splice(index, 1);
    vibrate(10);
    renderCurrentSlots();
    renderPalette();
    renderConfirmButton();
}

// ============================================
// ПРОВЕРКА ПОПЫТКИ
// ============================================

function submitGuess() {
    if (state.currentGuess.length !== CODE_LENGTH) {
        shakeSlots();
        return;
    }
    if (state.gameOver) return;

    var guess = state.currentGuess.slice();
    var secret = state.cocktail.recipe;
    var result = calculateHints(guess, secret);

    state.history.push({
        guess: guess,
        bulls: result.bulls,
        cows: result.cows
    });

    state.currentGuess = [];

    if (result.bulls === CODE_LENGTH) {
        state.gameOver = true;
        renderGame();
        setTimeout(function() { showWin(); }, 600);
        return;
    }

    if (state.attemptNumber >= MAX_ATTEMPTS) {
        state.gameOver = true;
        renderGame();
        setTimeout(function() { showLose(); }, 600);
        return;
    }

    state.attemptNumber++;
    renderGame();
}

function calculateHints(guess, secret) {
    var bulls = 0;
    var cows = 0;
    var secretRemaining = [];
    var guessRemaining = [];
    var i;

    for (i = 0; i < guess.length; i++) {
        if (guess[i] === secret[i]) {
            bulls++;
        } else {
            secretRemaining.push(secret[i]);
            guessRemaining.push(guess[i]);
        }
    }

    var secretCount = {};
    for (i = 0; i < secretRemaining.length; i++) {
        var s = secretRemaining[i];
        secretCount[s] = (secretCount[s] || 0) + 1;
    }

    for (i = 0; i < guessRemaining.length; i++) {
        var g = guessRemaining[i];
        if (secretCount[g] && secretCount[g] > 0) {
            cows++;
            secretCount[g]--;
        }
    }

    return { bulls: bulls, cows: cows };
}

// ============================================
// ЭКРАН ПОБЕДЫ
// ============================================

function showWin() {
    var cocktail = state.cocktail;

    document.getElementById('win-emoji').textContent = cocktail.emoji;
    document.getElementById('win-name').textContent = cocktail.name;
    document.getElementById('win-legend').textContent = cocktail.legend;
    document.getElementById('win-stats').textContent = 'Угадано с ' + state.history.length + '-й попытки';

    var recipeContainer = document.getElementById('win-recipe');
    recipeContainer.innerHTML = '';

    for (var i = 0; i < cocktail.recipe.length; i++) {
        var ing = getIngredient(cocktail.recipe[i]);

        var step = document.createElement('span');
        step.className = 'recipe-step';
        step.textContent = ing.emoji + ' ' + ing.name;
        recipeContainer.appendChild(step);

        if (i < cocktail.recipe.length - 1) {
            var arrow = document.createElement('span');
            arrow.className = 'recipe-arrow';
            arrow.textContent = '→';
            recipeContainer.appendChild(arrow);
        }
    }

    goToScreen('screen-win');
}

// ============================================
// ЭКРАН ПОРАЖЕНИЯ
// ============================================

function showLose() {
    var cocktail = state.cocktail;

    goToScreen('screen-lose');
}

// ============================================
// ПЕРЕХОДЫ ПОСЛЕ РЕЗУЛЬТАТА
// ============================================

function nextCocktail() {
    pickCocktail(true);
    startGameScreen();
}

function retryCocktail() {
    pickCocktail(false);
    startGameScreen();
}

// ============================================
// АНИМАЦИИ
// ============================================

function shakeSlots() {
    var el = document.getElementById('current-slots');
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    vibrate(50);
}
