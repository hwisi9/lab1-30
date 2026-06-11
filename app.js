function drawTrieNode(ctx, node, x, y, dx, charLabel) {
    if (!node) return;
    
    // Якщо це корінь, малюємо його сірим і меншим
    ctx.beginPath(); ctx.arc(x, y, charLabel === '*' ? 15 : 18, 0, 2 * Math.PI);
    ctx.fillStyle = node.isEndOfWord ? '#10b981' : '#374151'; // Зелений, якщо кінець слова
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
        // Для Trie залишаємо 1.8, бо там може бути більше ніж 2 гілки
        drawTrieNode(ctx, node.children[keys[i]], childX, childY, dx / 1.8, keys[i]);
    }
}
