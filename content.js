const siteName = [
	"2次方程式とは？順を追ってわかりやすく解説！",
	"日本の人口の推移 - よろづ統計Web",
	"【つまづきポイント】モルの攻略法 - 中高生の理科を徹底解説！",
	"夏目漱石について - 国語をこよなく愛しているとある人が、愛と熱意で書いているブログ",
	"仮定法の基本的な用法 - 英語大好きマンのブログ",
	"語呂合わせで覚える日本史〜江戸時代後期〜 - 歴史は任せろ！",
	"国別の失業率を比較〜新型コロナの影響は？〜 - HOT経済ニュース",
	"天気図の読み方〜高気圧・低気圧・等圧線・前線をわかりやすく〜 - 中高生の理科を徹底解説！",
	"作業効率爆上がり！厳選ショートカットキー10選",
	"「分かれば楽しい」オブジェクト指向を初心者向けに解説！【Java】",
	"Scratch が初心者におすすめな理由！ごめんなさい、私もなめていました。",
	"【最新】国別GDPランキング - HOT経済ニュース",
	"新入社員のNG行動5選。これだけは絶対にやるな！ - ビジネスは任せろ！",
	"春の季語一覧 - オンライン歳時記",
	"語呂合わせで覚える日本史〜鎌倉時代〜 - 歴史は任せろ！",
	"夏の季語一覧 - オンライン歳時記",
	"秋の季語一覧 - オンライン歳時記",
	"語呂合わせで覚える日本史〜江戸時代中期〜 - 歴史は任せろ！",
	"冬の季語一覧 - オンライン歳時記",
	"新年の季語一覧 - オンライン歳時記",
	"説得力のあるプレゼンテーションのコツ！ - ビジネスは任せろ！",
	"現在完了形と過去形の違いを解説！ - 英語大好きマンのブログ",
	"細胞分裂を顕微鏡写真を交えて解説 - 中高生の理科を徹底解説！",
	"古代文学史 - 国語をこよなく愛しているとある人が、愛と熱意で書いているブログ",
	"周期表（元素記号・元素名を隠せる機能付き） - 中高生の理科を徹底解説！",
	"元素の周期律 - 中高生の理科を徹底解説！",
	"SDGsとは？今、日本が取り組むべき課題も解説 - HOT経済ニュース",
	"AI時代を生き抜く能力 - HOT経済ニュース",
	"HOME - オンライン歳時記",
	"語呂合わせで覚える日本史〜江戸時代初期〜 - 歴史は任せろ！",
	"中世文学史 - 国語をこよなく愛しているとある人が、愛と熱意で書いているブログ",
	"不規則変化動詞一覧 - 英語大好きマンのブログ",
	"まだパワポにＭＳゴシック使ってるの？時代遅れです。 - ビジネスは任せろ！",
	"目からウロコの5文型習得術 - 英語大好きマンのブログ",
	"語呂合わせで覚える日本史〜戦国時代〜 - 歴史は任せろ！",
	"近代文学史 - 国語をこよなく愛しているとある人が、愛と熱意で書いているブログ",
	"語呂合わせで覚える日本史〜縄文・弥生時代〜 - 歴史は任せろ！",
	"語呂合わせで覚える日本史〜明治時代〜 - 歴史は任せろ！",
	"同期と差をつけるために。すぐに実践できる10の習慣！ - ビジネスは任せろ！",
	"語呂合わせで覚える日本史〜大正時代〜 - 歴史は任せろ！",
	"読解力を上げる5つの習慣 - ビジネスは任せろ！",
	"語呂合わせで覚える日本史〜昭和・平成・令和〜 - 歴史は任せろ！",
	"【歴史】難読人名の覚え方！ - 歴史は任せろ！",
	"近世文学史 - 国語をこよなく愛しているとある人が、愛と熱意で書いているブログ",
	"語呂合わせで覚える日本史〜室町時代〜 - 歴史は任せろ！",
	"現代文学史 - 国語をこよなく愛しているとある人が、愛と熱意で書いているブログ",
	"今すぐ使える！英会話フレーズ10 - 英語大好きマンのブログ",
	"誰にも教えたくない、商談を絶対に成功させる秘訣 - ビジネスは任せろ！",
	"語呂合わせで覚える日本史〜平安時代〜 - 歴史は任せろ！",
	"超絶神コミュニケーション術！ - ビジネスは任せろ！"
];
let title;
chrome.storage.sync.get("accept", function (result) {

	if (result.accept) {
		chrome.storage.sync.get("enable", function (result2) {
			if (result2.enable) {
				title = siteName[getRandomInt()];
				document.title = title;
				deleteIcon();
				setNewIcon();
					const target = document.querySelector("head");
					const config = {
						subtree: true,
						characterData: true,
						childList: true
					};
					const observer = new MutationObserver(function (mutations) {
						observer.disconnect();
						document.title = title;
						deleteIcon();
						setNewIcon();
						observer.observe(target, config);
					});

					observer.observe(target, config);
				}
		});
	}

});

function getRandomInt() {
	min = Math.ceil(0);
	max = Math.floor(siteName.length);
	return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function setNewIcon() {
	let newIcon = document.createElement("link");
	newIcon.setAttribute("rel", "icon");
	newIcon.setAttribute("type", "image/png");
	newIcon.setAttribute("sizes", "32x32");
	let image = chrome.runtime.getURL("/favicon.png");
	newIcon.setAttribute("href", image);
	newIcon.classList = "newIcon";
	let parent = document.head;
	parent.appendChild(newIcon);
}
function deleteIcon() {
	let metaDiscre = document.head.children;
	let metaLength = metaDiscre.length;
	for (let i = 0; i < metaLength; i++) {
		if (metaDiscre[i]) {
			let proper = metaDiscre[i].getAttribute('rel');
			if (proper && proper.indexOf("icon") !== -1) {
				metaDiscre[i].setAttribute("href", chrome.runtime.getURL("/favicon.png"));
			}
		}
	}
}