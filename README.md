# HomeMap CLT — Human-Centered AI for Homelessness in Charlotte-Mecklenburg

A class project that uses public data to show what drives homelessness in Charlotte-Mecklenburg, then maps where human-centered AI (including LLMs) could help — with people, not instead of them.

## What's on the site
1. **The data:** headline stats plus four interactive charts (unsheltered trend, Point-in-Time Count, One Number, eviction filings), with a table view and a downloadable CSV.
2. **Neighborhood map:** a map of all 459 Neighborhood Profile Areas that you can switch between 8 measures. They are food assistance (SNAP), income, rent, a rough rent-to-income ratio, subsidized housing, code violations, home ownership, and internet access. It has a year slider, a tooltip on hover, details when you click a neighborhood, an outline of the 10% with the most pressure, and a table view. The data comes from the [Quality of Life Explorer](https://mcmap.org/qol).
3. **The journey:** an 8-stage journey map of a composite, fictional person, showing where each solution could step in.
4. **The solution map:** an interactive map linking 7 root causes to 8 solutions. Each solution lists where AI helps, where people stay in charge, safeguards, and how success would be measured. It also includes a Shneiderman-style "automation × human control" matrix.
5. **Human-centered AI rules:** 8 design principles.
6. **Prototype:** a rule-based "Where do I start?" navigator (it uses verified resources only, so it can't make up a phone number), plus an example LLM guardrail system prompt.
7. **Sources & AI use statement.**

## Files
| File | Purpose |
|---|---|
| `index.html` | Page structure and text |
| `styles.css` | Styling (light + dark mode) |
| `data.js` | **All numbers, sources, causes, solutions, and resources.** Edit here to update content. |
| `app.js` | Charts and interactivity (plain JavaScript, no libraries) |
| `qol-data.js` | Neighborhood shapes and measures, generated from Quality of Life Explorer open data. Don't edit it by hand. |
| `qol-map.js` | The neighborhood map |
| `tools/build_qol.py` | Script that regenerates `qol-data.js` |
| `data/charlotte_homelessness_data.csv` | The compiled dataset with a source URL for each row |

No build step and no dependencies. It works when you open `index.html` directly or host it on GitHub Pages.

## Deploy to GitHub Pages
1. Create a new public repository on GitHub, for example `clt-homelessness-hcai`.
2. Upload every file in this folder to the repository root, keeping the `data/` folder. Use **Add file → Upload files**.
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: `main`**, and the **`/ (root)`** folder, then click **Save**.
4. Wait a minute or two. Your site will be live at `https://<your-username>.github.io/clt-homelessness-hcai/`.

## Updating the data
The main source is the [Charlotte-Mecklenburg Housing & Homelessness Dashboard](https://mecklenburghousingdata.org/). New Point-in-Time results usually come out in late spring, and the State of Housing Instability & Homelessness report comes out in winter. To add a year, append a row to the arrays in `data.js` (`PIT`, `UNSHELTERED`, `ONE_NUMBER`, `EVICTIONS`) and add the source to `SOURCES`.

## About the neighborhood data
The map uses the Explorer's open-data repository on GitHub ([tobinbradley/quality-of-life-explorer](https://github.com/tobinbradley/quality-of-life-explorer), MIT License). Its newest years are 2021 for the Census (ACS) measures, 2022 for SNAP, and 2023 for subsidized housing and code violations. The live site at mcmap.org/qol may have newer numbers. To refresh the map:

```bash
git clone https://github.com/tobinbradley/quality-of-life-explorer.git
python3 tools/build_qol.py quality-of-life-explorer qol-data.js
```

Each value is `r<metric>.csv ÷ d<metric>.csv`, the same calculation the Explorer uses. For median income and rent, the county value is the Explorer's official county median. A few impossible values, such as shares over 100% or incomes of $0, are shown as "no data."

The Explorer has no eviction data by neighborhood. If your class wants to add it, eviction filings by census tract are a good next dataset.

## Notes
- Figures were checked on November 10, 2026. The Point-in-Time Count and the One Number measure different things, so they shouldn't be compared directly.
- This is a student project, not an official county resource. Confirm resource phone numbers and hours before you share them.
- Edit the "AI use statement" at the bottom of the page so it describes how your team used AI.
