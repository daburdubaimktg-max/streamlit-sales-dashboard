"""Live data loader for the Sales Dashboard.

Loads the sales data from whichever source is available, in this priority:

1. A file the viewer uploads in the app (Excel or CSV) — no setup at all.
2. A public/direct-download URL (``PUBLIC_DATA_URL``) — e.g. a Google Sheet
   published as CSV, or a OneDrive/SharePoint "anyone with the link" link.
   No Azure app registration needed.
3. OneDrive/SharePoint via the Microsoft Graph API (needs the Azure setup).
4. The bundled local ``supermarkt_sales.xlsx`` (fallback for local dev).

Configuration is read from Streamlit secrets (``.streamlit/secrets.toml``) or
environment variables. See ``.streamlit/secrets.toml.example`` and the README.
"""

import base64
import io
import os

import pandas as pd
import requests
import streamlit as st

GRAPH_SCOPE = "https://graph.microsoft.com/.default"
LOCAL_FALLBACK_FILE = "supermarkt_sales.xlsx"

# Columns the dashboard needs to function.
REQUIRED_COLUMNS = {"City", "Customer_type", "Gender", "Product line", "Total", "Rating"}


def _config(key: str, default: str = "") -> str:
    """Read a setting from Streamlit secrets first, then environment vars."""
    try:
        if key in st.secrets:
            return str(st.secrets[key]).strip()
    except Exception:
        # st.secrets raises if no secrets file exists at all.
        pass
    return os.environ.get(key, default).strip()


# ---------------------------------------------------------------------------
# Parsing
# ---------------------------------------------------------------------------
def _shape(df: pd.DataFrame) -> pd.DataFrame:
    """Validate required columns and add helper columns the dashboard uses."""
    df = df.rename(columns=lambda c: str(c).strip())

    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(
            "The data is missing expected columns: "
            + ", ".join(sorted(missing))
            + ". Make sure the file matches the sample sales format."
        )

    if "Time" in df.columns:
        df["hour"] = pd.to_datetime(
            df["Time"].astype(str), format="%H:%M:%S", errors="coerce"
        ).dt.hour
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    return df


def parse_data(source, filename: str = "") -> pd.DataFrame:
    """Parse data from a path, bytes/buffer, or URL into the dashboard's shape.

    Handles both the structured sample workbook (header offset, B:R columns on
    a 'Sales' sheet) and plain Excel/CSV exports.
    """
    name = (filename or str(source)).lower()

    if name.endswith(".csv"):
        return _shape(pd.read_csv(source))

    # Excel. Try the structured sample layout first, fall back to a plain read.
    buffer = source
    if hasattr(source, "read"):
        buffer = io.BytesIO(source.read())  # allow two read passes

    try:
        sheets = pd.ExcelFile(buffer, engine="openpyxl").sheet_names
        if hasattr(buffer, "seek"):
            buffer.seek(0)
        if "Sales" in sheets:
            df = pd.read_excel(
                buffer, engine="openpyxl", sheet_name="Sales",
                skiprows=3, usecols="B:R", nrows=1000,
            )
            return _shape(df)
    except Exception:
        pass

    if hasattr(buffer, "seek"):
        buffer.seek(0)
    return _shape(pd.read_excel(buffer, engine="openpyxl"))


# ---------------------------------------------------------------------------
# Source 1: uploaded file
# ---------------------------------------------------------------------------
def load_from_upload(uploaded_file) -> pd.DataFrame:
    """Parse a file uploaded through st.file_uploader."""
    return parse_data(uploaded_file, filename=uploaded_file.name)


# ---------------------------------------------------------------------------
# Source 2: public/direct-download URL (no auth)
# ---------------------------------------------------------------------------
def _load_from_public_url(url: str) -> pd.DataFrame:
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    filename = url.split("?")[0]
    return parse_data(io.BytesIO(resp.content), filename=filename)


# ---------------------------------------------------------------------------
# Source 3: Microsoft Graph (OneDrive/SharePoint, needs Azure setup)
# ---------------------------------------------------------------------------
def _get_access_token(tenant_id: str, client_id: str, client_secret: str) -> str:
    import msal  # lazy import so local dev works without it

    app = msal.ConfidentialClientApplication(
        client_id,
        authority=f"https://login.microsoftonline.com/{tenant_id}",
        client_credential=client_secret,
    )
    result = app.acquire_token_for_client(scopes=[GRAPH_SCOPE])
    if "access_token" not in result:
        raise RuntimeError(
            "Could not authenticate with Microsoft Graph: "
            f"{result.get('error_description', result)}"
        )
    return result["access_token"]


def _encode_share_url(share_url: str) -> str:
    encoded = base64.urlsafe_b64encode(share_url.encode("utf-8")).decode("utf-8")
    return "u!" + encoded.rstrip("=")


def _load_from_graph() -> pd.DataFrame:
    token = _get_access_token(
        _config("MS_TENANT_ID"), _config("MS_CLIENT_ID"), _config("MS_CLIENT_SECRET")
    )
    headers = {"Authorization": f"Bearer {token}"}

    share_url = _config("EXCEL_SHARE_URL")
    drive_id, item_id = _config("MS_DRIVE_ID"), _config("MS_ITEM_ID")

    if share_url:
        endpoint = (
            "https://graph.microsoft.com/v1.0/shares/"
            f"{_encode_share_url(share_url)}/driveItem/content"
        )
    elif drive_id and item_id:
        endpoint = (
            f"https://graph.microsoft.com/v1.0/drives/{drive_id}/items/{item_id}/content"
        )
    else:
        raise RuntimeError("No Graph file configured (EXCEL_SHARE_URL or drive/item IDs).")

    resp = requests.get(endpoint, headers=headers, timeout=60)
    resp.raise_for_status()
    return parse_data(io.BytesIO(resp.content), filename="workbook.xlsx")


def _graph_configured() -> bool:
    return bool(
        _config("MS_TENANT_ID") and _config("MS_CLIENT_ID") and _config("MS_CLIENT_SECRET")
        and (_config("EXCEL_SHARE_URL") or (_config("MS_DRIVE_ID") and _config("MS_ITEM_ID")))
    )


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------
@st.cache_data(ttl=300, show_spinner="Loading latest data...")
def load_sales_data() -> tuple[pd.DataFrame, str]:
    """Return (dataframe, source_label) for automatic (non-upload) sources.

    Priority: public URL -> Microsoft Graph -> bundled local file. An uploaded
    file is handled separately in app.py (it can't be cached the same way).
    """
    public_url = _config("PUBLIC_DATA_URL")
    if public_url:
        return _load_from_public_url(public_url), "public link (live)"

    if _graph_configured():
        return _load_from_graph(), "OneDrive/SharePoint (live)"

    return parse_data(LOCAL_FALLBACK_FILE), "local file (sample data)"
