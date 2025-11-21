// mint-script.js
const xrpl = require("xrpl");

// NFTの設定
const NFT_COUNT = 30; // 作りたい数
const NFT_NAME_PREFIX = "Starter Camera Gen1 #"; // 名前
const IMAGE_URL = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"; // 画像URL

async function main() {
  // 1. テストネットに接続
  console.log("🌐 テストネットに接続中...");
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  // 2. 新しいウォレットを作って入金（全自動）
  console.log("💰 お店用の新しいウォレットを作成＆入金中...");
  // fundWalletは、ウォレット作成とFaucetからの入金を同時にやってくれる便利な機能です
  const { wallet } = await client.fundWallet();
  
  console.log("\n========================================");
  console.log("🎉 お店用ウォレットが完成しました！");
  console.log("アドレス: " + wallet.address);
  console.log("シークレット(鍵): " + wallet.seed); // ★これはメモしておくと良いです
  console.log("========================================\n");

  console.log(`🚀 今から ${NFT_COUNT} 個のNFTを発行します...（少々時間がかかります）`);

  // 3. 30回ループして発行
  for (let i = 1; i <= NFT_COUNT; i++) {
    const nftName = `${NFT_NAME_PREFIX}${String(i).padStart(3, '0')}`; // 例: #001
    
    // URI（NFTの中身のデータ）を16進数に変換
    // 本来はIPFSのハッシュなどを入れますが、今回は簡易的に画像URLを入れます
    const uri = xrpl.convertStringToHex(IMAGE_URL);

    const transactionBlob = {
      TransactionType: "NFTokenMint",
      Account: wallet.address,
      URI: uri,
      Flags: 8, // 8 = Transferable (転送・売買可能にする)
      NFTokenTaxon: 0 // カテゴリIDのようなもの
    };

    try {
      // 署名して送信
      const tx = await client.submitAndWait(transactionBlob, { wallet: wallet });
      
      if (tx.result.meta.TransactionResult === "tesSUCCESS") {
        process.stdout.write("✅"); // 成功したらチェックマークを表示
      } else {
        process.stdout.write("❌");
      }
    } catch (e) {
      console.error(`\nエラー (${i}個目):`, e);
    }
  }

  console.log("\n\n✨ 完了しました！");
  console.log(`以下のURLで、発行されたNFTを確認できます：`);
  console.log(`https://test.bithomp.com/nfts/${wallet.address}`);

  client.disconnect();
}

main();