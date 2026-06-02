"""Live data loader for the Sales Dashboard.

Fetches the sales Excel workbook straight from OneDrive / SharePoint using the
Microsoft Graph API, so the dashboard always reflects the latest edits your
team makes to the file in Microsoft 365. Falls back to the bundled local file
when no cloud credentials are configured (handy for local development).

Configuration is read from Streamlit secrets (``.streamlit/secrets.toml``) or
environment variables. See ``.streamlit/secrets.toml.example`` and the README
for a step-by-step setup guide.
"""

import base64
import io
import os

import pandas as pd
import requests
import streamlit as st

GRAPH_SCOPE = "https://graph.microsoft.com/.default"
LOCAL_FALLBACK_FILE = "supermarkt_sales.xlsx"


def _config(key: str, default: str = "") -> str:
    """Read a setting from Streamlit secrets first, then environment vars."""
    try:
        if key in st.secrets:
            return str(st.secrets[key]).strip()
    except Exception:
        # st.secrets raises if no secrets file exists at all.
        pass
    return os.environ.get(key, default).strip()


def _get_access_token(tenant_id: str, client_id: str, client_secret: str) -> str:
    """Acquire an app-only Microsoft Graph token (client credentials flow)."""
    # Imported lazily so the app still runs locally without msal installed.
    import msal

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
    """Encode a OneDrive/SharePoint sharing link for the Graph /shares endpoint."""
    encoded = base64.urlsafe_b64encode(share_url.encode("utf-8")).decode("utf-8")
    return "u!" + encoded.rstrip("=")


def _download_workbook_bytes() -> bytes:
    """Download the workbook from Microsoft Graph and return its raw bytes."""
    tenant_id = _config("MS_TENANT_ID")
    client_id = _config("MS_CLIENT_ID")
    client_secret = _config("MS_CLIENT_SECRET")

    token = _get_access_token(tenant_id, client_id, client_secret)
    headers = {"Authorization": f"Bearer {token}"}

    share_url = _config("EXCEL_SHARE_URL")
    drive_id = _config("MS_DRIVE_ID")
    item_id = _config("MS_ITEM_ID")

    if share_url:
        # Easiest path: paste the file's "Share" link from OneDrive/SharePoint.
        endpoint = (
            "https://graph.microsoft.com/v1.0/shares/"
            f"{_encode_share_url(share_url)}/driveItem/content"
        )
    elif drive_id and item_id:
        # Precise path: explicit drive + item IDs.
        endpoint = (
            f"https://graph.microsoft.com/v1.0/drives/{drive_id}/items/{item_id}/content"
        )
    else:
        raise RuntimeError(
            "No cloud file configured. Set EXCEL_SHARE_URL, or both MS_DRIVE_ID "
            "and MS_ITEM_ID, in your secrets."
        )

    resp = requests.get(endpoint, headers=headers, timeout=60)
    resp.raise_for_status()
    return resp.content


def _is_cloud_configured() -> bool:
    return bool(
        _config("MS_TENANT_ID")
        and _config("MS_CLIENT_ID")
        and _config("MS_CLIENT_SECRET")
        and (_config("EXCEL_SHARE_URL") or (_config("MS_DRIVE_ID") and _config("MS_ITEM_ID")))
    )


def _parse_workbook(source) -> pd.DataFrame:
    """Read the 'Sales' sheet and shape it the way the dashboard expects."""
    df = pd.read_excel(
        io=source,
        engine="openpyxl",
        sheet_name="Sales",
        skiprows=3,
        usecols="B:R",
        nrows=1000,
    )
    df["hour"] = pd.to_datetime(df["Time"], format="%H:%M:%S").dt.hour
    return df


# Cache for 5 minutes so repeated interactions are fast, but edits to the
# source file still flow through automatically. The "Refresh data" button in
# the app clears this cache on demand.
@st.cache_data(ttl=300, show_spinner="Loading latest data from OneDrive/SharePoint...")
def load_sales_data() -> tuple[pd.DataFrame, str]:
    """Return (dataframe, source_label).

    Pulls live from OneDrive/SharePoint when credentials are configured,
    otherwise reads the bundled local Excel file.
    """
    if _is_cloud_configured():
        content = _download_workbook_bytes()
        return _parse_workbook(io.BytesIO(content)), "OneDrive/SharePoint (live)"

    return _parse_workbook(LOCAL_FALLBACK_FILE), "local file (no cloud configured)"
