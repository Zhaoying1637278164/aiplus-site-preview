# AI+ · 观策数智 官网预览（Streamlit 版）

把 AI+ 官网的可点击预览版放到 Streamlit Community Cloud（https://share.streamlit.io/）上，生成一个网址，发给朋友就能打开浏览。

## 这个版本能做什么

- 浏览全部页面：首页、工具库（可筛选、搜索）、76 个工具详情、方法课、用户故事、提需求、理念与关于、后台界面预览
- 表单可以试填、试提交，**但提交的内容不会保存**（这是展示版；正式收集早鸟名单、需求、故事，需要把 aiplus-site 那套完整代码部署到服务器）
- 电脑和手机都能正常浏览

## 文件说明

```
app.py                  Streamlit 外壳：把 site/index.html 整页嵌入，隐藏 Streamlit 自带的页头和边距
site/index.html         官网预览本体（单个文件，字体已内嵌，不依赖外部网络资源）
requirements.txt        依赖：streamlit==1.65.0
.streamlit/config.toml  白色主题等基础设置
AGENTS.md               给 Codex 等代码助手看的发布说明
```

## 发布步骤

### 1. 上传到 GitHub

1. 登录 GitHub，新建一个仓库，例如 `aiplus-site-preview`，设为 **Public（公开）**。
2. 把本文件夹里的全部文件上传到仓库根目录。`app.py` 要在最外层，不要多套一层文件夹。

### 2. 在 Streamlit 上创建应用

1. 打开 https://share.streamlit.io/ ，用 GitHub 账号登录。
2. 点右上角 **Create app**，选择 **Deploy a public app from GitHub**。
3. 填写：
   - Repository：选择刚才的仓库，例如 `你的GitHub用户名/aiplus-site-preview`
   - Branch：`main`
   - Main file path：`app.py`
   - App URL（可选）：可以自定义网址前缀，例如 `aiplus-guance`，最终网址就是 `https://aiplus-guance.streamlit.app`
4. 展开 **Advanced settings**，Python version 选 **3.12**，保存。
5. 点 **Deploy**，等 1–3 分钟，页面出现官网首页就成功了。

### 3. 分享

把上面的网址发给朋友即可。

## 需要知道的几点

- **国内访问**：Streamlit 的服务器在美国，国内有些网络环境打开慢或打不开。发出去之前，先用手机流量试一次。
- **休眠**：一段时间没人访问会自动休眠。下一个人打开时会看到唤醒按钮，点一下等几十秒就恢复。
- **更新内容**：替换 `site/index.html` 后提交到 GitHub，Streamlit 会自动重新部署，网址不变。
- **顶部「预览版 · 内容为示例」标记和底部黑色提示条**：展示版专用，提醒访客内容为示例、提交不会保存。
- **浏览器后退键**：在嵌入的页面里跳转不会改变浏览器地址，后退键会直接离开网站。请用页面里的导航和「回到首页」。
