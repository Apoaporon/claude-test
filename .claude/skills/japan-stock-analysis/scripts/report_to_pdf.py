#!/usr/bin/env python3
"""
日本株分析レポート PDF出力スクリプト（ReportLab Platypus 直接レンダリング版）

依存ライブラリ（初回のみ）:
    pip install markdown reportlab fonttools

使用方法:
    python report_to_pdf.py <input.md> [output.pdf]

例:
    python report_to_pdf.py reports/NTT_20260331.md
    python report_to_pdf.py reports/NTT_20260331.md reports/NTT_20260331.pdf
"""

import argparse
import os
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

# Windows端末でのUTF-8出力を強制
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding and sys.stderr.encoding.lower() != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

try:
    import markdown
except ImportError:
    print("❌ pip install markdown reportlab fonttools", file=sys.stderr)
    sys.exit(1)

try:
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Table, TableStyle,
        Spacer, HRFlowable,
    )
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib import colors
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    print("❌ pip install reportlab", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# フォント設定: TTC から TTF を抽出してキャッシュし ReportLab に登録
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).parent
FONT_DIR = SCRIPT_DIR / "fonts"
FONT_DIR.mkdir(exist_ok=True)

def _extract_ttf(ttc_path: str, out_path: Path, index: int = 0) -> bool:
    """TTC コレクションから指定インデックスのフォントを TTF として保存する。"""
    if out_path.exists():
        return True
    if not os.path.exists(ttc_path):
        return False
    try:
        from fontTools.ttLib import TTCollection
        tc = TTCollection(ttc_path)
        tc.fonts[index].save(str(out_path))
        return True
    except Exception:
        return False

# (normal_name, normal_ttc, normal_ttf, bold_name, bold_ttc, bold_ttf)
_CANDIDATES = [
    ("YuGothic",  "C:/Windows/Fonts/YuGothM.ttc", "YuGothic.ttf",
     "YuGothic-Bold", "C:/Windows/Fonts/YuGothB.ttc", "YuGothic-Bold.ttf"),
    ("Meiryo",    "C:/Windows/Fonts/meiryo.ttc",  "Meiryo.ttf",
     "Meiryo-Bold", "C:/Windows/Fonts/meiryob.ttc", "Meiryo-Bold.ttf"),
    ("MSGothic",  "C:/Windows/Fonts/msgothic.ttc", "MSGothic.ttf",
     None, None, None),
]

FONT_NAME = None
FONT_BOLD_NAME = None

for _nname, _nttc, _nttf, _bname, _bttc, _bttf in _CANDIDATES:
    if not os.path.exists(_nttc):
        continue
    _npath = FONT_DIR / _nttf
    if not _extract_ttf(_nttc, _npath):
        continue
    try:
        pdfmetrics.registerFont(TTFont(_nname, str(_npath)))
        FONT_NAME = _nname
        # Bold バリアントの登録を試みる
        if _bname and _bttc and _bttf:
            _bpath = FONT_DIR / _bttf
            if _extract_ttf(_bttc, _bpath):
                try:
                    pdfmetrics.registerFont(TTFont(_bname, str(_bpath)))
                    pdfmetrics.registerFontFamily(_nname, normal=_nname, bold=_bname)
                    FONT_BOLD_NAME = _bname
                except Exception:
                    pass
        break
    except Exception:
        continue

if FONT_NAME is None:
    from reportlab.pdfbase.cidfonts import UnicodeCIDFont
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
    FONT_NAME = "HeiseiKakuGo-W5"
    FONT_BOLD_NAME = "HeiseiKakuGo-W5"

if FONT_BOLD_NAME is None:
    FONT_BOLD_NAME = FONT_NAME

# ---------------------------------------------------------------------------
# 絵文字除去
# ---------------------------------------------------------------------------
_EMOJI_RE = re.compile(
    "["
    "\U0001F300-\U0001F9FF"
    "\U00002702-\U000027B0"
    "\U000026A0"
    "\U00002705"
    "\U00002696"
    "\U0000FE00-\U0000FE0F"
    "]+",
    flags=re.UNICODE,
)

def strip_emoji(text: str) -> str:
    return _EMOJI_RE.sub("", text)

# ---------------------------------------------------------------------------
# スタイル定義
# ---------------------------------------------------------------------------
_LEFT_M = 18 * mm
_RIGHT_M = 18 * mm
_CONTENT_W = A4[0] - _LEFT_M - _RIGHT_M

def _s(name: str, **kw) -> ParagraphStyle:
    return ParagraphStyle(name, fontName=FONT_NAME, **kw)

S_H1    = _s("h1",    fontSize=17, leading=22, spaceAfter=4,  textColor=colors.HexColor("#1a1a2e"))
S_H2    = _s("h2",    fontSize=13, leading=18, spaceBefore=2, spaceAfter=2, textColor=colors.HexColor("#16213e"))
S_H3    = _s("h3",    fontSize=11, leading=17, spaceBefore=8, spaceAfter=4, textColor=colors.HexColor("#333333"))
S_BODY  = _s("body",  fontSize=11, leading=20, spaceAfter=6,  textColor=colors.HexColor("#2c2c2c"))
S_QUOTE = _s("quote", fontSize=10, leading=18, spaceAfter=0,  textColor=colors.HexColor("#555555"))
S_TH    = ParagraphStyle("th",    fontName=FONT_BOLD_NAME, fontSize=9,  leading=13, textColor=colors.white)
S_TD    = _s("td",    fontSize=9,  leading=13, textColor=colors.HexColor("#2c2c2c"))
S_LI    = _s("li",    fontSize=11, leading=19, spaceAfter=2,  textColor=colors.HexColor("#2c2c2c"), leftIndent=12)

_COL_RATIOS: dict[int, list[float]] = {
    4: [0.20, 0.20, 0.20, 0.40],
    3: [0.28, 0.28, 0.44],
    2: [0.35, 0.65],
}

# ---------------------------------------------------------------------------
# XML エスケープ（ReportLab Paragraph 用）
# ---------------------------------------------------------------------------
def _esc(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

# ---------------------------------------------------------------------------
# HTML → Platypus フローアブル パーサ
# ---------------------------------------------------------------------------
class _HTMLToFlowables(HTMLParser):
    """markdown.Markdown() の出力 HTML を ReportLab Platypus flowables に変換する。"""

    def __init__(self) -> None:
        super().__init__()
        self._flowables: list = []
        self._buf: list[str] = []       # 現在のインラインテキストバッファ
        self._context: str | None = None  # 現在のブロック要素
        self._in_blockquote = False

        # テーブル
        self._in_table = False
        self._table_rows: list[list] = []
        self._col_types: list[list[str]] = []
        self._cur_row: list = []
        self._cur_row_types: list[str] = []

        # リスト
        self._list_type: str | None = None
        self._list_items: list[str] = []

    # --- 内部ユーティリティ ---

    def _buf_text(self) -> str:
        return "".join(self._buf).strip()

    def _flush_buf_as(self, style: ParagraphStyle) -> Paragraph | None:
        text = self._buf_text()
        self._buf = []
        self._context = None
        if not text:
            return None
        return Paragraph(text, style)

    def _add(self, *items) -> None:
        for item in items:
            if item is not None:
                self._flowables.append(item)

    # --- HTML イベントハンドラ ---

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()

        # ブロックquote の内部: インライン要素だけ処理
        if self._in_blockquote:
            if tag in ("strong", "b"):
                self._buf.append("<b>")
            elif tag in ("em", "i"):
                self._buf.append("<i>")
            elif tag == "br":
                self._buf.append("<br/>")
            return

        if tag in ("h1", "h2", "h3", "p"):
            self._context = tag
            self._buf = []
        elif tag == "blockquote":
            self._in_blockquote = True
            self._buf = []
        elif tag == "table":
            self._in_table = True
            self._table_rows = []
            self._col_types = []
        elif tag == "tr":
            self._cur_row = []
            self._cur_row_types = []
        elif tag in ("th", "td"):
            self._context = tag
            self._buf = []
        elif tag in ("ul", "ol"):
            self._list_type = tag
            self._list_items = []
        elif tag == "li":
            self._context = "li"
            self._buf = []
        elif tag in ("strong", "b"):
            self._buf.append("<b>")
        elif tag in ("em", "i"):
            self._buf.append("<i>")
        elif tag == "hr":
            self._add(HRFlowable(
                width="100%", thickness=0.5,
                color=colors.HexColor("#dddddd"),
                spaceBefore=10, spaceAfter=10,
            ))
        elif tag == "br":
            self._buf.append("<br/>")

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()

        # ブロックquote の内部: インライン要素だけ処理（blockquote 自体は通す）
        if self._in_blockquote and tag != "blockquote":
            if tag in ("strong", "b"):
                self._buf.append("</b>")
            elif tag in ("em", "i"):
                self._buf.append("</i>")
            return

        if tag == "h1":
            text = self._buf_text()
            self._buf = []
            self._context = None
            if text:
                self._add(Paragraph(text, S_H1))
                self._add(HRFlowable(
                    width="100%", thickness=1.5,
                    color=colors.HexColor("#1a1a2e"),
                    spaceBefore=2, spaceAfter=8,
                ))
        elif tag == "h2":
            text = self._buf_text()
            self._buf = []
            self._context = None
            if text:
                inner = Paragraph(text, S_H2)
                t = Table([[inner]], colWidths=[_CONTENT_W])
                t.setStyle(TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#f0f4f8")),
                    ("LEFTPADDING",   (0, 0), (0, -1), 10),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                    ("TOPPADDING",    (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("LINEBEFORE",    (0, 0), (0, -1), 5, colors.HexColor("#0f3460")),
                ]))
                self._add(Spacer(1, 8), t, Spacer(1, 4))
        elif tag == "h3":
            para = self._flush_buf_as(S_H3)
            self._add(para)
        elif tag == "p":
            if self._context == "p":
                para = self._flush_buf_as(S_BODY)
                self._add(para)
            # blockquote > p の </p> は blockquote が処理するため無視
        elif tag == "blockquote":
            text = self._buf_text()
            self._buf = []
            self._in_blockquote = False
            self._context = None
            if text:
                inner = Paragraph(text, S_QUOTE)
                t = Table([[inner]], colWidths=[_CONTENT_W])
                t.setStyle(TableStyle([
                    ("BACKGROUND",    (0, 0), (-1, -1), colors.HexColor("#f8f9fc")),
                    ("LEFTPADDING",   (0, 0), (0, -1), 14),
                    ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
                    ("TOPPADDING",    (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LINEBEFORE",    (0, 0), (0, -1), 3, colors.HexColor("#4a90d9")),
                ]))
                self._add(t, Spacer(1, 6))
        elif tag in ("th", "td"):
            text = self._buf_text()
            self._buf = []
            style = S_TH if tag == "th" else S_TD
            self._cur_row.append(Paragraph(text or " ", style))
            self._cur_row_types.append(tag)
            self._context = None
        elif tag == "tr":
            if self._cur_row:
                self._table_rows.append(list(self._cur_row))
                self._col_types.append(list(self._cur_row_types))
            self._cur_row = []
            self._cur_row_types = []
        elif tag == "table":
            self._in_table = False
            if self._table_rows:
                self._add(self._build_table(), Spacer(1, 6))
            self._table_rows = []
            self._col_types = []
        elif tag == "li":
            text = self._buf_text()
            self._buf = []
            self._context = None
            if text:
                self._list_items.append(text)
        elif tag in ("ul", "ol"):
            ordered = (tag == "ol")
            for i, item in enumerate(self._list_items):
                bullet = f"{i + 1}." if ordered else "\u2022"
                self._add(Paragraph(f"{bullet}&nbsp; {item}", S_LI))
            if self._list_items:
                self._add(Spacer(1, 4))
            self._list_items = []
            self._list_type = None
        elif tag in ("strong", "b"):
            self._buf.append("</b>")
        elif tag in ("em", "i"):
            self._buf.append("</i>")

    def handle_data(self, data: str) -> None:
        self._buf.append(_esc(data))

    # --- テーブル構築 ---

    def _build_table(self) -> Table:
        n = max(len(r) for r in self._table_rows)
        ratios = _COL_RATIOS.get(n, [1 / n] * n)
        col_w = [_CONTENT_W * r for r in ratios]

        # 列数が足りない行をパディング
        rows = [
            row + [Paragraph(" ", S_TD)] * (n - len(row))
            for row in self._table_rows
        ]

        tbl = Table(rows, colWidths=col_w, repeatRows=1)

        cmds = [
            ("GRID",          (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING",   (0, 0), (-1, -1), 8),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ]
        for ri, types in enumerate(self._col_types):
            if any(t == "th" for t in types):
                cmds.append(("BACKGROUND", (0, ri), (-1, ri), colors.HexColor("#1a1a2e")))
            elif ri % 2 == 0 and ri > 0:
                cmds.append(("BACKGROUND", (0, ri), (-1, ri), colors.HexColor("#f6f8fa")))

        tbl.setStyle(TableStyle(cmds))
        return tbl


# ---------------------------------------------------------------------------
# メイン変換
# ---------------------------------------------------------------------------
def convert(input_path: str, output_path: str | None = None) -> str:
    src = Path(input_path)
    if not src.exists():
        raise FileNotFoundError(f"入力ファイルが見つかりません: {input_path}")

    dest = Path(output_path) if output_path else src.with_suffix(".pdf")
    dest.parent.mkdir(parents=True, exist_ok=True)

    md_text = src.read_text(encoding="utf-8")
    md_text = strip_emoji(md_text)

    md_engine = markdown.Markdown(extensions=["tables", "fenced_code"])
    html = md_engine.convert(md_text)

    parser = _HTMLToFlowables()
    parser.feed(html)
    flowables = parser._flowables

    doc = SimpleDocTemplate(
        str(dest),
        pagesize=A4,
        leftMargin=_LEFT_M,
        rightMargin=_RIGHT_M,
        topMargin=22 * mm,
        bottomMargin=22 * mm,
    )
    doc.build(flowables)
    return str(dest)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="日本株分析レポート（Markdown）をPDFに変換します"
    )
    parser.add_argument("input",  help="入力Markdownファイルのパス")
    parser.add_argument("output", nargs="?", help="出力PDFファイルのパス（省略時は入力と同名の.pdf）")
    args = parser.parse_args()

    try:
        out = convert(args.input, args.output)
        print(f"✅ PDF出力完了: {out}")
    except Exception as e:
        print(f"❌ エラー: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
