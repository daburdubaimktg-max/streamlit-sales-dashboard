# @Email:  contact@pythonandvba.com
# @Website:  https://pythonandvba.com
# @YouTube:  https://youtube.com/c/CodingIsFun
# @Project:  Sales Dashboard w/ Streamlit



import pandas as pd
import plotly.express as px  # pip install plotly-express
import streamlit as st  # pip install streamlit

from data_loader import _config, load_from_upload, load_sales_data
from report import build_pdf_report

# emojis: https://www.webfx.com/tools/emoji-cheat-sheet/
st.set_page_config(page_title="Sales Dashboard", page_icon=":bar_chart:", layout="wide")


# ---- PRIVATE ACCESS (password gate) ----
def check_password() -> bool:
    """Gate the dashboard behind a shared password so only internal staff
    can view it. Set APP_PASSWORD in secrets to enable. If no password is
    configured, the gate is skipped (e.g. when the hosting itself is private).
    """
    expected = _config("APP_PASSWORD")
    if not expected:
        return True  # No password configured -> rely on private hosting.

    if st.session_state.get("authenticated"):
        return True

    st.title(":lock: Sales Dashboard")
    entered = st.text_input("Enter the access password:", type="password")
    if entered:
        if entered == expected:
            st.session_state["authenticated"] = True
            st.rerun()
        else:
            st.error("Incorrect password.")
    return False


if not check_password():
    st.stop()


# ---- LOAD DATA ----
# An uploaded file (no setup needed) takes priority; otherwise use the
# configured live source (public link / OneDrive) or the bundled sample.
st.sidebar.header("Data")
uploaded = st.sidebar.file_uploader(
    "Upload your own data (Excel or CSV)", type=["xlsx", "xls", "csv"]
)
if uploaded is not None:
    df = load_from_upload(uploaded)
    data_source = f"uploaded file: {uploaded.name}"
else:
    df, data_source = load_sales_data()

if st.sidebar.button("🔄 Refresh data"):
    st.cache_data.clear()
    st.rerun()
st.sidebar.caption(f"Data source: {data_source}")

st.sidebar.markdown("---")
st.sidebar.header("Please Filter Here:")

# Date-range filter (only when the data has a usable Date column).
date_range = None
if "Date" in df.columns and df["Date"].notna().any():
    min_date = df["Date"].min().date()
    max_date = df["Date"].max().date()
    date_range = st.sidebar.date_input(
        "Select the Date Range:",
        value=(min_date, max_date),
        min_value=min_date,
        max_value=max_date,
    )
    if isinstance(date_range, (list, tuple)) and len(date_range) == 2:
        start, end = pd.to_datetime(date_range[0]), pd.to_datetime(date_range[1])
        df = df[(df["Date"] >= start) & (df["Date"] <= end)]

city = st.sidebar.multiselect(
    "Select the City:",
    options=df["City"].unique(),
    default=df["City"].unique()
)

customer_type = st.sidebar.multiselect(
    "Select the Customer Type:",
    options=df["Customer_type"].unique(),
    default=df["Customer_type"].unique(),
)

gender = st.sidebar.multiselect(
    "Select the Gender:",
    options=df["Gender"].unique(),
    default=df["Gender"].unique()
)

df_selection = df.query(
    "City == @city & Customer_type ==@customer_type & Gender == @gender"
)

# Check if the dataframe is empty:
if df_selection.empty:
    st.warning("No data available based on the current filter settings!")
    st.stop() # This will halt the app from further execution.

# ---- MAINPAGE ----
st.title(":bar_chart: Sales Dashboard")
st.markdown("##")

# TOP KPI's
total_sales = int(df_selection["Total"].sum())
average_rating = round(df_selection["Rating"].mean(), 1)
star_rating = ":star:" * int(round(average_rating, 0))
average_sale_by_transaction = round(df_selection["Total"].mean(), 2)

left_column, middle_column, right_column = st.columns(3)
with left_column:
    st.subheader("Total Sales:")
    st.subheader(f"US $ {total_sales:,}")
with middle_column:
    st.subheader("Average Rating:")
    st.subheader(f"{average_rating} {star_rating}")
with right_column:
    st.subheader("Average Sales Per Transaction:")
    st.subheader(f"US $ {average_sale_by_transaction}")

st.markdown("""---""")

# SALES BY PRODUCT LINE [BAR CHART]
sales_by_product_line = df_selection.groupby(by=["Product line"])[["Total"]].sum().sort_values(by="Total")
fig_product_sales = px.bar(
    sales_by_product_line,
    x="Total",
    y=sales_by_product_line.index,
    orientation="h",
    title="<b>Sales by Product Line</b>",
    color_discrete_sequence=["#0083B8"] * len(sales_by_product_line),
    template="plotly_white",
)
fig_product_sales.update_layout(
    plot_bgcolor="rgba(0,0,0,0)",
    xaxis=(dict(showgrid=False))
)

# SALES BY HOUR [BAR CHART]
sales_by_hour = df_selection.groupby(by=["hour"])[["Total"]].sum()
fig_hourly_sales = px.bar(
    sales_by_hour,
    x=sales_by_hour.index,
    y="Total",
    title="<b>Sales by hour</b>",
    color_discrete_sequence=["#0083B8"] * len(sales_by_hour),
    template="plotly_white",
)
fig_hourly_sales.update_layout(
    xaxis=dict(tickmode="linear"),
    plot_bgcolor="rgba(0,0,0,0)",
    yaxis=(dict(showgrid=False)),
)


left_column, right_column = st.columns(2)
left_column.plotly_chart(fig_hourly_sales, use_container_width=True)
right_column.plotly_chart(fig_product_sales, use_container_width=True)


# MONTH-OVER-MONTH SALES TREND [LINE CHART]
fig_monthly_trend = None
if "Date" in df_selection.columns and df_selection["Date"].notna().any():
    monthly = (
        df_selection.dropna(subset=["Date"])
        .groupby(df_selection["Date"].dt.to_period("M"))["Total"]
        .sum()
        .sort_index()
    )
    monthly.index = monthly.index.to_timestamp()
    mom = monthly.pct_change().mul(100).round(1)

    fig_monthly_trend = px.line(
        x=monthly.index,
        y=monthly.values,
        markers=True,
        title="<b>Month-over-Month Sales Trend</b>",
        template="plotly_white",
    )
    fig_monthly_trend.update_traces(line_color="#0083B8")
    fig_monthly_trend.update_layout(
        xaxis_title="Month",
        yaxis_title="Total Sales",
        plot_bgcolor="rgba(0,0,0,0)",
        yaxis=dict(showgrid=False),
    )
    st.plotly_chart(fig_monthly_trend, use_container_width=True)

    # Latest month-over-month change as a headline metric.
    if len(monthly) >= 2 and pd.notna(mom.iloc[-1]):
        latest_label = monthly.index[-1].strftime("%b %Y")
        st.metric(
            label=f"Sales change vs. previous month ({latest_label})",
            value=f"US $ {int(monthly.iloc[-1]):,}",
            delta=f"{mom.iloc[-1]:+.1f}%",
        )


# ---- PDF REPORT EXPORT ----
st.sidebar.markdown("---")
kpis = {
    "Total Sales": f"US $ {total_sales:,}",
    "Average Rating": f"{average_rating}",
    "Average Sales / Transaction": f"US $ {average_sale_by_transaction}",
}
figures = [
    ("Sales by Hour", fig_hourly_sales),
    ("Sales by Product Line", fig_product_sales),
]
if fig_monthly_trend is not None:
    figures.append(("Month-over-Month Sales Trend", fig_monthly_trend))

try:
    pdf_bytes = build_pdf_report(kpis, figures, data_source)
    st.sidebar.download_button(
        label="📄 Download PDF report",
        data=pdf_bytes,
        file_name="sales_dashboard_report.pdf",
        mime="application/pdf",
    )
except Exception as exc:  # PDF deps missing or chart render failed
    st.sidebar.caption(f"PDF export unavailable: {exc}")


# ---- HIDE STREAMLIT STYLE ----
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)
