# 莲話SandyTalk

手机端优先的粤语歌曲练习网页。首页可进入“回响·终章粤语合辑”，第一版收录林忆莲《没有你还是爱你》：整首歌词与逐字粤拼、点字听读音、原唱单句片段、粤语朗读、单句循环、歌名与歌词搜索、学习进度和最近练习记录。

设计和后续修改以手机端、类似 App 的使用体验为优先，先检查 320–390px 手机宽度，再检查更宽窗口。当前是静态网页工程，没有独立后端；歌曲与歌词在项目文件中，学习进度保存在当前浏览器，同一浏览器下次打开可继续使用，跨设备不会同步。

## 本地运行

需要 Node.js 20 或以上。

```bash
npm install
npm run dev
```

终端显示本地地址后，用浏览器打开。默认地址是 `http://localhost:5173/`。

## 检查构建

```bash
npm run build
npm run preview
```

`npm run build` 同时运行 TypeScript 检查并生成 `dist/`。`npm run preview` 可检查构建后的网页。直接刷新 `/collection`、`/search`、`/study?line=30`、`/profile` 也应能打开对应页面。

## 后续通过 GitHub 部署到 Vercel

工程保存在 GitHub 的 `codex/initial-site-upload` 分支，尚未发布到 Vercel。准备上线时：

1. 在仓库根目录运行 `npm run build`，确认完整工程可构建。代码放在 `sandy-cantonese/`，根目录的 `vercel.json` 负责调用它的安装和构建命令。
2. 在 Vercel 控制台连接该 GitHub 仓库，Root Directory 保持仓库根目录。根目录配置指定 Vite 构建及 `sandy-cantonese/dist` 输出目录，无需改动 Root Directory。
3. 由你在 Vercel 页面检查配置并手动完成首次部署。上线后检查首页、搜索结果、学习页和刷新后的深层链接。后续版本的部署触发方式，到准备上线时再确定。

后续改歌词、音频或样式时，由 AI 更新本地文件并检查；公开上线前确认歌曲音源和歌词的公开使用授权。


## 内容与文件

- 用户提供的原始歌词：`content/歌词原文.txt`。分句稿：`content/歌词分句.txt`。
- 页面使用的逐字粤拼数据：`src/data/lyrics.json`，由 `tools/generate-lyrics.py` 生成。
- 歌曲、场次日期和原唱单句播放时间：`src/data/song.ts`。
- 歌曲 MP3：`public/audio/song.mp3`。逐句和逐字粤语朗读：`public/audio/pronunciation/`。
- 歌曲封面：`public/images/song-cover.jpg`，对应 [Apple Music《没有你 还是爱你》原版条目](https://music.apple.com/hk/song/1773070138) 所属的《野花》专辑。创作署名也按该条目核对。
- 合辑海报：`public/images/resonance-poster.jpg`，来自用户提供的广州站海报；合辑信息在 `src/data/song.ts`，页面以方形视窗裁剪海报顶部和人物。
- 网页页面与交互：`src/App.tsx`。学习进度：`src/state.ts`。

歌曲、歌词和读音属于工程文件；用户的学习状态与最近文字记录保存在当前浏览器中。网页不录音，也不提供上传、编辑或发布歌曲的入口。原唱单句时间点已经配置，逐句边界仍需按这份 MP3 听辨核对。粤拼来自自动转换，正式扩充歌曲时应逐字校对多音字。
