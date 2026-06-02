"""Build a management-ready PDF report from the dashboard's KPIs and charts.

Renders the Plotly figures to PNG (via kaleido) and lays them out in a clean
PDF (via fpdf2) so the dashboard can be emailed or printed for top management.
"""

import datetime as _dt
import io


def build_pdf_report(kpis: dict, figures: list, data_source: str = "") -> bytes:
    """Return PDF bytes containing the KPIs and chart images.

    Args:
        kpis: mapping of KPI label -> formatted value string.
        figures: list of (title, plotly_figure) tuples.
        data_source: short label describing where the data came from.
    """
    from fpdf import FPDF  # lazy import so the app runs without PDF deps

    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # --- Header ---
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "Sales Dashboard Report", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(110, 110, 110)
    generated = _dt.datetime.now().strftime("%d %b %Y, %H:%M")
    subtitle = f"Generated {generated}"
    if data_source:
        subtitle += f"  |  Source: {data_source}"
    pdf.cell(0, 7, subtitle, ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(4)

    # --- KPIs ---
    pdf.set_font("Helvetica", "B", 13)
    pdf.cell(0, 9, "Key Metrics", ln=True)
    pdf.set_font("Helvetica", "", 12)
    for label, value in kpis.items():
        pdf.cell(90, 8, f"{label}:", border=0)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, str(value), ln=True)
        pdf.set_font("Helvetica", "", 12)
    pdf.ln(4)

    # --- Charts ---
    for title, fig in figures:
        png = fig.to_image(format="png", width=1000, height=500, scale=2)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, title, ln=True)
        pdf.image(io.BytesIO(png), w=180)
        pdf.ln(4)

    out = pdf.output(dest="S")
    # fpdf2 returns a bytearray; older fpdf returns str.
    return bytes(out) if isinstance(out, (bytes, bytearray)) else out.encode("latin-1")
