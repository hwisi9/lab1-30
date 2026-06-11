// Дефолтна матриця 5х5 (та сама, що була на твоїх скріншотах)
const defaultMatrix = [
    [5, 3, 4, 2, 1],
    [9, 8, 7, 3, 0],
    [8, 7, 6, 4, 3],
    [9, 1, 0, 2, 2],
    [8, 4, 3, 2, 1]
];

const n = 5;

// Ініціалізація полів на сторінці при завантаженні
window.onload = function() {
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
            rowDiv.appendChild(input);
        }
        container.appendChild(rowDiv);
    }
};

// Зчитування поточної матриці з полів вводу
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

// Друкує текст в "емульовану консоль"
function logToConsole(text, clear = false) {
    const consoleDiv = document.getElementById('consoleOutput');
    if (clear) consoleDiv.innerHTML = '';
    consoleDiv.innerHTML += text + '\n';
    consoleDiv.scrollTop = consoleDiv.scrollHeight; 
}

// --- АНАЛІЗ ГРАФА (Аналог ЛР21 на JS) ---
function analyzeGraph() {
    const matrix = getMatrix();
    logToConsole("=== АНАЛІЗ ГРАФА (ЛР21) ===", true);
    logToConsole(`Кількість вершин: ${n}`);
    
    // Перевірка симетричності
    let isSymmetric = true;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (matrix[i][j] !== matrix[j][i]) isSymmetric = false;
        }
    }
    logToConsole(`Орієнтованість: ${isSymmetric ? "неорієнтований" : "орієнтований"}`);

    // Перевірка зваженості
    let isWeighted = false;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] !== 0 && matrix[i][j] !== 1) isWeighted = true;
        }
    }
    logToConsole(`Зваженість: ${isWeighted ? "зважений" : "незважений"}`);

    // Петлі
    let hasLoops = false;
    for (let i = 0; i < n; i++) {
        if (matrix[i][i] !== 0) hasLoops = true;
    }
    logToConsole(`Наявність петель: ${hasLoops ? "є" : "немає"}`);

    // Кількість ребер
    let edges = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] !== 0) edges++;
        }
    }
    logToConsole(`Кількість ребер: ${edges}`);
    
    // Степені
    logToConsole("\nСтепені вершин:");
    for (let i = 0; i < n; i++) {
        let outDeg = 0, inDeg = 0;
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] !== 0) outDeg++;
            if (matrix[j][i] !== 0) inDeg++;
        }
        logToConsole(`  vertex(${i + 1}): out = ${outDeg}, in = ${inDeg}`);
    }
}

// --- ОБХІД DFS (Аналог ЛР22 на JS) ---
function runDFS() {
    const matrix = getMatrix();
    let visited = new Array(n).fill(false);
    
    logToConsole("=== ПОЧАТОК DFS (ЛР22) ===", true);
    
    // Функція рекурсивного обходу
    function dfs(node) {
        visited[node] = true;
        logToConsole(` -> Відвідали вершину ${node + 1}`);
        
        for (let i = 0; i < n; i++) {
            if (matrix[node][i] !== 0) {
                if (!visited[i]) {
                    logToConsole(`    [Йдемо вглиб: з ${node + 1} у ${i + 1}]`);
                    dfs(i);
                } else {
                    logToConsole(`    [Вершина ${i + 1} вже відвідана, пропускаємо]`);
                }
            }
        }
        logToConsole(` <- Повертаємось з вершини ${node + 1}`);
    }
    
    // Стартуємо з вершини 2 (індекс 1), як на твоєму скріншоті
    dfs(1); 
    logToConsole("=== КІНЕЦЬ DFS ===");
}
