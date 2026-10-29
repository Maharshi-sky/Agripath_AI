"""Convert the FAIRS country/report spreadsheet into src/data/fairs.generated.ts"""
import sys, json, openpyxl
src, out = sys.argv[1], sys.argv[2]
wb = openpyxl.load_workbook(src, read_only=True)
rows = list(wb.worksheets[0].iter_rows(values_only=True))[1:]
reg = {}
for c, t, link, year in rows:
    if not c: continue
    e = reg.setdefault(c.strip(), {"name": c.strip()})
    y = str(year).strip() if year is not None else ""
    if y.startswith("Managed Through"):
        e["status"] = "hub"; e["hub"] = y.replace("Managed Through", "").strip()
    elif y.lower() == "unavailable":
        e["status"] = "unavailable"
    else:
        e["status"] = "own"; e["year"] = y
    if link:
        e["exportCertUrl" if "Export" in t else "countryReportUrl"] = link
data = list(reg.values())
with open(out, "w") as f:
    f.write("// AUTO-GENERATED from Country_Regulatory_Details.xlsx by scripts/excel_to_fairs.py — do not edit by hand.\n")
    f.write("export interface FairsEntry { name: string; status: 'own' | 'hub' | 'unavailable'; hub?: string; year?: string; exportCertUrl?: string; countryReportUrl?: string }\n")
    f.write("export const FAIRS: FairsEntry[] = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
print(len(data), "countries;", sum(1 for d in data if d["status"]=="own"), "own;", sum(1 for d in data if d["status"]=="hub"), "hub")
