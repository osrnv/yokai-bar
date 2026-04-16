// ============================================
// ДАННЫЕ
// ============================================

const INGREDIENTS = [
    { id: 'sake',    name: 'Сакэ',    img: 'assets/ingredients/sake.png' },
    { id: 'umeshu',  name: 'Умэсю',   img: 'assets/ingredients/umeshu.png' },
    { id: 'yuzu',    name: 'Юдзу',    img: 'assets/ingredients/yuzu.png' },
    { id: 'persim',  name: 'Хурма',   img: 'assets/ingredients/persim.png' },
    { id: 'ginger',  name: 'Имбирь',  img: 'assets/ingredients/ginger.png' },
    { id: 'sakura',  name: 'Сакура',  img: 'assets/ingredients/sakura.png' },
    { id: 'matcha',  name: 'Матча',   img: 'assets/ingredients/matcha.png' },
    { id: 'soda',    name: 'Содовая', img: 'assets/ingredients/soda.png' },
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
        legend: 'Говорят, у этого коктейля два вкуса. Но второй ты узнаёшь только наутро.',
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

const BARMAN_STEPS = [
    {
        pose: 1,
        html: 'Добро пожаловать! Рад приветствовать в нашем баре. У нас есть традиция для новых посетителей.',
        button: 'Дальше'
    },
    {
        pose: 2,
        html: 'Я загадаю коктейль из четырёх ингредиентов. Все разные, и порядок имеет значение. У тебя будет 9 попыток.',
        button: 'Дальше'
    },
    {
        pose: 2,
        html: 'Я буду давать подсказки после каждой попытки:' +
              '<div class="hint-legend">' +
                  '<div class="hint-legend-item"><span class="moon">🌕</span><span>— ингредиент угадан и стоит на своём месте.</span></div>' +
                  '<div class="hint-legend-item"><span class="moon">🌙</span><span>— ингредиент есть в рецепте, но место не то.</span></div>' +
              '</div>',
        button: 'Принять вызов'
    }
];

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

/** DOM-узел ряда текущей попытки (живёт в #history); не сбрасывать при частичных обновлениях */
var currentHistoryRowEl = null;

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function getIngredient(id) {
    for (var i = 0; i < INGREDIENTS.length; i++) {
        if (INGREDIENTS[i].id === id) return INGREDIENTS[i];
    }
    return null;
}

function createIngredientIconEl(ing) {
    if (ing.img) {
        var img = document.createElement('img');
        img.className = 'ingredient-icon';
        img.src = ing.img;
        img.alt = ing.name;
        return img;
    }
    var span = document.createElement('span');
    span.className = 'ingredient-emoji';
    span.textContent = ing.emoji;
    return span;
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

var barmanStep = 0;

function startBarmanDialogue() {
    barmanStep = 0;
    renderBarmanStep();
}

function renderBarmanStep() {
    var step = BARMAN_STEPS[barmanStep];
    if (!step) return;

    var img1 = document.getElementById('barman-img-1');
    var img2 = document.getElementById('barman-img-2');
    img1.classList.toggle('barman-img--active', step.pose === 1);
    img2.classList.toggle('barman-img--active', step.pose === 2);

    var textEl = document.getElementById('barman-text');
    textEl.classList.remove('barman-text--fade-in');
    void textEl.offsetWidth;
    textEl.innerHTML = step.html;
    textEl.classList.add('barman-text--fade-in');

    var btn = document.getElementById('btn-barman-next');
    btn.textContent = step.button;
}

function advanceBarmanDialogue() {
    if (barmanStep < BARMAN_STEPS.length - 1) {
        barmanStep++;
        renderBarmanStep();
    } else {
        acceptChallenge();
    }
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

    currentHistoryRowEl = null;
    var pal = document.getElementById('palette');
    if (pal) delete pal.dataset.paletteClickBound;

    goToScreen('screen-game');
    renderGame();
}

// ============================================
// РЕНДЕР ИГРОВОГО ЭКРАНА
// ============================================

function renderGame(options) {
    options = options || {};
    renderAttemptCounter();
    renderHistory(!!options.animateLastCompleted);
    renderPalette();
    renderConfirmButton();
}

function renderAttemptCounter() {
    document.getElementById('current-attempt').textContent = state.attemptNumber;
}

function applyHistoryScroll(board, stickToBottom, prevScrollTop) {
    if (stickToBottom) {
        board.scrollTop = board.scrollHeight;
    } else {
        var maxScroll = Math.max(0, board.scrollHeight - board.clientHeight);
        board.scrollTop = Math.min(prevScrollTop, maxScroll);
    }
}

function collectPastRowsBefore(board, beforeEl) {
    var out = [];
    var c = board.firstChild;
    while (c && c !== beforeEl) {
        if (c.classList && c.classList.contains('history-row')) {
            out.push(c);
        }
        c = c.nextSibling;
    }
    return out;
}

function syncPastRowsBefore(board, beforeEl, animateLastCompleted) {
    var pastNodes = collectPastRowsBefore(board, beforeEl);
    var n = pastNodes.length;
    var h = state.history.length;
    var i;
    if (n < h) {
        for (i = n; i < h; i++) {
            var row = buildCompletedHistoryRow(i + 1, state.history[i]);
            if (animateLastCompleted && i === h - 1) {
                row.classList.add('history-row--enter');
            }
            board.insertBefore(row, beforeEl);
        }
    } else if (n > h) {
        for (i = n - 1; i >= h; i--) {
            pastNodes[i].remove();
        }
    }
}

function clearElementChildren(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function updateCurrentAttemptRowDOM(row) {
    var num = row.querySelector('.history-num');
    if (num) {
        num.textContent = String(state.attemptNumber);
    }
    var ingredients = row.querySelector('.history-ingredients');
    if (!ingredients) {
        return;
    }
    var slots = ingredients.querySelectorAll('.slot');
    var j;
    if (slots.length !== CODE_LENGTH) {
        clearElementChildren(ingredients);
        for (j = 0; j < CODE_LENGTH; j++) {
            var emptySlot = document.createElement('div');
            emptySlot.className = 'slot';
            ingredients.appendChild(emptySlot);
        }
        slots = ingredients.querySelectorAll('.slot');
    }
    for (j = 0; j < CODE_LENGTH; j++) {
        var slot = slots[j];
        clearElementChildren(slot);
        slot.className = 'slot';
        slot.onclick = null;
        if (state.currentGuess[j]) {
            var ing = getIngredient(state.currentGuess[j]);
            slot.classList.add('filled');
            slot.appendChild(createIngredientIconEl(ing));
            (function(index) {
                slot.onclick = function() {
                    removeFromSlot(index);
                };
            })(j);
        } else {
            var ph = document.createElement('span');
            ph.className = 'slot-placeholder-num';
            ph.textContent = String(j + 1);
            slot.appendChild(ph);
        }
    }
}

function renderHistory(animateLastCompleted) {
    var board = document.getElementById('history');
    var threshold = 12;
    var stickToBottom =
        board.scrollHeight - board.scrollTop - board.clientHeight < threshold;
    var prevScrollTop = board.scrollTop;

    if (state.gameOver) {
        if (currentHistoryRowEl && currentHistoryRowEl.parentNode) {
            currentHistoryRowEl.remove();
        }
        currentHistoryRowEl = null;
        board.innerHTML = '';
        for (var i = 0; i < state.history.length; i++) {
            var doneRow = buildCompletedHistoryRow(i + 1, state.history[i]);
            if (animateLastCompleted && i === state.history.length - 1) {
                doneRow.classList.add('history-row--enter');
            }
            board.appendChild(doneRow);
        }
        applyHistoryScroll(board, stickToBottom, prevScrollTop);
        return;
    }

    if (!currentHistoryRowEl || !board.contains(currentHistoryRowEl)) {
        board.innerHTML = '';
        var k;
        for (k = 0; k < state.history.length; k++) {
            board.appendChild(buildCompletedHistoryRow(k + 1, state.history[k]));
        }
        currentHistoryRowEl = buildCurrentAttemptRow();
        board.appendChild(currentHistoryRowEl);
    } else {
        syncPastRowsBefore(board, currentHistoryRowEl, animateLastCompleted);
        updateCurrentAttemptRowDOM(currentHistoryRowEl);
        if (board.lastChild !== currentHistoryRowEl) {
            board.appendChild(currentHistoryRowEl);
        }
    }

    applyHistoryScroll(board, stickToBottom, prevScrollTop);
}

function buildCompletedHistoryRow(rowNum, entry) {
    var row = document.createElement('div');
    row.className = 'history-row';

    var num = document.createElement('div');
    num.className = 'history-num';
    num.textContent = rowNum;
    row.appendChild(num);

    var ingredients = document.createElement('div');
    ingredients.className = 'history-ingredients';

    var j;
    for (j = 0; j < entry.guess.length; j++) {
        var ing = getIngredient(entry.guess[j]);
        var cell = document.createElement('div');
        cell.className = 'history-ingredient';
        cell.appendChild(createIngredientIconEl(ing));
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
    return row;
}

/**
 * Превращает уже существующий в DOM ряд текущей попытки в завершённый ряд.
 * Слоты-плейсхолдеры заменяются на ячейки-иконки, pending-подсказки — на 🌕/🌙.
 * Это избавляет от «моргания»: новый ряд сверху не вставляется, пользователь
 * видит, как его жёлтые слоты становятся готовой записью в истории.
 */
function convertCurrentRowToCompletedRow(row, attemptNumber, entry) {
    row.classList.remove('history-row-current');

    var num = row.querySelector('.history-num');
    if (num) {
        num.textContent = String(attemptNumber);
    }

    var ingredients = row.querySelector('.history-ingredients');
    if (ingredients) {
        clearElementChildren(ingredients);
        for (var j = 0; j < entry.guess.length; j++) {
            var ing = getIngredient(entry.guess[j]);
            var cell = document.createElement('div');
            cell.className = 'history-ingredient';
            cell.appendChild(createIngredientIconEl(ing));
            ingredients.appendChild(cell);
        }
    }

    var oldHints = row.querySelector('.history-hints');
    if (oldHints) {
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

        oldHints.replaceWith(hints);
    }
}

function buildCurrentAttemptRow() {
    var row = document.createElement('div');
    row.className = 'history-row history-row-current';

    var num = document.createElement('div');
    num.className = 'history-num';
    num.textContent = state.attemptNumber;
    row.appendChild(num);

    var ingredients = document.createElement('div');
    ingredients.className = 'history-ingredients';

    var i;
    for (i = 0; i < CODE_LENGTH; i++) {
        var slot = document.createElement('div');
        slot.className = 'slot';

        if (state.currentGuess[i]) {
            var ing = getIngredient(state.currentGuess[i]);
            slot.classList.add('filled');
            slot.appendChild(createIngredientIconEl(ing));
            (function(index) {
                slot.onclick = function() {
                    removeFromSlot(index);
                };
            })(i);
        } else {
            var ph = document.createElement('span');
            ph.className = 'slot-placeholder-num';
            ph.textContent = String(i + 1);
            slot.appendChild(ph);
        }

        ingredients.appendChild(slot);
    }
    row.appendChild(ingredients);

    var hintsPending = document.createElement('div');
    hintsPending.className = 'history-hints history-hints--pending';
    row.appendChild(hintsPending);

    return row;
}

function ensurePaletteClickDelegation(container) {
    if (container.dataset.paletteClickBound === '1') {
        return;
    }
    container.dataset.paletteClickBound = '1';
    container.addEventListener('click', function(e) {
        if (state.gameOver) {
            return;
        }
        var item = e.target.closest('.palette-item');
        if (!item || item.classList.contains('disabled')) {
            return;
        }
        var id = item.dataset.ingredientId;
        if (id) {
            addIngredient(id);
        }
    });
}

function renderPalette() {
    var container = document.getElementById('palette');
    if (container.children.length !== INGREDIENTS.length) {
        container.innerHTML = '';
        delete container.dataset.paletteClickBound;
        var i;
        for (i = 0; i < INGREDIENTS.length; i++) {
            var ing = INGREDIENTS[i];
            var item = document.createElement('div');
            item.className = 'palette-item';
            item.dataset.ingredientId = ing.id;

            var emojiWrap = document.createElement('span');
            emojiWrap.className = 'palette-emoji';
            emojiWrap.appendChild(createIngredientIconEl(ing));
            item.appendChild(emojiWrap);
            var nameEl = document.createElement('span');
            nameEl.className = 'palette-name';
            nameEl.textContent = ing.name;
            item.appendChild(nameEl);

            container.appendChild(item);
        }
    }
    ensurePaletteClickDelegation(container);
    var k;
    for (k = 0; k < INGREDIENTS.length; k++) {
        var id = INGREDIENTS[k].id;
        var paletteItem = container.children[k];
        if (!paletteItem) {
            continue;
        }
        var isUsed = state.currentGuess.indexOf(id) !== -1;
        paletteItem.classList.toggle('disabled', isUsed);
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
    renderHistory();
    renderPalette();
    renderConfirmButton();
}

function removeFromSlot(index) {
    if (state.gameOver) return;

    state.currentGuess.splice(index, 1);
    vibrate(10);
    renderHistory();
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

    var entry = {
        guess: guess,
        bulls: result.bulls,
        cows: result.cows
    };

    var board = document.getElementById('history');
    var stickToBottom =
        board.scrollHeight - board.scrollTop - board.clientHeight < 12;

    if (currentHistoryRowEl && currentHistoryRowEl.parentNode) {
        convertCurrentRowToCompletedRow(currentHistoryRowEl, state.attemptNumber, entry);
        currentHistoryRowEl = null;
    }

    state.history.push(entry);
    state.currentGuess = [];

    var isWin = result.bulls === CODE_LENGTH;
    var isLose = state.attemptNumber >= MAX_ATTEMPTS;

    if (isWin || isLose) {
        state.gameOver = true;
        renderAttemptCounter();
        renderPalette();
        renderConfirmButton();
        if (stickToBottom) {
            board.scrollTop = board.scrollHeight;
        }
        setTimeout(function() {
            if (isWin) {
                showWin();
            } else {
                showLose();
            }
        }, 600);
        return;
    }

    state.attemptNumber++;
    currentHistoryRowEl = buildCurrentAttemptRow();
    board.appendChild(currentHistoryRowEl);
    if (stickToBottom) {
        board.scrollTop = board.scrollHeight;
    }

    renderAttemptCounter();
    renderPalette();
    renderConfirmButton();
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
        step.appendChild(createIngredientIconEl(ing));
        step.appendChild(document.createTextNode(' ' + ing.name));
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
    var el = document.querySelector('.history-row-current .history-ingredients');
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    vibrate(50);
}
