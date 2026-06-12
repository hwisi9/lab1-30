// ==========================================
// НАВІГАЦІЯ ТА СПІЛЬНІ ФУНКЦІЇ
// ==========================================
function switchLab(labId) {
    document.querySelectorAll('.lab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(labId).classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.onload = function() {
    initMatrixInputs();
    drawGraph();
    generateArray();
    generateSearchArray();
    initHashTables();
    if (typeof drawLists === "function") drawLists();
    if (typeof drawStack === "function") drawStack();
    if (typeof drawQueue === "function") drawQueue();
    if (typeof drawTreeCanvas === "function") drawTreeCanvas();
};

// ==========================================
// ЛР 21-23: ГРАФИ
// ==========================================
const defaultMatrix = [
    [5, 3, 4, 2, 1], [9, 8, 7, 3, 0], [8, 7, 6, 4, 3], [9, 1, 0, 2, 2], [8, 4, 3, 2, 1]
];
const GRAPH_SIZE = 5;
let nodeStates = new Array(GRAPH_SIZE).fill('unvisited'); 
const centerX = 200, centerY = 200, radius = 120;
const nodePositions = [];

for (let i = 0; i < GRAPH_SIZE; i++) {
    const angle = (i * 2 * Math.PI) / GRAPH_SIZE - Math.PI / 2;
    nodePositions.push({ x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) });
}

function initMatrixInputs() {
    const container = document.getElementById('matrixInputs');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < GRAPH_SIZE; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        for (let j = 0; j < GRAPH_SIZE; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = defaultMatrix[i][j];
            input.id = `m_${i}_${j}`;
            input.oninput = drawGraph; 
            rowDiv.appendChild(input);
        }
        container.appendChild(rowDiv);
    }
}

function getMatrix() {
    let matrix = [];
    for (let i = 0; i < GRAPH_SIZE; i++) {
        matrix.push([]);
        for (let j = 0; j < GRAPH_SIZE; j++) {
            const el = document.getElementById(`m_${i}_${j}`);
            const val = el ? parseInt(el.value) || 0 : 0;
            matrix[i].push(val);
        }
    }
    return matrix;
}

function drawGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const matrix = getMatrix();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < GRAPH_SIZE; i++) {
        for (let j = 0; j < GRAPH_SIZE; j++) {
            if (matrix[i][j] !== 0) {
                ctx.beginPath();
                ctx.moveTo(nodePositions[i].x, nodePositions[i].y);
                ctx.lineTo(nodePositions[j].x, nodePositions[j].y);
                ctx.strokeStyle = (i === j) ? '#f59e0b' : '#374151'; 
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }

    nodePositions.forEach((pos, idx) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 22, 0, 2 * Math.PI);
        if (nodeStates[idx] === 'active') { ctx.fillStyle = '#3b82f6'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; }
        else if (nodeStates[idx] === 'visited') { ctx.fillStyle = '#10b981'; ctx.strokeStyle = '#047857'; ctx.lineWidth = 2; }
        else { ctx.fillStyle = '#1f2937'; ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 2; }
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(idx + 1, pos.x, pos.y);
    });
}

function logToConsole(text, clear = false) {
    const consoleDiv = document.getElementById('consoleOutput');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function analyzeGraph() {
    nodeStates.fill('unvisited'); drawGraph();
    const matrix = getMatrix();
    logToConsole("=== АНАЛІЗ ГРАФА (ЛР21) ===", true);
    let isSym = true, isWeight = false, hasLoops = false, edges = 0;
    for (let i = 0; i < GRAPH_SIZE; i++) {
        if (matrix[i][i] !== 0) hasLoops = true;
        for (let j = 0; j < GRAPH_SIZE; j++) {
            if (matrix[i][j] !== matrix[j][i]) isSym = false;
            if (matrix[i][j] !== 0 && matrix[i][j] !== 1) isWeight = true;
            if (matrix[i][j] !== 0) edges++;
        }
    }
    let actualEdges = isSym ? (edges / 2) + (hasLoops ? 1 : 0) : edges;
    logToConsole(`Кількість вершин: ${GRAPH_SIZE}\nОрієнтованість: ${isSym ? "неорієнтований" : "орієнтований"}\nЗваженість: ${isWeight ? "зважений" : "незважений"}\nНаявність петель: ${hasLoops ? "є" : "немає"}\nКількість ребер: ${Math.floor(actualEdges)}\n\nСтепені вершин:`);
    for (let i = 0; i < GRAPH_SIZE; i++) {
        let outDeg = 0, inDeg = 0;
        for (let j = 0; j < GRAPH_SIZE; j++) { if (matrix[i][j] !== 0) outDeg++; if (matrix[j][i] !== 0) inDeg++; }
        isSym ? logToConsole(`  deg(${i + 1}) = ${outDeg}`) : logToConsole(`  out(${i + 1}) = ${outDeg}, in(${i + 1}) = ${inDeg}`);
    }
}

async function runDFS() {
    const matrix = getMatrix(); nodeStates.fill('unvisited'); logToConsole("=== ПОЧАТОК DFS (ЛР22) ===", true);
    async function dfs(node) {
        nodeStates[node] = 'active'; drawGraph(); logToConsole(` -> Відвідали вершину ${node + 1}`); await sleep(1000);
        for (let i = 0; i < GRAPH_SIZE; i++) {
            if (matrix[node][i] !== 0) {
                if (nodeStates[i] === 'unvisited') {
                    logToConsole(`    [Йдемо вглиб: з ${node + 1} у ${i + 1}]`);
                    nodeStates[node] = 'visited'; await dfs(i); nodeStates[node] = 'active'; drawGraph(); await sleep(800);
                } else { logToConsole(`    [Вершина ${i + 1} вже відвідана, пропускаємо]`); }
            }
        }
        nodeStates[node] = 'visited'; drawGraph(); logToConsole(` <- Повертаємось з вершини ${node + 1}`);
    }
    await dfs(0); logToConsole("=== КІНЕЦЬ DFS ===");
}

async function runBFS() {
    const matrix = getMatrix(); nodeStates.fill('unvisited'); drawGraph(); logToConsole("=== ПОЧАТОК BFS (ЛР23) ===", true);
    let queue = [0]; nodeStates[0] = 'active'; logToConsole(` -> Додаємо початкову вершину 1 у чергу`); drawGraph(); await sleep(1000);
    while (queue.length > 0) {
        let current = queue.shift(); logToConsole(`\n=== Обробляємо вершину ${current + 1} ===`);
        for (let i = 0; i < GRAPH_SIZE; i++) {
            if (matrix[current][i] !== 0 && nodeStates[i] === 'unvisited') {
                queue.push(i); nodeStates[i] = 'active'; logToConsole(`    [Знайдено сусіда ${i + 1}, додаємо у чергу]`); drawGraph(); await sleep(800);
            }
        }
        nodeStates[current] = 'visited'; drawGraph(); await sleep(600);
    }
    logToConsole("\n=== КІНЕЦЬ BFS ===");
}

// ==========================================
// ЛР 1-8: СОРТУВАННЯ
// ==========================================
let currentArray = [];
let isSorting = false;
let ANIMATION_SPEED = 40;

// Парсимо числа з текстового поля
function parseArrayInput() {
    const raw = document.getElementById('arrValues').value;
    return raw.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
}

// Оновлюємо візуалізацію, коли юзер пише числа вручну
function updateArrayFromInput() {
    if (isSorting) return;
    let arr = parseArrayInput();
    if (arr.length === 0) arr = [10]; // Захист від порожнього поля
    currentArray = arr;
    drawArray(currentArray);
}

// Викликається при старті сторінки
function generateArray() {
    if (isSorting) return;
    updateArrayFromInput();
}

// Кнопка "Рандом"
function generateRandomArray() {
    if (isSorting) return;
    currentArray = [];
    const size = Math.floor(Math.random() * 15) + 10; // Випадковий розмір від 10 до 25
    for (let i = 0; i < size; i++) currentArray.push(Math.floor(Math.random() * 90) + 10);
    document.getElementById('arrValues').value = currentArray.join(', ');
    drawArray(currentArray);
}

// Кнопка "Стандарт"
function resetArray() {
    if (isSorting) return;
    currentArray = [42, 15, 77, 8, 99, 23, 15, 4, 61, 35];
    document.getElementById('arrValues').value = currentArray.join(', ');
    drawArray(currentArray);
}

function drawArray(arr, activeIndices = [], swapIndices = []) {
    const container = document.getElementById('sortVisualizer');
    if (!container) return;
    container.innerHTML = '';
    const maxVal = Math.max(...arr, 1); 
    arr.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'sort-bar';
        bar.style.height = `${(val / maxVal) * 90}%`; 
        bar.innerText = val;
        if (swapIndices.includes(idx)) bar.classList.add('swap');
        else if (activeIndices.includes(idx)) bar.classList.add('active');
        container.appendChild(bar);
    });
}

async function startSorting() {
    if (isSorting || currentArray.length === 0) return;
    isSorting = true;
    document.getElementById('sortBtn').disabled = true;
    document.getElementById('arrValues').disabled = true; // Блокуємо ввід на час сортування
    
    const algo = document.getElementById('algoSelect').value;
    const asc = document.getElementById('sortOrder').value === 'asc';
    let arr = [...currentArray]; 

    ANIMATION_SPEED = arr.length > 30 ? 20 : 60;

    switch(algo) {
        case '1': await selectionSort(arr, asc); break;
        case '2': await insertionSort(arr, asc); break;
        case '3': await bubbleSort(arr, asc); break;
        case '4': await mergeSortStarter(arr, asc); break;
        case '5': await quickSortStarter(arr, asc); break;
        case '6': await shellSort(arr, asc); break;
        case '7': await shakerSort(arr, asc); break;
        case '8': await heapSort(arr, asc); break;
    }
    
    drawArray(arr, [], [...Array(arr.length).keys()]); 
    setTimeout(() => { 
        drawArray(arr); 
        isSorting = false; 
        document.getElementById('sortBtn').disabled = false; 
        document.getElementById('arrValues').disabled = false; // Розблоковуємо ввід
        document.getElementById('arrValues').value = arr.join(', '); // Записуємо відсортований результат назад у поле
    }, 1000);
    currentArray = arr; 
}

async function selectionSort(arr, asc) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let idx = i;
        for (let j = i + 1; j < n; j++) {
            drawArray(arr, [i, j, idx]); await sleep(ANIMATION_SPEED);
            if (asc ? arr[j] < arr[idx] : arr[j] > arr[idx]) idx = j;
        }
        if (i !== idx) {
            drawArray(arr, [], [i, idx]); await sleep(ANIMATION_SPEED);
            let temp = arr[i]; arr[i] = arr[idx]; arr[idx] = temp;
        }
    }
}

async function insertionSort(arr, asc) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0 && (asc ? arr[j - 1] > arr[j] : arr[j - 1] < arr[j])) {
            drawArray(arr, [], [j - 1, j]); await sleep(ANIMATION_SPEED);
            let temp = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = temp; j--;
        }
    }
}

async function bubbleSort(arr, asc) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            drawArray(arr, [j, j + 1]); await sleep(ANIMATION_SPEED);
            if (asc ? arr[j] > arr[j + 1] : arr[j] < arr[j + 1]) {
                drawArray(arr, [], [j, j + 1]); await sleep(ANIMATION_SPEED);
                let temp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = temp; swapped = true;
            }
        }
        if (!swapped) break;
    }
}

async function merge(arr, l, m, r, asc) {
    let n1 = m - l + 1, n2 = r - m;
    let L = new Array(n1), R = new Array(n2);
    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        drawArray(arr, [k]); await sleep(ANIMATION_SPEED);
        if (asc ? L[i] <= R[j] : L[i] >= R[j]) { arr[k] = L[i++]; } else { arr[k] = R[j++]; }
        drawArray(arr, [], [k]); await sleep(ANIMATION_SPEED); k++;
    }
    while (i < n1) { drawArray(arr, [k]); await sleep(ANIMATION_SPEED); arr[k] = L[i++]; drawArray(arr, [], [k]); await sleep(ANIMATION_SPEED); k++; }
    while (j < n2) { drawArray(arr, [k]); await sleep(ANIMATION_SPEED); arr[k] = R[j++]; drawArray(arr, [], [k]); await sleep(ANIMATION_SPEED); k++; }
}
async function mergeSortRecursive(arr, l, r, asc) {
    if (l >= r) return;
    let m = l + Math.floor((r - l) / 2);
    await mergeSortRecursive(arr, l, m, asc);
    await mergeSortRecursive(arr, m + 1, r, asc);
    await merge(arr, l, m, r, asc);
}
async function mergeSortStarter(arr, asc) { await mergeSortRecursive(arr, 0, arr.length - 1, asc); }

async function partition(arr, low, high, asc) {
    let pivot = arr[high]; let i = (low - 1);
    for (let j = low; j <= high - 1; j++) {
        drawArray(arr, [j, high]); await sleep(ANIMATION_SPEED);
        if (asc ? arr[j] <= pivot : arr[j] >= pivot) {
            i++;
            if (i !== j) { drawArray(arr, [], [i, j]); await sleep(ANIMATION_SPEED); let temp = arr[i]; arr[i] = arr[j]; arr[j] = temp; }
        }
    }
    if (i + 1 !== high) { drawArray(arr, [], [i + 1, high]); await sleep(ANIMATION_SPEED); let temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp; }
    return (i + 1);
}
async function quickSortRecursive(arr, low, high, asc) {
    if (low < high) { let pi = await partition(arr, low, high, asc); await quickSortRecursive(arr, low, pi - 1, asc); await quickSortRecursive(arr, pi + 1, high, asc); }
}
async function quickSortStarter(arr, asc) { await quickSortRecursive(arr, 0, arr.length - 1, asc); }

async function shellSort(arr, asc) {
    let n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i += 1) {
            let temp = arr[i]; let j;
            for (j = i; j >= gap && (asc ? arr[j - gap] > temp : arr[j - gap] < temp); j -= gap) {
                drawArray(arr, [j, j - gap]); await sleep(ANIMATION_SPEED);
                arr[j] = arr[j - gap];
            }
            if (j !== i) { drawArray(arr, [], [j, i]); await sleep(ANIMATION_SPEED); arr[j] = temp; }
        }
    }
}

async function shakerSort(arr, asc) {
    let n = arr.length; let swapped = true; let start = 0, end = n - 1;
    while (swapped) {
        swapped = false;
        for (let i = start; i < end; ++i) {
            drawArray(arr, [i, i + 1]); await sleep(ANIMATION_SPEED);
            if (asc ? arr[i] > arr[i + 1] : arr[i] < arr[i + 1]) { drawArray(arr, [], [i, i + 1]); await sleep(ANIMATION_SPEED); let temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp; swapped = true; }
        }
        if (!swapped) break;
        swapped = false; --end;
        for (let i = end - 1; i >= start; --i) {
            drawArray(arr, [i, i + 1]); await sleep(ANIMATION_SPEED);
            if (asc ? arr[i] > arr[i + 1] : arr[i] < arr[i + 1]) { drawArray(arr, [], [i, i + 1]); await sleep(ANIMATION_SPEED); let temp = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = temp; swapped = true; }
        }
        ++start;
    }
}

async function heapify(arr, n, i, asc) {
    let target = i; let l = 2 * i + 1; let r = 2 * i + 2;
    if (asc) {
        if (l < n && arr[l] > arr[target]) target = l;
        if (r < n && arr[r] > arr[target]) target = r;
    } else {
        if (l < n && arr[l] < arr[target]) target = l;
        if (r < n && arr[r] < arr[target]) target = r;
    }
    if (target !== i) {
        drawArray(arr, [], [i, target]); await sleep(ANIMATION_SPEED);
        let temp = arr[i]; arr[i] = arr[target]; arr[target] = temp;
        await heapify(arr, n, target, asc);
    }
}
async function heapSort(arr, asc) {
    let n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i, asc);
    for (let i = n - 1; i > 0; i--) {
        drawArray(arr, [], [0, i]); await sleep(ANIMATION_SPEED);
        let temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        await heapify(arr, i, 0, asc);
    }
}

// ==========================================
// ЛР 9-10: ПОШУК В МАСИВІ
// ==========================================
let searchArray = [];
let isSearchSorted = false;
let isSearching = false;

function generateSearchArray() {
    if (isSearching) return;
    searchArray = [];
    for (let i = 0; i < 15; i++) {
        searchArray.push(Math.floor(Math.random() * 90) + 10);
    }
    isSearchSorted = false;
    drawSearchArray();
    logSearch("Новий масив згенеровано. Стан: Не відсортований", true);
}

function sortSearchArray() {
    if (isSearching) return;
    searchArray.sort((a, b) => a - b);
    isSearchSorted = true;
    drawSearchArray();
    logSearch("Масив відсортовано. Бінарний пошук розблоковано.", true);
}

function drawSearchArray(current = -1, left = -1, right = -1, mid = -1, found = -1, barrier = -1) {
    const container = document.getElementById('searchVisualizer');
    if (!container) return;
    container.innerHTML = '';
    
    searchArray.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = 'search-cell';
        cell.innerText = val;
        cell.setAttribute('data-index', i);

        if (left !== -1 && right !== -1) {
            if (i >= left && i <= right) cell.classList.add('active-zone');
            else cell.classList.add('dimmed');
        }
        if (i === barrier) cell.classList.add('barrier');
        if (i === mid) cell.classList.add('mid');
        if (i === current) cell.classList.add('current');
        if (i === found) cell.classList.add('found');

        container.appendChild(cell);
    });
}

function logSearch(text, clear = false) {
    const consoleDiv = document.getElementById('searchConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

async function runLinearSearch() {
    if (isSearching || searchArray.length === 0) return;
    isSearching = true;
    let target = parseInt(document.getElementById('searchTarget').value);
    if (isNaN(target)) target = searchArray[0];

    logSearch(`\n=== ЛІНІЙНИЙ ПОШУК (Шукаємо: ${target}) ===`);
    let comparisons = 0;
    let foundIdx = -1;

    for (let i = 0; i < searchArray.length; i++) {
        comparisons++;
        drawSearchArray(i);
        await sleep(400);

        if (searchArray[i] === target) {
            foundIdx = i;
            drawSearchArray(-1, -1, -1, -1, i);
            break;
        }
    }

    if (foundIdx !== -1) logSearch(`[Успіх] Знайдено на індексі [${foundIdx}]`);
    else logSearch(`[Не знайдено] Елемент відсутній у масиві`);
    logSearch(`Порівнянь: ${comparisons}`);
    
    if (foundIdx === -1) drawSearchArray();
    isSearching = false;
}

async function runBarrierSearch() {
    if (isSearching || searchArray.length === 0) return;
    isSearching = true;
    let target = parseInt(document.getElementById('searchTarget').value);
    if (isNaN(target)) target = searchArray[0];

    logSearch(`\n=== ПОШУК З БАР'ЄРОМ (Шукаємо: ${target}) ===`);
    
    let n = searchArray.length;
    let lastVal = searchArray[n - 1];
    searchArray[n - 1] = target; 
    
    logSearch(`Встановлено бар'єр на індекс [${n - 1}]`);
    drawSearchArray(-1, -1, -1, -1, -1, n - 1);
    await sleep(800);

    let i = 0;
    let comparisons = 0;
    
    while (searchArray[i] !== target) {
        comparisons++;
        drawSearchArray(i, -1, -1, -1, -1, n - 1);
        await sleep(400);
        i++;
    }
    comparisons++; 

    searchArray[n - 1] = lastVal; 
    
    if (i < n - 1 || searchArray[n - 1] === target) {
        drawSearchArray(-1, -1, -1, -1, i);
        logSearch(`[Успіх] Знайдено на індексі [${i}]`);
    } else {
        drawSearchArray();
        logSearch(`[Не знайдено] Елемент відсутній у масиві (алгоритм зупинився об бар'єр)`);
    }
    logSearch(`Порівнянь: ${comparisons}`);
    isSearching = false;
}

async function runBinarySearch() {
    if (isSearching || searchArray.length === 0) return;
    if (!isSearchSorted) {
        alert("Для бінарного пошуку масив має бути відсортованим!");
        return;
    }
    
    isSearching = true;
    let target = parseInt(document.getElementById('searchTarget').value);
    if (isNaN(target)) target = searchArray[0];

    logSearch(`\n=== БІНАРНИЙ ПОШУК (Шукаємо: ${target}) ===`);
    
    let left = 0;
    let right = searchArray.length - 1;
    let comparisons = 0;
    let foundIdx = -1;

    while (left <= right) {
        let mid = Math.floor(left + (right - left) / 2);
        comparisons++;
        
        logSearch(`Діапазон: [${left} ... ${right}], Середина: [${mid}]`);
        drawSearchArray(-1, left, right, mid);
        await sleep(1000);

        if (searchArray[mid] === target) {
            foundIdx = mid;
            drawSearchArray(-1, -1, -1, -1, mid);
            break;
        }
        if (searchArray[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    if (foundIdx !== -1) logSearch(`[Успіх] Знайдено на індексі [${foundIdx}]`);
    else {
        drawSearchArray();
        logSearch(`[Не знайдено] Елемент відсутній у масиві`);
    }
    logSearch(`Порівнянь: ${comparisons}`);
    isSearching = false;
}

// ==========================================
// ЛР 11-12: ХЕШ-ТАБЛИЦІ
// ==========================================
const HASH_SIZE = 11;
let tableChain = Array.from({length: HASH_SIZE}, () => []);
let tableOpen = Array.from({length: HASH_SIZE}, () => ({ state: 'free', key: null, value: '' }));
let collisionsCount = 0;

function hashFunction(key) { return key % HASH_SIZE; }

function initHashTables() {
    tableChain = Array.from({length: HASH_SIZE}, () => []);
    tableOpen = Array.from({length: HASH_SIZE}, () => ({ state: 'free', key: null, value: '' }));
    collisionsCount = 0;
    drawHashTables();
}

function drawHashTables() {
    const container = document.getElementById('hashVisualizer');
    if (!container) return;
    container.innerHTML = '';
    const counterEl = document.getElementById('collisionCounter');
    if (counterEl) counterEl.innerText = `Колізій: ${collisionsCount}`;

    for (let i = 0; i < HASH_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'hash-row';

        const idxDiv = document.createElement('div');
        idxDiv.className = 'hash-index';
        idxDiv.innerText = `[${i}]`;
        row.appendChild(idxDiv);

        const chainDiv = document.createElement('div');
        chainDiv.className = 'hash-chain-area';
        if (tableChain[i].length === 0) {
            chainDiv.innerHTML = '<span style="color: #6b7280; font-size: 0.85rem;">NULL</span>';
        } else {
            tableChain[i].forEach(entry => {
                const item = document.createElement('div');
                item.className = 'hash-chain-item';
                item.innerText = `{${entry.key}: ${entry.value}}`;
                chainDiv.appendChild(item);
            });
        }
        row.appendChild(chainDiv);

        const openDiv = document.createElement('div');
        openDiv.className = `hash-open-area ${tableOpen[i].state}`;
        if (tableOpen[i].state === 'free') openDiv.innerText = '[ Вільна ]';
        else if (tableOpen[i].state === 'deleted') openDiv.innerText = '[ Видалено ]';
        else openDiv.innerText = `{${tableOpen[i].key}: ${tableOpen[i].value}}`;
        row.appendChild(openDiv);

        container.appendChild(row);
    }
}

function logHash(text, clear = false) {
    const consoleDiv = document.getElementById('hashConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function getHashInputs() {
    const key = parseInt(document.getElementById('hashKey').value);
    const value = document.getElementById('hashValue').value || "дані";
    return { key, value };
}

function insertHash() {
    const { key, value } = getHashInputs();
    if (isNaN(key)) { alert("Введіть коректний числовий ключ!"); return; }

    const h = hashFunction(key);
    logHash(`\n[+] Спроба вставити {${key}: ${value}} (Базовий хеш: ${h})`);

    let foundChain = tableChain[h].find(e => e.key === key);
    if (foundChain) foundChain.value = value;
    else tableChain[h].push({ key, value });

    let inserted = false;
    for (let attempt = 0; attempt < HASH_SIZE; attempt++) {
        let index = (h + attempt * attempt) % HASH_SIZE;
        if (attempt > 0) collisionsCount++;

        if (tableOpen[index].state !== 'used') {
            tableOpen[index] = { state: 'used', key, value };
            inserted = true;
            break;
        } else if (tableOpen[index].key === key) {
            tableOpen[index].value = value;
            inserted = true;
            break;
        }
    }

    if (!inserted) logHash("[-] Помилка: Таблиця відкритої адресації переповнена!");
    else logHash(`[Успіх] Елемент додано.`);
    
    drawHashTables();
}

function searchHash() {
    const { key } = getHashInputs();
    if (isNaN(key)) return;
    const h = hashFunction(key);
    logHash(`\n--- Пошук ключа ${key} (Базовий хеш: ${h}) ---`);

    let foundChain = tableChain[h].find(e => e.key === key);
    logHash(`Ланцюжки: ${foundChain ? 'Знайдено (Значення: ' + foundChain.value + ')' : 'Не знайдено'}`);

    let foundOpen = false;
    for (let attempt = 0; attempt < HASH_SIZE; attempt++) {
        let index = (h + attempt * attempt) % HASH_SIZE;
        if (tableOpen[index].state === 'free') break;
        if (tableOpen[index].state === 'used' && tableOpen[index].key === key) {
            logHash(`Відкрита адресація: Знайдено (Значення: ${tableOpen[index].value})`);
            foundOpen = true;
            break;
        }
    }
    if (!foundOpen) logHash(`Відкрита адресація: Не знайдено`);
}

function removeHash() {
    const { key } = getHashInputs();
    if (isNaN(key)) return;
    const h = hashFunction(key);
    let removed = false;

    const initialLen = tableChain[h].length;
    tableChain[h] = tableChain[h].filter(e => e.key !== key);
    if (tableChain[h].length < initialLen) removed = true;

    for (let attempt = 0; attempt < HASH_SIZE; attempt++) {
        let index = (h + attempt * attempt) % HASH_SIZE;
        if (tableOpen[index].state === 'free') break;
        if (tableOpen[index].state === 'used' && tableOpen[index].key === key) {
            tableOpen[index].state = 'deleted';
            removed = true;
            break;
        }
    }

    if (removed) logHash(`\n[+] Елемент з ключем ${key} успішно видалено.`);
    else logHash(`\n[-] Елемент з ключем ${key} не знайдено для видалення.`);
    
    drawHashTables();
}

// ==========================================
// ЛР 13-14: ЗВ'ЯЗНІ СПИСКИ
// ==========================================
let sList = []; 
let dList = []; 
let cList = []; 

function logList(text, clear = false) {
    const consoleDiv = document.getElementById('listConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function getListInput() {
    const val = parseInt(document.getElementById('listValue').value);
    return isNaN(val) ? Math.floor(Math.random() * 99) : val;
}

function drawLists() {
    const typeEl = document.getElementById('listType');
    if (!typeEl) return;
    const type = typeEl.value;
    const container = document.getElementById('listVisualizer');
    const hint = document.getElementById('listRulesHint');
    const btnReverse = document.getElementById('btnReverse');
    if (!container) return;
    container.innerHTML = '';

    if (type === 'singly') {
        if (hint) hint.innerText = "Правило: Додає в початок. Видаляє за значенням. Можна реверсувати.";
        if (btnReverse) btnReverse.disabled = false;
        container.innerHTML += `<span class="list-head-label">[Head]</span> <div class="list-arrow">→</div>`;
        sList.forEach(val => {
            container.innerHTML += `<div class="list-node">[${val}]</div> <div class="list-arrow">→</div>`;
        });
        container.innerHTML += `<div class="list-null">NULL</div>`;
    } else if (type === 'doubly') {
        if (hint) hint.innerText = "Правило: Додає в кінець. Видаляє перший елемент (Head).";
        if (btnReverse) btnReverse.disabled = true;
        container.innerHTML += `<div class="list-null">NULL</div> <div class="list-arrow">⇔</div>`;
        dList.forEach(val => {
            container.innerHTML += `<div class="list-node">[${val}]</div> <div class="list-arrow">⇔</div>`;
        });
        container.innerHTML += `<div class="list-null">NULL</div>`;
    } else if (type === 'circular') {
        if (hint) hint.innerText = "Правило: Додає в кінець. Вказує на Head.";
        if (btnReverse) btnReverse.disabled = true;
        if (cList.length === 0) {
            container.innerHTML += `<div class="list-null">Список порожній</div>`;
        } else {
            container.innerHTML += `<span class="list-head-label">Head</span> <div class="list-arrow">→</div>`;
            cList.forEach(val => {
                container.innerHTML += `<div class="list-node">[${val}]</div> <div class="list-arrow">→</div>`;
            });
            container.innerHTML += `<div class="list-arrow" style="color: #10b981;">(до Head: ${cList[0]})</div>`;
        }
    }
}

function listInsert() {
    const type = document.getElementById('listType').value;
    const val = getListInput();

    if (type === 'singly') {
        sList.unshift(val); 
        logList(`[Послідовний список] Додано [${val}] на початок. Всього: ${sList.length}`);
    } else if (type === 'doubly') {
        dList.push(val); 
        logList(`[Двозв'язний] Додано [${val}] в кінець.`);
    } else if (type === 'circular') {
        cList.push(val); 
        logList(`[Кільцевий] Додано [${val}] в кінець кільця.`);
    }
    drawLists();
}

function listDelete() {
    const type = document.getElementById('listType').value;

    if (type === 'singly') {
        const val = getListInput();
        const index = sList.indexOf(val);
        if (index !== -1) {
            sList.splice(index, 1);
            logList(`[Послідовний список] Перше входження [${val}] видалено.`);
        } else {
            logList(`[Послідовний список] Елемент [${val}] не знайдено!`);
        }
    } else if (type === 'doubly') {
        if (dList.length > 0) {
            const removed = dList.shift(); 
            logList(`[Двозв'язний] Перший елемент [${removed}] видалено.`);
        } else {
            logList(`[Двозв'язний] Список і так порожній!`);
        }
    } else if (type === 'circular') {
        if (cList.length > 0) {
            const removed = cList.shift();
            logList(`[Кільцевий] Головний елемент [${removed}] видалено.`);
        } else {
            logList(`[Кільцевий] Список порожній!`);
        }
    }
    drawLists();
}

function listReverse() {
    const type = document.getElementById('listType').value;
    if (type === 'singly') {
        sList.reverse();
        logList(`[Послідовний список] Вказівники успішно перевернуто (Реверс).`);
        drawLists();
    }
}

// ==========================================
// ЛР 15: СТЕК (STACK)
// ==========================================
let stackData = [];

function logStack(text, clear = false) {
    const consoleDiv = document.getElementById('stackConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function stackPush() {
    const val = parseInt(document.getElementById('stackValue').value);
    if (isNaN(val)) { logStack("[-] Введіть коректне число!"); return; }
    if (stackData.length >= 10) { logStack("[-] Помилка: Стек переповнено (ліміт для візуалізації)!"); return; }
    stackData.push(val);
    logStack(`[+] Додано (Push): ${val}`);
    drawStack();
}

function stackPop() {
    if (stackData.length === 0) { logStack("[-] Помилка: Стек порожній!"); return; }
    const val = stackData.pop();
    logStack(`[-] Вилучено (Pop): ${val}`);
    drawStack();
}

function stackPeek() {
    if (stackData.length === 0) { logStack("[-] Стек порожній!"); }
    else { logStack(`[i] Верхній елемент (Peek): ${stackData[stackData.length - 1]}`); }
}

function stackSearch() {
    if (stackData.length === 0) { logStack("[-] Стек порожній, шукати ніде."); return; }
    const val = parseInt(document.getElementById('stackValue').value);
    if (isNaN(val)) { logStack("[-] Введіть число в поле 'Значення' для пошуку."); return; }
    
    let found = false;
    for (let i = stackData.length - 1; i >= 0; i--) {
        if (stackData[i] === val) {
            const posFromTop = stackData.length - i;
            logStack(`[+] Елемент ${val} знайдено на позиції ${posFromTop} від вершини.`);
            found = true;
            break;
        }
    }
    if (!found) logStack(`[-] Елемент ${val} не знайдено у стеку.`);
}

function stackSumAvg() {
    if (stackData.length === 0) { logStack("[-] Стек порожній."); return; }
    let sum = stackData.reduce((a, b) => a + b, 0);
    let avg = sum / stackData.length;
    logStack(`[i] Сума елементів: ${sum} | Середнє значення: ${avg.toFixed(2)}`);
}

function stackSave() {
    if (stackData.length === 0) { logStack("[-] Стек порожній — нічого зберігати."); return; }
    localStorage.setItem('mySavedStack', JSON.stringify(stackData));
    logStack(`[+] Стек успішно збережено у пам'ять браузера (імітація запису у файл).`);
}

function stackLoad() {
    const saved = localStorage.getItem('mySavedStack');
    if (!saved) { logStack("[-] Файл збереження не знайдено!"); return; }
    
    if (stackData.length > 0) {
        if (!confirm("Поточний стек не порожній. Завантаження замінить усі дані. Продовжити?")) {
            logStack("[i] Завантаження скасовано.");
            return;
        }
    }
    stackData = JSON.parse(saved);
    logStack(`[+] Стек успішно завантажено з пам'яті.`);
    drawStack();
}

function drawStack() {
    const container = document.getElementById('stackVisualizer');
    if (!container) return;
    container.innerHTML = '';
    stackData.forEach(val => {
        container.innerHTML += `<div class="stack-item">${val}</div>`;
    });
}

// ==========================================
// ЛР 16-17: ЧЕРГИ ТА ДЕК
// ==========================================
let queueData = []; 

function drawQueue() {
    const typeEl = document.getElementById('queueType');
    if(!typeEl) return;
    const type = typeEl.value;
    const container = document.getElementById('queueVisualizer');
    if (!container) return;
    
    const pInput = document.getElementById('priorityInputDiv');
    const qStd = document.getElementById('qControlsStandard');
    const qDq = document.getElementById('qControlsDeque');
    
    if (pInput) pInput.style.display = (type === 'priority') ? 'block' : 'none';
    if (qStd) qStd.style.display = (type === 'deque') ? 'none' : 'flex';
    if (qDq) qDq.style.display = (type === 'deque') ? 'flex' : 'none';

    container.innerHTML = '';
    if (queueData.length === 0) { container.innerHTML = '<span style="color:gray;">Порожньо</span>'; return; }

    queueData.forEach(item => {
        if (type === 'priority') {
            container.innerHTML += `<div class="queue-item" style="background:#f59e0b; border-color:#b45309;">${item.val}<small>Pr: ${item.pr}</small></div>`;
        } else {
            container.innerHTML += `<div class="queue-item">${item.val}</div>`;
        }
    });
}

function qEnqueue() {
    const type = document.getElementById('queueType').value;
    const val = parseInt(document.getElementById('qValue').value) || 0;

    if (type === 'priority') {
        const pr = parseInt(document.getElementById('qPriority').value) || 1;
        queueData.push({val, pr});
        queueData.sort((a, b) => b.pr - a.pr); 
    } else {
        queueData.push({val}); 
    }
    drawQueue();
}

function qDequeue() {
    if (queueData.length === 0) { alert("Черга порожня!"); return; }
    queueData.shift();
    drawQueue();
}

function dqPushFront() { const val = parseInt(document.getElementById('qValue').value)||0; queueData.unshift({val}); drawQueue(); }
function dqPushBack() { const val = parseInt(document.getElementById('qValue').value)||0; queueData.push({val}); drawQueue(); }
function dqPopFront() { if(queueData.length===0) return; queueData.shift(); drawQueue(); }
function dqPopBack() { if(queueData.length===0) return; queueData.pop(); drawQueue(); }

// ==========================================
// ЛР 18-20: ДЕРЕВА (BST, AVL, TRIE)
// ==========================================
class TreeNode {
    constructor(val) { this.val = val; this.left = null; this.right = null; this.height = 1; }
}

let bstRoot = null;
let avlRoot = null;
let trieRoot = { children: {}, isEndOfWord: false };

function logTree(text, clear = false) {
    const consoleDiv = document.getElementById('treeConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function updateTreeUI() {
    const type = document.getElementById('treeType').value;
    const numDiv = document.getElementById('treeNumInputDiv');
    const strDiv = document.getElementById('treeStrInputDiv');
    const cNum = document.getElementById('treeControlsNum');
    const cStr = document.getElementById('treeControlsStr');
    const extra = document.getElementById('treeExtraControls');
    const hr = document.getElementById('treeHr');

    if (type === 'trie') {
        if (numDiv) numDiv.style.display = 'none';
        if (strDiv) strDiv.style.display = 'block';
        if (cNum) cNum.style.display = 'none';
        if (cStr) cStr.style.display = 'flex';
        if (extra) extra.style.display = 'none';
        if (hr) hr.style.display = 'none';
    } else {
        if (numDiv) numDiv.style.display = 'block';
        if (strDiv) strDiv.style.display = 'none';
        if (cNum) cNum.style.display = 'flex';
        if (cStr) cStr.style.display = 'none';
        if (extra) extra.style.display = 'flex';
        if (hr) hr.style.display = 'block';
    }
    drawTreeCanvas();
}

function insertBST(node, val) {
    if (!node) return new TreeNode(val);
    if (val < node.val) node.left = insertBST(node.left, val);
    else if (val > node.val) node.right = insertBST(node.right, val);
    return node;
}

function findMinNode(node) {
    while (node && node.left) node = node.left;
    return node;
}
function findMaxNode(node) {
    while (node && node.right) node = node.right;
    return node;
}

function removeBST(node, val) {
    if (!node) return null;
    if (val < node.val) node.left = removeBST(node.left, val);
    else if (val > node.val) node.right = removeBST(node.right, val);
    else {
        if (!node.left) return node.right;
        if (!node.right) return node.left;
        let temp = findMinNode(node.right);
        node.val = temp.val;
        node.right = removeBST(node.right, temp.val);
    }
    return node;
}

function getHeight(node) { return node ? node.height : 0; }
function getBalance(node) { return node ? getHeight(node.left) - getHeight(node.right) : 0; }
function rightRotate(y) {
    let x = y.left; let T2 = x.right;
    x.right = y; y.left = T2;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    return x;
}
function leftRotate(x) {
    let y = x.right; let T2 = y.left;
    y.left = x; x.right = T2;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    return y;
}

function insertAVL(node, val) {
    if (!node) return new TreeNode(val);
    if (val < node.val) node.left = insertAVL(node.left, val);
    else if (val > node.val) node.right = insertAVL(node.right, val);
    else return node;

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    let balance = getBalance(node);

    if (balance > 1 && val < node.left.val) return rightRotate(node);
    if (balance < -1 && val > node.right.val) return leftRotate(node);
    if (balance > 1 && val > node.left.val) { node.left = leftRotate(node.left); return rightRotate(node); }
    if (balance < -1 && val < node.right.val) { node.right = rightRotate(node.right); return leftRotate(node); }
    return node;
}

function removeAVL(node, val) {
    if (!node) return null;
    if (val < node.val) node.left = removeAVL(node.left, val);
    else if (val > node.val) node.right = removeAVL(node.right, val);
    else {
        if (!node.left || !node.right) {
            node = node.left ? node.left : node.right;
        } else {
            let temp = findMinNode(node.right);
            node.val = temp.val;
            node.right = removeAVL(node.right, temp.val);
        }
    }
    if (!node) return node;

    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
    let balance = getBalance(node);

    if (balance > 1 && getBalance(node.left) >= 0) return rightRotate(node);
    if (balance > 1 && getBalance(node.left) < 0) { node.left = leftRotate(node.left); return rightRotate(node); }
    if (balance < -1 && getBalance(node.right) <= 0) return leftRotate(node);
    if (balance < -1 && getBalance(node.right) > 0) { node.right = rightRotate(node.right); return leftRotate(node); }
    return node;
}

function treeInsert() {
    const type = document.getElementById('treeType').value;
    const val = parseInt(document.getElementById('treeValue').value);
    if (isNaN(val)) return;
    if (type === 'bst') { bstRoot = insertBST(bstRoot, val); logTree(`[BST] Додано вузол ${val}`); }
    else { avlRoot = insertAVL(avlRoot, val); logTree(`[AVL] Додано вузол ${val} (виконано балансування якщо треба)`); }
    drawTreeCanvas();
}

function treeDelete() {
    const type = document.getElementById('treeType').value;
    const val = parseInt(document.getElementById('treeValue').value);
    if (isNaN(val)) return;
    if (type === 'bst') { bstRoot = removeBST(bstRoot, val); logTree(`[BST] Спроба видалення вузла ${val}`); }
    else { avlRoot = removeAVL(avlRoot, val); logTree(`[AVL] Спроба видалення вузла ${val}`); }
    drawTreeCanvas();
}

function treeMinMax() {
    const type = document.getElementById('treeType').value;
    const root = type === 'bst' ? bstRoot : avlRoot;
    if (!root) { logTree("[-] Дерево порожнє."); return; }
    logTree(`[i] Мінімум: ${findMinNode(root).val} | Максимум: ${findMaxNode(root).val}`);
}

function countNodes(node) { return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0; }
function calcHeight(node) { return node ? 1 + Math.max(calcHeight(node.left), calcHeight(node.right)) : 0; }

function treeStats() {
    const type = document.getElementById('treeType').value;
    const root = type === 'bst' ? bstRoot : avlRoot;
    logTree(`[i] Статистика: Висота = ${calcHeight(root)}, Кількість вузлів = ${countNodes(root)}`);
}

let traverseRes = [];
function inOrder(node) { if(node) { inOrder(node.left); traverseRes.push(node.val); inOrder(node.right); } }
function preOrder(node) { if(node) { traverseRes.push(node.val); preOrder(node.left); preOrder(node.right); } }
function postOrder(node) { if(node) { postOrder(node.left); postOrder(node.right); traverseRes.push(node.val); } }

function treeTraverse(order) {
    const type = document.getElementById('treeType').value;
    const root = type === 'bst' ? bstRoot : avlRoot;
    traverseRes = [];
    if (order === 'in') inOrder(root);
    else if (order === 'pre') preOrder(root);
    else postOrder(root);
    logTree(`[${order.toUpperCase()} Обхід]: ${traverseRes.join(' -> ')}`);
}

function sanitizeWord(w) { return w.toLowerCase().replace(/[^a-z]/g, ''); }

function trieInsertWord() {
    let word = sanitizeWord(document.getElementById('treeStrValue').value);
    if (!word) { logTree("[-] Введіть слово (лише латинські літери)"); return; }
    let curr = trieRoot;
    for (let char of word) {
        if (!curr.children[char]) curr.children[char] = { children: {}, isEndOfWord: false };
        curr = curr.children[char];
    }
    curr.isEndOfWord = true;
    logTree(`[Trie] Слово "${word}" додано.`);
    drawTreeCanvas();
}

function trieSearchWord() {
    let word = sanitizeWord(document.getElementById('treeStrValue').value);
    if (!word) return;
    let curr = trieRoot;
    for (let char of word) {
        if (!curr.children[char]) { logTree(`[Trie] Слово "${word}" НЕ знайдено.`); return; }
        curr = curr.children[char];
    }
    if (curr.isEndOfWord) logTree(`[Trie] Слово "${word}" ЗНАЙДЕНО!`);
    else logTree(`[Trie] Слово "${word}" НЕ знайдено (є лише такий префікс).`);
}

function countWordsInTrie(node) {
    if (!node) return 0;
    let count = node.isEndOfWord ? 1 : 0;
    for (let char in node.children) count += countWordsInTrie(node.children[char]);
    return count;
}

function trieCountPrefix() {
    let prefix = sanitizeWord(document.getElementById('treeStrValue').value);
    if (!prefix) return;
    let curr = trieRoot;
    for (let char of prefix) {
        if (!curr.children[char]) { logTree(`[Trie] Слів з префіксом "${prefix}": 0`); return; }
        curr = curr.children[char];
    }
    logTree(`[Trie] Слів з префіксом "${prefix}": ${countWordsInTrie(curr)}`);
}

function removeTrieWord(node, word, depth) {
    if (!node) return false;
    if (depth === word.length) {
        if (node.isEndOfWord) node.isEndOfWord = false;
        return Object.keys(node.children).length === 0;
    }
    let char = word[depth];
    if (removeTrieWord(node.children[char], word, depth + 1)) {
        delete node.children[char];
        return !node.isEndOfWord && Object.keys(node.children).length === 0;
    }
    return false;
}

function trieDeleteWord() {
    let word = sanitizeWord(document.getElementById('treeStrValue').value);
    if (!word) return;
    removeTrieWord(trieRoot, word, 0);
    logTree(`[Trie] Спроба видалення слова "${word}".`);
    drawTreeCanvas();
}

function calcTreeDepth(node) {
    return node ? 1 + Math.max(calcTreeDepth(node.left), calcTreeDepth(node.right)) : 0;
}

function drawTreeCanvas() {
    const canvas = document.getElementById('treeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const type = document.getElementById('treeType').value;

    if (type !== 'trie') {
        const root = type === 'bst' ? bstRoot : avlRoot;
        let depth = calcTreeDepth(root);
        canvas.height = Math.max(400, depth * 70 + 50); 
    } else {
        canvas.height = 500; 
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (type === 'trie') {
        drawTrieNode(ctx, trieRoot, canvas.width / 2, 30, (canvas.width / 4) - 10, '*');
    } else {
        const root = type === 'bst' ? bstRoot : avlRoot;
        if (root) drawBinaryNode(ctx, root, canvas.width / 2, 40, (canvas.width / 4) - 20, type);
    }
}

function drawBinaryNode(ctx, node, x, y, dx, type) {
    if (!node) return;
    ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 2;
    
    if (node.left) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx, y + 60); ctx.stroke();
        drawBinaryNode(ctx, node.left, x - dx, y + 60, dx / 2, type); 
    }
    if (node.right) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + 60); ctx.stroke();
        drawBinaryNode(ctx, node.right, x + dx, y + 60, dx / 2, type);
    }
    
    ctx.beginPath(); ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = type === 'avl' ? '#8b5cf6' : '#3b82f6';
    ctx.fill(); ctx.stroke();
    
    ctx.fillStyle = 'white'; ctx.font = 'bold 14px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(node.val, x, y);
}

function drawTrieNode(ctx, node, x, y, dx, charLabel) {
    if (!node) return;
    
    ctx.beginPath(); ctx.arc(x, y, charLabel === '*' ? 15 : 18, 0, 2 * Math.PI);
    ctx.fillStyle = node.isEndOfWord ? '#10b981' : '#374151';
    ctx.fill(); ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2; ctx.stroke();
    
    ctx.fillStyle = 'white'; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(charLabel.toUpperCase(), x, y);

    let keys = Object.keys(node.children);
    let n = keys.length;
    if (n === 0) return;
    
    let startX = x - (dx * (n - 1)) / 2;
    for (let i = 0; i < n; i++) {
        let childX = startX + i * dx;
        let childY = y + 60;
        ctx.beginPath(); ctx.moveTo(x, y + 18); ctx.lineTo(childX, childY - 18); ctx.strokeStyle = '#4b5563'; ctx.stroke();
        drawTrieNode(ctx, node.children[keys[i]], childX, childY, dx / 1.8, keys[i]);
    }
}

// ==========================================
// ЛР 26-30: СКЛАДНІ АЛГОРИТМИ НА ГРАФАХ
// ==========================================
const INF = 1000000000;

function logAdvGraph(text, clear = false) {
    const consoleDiv = document.getElementById('advGraphConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function parseGraphMatrix() {
    const raw = document.getElementById('advGraphMatrix').value.trim();
    if (!raw) return [];
    return raw.split('\n').map(row => 
        row.split(',').map(val => {
            let v = parseInt(val.trim());
            return isNaN(v) ? 0 : v;
        })
    );
}

function parseCoords() {
    const raw = document.getElementById('astarCoords').value.trim();
    if (!raw) return [];
    return raw.split('\n').map(row => {
        let parts = row.split(',').map(v => parseFloat(v.trim()));
        return { x: parts[0] || 0, y: parts[1] || 0 };
    });
}

function runPrimJS() {
    const g = parseGraphMatrix();
    if (!g.length) return;
    const n = g.length;
    
    logAdvGraph("=== ЛР 26: Алгоритм Пріма (MST) ===", true);
    
    let key = new Array(n).fill(INF);
    let parent = new Array(n).fill(-1);
    let inMST = new Array(n).fill(false);
    key[0] = 0;
    let totalWeight = 0;

    logAdvGraph(`Крок | Вершина | ` + Array.from({length: n}, (_, i) => `v${i+1}`).join(' | '));
    logAdvGraph("-".repeat(50));

    for (let step = 0; step < n; step++) {
        let u = -1;
        for (let v = 0; v < n; v++) {
            if (!inMST[v] && (u === -1 || key[v] < key[u])) u = v;
        }
        if (u === -1) break;

        inMST[u] = true;
        if (parent[u] !== -1) totalWeight += g[u][parent[u]];

        let rowStr = `  ${step+1}  | v${u+1}(${key[u] === INF ? '∞' : key[u]}) | `;
        for (let v = 0; v < n; v++) {
            if (inMST[v]) rowStr += " MST |";
            else if (key[v] === INF) rowStr += "  ∞  |";
            else rowStr += ` ${key[v].toString().padStart(3, ' ')} |`;
        }
        logAdvGraph(rowStr);

        for (let v = 0; v < n; v++) {
            if (g[u][v] && !inMST[v] && g[u][v] < key[v]) {
                key[v] = g[u][v];
                parent[v] = u;
            }
        }
    }

    logAdvGraph("\nМінімальний кістяк:");
    for (let i = 1; i < n; i++) {
        if (parent[i] !== -1) {
            logAdvGraph(` v${parent[i]+1} -- v${i+1} (вага: ${g[i][parent[i]]})`);
        }
    }
    logAdvGraph(`Загальна вага MST: ${totalWeight}`);
}

function runDijkstraJS() {
    const g = parseGraphMatrix();
    if (!g.length) return;
    const n = g.length;
    let start = parseInt(document.getElementById('advStartNode').value) - 1 || 0;
    let end = parseInt(document.getElementById('advEndNode').value) - 1 || n - 1;
    
    if (start < 0 || start >= n) start = 0;
    if (end < 0 || end >= n) end = n - 1;

    logAdvGraph(`=== ЛР 27: Алгоритм Дейкстри (Старт: v${start+1}) ===`, true);

    let dist = new Array(n).fill(INF);
    let parent = new Array(n).fill(-1);
    let vis = new Array(n).fill(false);
    dist[start] = 0;

    logAdvGraph(`Крок | Поточна | ` + Array.from({length: n}, (_, i) => `v${i+1}`).join(' | '));
    logAdvGraph("-".repeat(50));

    for (let step = 0; step < n; step++) {
        let u = -1;
        for (let v = 0; v < n; v++) {
            if (!vis[v] && (u === -1 || dist[v] < dist[u])) u = v;
        }
        if (u === -1 || dist[u] === INF) break;

        vis[u] = true;

        let rowStr = `  ${step+1}  |    v${u+1}   |`;
        for (let v = 0; v < n; v++) {
            if (vis[v]) rowStr += "  * |";
            else if (dist[v] === INF) rowStr += "  ∞  |";
            else rowStr += ` ${dist[v].toString().padStart(3, ' ')} |`;
        }
        logAdvGraph(rowStr);

        for (let v = 0; v < n; v++) {
            if (!vis[v] && g[u][v] && dist[u] !== INF && dist[u] + g[u][v] < dist[v]) {
                dist[v] = dist[u] + g[u][v];
                parent[v] = u;
            }
        }
    }

    logAdvGraph(`\nШлях від v${start+1} до v${end+1}:`);
    if (dist[end] === INF) {
        logAdvGraph("Шлях відсутній.");
    } else {
        let path = [];
        for (let v = end; v !== -1; v = parent[v]) path.push(v + 1);
        path.reverse();
        logAdvGraph(`(довжина=${dist[end]})  ${path.join(' → ')}`);
    }
}

function runBellmanFordJS() {
    const g = parseGraphMatrix();
    if (!g.length) return;
    const n = g.length;
    let start = parseInt(document.getElementById('advStartNode').value) - 1 || 0;
    if (start < 0 || start >= n) start = 0;

    logAdvGraph(`=== ЛР 28: Алгоритм Беллмана-Форда (Старт: v${start+1}) ===`, true);

    let edges = [];
    for(let i = 0; i < n; i++) {
        for(let j = 0; j < n; j++) {
            if(g[i][j] !== 0) edges.push({u: i, v: j, w: g[i][j]});
        }
    }

    let dist = new Array(n).fill(INF);
    let parent = new Array(n).fill(-1);
    dist[start] = 0;

    for (let i = 0; i < n - 1; i++) {
        for (let e of edges) {
            if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) {
                dist[e.v] = dist[e.u] + e.w;
                parent[e.v] = e.u;
            }
        }
    }

    let negCycle = false;
    for (let e of edges) {
        if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) negCycle = true;
    }

    if (negCycle) {
        logAdvGraph("⚠ Виявлено від'ємний цикл!");
        return;
    }

    logAdvGraph("Вершина | Відстань | Шлях");
    logAdvGraph("-".repeat(40));
    for (let i = 0; i < n; i++) {
        let d = dist[i] === INF ? "∞" : dist[i];
        let pathStr = "недосяжна";
        if (dist[i] !== INF) {
            let path = [];
            for (let v = i; v !== -1; v = parent[v]) path.push(v + 1);
            path.reverse();
            pathStr = path.join(' → ');
        }
        logAdvGraph(`   v${i+1}   |    ${d.toString().padEnd(3, ' ')}   | ${pathStr}`);
    }
}

function runFloydWarshallJS() {
    const g = parseGraphMatrix();
    if (!g.length) return;
    const n = g.length;

    logAdvGraph(`=== ЛР 29: Алгоритм Флойда-Воршалла ===`, true);

    let dist = Array.from({length: n}, () => new Array(n).fill(INF));
    let next = Array.from({length: n}, () => new Array(n).fill(-1));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i === j) dist[i][j] = 0;
            else if (g[i][j] !== 0) {
                dist[i][j] = g[i][j];
                next[i][j] = j;
            }
        }
    }

    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    next[i][j] = next[i][k];
                }
            }
        }
    }

    logAdvGraph("Матриця найкоротших відстаней:");
    let header = "      | " + Array.from({length: n}, (_, i) => `v${i+1}`).join(' | ');
    logAdvGraph(header);
    logAdvGraph("-".repeat(header.length));
    
    for (let i = 0; i < n; i++) {
        let rowStr = `  v${i+1}  |`;
        for (let j = 0; j < n; j++) {
            let val = dist[i][j] === INF ? "INF" : dist[i][j];
            rowStr += ` ${val.toString().padStart(2, ' ')} |`;
        }
        logAdvGraph(rowStr);
    }
}

function runAStarJS() {
    const g = parseGraphMatrix();
    const coords = parseCoords();
    if (!g.length || !coords.length) return;
    const n = g.length;

    let start = parseInt(document.getElementById('advStartNode').value) - 1 || 0;
    let goal = parseInt(document.getElementById('advEndNode').value) - 1 || n - 1;

    if (start < 0 || start >= n) start = 0;
    if (goal < 0 || goal >= n) goal = n - 1;

    if (coords.length < n) {
        logAdvGraph("[-] Помилка: Кількість координат менша за кількість вершин у матриці!");
        return;
    }

    logAdvGraph(`=== ЛР 30: Алгоритм A* (Старт: v${start+1}, Ціль: v${goal+1}) ===`, true);

    let h = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
        let dx = coords[i].x - coords[goal].x;
        let dy = coords[i].y - coords[goal].y;
        h[i] = Math.floor(Math.sqrt(dx * dx + dy * dy)); 
    }

    logAdvGraph("Автоматично обчислені h(v) [Евклідова до цілі]:");
    for (let i = 0; i < n; i++) {
        logAdvGraph(`  h(v${i+1}) = ${h[i]}`);
    }
    logAdvGraph("-".repeat(50));

    let dist = new Array(n).fill(INF);
    let parent = new Array(n).fill(-1);
    let closed = new Array(n).fill(false);
    dist[start] = 0;

    let processed = 0;
    let found = false;
    let pq = [{ v: start, f: h[start] }];

    while (pq.length > 0) {
        pq.sort((a, b) => a.f - b.f);
        let current = pq.shift();
        let u = current.v;

        if (closed[u]) continue;
        closed[u] = true;
        processed++;

        if (u === goal) {
            found = true;
            break;
        }

        for (let v = 0; v < n; v++) {
            let weight = g[u][v];
            if (weight !== 0 && !closed[v]) {
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u;
                    pq.push({ v: v, f: dist[v] + h[v] });
                }
            }
        }
    }

    if (found) {
        let path = [];
        for (let v = goal; v !== -1; v = parent[v]) path.push(v + 1);
        path.reverse();

        logAdvGraph(`[+] Шлях знайдено!`);
        logAdvGraph(`    Довжина шляху: ${dist[goal]}`);
        logAdvGraph(`    Оброблено вершин: ${processed}`);
        logAdvGraph(`    Маршрут: ${path.join(' → ')}`);
        
        logAdvGraph(`\nСхема маршруту:`);
        for (let i = 0; i < path.length - 1; i++) {
            let u = path[i] - 1;
            let v = path[i+1] - 1;
            let w = g[u][v];
            logAdvGraph(`  [v${u+1}](${coords[u].x}, ${coords[u].y}) --${w}--> [v${v+1}](${coords[v].x}, ${coords[v].y})`);
        }
    } else {
        logAdvGraph(`[-] Шлях до цільової вершини v${goal+1} не знайдено.`);
    }
}
// ==========================================
// ЛР 24: ТОПОЛОГІЧНЕ СОРТУВАННЯ (АЛГОРИТМ КАНА)
// ==========================================

function logTopo(text, clear = false) {
    const consoleDiv = document.getElementById('topoConsole');
    if (!consoleDiv) return;
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function runKahnJS() {
    let n = parseInt(document.getElementById('topoNodes').value);
    if (isNaN(n) || n <= 0) {
        logTopo("[-] Помилка: введіть коректну кількість вершин.", true);
        return;
    }

    // Зчитуємо сирий текст і розбиваємо на рядки
    let edgesRaw = document.getElementById('topoEdges').value.trim().split('\n');
    let graph = Array.from({length: n}, () => []);
    let inDegree = new Array(n).fill(0);

    logTopo(`=== ЛР 24: Топологічне сортування (Алгоритм Кана) ===`, true);

    // Парсимо ребра
    for (let line of edgesRaw) {
        if (!line.trim()) continue;
        let parts = line.trim().split(/\s+/).map(Number);
        if (parts.length >= 2) {
            let u = parts[0];
            let v = parts[1];
            if (u >= 0 && u < n && v >= 0 && v < n) {
                graph[u].push(v);
                inDegree[v]++;
            } else {
                logTopo(`[!] Ігноруємо ребро ${u} -> ${v} (вершини поза межами 0..${n-1})`);
            }
        }
    }

    logTopo(`[i] Граф зчитано. Вершин: ${n}\nСписок суміжності:`);
    for (let i = 0; i < n; i++) {
        logTopo(`  ${i}: ${graph[i].join(' ')}`);
    }
    logTopo("-".repeat(40));

    // Реалізація Алгоритму Кана
    let q = [];
    let order = [];

    // 1. Додаємо в чергу всі вершини, які не мають вхідних ребер (inDegree == 0)
    for (let i = 0; i < n; i++) {
        if (inDegree[i] === 0) {
            q.push(i);
        }
    }

    let count = 0;
    
    // 2. Основний цикл обробки черги
    while (q.length > 0) {
        let u = q.shift(); // Витягуємо перший елемент (як q.front() + q.pop() у С++)
        order.push(u);
        count++;

        // Зменшуємо вхідний ступінь для всіх суміжних вершин
        for (let v of graph[u]) {
            inDegree[v]--;
            if (inDegree[v] === 0) {
                q.push(v);
            }
        }
    }

    // 3. Перевірка на цикл
    if (count !== n) {
        logTopo("\n[!] Помилка: виявлено цикл! Топологічне сортування неможливе.");
    } else {
        logTopo("\n[+] Сортування успішно виконано.");
        logTopo(`Топологічний порядок вершин: ${order.join(' ')}`);
    }
}
