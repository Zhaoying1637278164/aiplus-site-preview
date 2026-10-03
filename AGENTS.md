# 给代码助手（Codex 等）的发布说明

目标：把本仓库发布到 Streamlit Community Cloud，得到一个公开网址。

## 项目性质

- 这是一个**静态展示站点**：`site/index.html` 是完整的单页网站（内含全部 CSS、JS 和字体），`app.py` 用 `st.iframe(Path)` 把它整页嵌入，并用 CSS 隐藏 Streamlit 页头和边距。
- **不要修改 `site/index.html` 的内容和样式**，除非用户明确要求。它由另一套 Node.js 网站（aiplus-site）导出。
- 页面内导航使用自定义路由（`go()` 函数），不读写 URL hash。原因：`st.iframe` 以 srcdoc 嵌入，`<a href="#x">` 会按父页面 URL 解析，导致整页跳转。不要改回 hash 路由。

## 本地验证

```bash
pip install -r requirements.txt
streamlit run app.py
```

打开 http://localhost:8501 ，应看到官网首页铺满窗口、没有 Streamlit 自带的页头。点击「浏览 76 个工具」进入工具库，左侧模块筛选可用。

## 发布步骤

1. 创建 GitHub 公开仓库（建议名 `aiplus-site-preview`），把本目录全部文件推送到 `main` 分支根目录。
2. 在 https://share.streamlit.io/ 用 GitHub 账号登录（这一步需要用户本人在网页上操作）：
   Create app → Deploy a public app from GitHub → Repository 选该仓库，Branch `main`，Main file path `app.py`
   → Advanced settings 里 Python version 选 3.12 → Deploy。
3. 部署完成后，把 `https://<自定义前缀>.streamlit.app` 告诉用户。

## 注意

- `requirements.txt` 固定为 `streamlit==1.65.0`；`st.iframe` 需要较新版本，已在该版本上实测通过（桌面 1440px、手机 390px，页面跳转、工具筛选、表单提交均正常）。
- 不需要任何密钥、数据库或环境变量。
