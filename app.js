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
const defaultMatrix = [[5, 3, 4, 2, 1], [9, 8, 7, 3, 0], [8, 7, 6, 4, 3], [9, 1, 0, 2, 2], [8, 4, 3, 2, 1]];
const N_VAL = 5; // Змінив назву з 'n' на 'N_VAL' щоб уникнути помилки redeclaration
let nodeStates = new Array(N_VAL).fill('unvisited'); 
const centerX = 200, centerY = 200, radius = 120;
const nodePositions = [];

for (let i = 0; i < N_VAL; i++) {
    const angle = (i * 2 * Math.PI) / N_VAL - Math.PI / 2;
    nodePositions.push({ x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) });
}

function initMatrixInputs() {
    const container = document.getElementById('matrixInputs');
    if(!container) return;
    container.innerHTML = '';
    for (let i = 0; i < N_VAL; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';
        for (let j = 0; j < N_VAL; j++) {
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
    for (let i = 0; i < N_VAL; i++) {
        matrix.push([]);
        for (let j = 0; j < N_VAL; j++) {
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

    for (let i = 0; i < N_VAL; i++) {
        for (let j = 0; j < N_VAL; j++) {
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
}

function analyzeGraph() {
    nodeStates.fill('unvisited'); drawGraph();
    const matrix = getMatrix();
    logToConsole("=== АНАЛІЗ ГРАФА (ЛР21) ===", true);
    let isSym = true, isWeight = false, hasLoops = false, edges = 0;
    for (let i = 0; i < N_VAL; i++) {
        if (matrix[i][i] !== 0) hasLoops = true;
        for (let j = 0; j < N_VAL; j++) {
            if (matrix[i][j] !== matrix[j][i]) isSym = false;
            if (matrix[i][j] !== 0 && matrix[i][j] !== 1) isWeight = true;
            if (matrix[i][j] !== 0) edges++;
        }
    }
    logToConsole(`Кількість вершин: ${N_VAL}\nОрієнтованість: ${isSym ? "неорієнтований" : "орієнтований"}`);
}

async function runDFS() {
    const matrix = getMatrix(); nodeStates.fill('unvisited'); logToConsole("=== ПОЧАТОК DFS ===", true);
    async function dfs(node) {
        nodeStates[node] = 'active'; drawGraph(); await sleep(800);
        for (let i = 0; i < N_VAL; i++) {
            if (matrix[node][i] !== 0 && nodeStates[i] === 'unvisited') {
                nodeStates[node] = 'visited'; await dfs(i); nodeStates[node] = 'active'; drawGraph();
            }
        }
        nodeStates[node] = 'visited'; drawGraph();
    }
    await dfs(0); logToConsole("=== КІНЕЦЬ DFS ===");
}

async function runBFS() {
    const matrix = getMatrix(); nodeStates.fill('unvisited'); drawGraph(); logToConsole("=== ПОЧАТОК BFS ===", true);
    let queue = [0]; nodeStates[0] = 'active'; drawGraph(); await sleep(800);
    while (queue.length > 0) {
        let current = queue.shift();
        for (let i = 0; i < N_VAL; i++) {
            if (matrix[current][i] !== 0 && nodeStates[i] === 'unvisited') {
                queue.push(i); nodeStates[i] = 'active'; drawGraph(); await sleep(800);
            }
        }
        nodeStates[current] = 'visited'; drawGraph();
    }
    logToConsole("=== КІНЕЦЬ BFS ===");
}

// ...[Сюди додай старий код Сортування, Пошуку, Хешу, Списків, Стеку, Черги та Дерев, що були в попередніх версіях]...
// (Я навмисно не дублюю все це сюди, щоб не перевищити ліміт повідомлення, 
// просто встав свої старі функції після функції runBFS, 
// але ПЕРЕД останньою дужкою і переконайся, що в коді немає дублювання змінної 'n')
