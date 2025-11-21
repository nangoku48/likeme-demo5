const translations = {
  ja: {
    // トップページ
    hero_title: "LIKE が<br>価値に変わる。",
    hero_sub: "写真を投稿して稼ぐ、投票して稼ぐ。<br>クリエイターもファンも報酬がもらえる<br>次世代のソーシャルリワードプラットフォーム。",
    btn_connect: "⚡ ウォレット接続して始める",
    btn_logout: "ログアウト",
    link_demo: "デモ画面を見る →",
    link_features: "機能詳細 →",
    wallet_status: "未接続",
    // プロフィール
    my_posts: "My Posts",
    vote_now: "VOTE NOW",
    back_home: "← Back to Home",
    // カメラ販売所
    shop_title: "Genesis Collection",
    shop_desc: "限定30台。初期モデルのカメラNFTを手に入れよう。",
    shop_buy: "Buy Now",
    shop_sold: "🚫 SOLD OUT"
  },
  en: {
    // Top Page
    hero_title: "Turn LIKES<br>into Value.",
    hero_sub: "Post to earn, Vote to earn.<br>A next-gen social reward platform where both creators and fans get rewarded.",
    btn_connect: "⚡ Connect Wallet",
    btn_logout: "Log Out",
    link_demo: "View Demo →",
    link_features: "Features →",
    wallet_status: "Not Connected",
    // Profile
    my_posts: "My Posts",
    vote_now: "VOTE NOW",
    back_home: "← Back to Home",
    // Camera Shop
    shop_title: "Genesis Collection",
    shop_desc: "Limited 30 units. Get the first model camera NFT.",
    shop_buy: "Buy Now",
    shop_sold: "🚫 SOLD OUT"
  }
};

function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  const t = translations[lang];

  // テキストの書き換え（IDが一致する要素があれば書き換える）
  if(document.getElementById('heroTitle')) document.getElementById('heroTitle').innerHTML = t.hero_title;
  if(document.getElementById('heroSub')) document.getElementById('heroSub').innerHTML = t.hero_sub;
  if(document.getElementById('connectBtn')) document.getElementById('connectBtn').textContent = t.btn_connect;
  if(document.getElementById('logoutBtn')) document.getElementById('logoutBtn').textContent = t.btn_logout;
  if(document.getElementById('demoLink')) document.getElementById('demoLink').textContent = t.link_demo;
  if(document.getElementById('moreLink')) document.getElementById('moreLink').textContent = t.link_features;
  
  // ボタンの見た目切り替え
  document.getElementById('lang-jp').style.opacity = lang === 'ja' ? '1' : '0.5';
  document.getElementById('lang-en').style.opacity = lang === 'en' ? '1' : '0.5';
}

document.addEventListener('DOMContentLoaded', () => {
  // 言語スイッチのHTMLをヘッダーに挿入
  const header = document.querySelector('header');
  if(header) {
    const div = document.createElement('div');
    div.className = 'lang-switch';
    div.style.cssText = "position:absolute; top:20px; right:20px; z-index:1000; font-weight:bold; cursor:pointer; background:rgba(0,0,0,0.5); padding:5px 10px; border-radius:20px;";
    div.innerHTML = `
      <span id="lang-jp" onclick="setLanguage('ja')">JP</span> / 
      <span id="lang-en" onclick="setLanguage('en')">EN</span>
    `;
    header.appendChild(div);
  }

  // 初期設定（保存された言語 or 日本語）
  const savedLang = localStorage.getItem('lang') || 'ja';
  setLanguage(savedLang);
});