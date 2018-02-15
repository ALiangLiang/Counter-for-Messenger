# ![Logo](.github/assets/icon.png) Messenger 計數器

[<img src="https://img.shields.io/chrome-web-store/v/ldlagicdigidgnhniajpmoddkoakdoca.svg?label=Chrome%20Web%20Store"> ](https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/ldlagicdigidgnhniajpmoddkoakdoca.svg?label=Users)](https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/ldlagicdigidgnhniajpmoddkoakdoca.svg?label=Rating&colorB=dfb317)](https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca)

![示意圖](.github/assets/screenshot1.png)

統計你在 Messenger 中，與朋友們的訊息數量，並且排名！！
快來看看你與哪個朋友最麻吉唄！
想不想知道與好朋友聊了幾句？想回味與她聊天的點點滴滴嗎？
這時候這碗糕就派上用場了！！還不快安裝！？

[![從 Chrome Web Store 安裝](.github/assets/tryitnowbutton_small.png)](https://chrome.google.com/webstore/detail/ldlagicdigidgnhniajpmoddkoakdoca)

## 🔥 特色

- 💬 **統計**
  - 多少聊天室
  - 聊天室的訊息量
  - 聊天室的文字量
- 📊 將所有聊天室**排名**
- 💾 **下載**聊天紀錄

## 📄 使用
安裝完畢後，點擊 Chrome 右上角的 LOGO 圖示 <img width="20" alt="Logo" src=".github/assets/icon.png">，如果找不到，點擊右上角的「三顆點」按鈕，就可以找到了。  
![點logo](.github/assets/click_icon1.png)
![點隱藏的logo](.github/assets/click_icon2.png)

## 🔧 貢獻

如果你喜歡這個套件的話，又或是想要新的功能、修復 bug。  
歡迎 [PR](https://github.com/ALiangLiang/Counter-for-Messenger/compare) 或是[建立 issue](https://github.com/ALiangLiang/Counter-for-Messenger/issues/new)。  
閱讀[貢獻守則](.github/CONTRIBUTING.md)來瞭解更多資訊。

## 🌎 語言

- [English](README.md)
- 正體中文 (Traditional Chinese)

## 如何運作

簡單來說，就是開啟 Messenger 網頁版頁面，攔截它發出資訊，然後以這些資訊向 FB 請求我們所要的資訊 (訊息數)。

稍微技術點的講法，就是開啟 Messenger 頁面後，以 Chrome Extension 的 API「webRequest」
，攔截下我們要的 token 等資訊，然後再拿它們去向 FB 發 request，最後再丟到新的頁面，呈現給大家。

## 📣 聲明

- **這是非官方專案**  
- **不會收集使用者數據**
