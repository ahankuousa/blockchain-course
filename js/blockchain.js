/**
 * 區塊鏈互動課程 - JavaScript 互動邏輯
 * 包含所有章節的互動演示功能
 */

// ==========================================
// 全域變數與初始化
// ==========================================

let miningInterval = null;
let chainData = {
    blocks: [
        { index: 0, data: 'Genesis Block', prevHash: '000000', hash: '' },
        { index: 1, data: 'A→B 10 BTC', prevHash: '', hash: '' },
        { index: 2, data: 'C→D 5 BTC', prevHash: '', hash: '' }
    ]
};
let consensusState = {
    chainA: 4,
    chainB: 5
};
let walletSignature = null;
let currentMessage = '';

// ==========================================
// 工具函數
// ==========================================

/**
 * 簡易 Hash 函數（用於演示，實際使用 Web Crypto API）
 */
async function simpleHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 延遲函數
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化時間戳
 */
function formatTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * 滾動到下一個章節
 */
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = 70;
        const sectionTop = section.offsetTop - headerHeight;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

// ==========================================
// 導航功能
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    // 導航連結點擊
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // 更新 active 狀態
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 關閉 mobile 選單
            closeMobileMenu();
        });
    });
    
    // Mobile 選單按鈕
    document.querySelector('.mobile-menu-btn')?.addEventListener('click', toggleMobileMenu);
    document.querySelector('.mobile-nav-overlay')?.addEventListener('click', closeMobileMenu);
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // 監聽滾動以更新導航 active 狀態
    window.addEventListener('scroll', updateNavActive);
    
    // 初始化各章節
    initBlockStructure();
    initHashDemo();
    initChainDemo();
    initPowDemo();
    initConsensusDemo();
    initWalletDemo();
});

function toggleMobileMenu() {
    document.querySelector('.mobile-nav')?.classList.toggle('active');
    document.querySelector('.mobile-nav-overlay')?.classList.toggle('active');
    document.body.style.overflow = document.querySelector('.mobile-nav')?.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    document.querySelector('.mobile-nav')?.classList.remove('active');
    document.querySelector('.mobile-nav-overlay')?.classList.remove('active');
    document.body.style.overflow = '';
}

function updateNavActive() {
    const sections = document.querySelectorAll('.section[id]');
    const scrollPos = window.scrollY + 150;
    
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        
        if (scrollPos >= top && scrollPos < top + height) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ==========================================
// 第二章：區塊結構
// ==========================================

async function initBlockStructure() {
    updateBlockHash();
    
    // 監聽輸入變化
    ['input-index', 'input-data', 'input-prevhash', 'input-nonce'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', updateBlockHash);
    });
    
    // 更新時間戳
    setInterval(() => {
        document.getElementById('block-time').textContent = formatTimestamp();
    }, 1000);
}

async function updateBlockHash() {
    const index = document.getElementById('input-index')?.value || '0';
    const data = document.getElementById('input-data')?.value || '';
    const prevHash = document.getElementById('input-prevhash')?.value || '';
    const nonce = document.getElementById('input-nonce')?.value || '0';
    
    const hashInput = index + data + prevHash + nonce;
    const hash = await simpleHash(hashInput);
    
    const hashDisplay = document.getElementById('display-hash');
    if (hashDisplay) {
        hashDisplay.style.opacity = '0.5';
        await sleep(100);
        hashDisplay.textContent = hash;
        hashDisplay.style.opacity = '1';
    }
}

function resetBlock() {
    document.getElementById('input-index').value = '1';
    document.getElementById('input-data').value = 'A 轉給 B 10 枚比特幣';
    document.getElementById('input-prevhash').value = '0000000000000000000000000000000000000000000000000000000000000000';
    document.getElementById('input-nonce').value = '0';
}

// ==========================================
// 第三章：Hash 計算
// ==========================================

async function initHashDemo() {
    await updateHashResult();
    
    document.getElementById('hash-input')?.addEventListener('input', debounce(updateHashResult, 300));
}

async function updateHashResult() {
    const input = document.getElementById('hash-input')?.value || '';
    const hashResult = document.getElementById('hash-result');
    const hashAnimation = document.getElementById('hash-animation');
    
    if (!hashResult) return;
    
    // 顯示計算動畫
    if (hashAnimation) hashAnimation.classList.add('active');
    hashResult.style.opacity = '0.5';
    
    await sleep(200);
    
    const hash = await simpleHash(input);
    
    if (hashAnimation) hashAnimation.classList.remove('active');
    hashResult.textContent = hash;
    hashResult.style.opacity = '1';
    
    // 更新統計
    const charCount = document.getElementById('char-count');
    const hashPrefix = document.getElementById('hash-prefix');
    
    if (charCount) charCount.textContent = input.length;
    if (hashPrefix) hashPrefix.textContent = hash.substring(0, 4) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function resetHash() {
    document.getElementById('hash-input').value = 'Hello, Blockchain!';
    updateHashResult();
}

// ==========================================
// 第四章：區塊連結
// ==========================================

async function initChainDemo() {
    await rebuildChain();
}

async function rebuildChain() {
    // 計算所有區塊的 Hash
    for (let i = 0; i < chainData.blocks.length; i++) {
        const block = chainData.blocks[i];
        const prevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : chainData.blocks[i-1].hash;
        block.prevHash = prevHash;
        
        const hashInput = block.index + block.data + prevHash + '0';
        block.hash = await simpleHash(hashInput);
        
        // 更新顯示
        updateChainDisplay(i);
    }
    
    // 更新連結狀態
    updateChainLinks();
}

function updateChainDisplay(index) {
    const block = chainData.blocks[index];
    if (!block) return;
    
    const hashEl = document.getElementById(`hash-${index}`);
    const dataEl = document.getElementById(`data-${index}`);
    const prevEl = document.getElementById(`prev-${index}`);
    
    if (hashEl) hashEl.textContent = block.hash.substring(0, 12) + '...';
    if (dataEl) dataEl.textContent = block.data;
    if (prevEl) prevEl.textContent = index === 0 ? '000000...' : chainData.blocks[index-1].hash.substring(0, 12) + '...';
}

function updateChainLinks() {
    // 視覺化更新：確保區塊之間的連結正確
    const chainVisual = document.getElementById('chain-visual');
    if (chainVisual) {
        chainVisual.querySelectorAll('.chain-block').forEach((el, i) => {
            el.style.opacity = '1';
        });
    }
}

async function tamperBlock() {
    const selectEl = document.getElementById('tamper-select');
    const valueEl = document.getElementById('tamper-value');
    const resultEl = document.getElementById('tamper-result');
    
    if (!selectEl || !valueEl || !resultEl) return;
    
    const blockIndex = parseInt(selectEl.value);
    const newData = valueEl.value;
    
    // 篡改資料
    chainData.blocks[blockIndex].data = newData;
    
    // 重新計算該區塊及後面所有區塊的 Hash
    for (let i = blockIndex; i < chainData.blocks.length; i++) {
        const block = chainData.blocks[i];
        const prevHash = i === 0 ? '0000000000000000000000000000000000000000000000000000000000000000' : chainData.blocks[i-1].hash;
        block.prevHash = prevHash;
        
        const hashInput = block.index + block.data + prevHash + '0';
        block.hash = await simpleHash(hashInput);
        
        updateChainDisplay(i);
    }
    
    // 顯示篡改結果
    resultEl.className = 'tamper-result invalid';
    resultEl.innerHTML = `
        <strong>⚠️ 區塊 ${blockIndex} 已被篡改！</strong><br>
        Hash 改變，導致區塊 #${blockIndex} 及後續所有區塊的 Hash 都失效！<br>
        這就是區塊鏈不可篡改的原理。
    `;
    
    // 標記篡改的區塊
    for (let i = blockIndex; i < chainData.blocks.length; i++) {
        const blockEl = document.getElementById(`chain-block-${i}`);
        if (blockEl) {
            blockEl.style.border = '2px solid var(--accent-red)';
            blockEl.style.animation = 'shake 0.5s ease';
        }
    }
}

function resetChain() {
    chainData = {
        blocks: [
            { index: 0, data: 'Genesis Block', prevHash: '000000', hash: '' },
            { index: 1, data: 'A→B 10 BTC', prevHash: '', hash: '' },
            { index: 2, data: 'C→D 5 BTC', prevHash: '', hash: '' }
        ]
    };
    
    document.getElementById('chain-data-1').value = 'A→B 10 BTC';
    document.getElementById('chain-data-2').value = 'C→D 5 BTC';
    document.getElementById('tamper-value').value = '';
    document.getElementById('tamper-result').className = 'tamper-result';
    document.getElementById('tamper-result').innerHTML = '';
    
    // 重置區塊樣式
    document.querySelectorAll('.chain-block').forEach(el => {
        el.style.border = '';
        el.style.animation = '';
    });
    
    rebuildChain();
}

// ==========================================
// 第五章：工作量證明 (PoW)
// ==========================================

let isMining = false;

async function initPowDemo() {
    updateDifficulty();
}

function updateDifficulty() {
    const difficulty = document.getElementById('difficulty')?.value || 3;
    const display = document.getElementById('difficulty-display');
    const targetDisplay = document.getElementById('target-display');
    
    if (display) display.textContent = difficulty + ' 個零';
    if (targetDisplay) targetDisplay.textContent = '0'.repeat(difficulty);
}

async function startMining() {
    if (isMining) return;
    
    const mineBtn = document.getElementById('mine-btn');
    if (mineBtn) {
        mineBtn.disabled = true;
        mineBtn.textContent = '⛏️ 挖礦中...';
    }
    
    isMining = true;
    const difficulty = parseInt(document.getElementById('difficulty')?.value || 3);
    const data = document.getElementById('pow-data')?.value || '';
    const target = '0'.repeat(difficulty);
    
    let nonce = 0;
    const maxIterations = 100000;
    
    miningInterval = setInterval(async () => {
        if (!isMining) {
            clearInterval(miningInterval);
            return;
        }
        
        // 嘗試計算 Hash
        const hashInput = data + nonce.toString();
        const hash = await simpleHash(hashInput);
        
        // 更新顯示
        document.getElementById('nonce-display').textContent = nonce;
        document.getElementById('current-hash-mini').textContent = hash.substring(0, 20) + '...';
        
        // 更新進度條
        const progress = Math.min((nonce / maxIterations) * 100, 99);
        document.getElementById('pow-progress').style.width = progress + '%';
        
        // 檢查是否找到符合條件的 Hash
        if (hash.substring(0, difficulty) === target) {
            stopMining();
            
            const resultEl = document.getElementById('mining-result');
            if (resultEl) {
                resultEl.className = 'mining-result success';
                resultEl.innerHTML = `
                    <strong>🎉 挖礦成功！</strong><br>
                    Nonce: ${nonce}<br>
                    Hash: ${hash}<br>
                    符合條件：前 ${difficulty} 個字元為 0
                `;
            }
            
            document.getElementById('pow-progress').style.width = '100%';
            return;
        }
        
        nonce++;
        
        // 防止過度運算
        if (nonce > maxIterations) {
            stopMining();
            alert('達到最大迭代次數，請嘗試降低難度或更短的資料');
        }
    }, 10);
}

function stopMining() {
    isMining = false;
    const mineBtn = document.getElementById('mine-btn');
    if (mineBtn) {
        mineBtn.disabled = false;
        mineBtn.textContent = '⛏️ 開始挖礦';
    }
}

function resetPow() {
    stopMining();
    document.getElementById('nonce-display').textContent = '0';
    document.getElementById('current-hash-mini').textContent = '-';
    document.getElementById('pow-progress').style.width = '0%';
    document.getElementById('mining-result').className = 'mining-result';
    document.getElementById('mining-result').innerHTML = '';
    document.getElementById('pow-data').value = '交易資料：A轉B 1 BTC';
    document.getElementById('difficulty').value = 3;
    updateDifficulty();
}

// ==========================================
// 第六章：共識機制
// ==========================================

function initConsensusDemo() {
    updateConsensusDisplay();
}

function updateConsensusDisplay() {
    // 更新鏈 A
    document.getElementById('len-a').textContent = consensusState.chainA;
    updateChainNodes('chain-a', consensusState.chainA);
    
    // 更新鏈 B
    document.getElementById('len-b').textContent = consensusState.chainB;
    updateChainNodes('chain-b', consensusState.chainB);
    
    // 判斷贏家
    updateConsensusStatus();
}

function updateChainNodes(chainId, length) {
    const chainEl = document.getElementById(chainId);
    if (!chainEl) return;
    
    const nodesContainer = chainEl.querySelector('.chain-nodes');
    if (!nodesContainer) return;
    
    // 移除所有節點
    nodesContainer.innerHTML = '';
    
    // 添加新節點
    for (let i = 1; i <= length; i++) {
        const node = document.createElement('div');
        node.className = 'node';
        node.textContent = '#' + i;
        node.dataset.height = i;
        
        // 標記獲勝的區塊
        if (chainId === 'chain-b' && consensusState.chainB >= consensusState.chainA) {
            node.classList.add('winning');
        }
        
        nodesContainer.appendChild(node);
    }
}

function updateConsensusStatus() {
    const statusEl = document.getElementById('consensus-status');
    if (!statusEl) return;
    
    if (consensusState.chainB > consensusState.chainA) {
        statusEl.innerHTML = `
            <div class="status-box">
                <h4>🏆 當前共識結果</h4>
                <p>鏈 B 成為主鏈！</p>
                <p class="small">藍隊的鏈更長（${consensusState.chainB} 個區塊），所有節點會自動切换到這條鏈</p>
            </div>
        `;
    } else if (consensusState.chainA > consensusState.chainB) {
        statusEl.innerHTML = `
            <div class="status-box">
                <h4>🏆 當前共識結果</h4>
                <p>鏈 A 成為主鏈！</p>
                <p class="small">紅隊的鏈更長（${consensusState.chainA} 個區塊），所有節點會自動切换到這條鏈</p>
            </div>
        `;
    } else {
        statusEl.innerHTML = `
            <div class="status-box">
                <h4>⚖️ 當前共識結果</h4>
                <p>勢均力敵！</p>
                <p class="small">兩條鏈長度相同，等待下一個區塊揭曉結果</p>
            </div>
        `;
    }
}

function addBlockToChain(chain) {
    if (chain === 'a') {
        consensusState.chainA++;
    } else {
        consensusState.chainB++;
    }
    
    updateConsensusDisplay();
    
    // 添加動畫效果
    const chainEl = document.getElementById('chain-' + chain);
    if (chainEl) {
        const lastNode = chainEl.querySelector('.node:last-child');
        if (lastNode) {
            lastNode.style.transform = 'scale(1.2)';
            lastNode.style.boxShadow = '0 0 20px var(--cyan-glow)';
            setTimeout(() => {
                lastNode.style.transform = '';
                lastNode.style.boxShadow = '';
            }, 300);
        }
    }
}

function resetConsensus() {
    consensusState = {
        chainA: 4,
        chainB: 5
    };
    updateConsensusDisplay();
}

// ==========================================
// 第七章：錢包與簽名
// ==========================================

function initWalletDemo() {
    // 生成示範用的密鑰對（實際上這只是展示用，不是真實的加密）
    generateDemoKeys();
}

function generateDemoKeys() {
    // 這些只是演示用的虛構密鑰
    const privateKey = '0f1e2d3c4b5a69788796a5b4c3d2e1f0a1b2c3d4e5f6071829384756647392';
    const publicKey = '04588d2ed9da166cb2f1a8b9f2e6d4f8a1b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d';
    const walletAddress = '1A2B3C4D5E6F7G8H9I0JKLMNOPQRSTU';
    
    document.getElementById('private-key').textContent = privateKey;
    document.getElementById('public-key').textContent = publicKey;
    document.getElementById('wallet-address').textContent = walletAddress;
}

async function signMessage() {
    const message = document.getElementById('sign-message')?.value || '';
    currentMessage = message;
    
    if (!message) {
        alert('請輸入要簽名的訊息');
        return;
    }
    
    // 模擬簽名過程
    const signatureResult = document.getElementById('signature-result');
    if (signatureResult) {
        signatureResult.textContent = '🔐 簽名中...';
        await sleep(500);
        
        // 生成模擬簽名（實際使用 ECDSA）
        const hash = await simpleHash(message + 'private-key');
        walletSignature = 'SIG_' + hash.substring(0, 32).toUpperCase();
        
        signatureResult.textContent = walletSignature;
        signatureResult.style.color = 'var(--accent-green)';
    }
    
    // 更新驗證狀態
    const verifyStatus = document.querySelector('.verify-status');
    if (verifyStatus) {
        verifyStatus.textContent = '✓ 簽名已生成，可以驗證';
        verifyStatus.className = 'verify-status valid';
    }
}

async function verifySignature() {
    if (!walletSignature) {
        alert('請先簽名訊息');
        return;
    }
    
    const verificationResult = document.getElementById('verification-result');
    if (verificationResult) {
        verificationResult.innerHTML = '<span class="verify-status valid">✅ 簽名驗證成功！</span>';
    }
}

async function tamperSignature() {
    const tamperedMessage = document.getElementById('tamper-message')?.value;
    
    if (!tamperedMessage) {
        alert('請輸入篡改後的訊息');
        return;
    }
    
    if (!walletSignature) {
        alert('請先生成簽名');
        return;
    }
    
    const verificationResult = document.getElementById('verification-result');
    if (verificationResult) {
        verificationResult.innerHTML = '<span class="verify-status invalid">❌ 簽名驗證失敗！</span><br>訊息被篡改，Hash 不匹配';
    }
    
    // 顯示篡改警告
    const tamperedEl = document.createElement('div');
    tamperedEl.style.cssText = 'margin-top: 1rem; padding: 1rem; background: rgba(239, 68, 68, 0.2); border: 1px solid var(--accent-red); border-radius: 8px; color: var(--accent-red); font-size: 0.875rem;';
    tamperedEl.innerHTML = `<strong>🚨 篡改檢測！</strong><br>原始訊息：${currentMessage}<br>篡改後：${tamperedMessage}<br>Hash 不匹配，簽名失效！`;
    
    if (verificationResult) {
        verificationResult.appendChild(tamperedEl);
    }
}

function resetWallet() {
    generateDemoKeys();
    document.getElementById('sign-message').value = '轉帳 1 BTC 給地址 1A2B3C4D';
    document.getElementById('tamper-message').value = '';
    document.getElementById('signature-result').textContent = '';
    document.getElementById('signature-result').style.color = '';
    document.getElementById('verification-result').innerHTML = '<span class="verify-status">等待簽名...</span>';
    walletSignature = null;
    currentMessage = '';
}

// ==========================================
// 第八章：加密貨幣
// ==========================================

function expandCrypto(crypto) {
    // 滾動到頂部顯示詳細信息
    const cryptoSection = document.getElementById('crypto');
    if (cryptoSection) {
        cryptoSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // 根據不同加密貨幣顯示更多信息（這裡可以擴展為 Modal 或詳細頁面）
    let message = '';
    switch(crypto) {
        case 'btc':
            message = '比特幣是第一個區塊鏈應用，由中本聰於 2009 年創建。它採用 PoW 共識機制，SHA-256 挖礦演算法，最大供應量 2100 萬枚。';
            break;
        case 'eth':
            message = '以太坊由 Vitalik Buterin 於 2015 年創建，是第一個支援智慧合約的區塊鏈平台。ETH 2.0 已轉型為 PoS 共識，大幅降低能源消耗。';
            break;
        case 'sol':
            message = 'Solana 由 Anatoly Yakovenko 於 2020 年創建，採用 PoH（歷史證明）+ PoS 混合共識，理論 TPS 可達 65,000，交易費用極低。';
            break;
        case 'ada':
            message = 'Cardano 由 Charles Hoskinson 於 2017 年創建，以學術研究為基礎，採用 Haskell 語言開發，強調形式化驗證與嚴格的同行評議。';
            break;
    }
    
    alert(message);
}

// ==========================================
// 全域控制函數
// ==========================================

function nextStep(currentSection) {
    const sections = ['intro', 'block-structure', 'hash', 'chain', 'pow', 'consensus', 'wallet', 'crypto', 'complete'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (currentIndex >= 0 && currentIndex < sections.length - 1) {
        scrollToSection(sections[currentIndex + 1]);
    } else if (currentSection === 'crypto') {
        scrollToSection('complete');
    }
}

function restartCourse() {
    // 重置所有狀態
    resetBlock();
    resetHash();
    resetChain();
    resetPow();
    resetConsensus();
    resetWallet();
    
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// ==========================================
// 頁面載入完成
// ==========================================

console.log('區塊鏈互動課程已載入完成');
