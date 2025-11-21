// app.js

const XUMM_API_KEY = 'bedbb175-1ab7-4fc8-a321-08d00ad4a1a5';

// ★お店の在庫用ウォレット（ここに売上が入ります）
const SHOP_ADDRESS = "rwFxhAeoxxP3Ct1rTvSsvp95D3NwgNo5K5";

let xumm = null;
let currentAccount = null;

// 30個の商品データを自動生成
const nftCollection = [];
for (let i = 1; i <= 30; i++) {
    nftCollection.push({
        id: i,
        name: `Starter Camera #${String(i).padStart(3, '0')}`,
        price: 10, // 10 XRP
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80"
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Xumm !== 'undefined') {
        xumm = new Xumm(XUMM_API_KEY);
        checkLogin();
    }

    renderGrid();

    const connectBtn = document.getElementById('connectBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    if(connectBtn) connectBtn.addEventListener('click', connect);
    if(logoutBtn) logoutBtn.addEventListener('click', disconnect);
});

// --- 商品一覧の描画 ---
function renderGrid() {
    const grid = document.getElementById('nftGrid');
    if (!grid) return;
    
    grid.innerHTML = "";

    nftCollection.forEach(item => {
        const card = document.createElement('div');
        card.className = 'nft-card';
        
        // ★売り切れチェック（ブラウザの記憶を見る）
        const isSold = localStorage.getItem(`sold_${item.id}`);
        
        // ボタンのデザイン切り替え
        let btnHtml = "";
        if (isSold) {
            // 売り切れ時
            btnHtml = `<button class="btn-buy" disabled style="background:#333; color:#888; cursor:not-allowed; border:1px solid #555;">🚫 SOLD OUT</button>`;
        } else {
            // 販売中
            btnHtml = `<button id="btn_${item.id}" class="btn-buy" onclick="buyNft(${item.id})">Buy Now</button>`;
        }

        card.innerHTML = `
            <div class="nft-img-wrapper" style="${isSold ? 'opacity:0.5;' : ''}">
                <img src="${item.image}" alt="${item.name}">
                <div class="badge-id">#${item.id}</div>
            </div>
            <div class="nft-info">
                <div class="nft-title">${item.name}</div>
                <div class="nft-price">${item.price} XRP</div>
                ${btnHtml}
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- 購入処理（ここを直しました！） ---
window.buyNft = async function(id) {
    if (!currentAccount) return alert("まずはウォレットを接続してください！");

    const item = nftCollection.find(p => p.id === id);
    if (!confirm(`${item.name} を ${item.price} XRP で購入しますか？`)) return;

    const btn = document.getElementById(`btn_${id}`);
    if(btn) {
        btn.textContent = "Processing..."; // 英語でかっこよく
        btn.disabled = true;
    }

    try {
        // 支払いデータ作成
        const payloadData = {
            TransactionType: "Payment",
            Destination: SHOP_ADDRESS,
            Amount: (item.price * 1000000).toString(), // XRP -> drops
            DestinationTag: 2025
        };

        // Xamanに送信
        const created = await xumm.payload.create({ txjson: payloadData });

        if (created) {
            // ★修正点: PCでのエラー原因を取り除きました
            // 自動で通知が行くので、ここでは待つだけでOKです
            console.log("署名リクエスト送信済み:", created.uuid);

            // 署名完了を監視
            const subscription = await xumm.payload.subscribe(created.uuid, (event) => {
                if (typeof event.data.signed !== 'undefined') return event.data;
            });

            if (subscription.signed) {
                alert(`🎉 SUCCESS!\n\n${item.name} の購入が完了しました。`);
                
                // ★ここで「売り切れ」をブラウザに記憶させる
                localStorage.setItem(`sold_${id}`, "true");
                
                // 画面を再描画（SOLD OUTにする）
                renderGrid();
            } else {
                alert("Transaction Canceled");
                if(btn) {
                    btn.textContent = "Buy Now";
                    btn.disabled = false;
                }
            }
        }
    } catch (e) {
        console.error(e);
        alert("Error: " + e.message);
        if(btn) {
            btn.textContent = "Buy Now";
            btn.disabled = false;
        }
    }
};

// --- ログイン周り ---
async function connect() {
    try {
        const result = await xumm.authorize();
        if (result && result.me) onLogin(result.me.account);
    } catch (e) { console.error(e); }
}

async function checkLogin() {
    try {
        const account = await xumm.user.account;
        if (account) onLogin(account);
    } catch (e) {}
}

async function disconnect() {
    await xumm.logout();
    location.reload();
}

function onLogin(account) {
    currentAccount = account;
    const connectBtn = document.getElementById('connectBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const status = document.getElementById('walletStatus');

    if(connectBtn) connectBtn.style.display = 'none';
    if(logoutBtn) logoutBtn.style.display = 'block';
    
    if(status) {
        status.style.display = 'block';
        status.textContent = account.slice(0,4) + '...' + account.slice(-4);
    }
}