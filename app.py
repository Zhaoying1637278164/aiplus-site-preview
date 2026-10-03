"""AI+ · 观策数智 官网预览 —— Streamlit 外壳

把 site/index.html（官网的可点击预览版）整页嵌入 Streamlit，并隐藏 Streamlit 自带的页头和边距，
让访客看到的就是官网本身。官网内容都在 site/index.html 里，本文件一般不需要改。
"""
from pathlib import Path
import base64
import streamlit.components.v1 as components

import streamlit as st

st.set_page_config(
    page_title="AI+ · 观策数智",
    page_icon="➕",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# 隐藏 Streamlit 的页头、工具栏、页边距，让嵌入的官网铺满整个窗口
st.html(
    """
<style>
  header[data-testid="stHeader"], [data-testid="stToolbar"], [data-testid="stDecoration"],
  [data-testid="stStatusWidget"], footer { display: none !important; }
  html, body, .stApp, [data-testid="stAppViewContainer"], [data-testid="stMain"] { background: #ffffff !important; }
  [data-testid="stMain"] { overflow: hidden !important; }
  [data-testid="stMainBlockContainer"], .block-container {
    padding: 0 !important; margin: 0 !important; max-width: 100% !important;
  }
  [data-testid="stVerticalBlock"] { gap: 0 !important; }
  [data-testid="stElementContainer"]:has(iframe) { width: 100% !important; }
  iframe { display: block; width: 100% !important; height: 100vh !important; height: 100dvh !important; border: 0 !important; }
</style>
"""
)

ROOT = Path(__file__).parent
# Only exact registered IDs can select a program. Never form a path from user input.
TOOLS = {'D02': ROOT / "site" / "tools" / 'D02' / '0.1.0', 'D06': ROOT / "site" / "tools" / 'D06' / '0.1.0'}
VERSIONS = {'D02': '0.1.0', 'D06': '0.1.0'}
selected = st.query_params.get("tool", "")
if selected in TOOLS:
    folder = TOOLS[selected]
    version = VERSIONS[selected]
    html = (folder / "index.html").read_text(encoding="utf-8")
    names = [f"{selected}-{version}-离线包.zip", f"{selected}-{version}-源码.zip", "虚构样例.xlsx", "空白模板.csv", "使用说明.md", "财务规则.md", "THIRD_PARTY_NOTICES.md"]
    links = []
    for name in names:
        payload = base64.b64encode((folder / name).read_bytes()).decode("ascii")
        links.append(f'<a download="{name}" href="data:application/octet-stream;base64,{payload}" style="margin:8px;display:inline-block">{name}</a>')
    toolbar = '<nav style="padding:16px;background:white"><a href="?" target="_blank" rel="noopener">返回官网</a>' + f'<strong style="margin:12px">{selected} · {version} 下载</strong>' + "".join(links) + '</nav>'
    html = html.replace('<div id="root">', toolbar + '<div id="root">', 1)
    components.html(html, height=900, scrolling=True)
else:
    if selected:
        st.warning("该工具尚未开放，返回官网查看交付状态。")
    components.html((ROOT / "site" / "index.html").read_text(encoding="utf-8"), height=900, scrolling=True)
