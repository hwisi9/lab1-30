// ==========================================
// НАВІГАЦІЯ ТА СПІЛЬНІ ФУНКЦІЇ
// ==========================================
function switchLab(labId) {
    document.querySelectorAll('.lab-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    document.getElementById(labId).classList.add('active');
    event.currentTarget.classList.add('active');
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Ініціалізація всіх модулів при завантаженні сторінки
window.onload = function() {
    initMatrixInputs();
    drawGraph();
    generateArray();
    generateSearchArray();
    initHashTables();
    drawLists();
};


// ==========================================
// ЛР 21-23: ГРАФИ
// ==========================================
const defaultMatrix = [
    [5, 3, 4, 2, 1], [9, 8, 7, 3, 0], [8, 7, 6, 4, 3], [9, 1, 0, 2, 2], [8, 4, 3, 2, 1]
];
const n = 5;
let nodeStates = new Array(n).fill('unvisited'); 
const centerX = 200, centerY = 200, radius = 120;
const nodePositions = [];

for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    nodePositions.push({ x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) });
}

function initMatrixInputs() {
    const container = document.getElementById('matrixInputs');
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        for (let j = 0; j < n; j++) {
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
    for (let i = 0; i < n; i++) {
        matrix.push([]);
        for (let j = 0; j < n; j++) {
            const val = parseInt(document.getElementById(`m_${i}_${j}`).value) || 0;
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

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
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
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function analyzeGraph() {
    nodeStates.fill('unvisited'); drawGraph();
    const matrix = getMatrix();
    logToConsole("=== АНАЛІЗ ГРАФА (ЛР21) ===", true);
    let isSym = true, isWeight = false, hasLoops = false, edges = 0;
    for (let i = 0; i < n; i++) {
        if (matrix[i][i] !== 0) hasLoops = true;
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] !== matrix[j][i]) isSym = false;
            if (matrix[i][j] !== 0 && matrix[i][j] !== 1) isWeight = true;
            if (matrix[i][j] !== 0) edges++;
        }
    }
    let actualEdges = isSym ? (edges / 2) + (hasLoops ? 1 : 0) : edges;
    logToConsole(`Кількість вершин: ${n}\nОрієнтованість: ${isSym ? "неорієнтований" : "орієнтований"}\nЗваженість: ${isWeight ? "зважений" : "незважений"}\nНаявність петель: ${hasLoops ? "є" : "немає"}\nКількість ребер: ${Math.floor(actualEdges)}\n\nСтепені вершин:`);
    for (let i = 0; i < n; i++) {
        let outDeg = 0, inDeg = 0;
        for (let j = 0; j < n; j++) { if (matrix[i][j] !== 0) outDeg++; if (matrix[j][i] !== 0) inDeg++; }
        isSym ? logToConsole(`  deg(${i + 1}) = ${outDeg}`) : logToConsole(`  out(${i + 1}) = ${outDeg}, in(${i + 1}) = ${inDeg}`);
    }
}

async function runDFS() {
    const matrix = getMatrix(); nodeStates.fill('unvisited'); logToConsole("=== ПОЧАТОК DFS (ЛР22) ===", true);
    async function dfs(node) {
        nodeStates[node] = 'active'; drawGraph(); logToConsole(` -> Відвідали вершину ${node + 1}`); await sleep(1000);
        for (let i = 0; i < n; i++) {
            if (matrix[node][i] !== 0) {
                if (nodeStates[i] === 'unvisited') {
                    logToConsole(`    [Йдемо вглиб: з ${node + 1} у ${i + 1}]`);
                    nodeStates[node] = 'visited'; await dfs(i); nodeStates[node] = 'active'; drawGraph(); await sleep(800);
                } else { logToConsole(`    [Вершина ${i + 1} вже відвідана, пропускаємо]`); }
            }
        }
        nodeStates[node] = 'visited'; drawGraph(); logToConsole(` <- Повертаємось з вершини ${node + 1}`);
    }
    await dfs(1); logToConsole("=== КІНЕЦЬ DFS ===");
}

async function runBFS() {
    const matrix = getMatrix(); nodeStates.fill('unvisited'); drawGraph(); logToConsole("=== ПОЧАТОК BFS (ЛР23) ===", true);
    let queue = [1]; nodeStates[1] = 'active'; logToConsole(` -> Додаємо початкову вершину 2 у чергу`); drawGraph(); await sleep(1000);
    while (queue.length > 0) {
        let current = queue.shift(); logToConsole(`\n=== Обробляємо вершину ${current + 1} ===`);
        for (let i = 0; i < n; i++) {
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

function generateArray() {
    if (isSorting) return;
    const size = parseInt(document.getElementById('arrSize').value) || 20;
    currentArray = [];
    for (let i = 0; i < size; i++) currentArray.push(Math.floor(Math.random() * 90) + 10);
    drawArray(currentArray);
}

function drawArray(arr, activeIndices = [], swapIndices = []) {
    const container = document.getElementById('sortVisualizer');
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
    setTimeout(() => { drawArray(arr); isSorting = false; document.getElementById('sortBtn').disabled = false; }, 1000);
    currentArray = arr; 
}

// 1. Вибором
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

// 2. Включенням
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

// 3. Бульбашкою
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

// 4. Злиттям
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

// 5. Швидке
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

// 6. Шелла
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

// 7. Шейкерне
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

// 8. Пірамідальне (Купою)
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
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// 1. Лінійний пошук
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

// 2. Лінійний пошук з бар'єром
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

// 3. Бінарний пошук
async function runBinarySearch() {
    if (isSearching || searchArray.length === 0) return;
    if (!isSearchSorted) {
        alert("Для бінарного пошуку масив має бути відсортованим! Натисніть кнопку 'Відсортувати'.");
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

function hashFunction(key) {
    return key % HASH_SIZE;
}

function initHashTables() {
    tableChain = Array.from({length: HASH_SIZE}, () => []);
    tableOpen = Array.from({length: HASH_SIZE}, () => ({ state: 'free', key: null, value: '' }));
    collisionsCount = 0;
    drawHashTables();
}

function drawHashTables() {
    const container = document.getElementById('hashVisualizer');
    container.innerHTML = '';
    document.getElementById('collisionCounter').innerText = `Колізій: ${collisionsCount}`;

    for (let i = 0; i < HASH_SIZE; i++) {
        const row = document.createElement('div');
        row.className = 'hash-row';

        // Індекс
        const idxDiv = document.createElement('div');
        idxDiv.className = 'hash-index';
        idxDiv.innerText = `[${i}]`;
        row.appendChild(idxDiv);

        // Ланцюжки
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

        // Відкрита адресація
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

    // 1. Метод ланцюжків
    let foundChain = tableChain[h].find(e => e.key === key);
    if (foundChain) foundChain.value = value;
    else tableChain[h].push({ key, value });

    // 2. Відкрита адресація (Квадратичне пробування)
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

    // Ланцюжки
    let foundChain = tableChain[h].find(e => e.key === key);
    logHash(`Ланцюжки: ${foundChain ? 'Знайдено (Значення: ' + foundChain.value + ')' : 'Не знайдено'}`);

    // Відкрита адресація
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

    // Ланцюжки
    const initialLen = tableChain[h].length;
    tableChain[h] = tableChain[h].filter(e => e.key !== key);
    if (tableChain[h].length < initialLen) removed = true;

    // Відкрита адресація
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
let sList = []; // Однозв'язний (імітація через масив для рендеру)
let dList = []; // Двозв'язний
let cList = []; // Кільцевий

function logList(text, clear = false) {
    const consoleDiv = document.getElementById('listConsole');
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

function getListInput() {
    const val = parseInt(document.getElementById('listValue').value);
    return isNaN(val) ? Math.floor(Math.random() * 99) : val;
}

function drawLists() {
    const type = document.getElementById('listType').value;
    const container = document.getElementById('listVisualizer');
    const hint = document.getElementById('listRulesHint');
    const btnReverse = document.getElementById('btnReverse');
    container.innerHTML = '';

    if (type === 'singly') {
        hint.innerText = "Правило: Додає в початок. Видаляє за значенням. Можна реверсувати.";
        btnReverse.disabled = false;
        
        container.innerHTML += `<span class="list-head-label">[Head]</span> <div class="list-arrow">→</div>`;
        sList.forEach(val => {
            container.innerHTML += `<div class="list-node">[${val}]</div> <div class="list-arrow">→</div>`;
        });
        container.innerHTML += `<div class="list-null">NULL</div>`;
        
    } else if (type === 'doubly') {
        hint.innerText = "Правило: Додає в кінець. Видаляє перший елемент (Head).";
        btnReverse.disabled = true;

        container.innerHTML += `<div class="list-null">NULL</div> <div class="list-arrow">⇔</div>`;
        dList.forEach(val => {
            container.innerHTML += `<div class="list-node">[${val}]</div> <div class="list-arrow">⇔</div>`;
        });
        container.innerHTML += `<div class="list-null">NULL</div>`;

    } else if (type === 'circular') {
        hint.innerText = "Правило: Додає в кінець. Вказує на Head.";
        btnReverse.disabled = true;

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
        sList.unshift(val); // Додаємо на початок
        logList(`[Однозв'язний] Додано [${val}] на початок. Всього: ${sList.length}`);
    } else if (type === 'doubly') {
        dList.push(val); // Додаємо в кінець
        logList(`[Двозв'язний] Додано [${val}] в кінець.`);
    } else if (type === 'circular') {
        cList.push(val); // Додаємо в кінець
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
            logList(`[Однозв'язний] Перше входження [${val}] видалено.`);
        } else {
            logList(`[Однозв'язний] Елемент [${val}] не знайдено!`);
        }
    } else if (type === 'doubly') {
        if (dList.length > 0) {
            const removed = dList.shift(); // Видаляємо перший (Head)
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
        logList(`[Однозв'язний] Вказівники успішно перевернуто (Реверс).`);
        drawLists();
    }
}
