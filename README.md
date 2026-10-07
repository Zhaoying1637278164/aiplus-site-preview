# AI+ · 观策数智 官网预览（Streamlit 版）

把 AI+ 官网的可点击预览版放到 Streamlit Community Cloud（https://share.streamlit.io/）上，生成一个网址，发给朋友就能打开浏览。

## 这个版本能做什么

- 浏览全部页面：首页、工具库（可筛选、搜索）、已上线工具详情、方法课、用户故事、提需求、理念与关于、后台界面预览
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

## 工具分类与计数

网站分类来源为 `site/catalog.json`；`site/registry.json` 仅登记实际工具程序与下载版本。所有展示计数只统计状态为「已上线」的登记项。规划项独立展示且没有详情入口。

修改分类后执行：

```sh
python3 scripts/build_catalog.py
python3 scripts/check_catalog.py
python3 scripts/test_catalog.py
```

构建脚本把登记数据与展示代码内嵌到官网，离线展示不依赖外部请求。规划编号采用模块前缀加 `-P` 与顺序号，不代表已交付工具编号。

## 场景路径与快速指引

首页和工具库提供月结、经营分析、资金预测三条操作路径。每个步骤写明准备资料、关键口径、复核重点、导出成果和下一步衔接；全部已上线工具的详情页提供快速使用指引。工具名称与链接始终来自 `site/catalog.json`，不增加产品登记或改变分类计数。

`site/workflows.json` 仅包含无业务数据的操作说明，`site/workflows-ui.js` 生成页面模板并通过既有路由打开工具。场景指引可主动下载为 Markdown；跨工具资料按下一款模板人工整理。没有跨工具自动传数、AI解释或企业系统连接。

修改指引后执行：

```sh
python3 scripts/build_catalog.py
python3 scripts/build_workflows.py
python3 scripts/check_catalog.py
python3 scripts/test_catalog.py
AIPLUS_PLAYWRIGHT_MODULE=/path/to/playwright node scripts/browser/check_workflows.cjs
```

浏览器验收支持 `AIPLUS_WORKFLOW_URL` 指定 Streamlit 官网，以及 `AIPLUS_WORKFLOW_EVIDENCE` 指定证据输出目录；未指定网址时验证本地 `file://` 页面。
