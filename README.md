# 柴田健一 ポートフォリオ

柴田健一（玉川大学 工学部 ソフトウェアサイエンス学科 講師）の個人ポートフォリオのソースです。
本番は GitHub Pages の `https://brightwaltz.github.io/portfolio/`（日本語）と `…/portfolio/en.html`（英語）です。
`main` に push すると GitHub Pages が自動でビルドして公開します。

このリポジトリは Claude Code（Anthropic）を使って作っています。

## このサイトの役割

- **柴田本人の窓口**です。研究・社会実装・音楽・クラウドファンディングを 1 ページにまとめます。
- 研究の詳しい内容と学生の取り組みは[研究室のサイト](https://brightwaltz.github.io/shibakenlab/)、業績の全件は [researchmap](https://researchmap.jp/brightwaltz) に任せます。ページの主な行き先はこの 2 つです。
- 連絡は[個人サイトのお問い合わせ](https://brightwaltz.mystrikingly.com/#contact)で受け付けます。

## ファイルの置き場

```
portfolio/
├─ _data/
│  ├─ ja.yml            # 日本語ページの文言（ここを直す）
│  └─ en.yml            # 英語ページの文言（ja.yml と同じ形）
├─ _layouts/home.html   # ページの骨組み（両言語で共通）
├─ _includes/           # 矢印アイコン（Phosphor）と節の目印
├─ assets/
│  ├─ site.css          # 見た目のすべて
│  ├─ site.js           # 動きと操作（本文は足さない）
│  ├─ favicon.svg / apple-touch-icon.png
│  └─ og-ja.png / og-en.png   # SNS で共有されたときの画像（1200×630）
├─ images/kenichi_shibata.jpg
├─ index.html / en.html # 中身はほぼ空。レイアウトと言語を指定するだけ
├─ 404.html
└─ .claude/skills/site-design-ja/   # 見た目を直すときの決まり（下記）
```

## 文言を直す

`_data/ja.yml` と `_data/en.yml` を直します。両方の形をそろえてください。

- 社会実装の事例を足す：`practice.items` に 1 件足す（`kind`・`title`・`body`・`tags`、あれば `href` と `href_label`）
- 音楽の実績を足す：`music.areas` に足す。リンクは HTML の `<a>` をそのまま書けます
- 値に「: 」（コロンと空白）を含むときは、値全体を `"…"` で囲みます（YAML の決まり）
- 英語ページは `en.html`、日本語ページはトップ（`/`）です。URL は変えないでください（研究室のサイトなどからリンクされています）

本文はすべて静的な HTML として出力されます。研究室サイトの「AI に聞く」が、このページを AI に読ませる参照先にしているためです。JS で本文を差し込まないでください。

## 見た目を直す

`.claude/skills/site-design-ja/SKILL.md` に、色・書体・余白・角丸・動きの値と、元にしたスキル（[elayadesign/redesign-skill](https://github.com/elayadesign/redesign-skill)、[elayadesign/ai-design-skills](https://github.com/elayadesign/ai-design-skills)、ともに MIT）から読み替えた点が書いてあります。Claude Code でこのリポジトリを開いて「見た目を直して」と頼むと、このスキルが使われます。値は `assets/site.css` の冒頭の変数にまとめてあります。

## 手元で確かめる

GitHub Pages と同じ版の Jekyll で確かめられます（Ruby 2.7 以上と Bundler が必要）。

```bash
bundle install
bundle exec jekyll serve
# → http://127.0.0.1:4000/portfolio/
```

直したら、デスクトップ（1440×900）とスマホ（390×844）の両方で表示を見てください。

## OG 画像を作り直す

名前や肩書きが変わったら `assets/og-ja.png`・`assets/og-en.png` も作り直します。Claude Code に「OG 画像を作り直して」と頼んでください（1200×630、ページと同じ書体・色）。
