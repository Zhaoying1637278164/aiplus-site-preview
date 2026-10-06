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
ASSET_COMPONENT = components.declare_component("aiplus_tool_assets", path=ROOT / "static")
import json
REGISTRY = json.loads((ROOT / "site/registry.json").read_text(encoding="utf-8"))
TOOLS = {r["id"]: r for r in REGISTRY}
selected = st.query_params.get("tool", "")
entry = TOOLS.get(selected)
document = (ROOT / "site/index.html").read_text(encoding="utf-8")
asset_prefix = json.dumps("component/" + ASSET_COMPONENT.name + "/tools/").replace("<", "\\u003c")
document = document.replace("<script>window.__AIPlusRegistry", "<script>window.__AIPlusAssetPrefix=" + asset_prefix + ";</script><script>window.__AIPlusRegistry", 1)
if entry:
    initial = json.dumps(entry["workspaceRoute"]).replace("<", "\\u003c")
    document = document.replace("<script>window.__AIPlusRegistry", "<script>window.__AIPlusInitialRoute=" + initial + ";</script><script>window.__AIPlusRegistry", 1)
elif selected:
    st.info("该工具尚未开放，请从工具库选择已交付的工具。")
components.html(document, height=900, scrolling=True)
