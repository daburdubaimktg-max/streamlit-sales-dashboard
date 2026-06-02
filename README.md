
# Interactive Dashboard with Python – Streamlit

Sales Dashboard built-in Python and the Streamlit library to visualize Excel data.

## Video Tutorial
[![YouTube Video](https://img.youtube.com/vi/Sb0A9i6d320/0.jpg)](https://youtu.be/Sb0A9i6d320)

## Run the app
```Powershell
# vanilla terminal
streamlit run app.py

# quit
ctrl-c
```

## Connect your own data (no Azure setup needed)

You don't need the Microsoft/Azure setup to use your own data. Pick whichever
is easiest:

### Option A — Drag & drop (zero config)
Just run the app and use **"Upload your own data (Excel or CSV)"** in the
sidebar. The dashboard updates instantly from your file. Great for quick,
ad-hoc reports. Your file should have the same columns as the sample
(City, Customer_type, Gender, Product line, Total, Rating, Date, Time, …).

### Option B — Public link (auto-updating, no login)
Set `PUBLIC_DATA_URL` in `.streamlit/secrets.toml` to a direct-download link:

- **Google Sheets:** File → Share → **Publish to web** → choose the sheet →
  **CSV** → copy the link. Anyone editing the sheet updates the dashboard.
- **OneDrive/SharePoint share link:** create an "Anyone with the link" link,
  then change the trailing `...?e=...` part: replace `:x:/g/` style view links
  by appending `&download=1`, or use the "Embed" → download URL. (For locked-
  down company files that can't be shared publicly, use the Graph option below.)

### Management features
- **Date-range filter** in the sidebar.
- **Month-over-month sales trend** line chart, with the latest month's % change
  shown as a headline metric.
- **📄 Download PDF report** button in the sidebar — exports the KPIs and charts
  as a clean PDF to email or print for management.

## Live data from OneDrive/SharePoint (private company files)

By default the app reads the bundled `supermarkt_sales.xlsx`. To make it
**live** — so the dashboard updates whenever your team edits the Excel file in
Microsoft 365 — connect it to OneDrive/SharePoint via the Microsoft Graph API.

### 1. Register an app in Azure (one-time, done by an IT admin)
1. Go to **Azure Portal → Microsoft Entra ID → App registrations → New registration**.
2. Give it a name (e.g. "Sales Dashboard"), register it.
3. Copy the **Application (client) ID** and **Directory (tenant) ID**.
4. Under **Certificates & secrets → New client secret**, create a secret and
   copy its **Value** (not the ID).
5. Under **API permissions → Add a permission → Microsoft Graph →
   Application permissions**, add **`Files.Read.All`** (or `Sites.Read.All`
   for SharePoint), then click **Grant admin consent**.

### 2. Get the Excel file's share link
In OneDrive/SharePoint, open the file → **Share** → **Copy link**. Paste this
into `EXCEL_SHARE_URL` below.

### 3. Configure secrets
Copy `.streamlit/secrets.toml.example` to `.streamlit/secrets.toml` and fill in
the values from steps 1–2:

```toml
APP_PASSWORD      = "a-shared-password"   # viewers type this to open the dashboard
MS_TENANT_ID      = "..."
MS_CLIENT_ID      = "..."
MS_CLIENT_SECRET  = "..."
EXCEL_SHARE_URL   = "https://yourcompany-my.sharepoint.com/:x:/g/..."
```

`secrets.toml` is git-ignored — never commit real credentials.

### 4. Updating the dashboard
- Edit the Excel file in Microsoft 365 → the dashboard picks up changes within
  ~5 minutes, or instantly when a viewer clicks **🔄 Refresh data** in the sidebar.

## Private / internal hosting

This dashboard is meant for **internal viewers only**. Two layers protect it:

1. **Password gate** — set `APP_PASSWORD` in `secrets.toml`; viewers must enter
   it to see any data. (Skipped automatically if left blank.)
2. **Network/hosting** — host it where only your company can reach it.

### Run it privately with Docker
```bash
docker build -t sales-dashboard .

# Inject secrets at runtime (do NOT bake them into the image)
docker run -p 8501:8501 \
  -v "$(pwd)/.streamlit/secrets.toml:/app/.streamlit/secrets.toml:ro" \
  sales-dashboard
```
Then expose port 8501 only on your internal network / VPN, or put it behind
your company's reverse proxy or identity-aware proxy. The container already
includes a health check on `/_stcore/health`.

## Demo
Sales Dashboard: https://www.salesdashboard.pythonandvba.com/

## Screenshot
![Dashboard Screenshot](./Dashboard_Sample.png)



## More Solutions
Explore my tools and templates for Excel, automation, and more.

**[View all solutions](https://pythonandvba.com/solutions)**
## Connect with Me
- **YouTube:** [CodingIsFun](https://youtube.com/c/CodingIsFun)
- **Website:** [PythonAndVBA](https://pythonandvba.com)
- **LinkedIn:** [Sven Bosau](https://www.linkedin.com/in/sven-bosau/)
- **Contact:** [Get in Touch](https://pythonandvba.com/contact)
## ☕️ Support My Work
Love my content and want to show appreciation? Why not [buy me a coffee](https://pythonandvba.com/coffee-donation) to fuel my creative engine? Your support means the world to me! 😊

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://pythonandvba.com/coffee-donation)

## 💌 Feedback
Got some thoughts or suggestions? Don't hesitate to reach out to me at contact@pythonandvba.com. I'd love to hear from you! 💡
![Logo](https://www.pythonandvba.com/banner-img)
