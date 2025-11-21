// script.js
const XUMM_API_KEY = 'bedbb175-1ab7-4fc8-a321-08d00ad4a1a5';

// ★あなたのアドレス（Voteを受け取る用）
const MY_ADDRESS = "r4t7MbqVYAPDN9nshQ8MyswsfHjCZrVwbJ"; 

let xumm = null;
let currentAccount = null;

// サンプル写真データ（12枚）
const myPosts = [
    { id: 1, title: "Summer Trip", votes: 1250, img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=400" },
    { id: 2, title: "Delicious Lunch", votes: 890, img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=400" },
    { id: 3, title: "My Cat", votes: 540, img: "https://images.unsplash.com/photo-1542042161-d19577987127?q=80&w=400" },
    { id: 4, title: "City Night View", votes: 320, img: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=400" },
    { id: 5, title: "Morning Coffee", votes: 210, img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400" },
    { id: 6, title: "Workout Done!", votes: 180, img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400" },
    // 残り6枚はダミーで埋めます
    ...Array.from({ length: 6 }, (_, i) => ({
        id: i + 7, title: `Post #${i + 7}`, votes: Math.floor(Math.random() * 100),
        img: `https://picsum.photos/400/400?random=${i}`
    }))
];

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof Xumm !== 'undefined') {
        xumm = new Xumm(XUMM_API_KEY);
        checkLogin();
    }
    renderPosts();

    const logoutBtn = document.getElementById('logoutBtn');
    const connectBtn = document.getElementById('connectBtn'); // index.html用

    if(logoutBtn) logoutBtn.addEventListener('click', disconnect);
    
    // トップページ用の接続処理
    if(connectBtn) {
        connectBtn.addEventListener('click', async () => {
            try {
                const result = await xumm.authorize();
                if (result && result.me) {
                    window.location.href = `index.html?account=${result.me.account}`;
                }
            } catch(e) { console.error(e); }
        });
    }
});

// 写真グリッドの描画
function renderPosts() {
    const grid = document.querySelector('.nft-grid');
    if (!grid) return;
    grid.innerHTML = "";

    myPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div class="nft-img-wrapper">
                <img src="${post.img}" alt="${post.title}">
                <div class="badge-votes">❤️ ${post.votes}</div>
            </div>
            <div class="nft-info">
                <div class="nft-title">${post.title}</div>
                <button class="btn-vote" onclick="votePost(${post.id})">VOTE NOW</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Vote処理
window.votePost = async function(id) {
    if (!currentAccount) return alert("まずはトップページからログインしてください！");
    if (!confirm(`Post #${id} に投票（0.001 XRP送付）しますか？`)) return;

    try {
        const payload = {
            TransactionType: "Payment",
            Destination: MY_ADDRESS, // 自分宛て（エラー回避）
            Amount: "1000", // 0.001 XRP
            DestinationTag: 8888
        };

        const created = await xumm.payload.create({ txjson: payload });
        if (created) {
            xumm.xapp.openSignRequest(created);
            const sub = await xumm.payload.subscribe(created.uuid, (event) => {
                if (typeof event.data.signed !== 'undefined') return event.data;
            });
            
            if (sub.signed) {
                alert("投票完了！🎉");
            } else {
                alert("キャンセルされました");
            }
        }
    } catch(e) {
        console.error(e);
        alert("エラーが発生しました");
    }
};

// ログイン周り
async function checkLogin() {
    const params = new URLSearchParams(window.location.search);
    let account = params.get("account");
    
    if(!account) {
        try {
            const state = await xumm.user.account;
            if (state) account = state;
        } catch (e) {}
    }

    if (account) onLogin(account);
}

async function disconnect() {
    await xumm.logout();
    window.location.href = "index.html";
}

function onLogin(account) {
    currentAccount = account;
    const logoutBtn = document.getElementById('logoutBtn');
    const connectBtn = document.getElementById('connectBtn');
    const status = document.getElementById('walletStatus'); // index用
    const connectedAddress = document.getElementById('connectedAddress'); // index用

    if(logoutBtn) logoutBtn.style.display = 'block';
    if(connectBtn) connectBtn.style.display = 'none';
    
    if(status) {
        status.style.display = 'block';
        status.textContent = account.slice(0,4) + '...' + account.slice(-4);
    }
    if(connectedAddress) {
        connectedAddress.textContent = account.slice(0,4) + '...' + account.slice(-4);
    }
    
    // リンク引継ぎ
    document.querySelectorAll('a').forEach(link => {
        if(!link.href.includes('account=') && link.href.includes('.html')) {
             link.href += (link.href.includes('?') ? '&' : '?') + `account=${account}`;
        }
    });
}