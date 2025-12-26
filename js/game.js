// ================= 游戏逻辑 =================
const ICONS = ['🥬', '🥕', '🌽', '🪵', '🧶', '🔥', '✂️', '🥛', '🐔'];
const CARD_W = 48;
const CARD_H = 56;
const GAP = 2;
const DOCK_CAPACITY = 7;

let cards = [];
let dockCards = [];
let isAnimating = false;

const gameArea = document.getElementById('gameArea');
const dock = document.getElementById('dock');
const modal = document.getElementById('gameModal');
const startScreen = document.getElementById('startScreen');

async function startGame() {
    await initAudio();
    playMusic();
    startScreen.style.opacity = '0';
    setTimeout(() => startScreen.remove(), 500);
    initGameData();
}

function restartGame() {
    modal.classList.remove('show');
    initGameData();
}

function initGameData() {
    gameArea.innerHTML = '';
    document.querySelectorAll('.card').forEach(el => el.remove());
    dock.innerHTML = '';
    
    cards = [];
    dockCards = [];
    isAnimating = false;

    let pool = [];
    for (let i = 0; i < 21; i++) { 
        const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
        pool.push(icon, icon, icon);
    }
    pool.sort(() => Math.random() - 0.5);

    const centerX = window.innerWidth / 2 - CARD_W / 2;
    
    // 关键修复：重心下移
    // gameArea 从 140px 开始，我们让内容重心在容器内 120px 处
    // 这样绝对位置大概在 260px，即便上飘 150px 也是 110px，远低于标题
    const centerY = 120;

    pool.forEach((icon, index) => {
        const layer = Math.floor(index / 12); 
        let xOffset = (Math.random() - 0.5) * 300;
        let yOffset = (Math.random() - 0.5) * 300;
        
        // 越顶层的卡片越聚拢
        if (index > 40) {
            xOffset *= 0.3;
            yOffset *= 0.3;
        }

        xOffset = Math.round(xOffset / (CARD_W/2)) * (CARD_W/2);
        yOffset = Math.round(yOffset / (CARD_H/2)) * (CARD_H/2);

        const card = {
            id: index,
            icon: icon,
            x: centerX + xOffset,
            y: centerY + yOffset,
            z: index,
            el: null,
            status: 'board'
        };
        cards.push(card);
    });

    cards.sort((a, b) => a.z - b.z);

    cards.forEach(c => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerText = c.icon;
        el.style.left = c.x + 'px';
        el.style.top = c.y + 'px';
        el.style.zIndex = c.z;
        
        el.onclick = (e) => handleClick(c, e);
        
        c.el = el;
        gameArea.appendChild(el);
    });

    checkCover();
}

function checkCover() {
    const boardCards = cards.filter(c => c.status === 'board');
    
    boardCards.forEach(card => {
        let isCovered = false;
        for (let other of boardCards) {
            if (card === other) continue;
            
            if (other.z > card.z) {
                const xOverlap = Math.abs(card.x - other.x) < (CARD_W - 2);
                const yOverlap = Math.abs(card.y - other.y) < (CARD_H - 2);
                
                if (xOverlap && yOverlap) {
                    isCovered = true;
                    break;
                }
            }
        }
        
        if (isCovered) {
            card.el.classList.add('disabled');
        } else {
            card.el.classList.remove('disabled');
        }
    });
}

async function handleClick(card, e) {
    if (isAnimating) return;
    if (card.status !== 'board') return;
    if (card.el.classList.contains('disabled')) return;
    
    if (dockCards.length >= DOCK_CAPACITY) {
        shakeDock();
        return;
    }

    playClickSound();
    isAnimating = true;

    // 1. 移入Dock
    card.status = 'dock';
    let insertIndex = dockCards.length;
    for (let i = dockCards.length - 1; i >= 0; i--) {
        if (dockCards[i].icon === card.icon) {
            insertIndex = i + 1;
            break;
        }
    }
    dockCards.splice(insertIndex, 0, card);

    // 2. 坐标转换到Body
    const rect = card.el.getBoundingClientRect();
    card.el.style.position = 'fixed';
    card.el.style.left = rect.left + 'px';
    card.el.style.top = rect.top + 'px';
    card.el.style.zIndex = 2000;
    card.el.style.margin = '0';
    document.body.appendChild(card.el);

    checkCover();

    // 3. 动画
    await updateDockVisuals(card);

    // 4. 消除
    const hasMatch = await checkMatch();

    // 5. 输赢
    if (cards.every(c => c.status === 'removed')) {
        showModal(true);
    } else if (!hasMatch && dockCards.length >= DOCK_CAPACITY) {
        showModal(false);
    }

    isAnimating = false;
}

function updateDockVisuals(flyingCard = null) {
    return new Promise(resolve => {
        const totalWidth = DOCK_CAPACITY * CARD_W + (DOCK_CAPACITY - 1) * GAP;
        const dockRect = dock.getBoundingClientRect();
        const startX = dockRect.left + (dockRect.width - totalWidth) / 2;
        const startY = dockRect.top + 8;

        dockCards.forEach((c, i) => {
            const targetX = startX + i * (CARD_W + GAP);
            const targetY = startY;

            const duration = c === flyingCard ? '0.25s' : '0.2s';
            c.el.style.transition = `left ${duration} cubic-bezier(0.25, 0.8, 0.25, 1), top ${duration} cubic-bezier(0.25, 0.8, 0.25, 1)`;
            
            c.el.style.left = targetX + 'px';
            c.el.style.top = targetY + 'px';
            c.el.style.zIndex = 2000;
        });

        setTimeout(resolve, 250);
    });
}

function checkMatch() {
    return new Promise(async resolve => {
        const counts = {};
        dockCards.forEach(c => counts[c.icon] = (counts[c.icon] || 0) + 1);

        const matchIcon = Object.keys(counts).find(icon => counts[icon] >= 3);

        if (matchIcon) {
            const toRemove = dockCards.filter(c => c.icon === matchIcon).slice(0, 3);
            playMatchSound();

            toRemove.forEach(c => {
                c.el.classList.add('vanish');
                c.status = 'removed';
            });

            await new Promise(r => setTimeout(r, 200));
            toRemove.forEach(c => c.el.remove());
            dockCards = dockCards.filter(c => !toRemove.includes(c));
            await updateDockVisuals();
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

function shakeDock() {
    dock.style.transition = 'transform 0.1s';
    dock.style.transform = 'translateX(-50%) scale(1.1)';
    setTimeout(() => {
        dock.style.transform = 'translateX(-50%) scale(1)';
    }, 100);
}

function showModal(win) {
    const icon = document.getElementById('modalIcon');
    const title = document.getElementById('modalTitle');
    const msg = document.getElementById('modalMsg');

    if (win) {
        icon.innerText = '🏆';
        title.innerText = '通关成功！';
        msg.innerText = '今天的羊群首领就是你！';
    } else {
        icon.innerText = '🪦';
        title.innerText = '槽位已满';
        msg.innerText = '胜败乃兵家常事，换个姿势再来？';
    }
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 500);
}

window.addEventListener('resize', () => {
    if (dockCards.length > 0) {
        updateDockVisuals();
    }
});