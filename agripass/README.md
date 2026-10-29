# AgriPass Global — Single-Window Agri-Compliance & Export Document Automation

Client-side React app for exporters shipping agricultural inputs from India. Pick a destination, category and commodity, and it will:

1. List mandatory **certifications** and **import/movement permits**, each with its issuer, legal basis, lead time and source.
2. Show the **harmonized regulatory pathway** for that category (EAC, COMESA, SADC, ECOWAS, UEMOA, CILSS/CSP, CEMAC/CPAC, GCC, ASEAN, SAARC, EAEU, MERCOSUR), with sibling countries you can switch to or compare.
3. Capture exporter, consignee, shipment and product data **once** in the master form, then cascade it into every document.
4. Let you inspect each document: green **auto-filled** fields alongside amber **manual** fields, with validation, a completion bar, a certificate-style preview, and PDF/ZIP/JSON export.

## Run

```bash
npm install
npm run dev            # local dev server
npm run build          # production build → dist/ (deploy to any static host)
npm run build:artifact # single self-contained HTML → dist-artifact/agripass.html
npm test               # data integrity + scenario/validation checks (504 country × category stacks)
npm run data:fairs     # regenerate src/data/fairs.generated.ts from data/Country_Regulatory_Details.xlsx
```

## Structure

| Path | What it holds |
|---|---|
| `data/Country_Regulatory_Details.xlsx` | Your FAIRS spreadsheet (79 countries, report links) |
| `scripts/excel_to_fairs.py` | Spreadsheet → `src/data/fairs.generated.ts` |
| `src/data/countries.ts` | 84 destination profiles: NPPO, seed, fertilizer, pesticide, biosafety and standards regulators, ports, single window, conformity scheme, GMO policy, India preferential CoO form, alerts |
| `src/data/blocs.ts` | Regional blocs and per-category instruments, with harmonization level (single authorization / regional catalogue / data recognition / common standards) |
| `src/data/commodities.ts` | 57 commodities across the 6 categories, with HS 2022 codes |
| `src/data/standards.ts` | Seed minimums, phytosanitary AD wording by crop, FCO heavy-metal ceilings, Rotterdam Annex III list, irrigation standards |
| `src/data/documents.ts` | ~40 document templates and the rules engine `buildStack(ctx)` |
| `src/data/masterSchema.ts` | Master form schema, commodity defaults, labelled sample data |
| `src/lib/docstate.ts` | Field resolution (auto / computed / manual), staleness, validation, progress |
| `src/lib/pdf.ts`, `exporters.ts` | jsPDF drafts (watermarked), unified pack, ZIP, JSON dossier |
| `src/store.ts` | Zustand store with localStorage persistence (profiles, templates, draft) |

## Data provenance

- **FAIRS** (USDA, via APEDA AgriExchange): 24 countries have their own report. 53 are covered through a hub country and 2 are unavailable. Hub coverage ("Managed through") is a USDA reporting arrangement. The app shows it separately and never treats it as legal harmonization.
- FAIRS reports cover food and plant products. Requirements for seeds, fertilizers, agrochemicals, bio-inputs and machinery come from published regulations. Every document card names its source.
- Each country is labelled **Full profile**, **Bloc-derived** or **Indicative**.
- Regulations change. Confirm requirements with the competent authority and your importer before shipping.

## Generated documents

Every preview and PDF is a pre-filled **draft**, watermarked "DRAFT — NOT AN OFFICIAL CERTIFICATE", with blank boxes for the officer's signature and seal. Official certificates are issued only by the named authorities through their own systems (PQIS, KenTrade, ICEGATE, SABER, etc.).

## Extending

- **New country:** add an entry to `SEEDS` in `countries.ts`, and its ISO2 code to the relevant blocs in `blocs.ts`.
- **New document:** write a template function returning `Base` in `documents.ts`, then `push()` it in `buildStack` with a requirement and reason. Fields with `from: 'masterKey'` (or `'{a} — {b}'` templates) auto-fill; fields without `from` are manual.
- **Hosting:** `dist/` is static. Persistence uses localStorage, so add a backend if profiles need to be shared across users.
