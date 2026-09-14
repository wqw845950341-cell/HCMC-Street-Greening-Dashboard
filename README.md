# HCMC Street Greening Dashboard

Bilingual (中文 / English) research dashboard for **Revealing the Potential for Green**, by Wang Qianwen. Static React + Vite application prepared for GitHub Pages.

## Development

```sh
npm ci --ignore-scripts
npm run dev
npm run lint
npm run build
npm run preview
```

No backend, database, account, or API key is required. The build does not inject environment secrets into browser code. Existing dependencies are retained; unused server packages are not bundled.

## GitHub Pages

The `.github/workflows/pages.yml` workflow builds and deploys `dist` on every push to `main`, or manually from Actions. Repository Settings → Pages → Source must be **GitHub Actions**.

GitHub Pages URL: https://wqw845950341-cell.github.io/HCMC-Street-Greening-Dashboard/

The repository is public and GitHub Pages is enabled with GitHub Actions as the build source. HTTPS is enforced.

Vite uses `base: './'`, and local data/media paths use `import.meta.env.BASE_URL`, supporting the repository subdirectory and a root-level static host. Navigation is client-side view state, without server rewrite requirements. The previous Vercel deployment can continue building the same project.

## Features

- Persistent Chinese/English language selection.
- Grade and typology filters, linked counts, critical share, and UTF-8 CSV export.
- Canvas-based map of 8,915 existing research sample points.
- Sample diagnosis plus 15 independently located before/proposed comparison cases.
- Keyboard-accessible comparison slider and closeable dialog; image and data error states.
- Five retrofit strategies, seven-indicator methodology, and original research board gallery.
- Responsive desktop and mobile layouts.

## Data integrity and sources

- `public/HCMC_Dashboard_Data.json` contains 8,915 Point features with `Grade` and `Type` only. Counts are samples, not complete street segments. It is static research data, not a live feed.
- The map preserves supplied classifications. It does not recompute scores or join the separate legacy score files by unverified IDs or coordinates.
- Final4 gives composite weights GVI 25%, SVF 5%, NDVI 20%, FVC 10%, canopy connectivity 15%, tree-to-building distance 15%, and negative PVI 10%. Inputs in the displayed formula are normalized 0–1.
- Final2 macro and Final3 micro weights are separate models. Final4 Run 3 grading boundaries are approximate and have rounded overlaps/gaps; they are not imposed on the map data.
- `public/research/board-*.jpg` are resized copies of the five user-provided A0 boards; `strategy-*.jpg` are crops of the Final5 proposed views. The gallery preserves embedded English text; interface, explanations, and strategy summaries are bilingual.
- Case images use the original linked public repository `wqw845950341-cell/street`. Their filenames were checked against its contents. Generic samples do not claim a unique matched before/after photo.
- Base maps load from OpenStreetMap with attribution. Base maps and linked comparison images require an internet connection. Other app assets and research data are deployed with this repository.

## Validation

Run `npm run lint` and `npm run build` before publishing. Browser checks cover both languages, typology/grade filters and empty states, CSV download, comparison dialog, research imagery, and mobile overflow.


