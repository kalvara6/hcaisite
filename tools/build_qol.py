import csv, json, math, sys
SRC = sys.argv[1]; OUT = sys.argv[2]
geo = json.load(open(f"{SRC}/public/data/geography/geography.geojson.json"))
groups = json.load(open(f"{SRC}/src/assets/neighborhod-groups.json"))

# --- projection: equirectangular scaled by cos(lat) into 800-wide viewBox
xs, ys = [], []
def rings(geom):
    if geom["type"] == "Polygon": return [geom["coordinates"]]
    return geom["coordinates"]
for f in geo["features"]:
    for poly in rings(f["geometry"]):
        for ring in poly:
            for x, y in ring: xs.append(x); ys.append(y)
lat0 = (min(ys)+max(ys))/2; k = math.cos(math.radians(lat0))
W = 800; pad = 10
sx = (W-2*pad)/((max(xs)-min(xs))*k)
H = round((max(ys)-min(ys))*sx + 2*pad)
def P(x, y): return ((x-min(xs))*k*sx+pad, (max(ys)-y)*sx+pad)

def pip(pt, ring):
    x, y = pt; inside = False
    for i in range(len(ring)):
        x1, y1 = ring[i]; x2, y2 = ring[i-1]
        if (y1 > y) != (y2 > y) and x < (x2-x1)*(y-y1)/(y2-y1)+x1: inside = not inside
    return inside

juris = {}
for name, ids in groups["Jurisdiction"].items():
    for i in ids: juris.setdefault(i, []).append(name)

npas = []; cent = {}
uptown = (-80.8431, 35.2271); uptown_id = None
for f in geo["features"]:
    fid = str(f["properties"]["id"]); parts = []; ax = ay = an = 0
    for poly in rings(f["geometry"]):
        if pip(uptown, poly[0]): uptown_id = fid
        for ring in poly:
            pts = [P(x, y) for x, y in ring]
            for px, py in pts: ax += px; ay += py; an += 1
            parts.append("M" + "L".join(f"{px:.1f},{py:.1f}" for px, py in pts) + "Z")
    cent[fid] = (ax/an, ay/an)
    npas.append({"id": fid, "d": "".join(parts), "j": juris.get(fid, [])})

labels = []
for name, ids in groups["Jurisdiction"].items():
    if name == "Charlotte": continue
    pts = [cent[i] for i in ids if i in cent]
    if pts: labels.append({"name": name, "x": round(sum(p[0] for p in pts)/len(pts), 1), "y": round(sum(p[1] for p in pts)/len(pts), 1)})
ux, uy = P(*uptown); labels.append({"name": "Uptown", "x": round(ux, 1), "y": round(uy, 1), "dot": True})

def load(m, pre):
    return {r["id"].strip('"'): r for r in csv.DictReader(open(f"{SRC}/data/metric/{pre}{m[1:]}.csv"))}
PCT = {"m80": 1, "m82": 1, "m29": 1, "m88": 1}
NOTES = {"m80": "In the open data, neighborhood population totals stop updating after 2019, so 2020-2022 shares may run high in fast-growing areas. One impossible value (over 100%) is shown as no data."}
CFG = {c["metric"]: c for c in json.load(open(f"{SRC}/data/data.json"))}
def metric(m):
    r, d = load(m, "r"), load(m, "d")
    yrs = [k for k in next(iter(d.values())) if k != "id"]
    vals, county = {}, {}
    for y in yrs:
        R = D = 0; vy = {}
        for i in d:
            try: rv = float(r[i][y]); dv = float(d[i][y])
            except (KeyError, ValueError): continue
            if dv == 0: continue
            val = rv/dv; R += rv; D += dv
            if m in ("m37", "m40") and val <= 0: continue  # missing estimate
            if PCT.get(m) and val > 100: continue  # impossible share -> show as no data on the map
            vy[i] = round(val, 2)
        wv = (CFG.get(m, {}).get("world_val") or {}).get(y)
        vals[y[2:]] = vy; county[y[2:]] = wv if wv else round(R/D, 2)
    return [y[2:] for y in yrs], vals, county

SPEC = [
  ("m80", "Food assistance (SNAP)", "Share of residents receiving Food and Nutrition Services", "pct", "high",
   "A strong, frequently updated sign of household financial strain — the kind of strain that comes before a missed rent payment.", "Mecklenburg County Department of Social Services", "s2"),
  ("m37", "Household income", "Median household income", "money", "low",
   "Lower-income neighborhoods have the least cushion when rents rise.", "U.S. Census Bureau, American Community Survey 5-year estimates", "s2"),
  ("m40", "Rent", "Median gross rent (rent + utilities)", "money", "neutral",
   "Where rents are rising fastest is where low-cost housing disappears.", "U.S. Census Bureau, American Community Survey 5-year estimates", "s6"),
  ("rti", "Rent vs. income (rough)", "Median rent × 12 as a share of median household income", "pct", "high",
   "A rough pressure gauge we calculated. Renters usually earn less than homeowners, so true rent burden is higher than this shows.", "Calculated from the two ACS metrics above", "s2"),
  ("m82", "Subsidized rental housing", "Share of housing units with development-based rental assistance", "pct", "neutral",
   "Shows where the existing affordable-housing safety net sits — and where it doesn't.", "InLivian, DreamKey Partners, City of Charlotte, NHPD, NCHFA, HUD", "s6"),
  ("m68", "Housing code violations", "Housing code violations per 100 units", "rate", "high",
   "Substandard housing is a form of housing instability and can push people out.", "City of Charlotte Code Enforcement", "s6"),
  ("m29", "Home ownership", "Share of housing units that are owner-occupied", "pct", "low",
   "Renter-heavy neighborhoods are more exposed to rent hikes and eviction.", "U.S. Census Bureau, American Community Survey 5-year estimates", "s2"),
  ("m88", "High-speed internet", "Share of households with high-speed internet access", "pct", "low",
   "A human-centered AI check: a web-only tool misses the neighborhoods with the least internet. This is why our navigator is text-first.", "U.S. Census Bureau, American Community Survey 5-year estimates", "s3"),
]
metrics = []
raw = {}
for mid, title, sub, fmt, need, why, src, sol in SPEC:
    if mid == "rti":
        rent = raw["m40"][1]["2021"]; inc = raw["m37"][1]["2021"]
        v = {i: round(rent[i]*12/inc[i]*100, 1) for i in rent if i in inc and inc[i] > 0}
        cr = raw["m40"][2]["2021"]*12/raw["m37"][2]["2021"]*100
        yrs, vals, county = ["2021"], {"2021": v}, {"2021": round(cr, 1)}
    else:
        yrs, vals, county = metric(mid); raw[mid] = (yrs, vals, county)
    metrics.append({"id": mid, "title": title, "subtitle": sub, "format": fmt, "need": need, "why": why,
                    "source": src, "solution": sol, "note": NOTES.get(mid, ""), "years": yrs, "values": vals, "county": county})

out = {"width": W, "height": H, "npas": npas, "labels": labels, "uptown": uptown_id, "metrics": metrics}
with open(OUT, "w") as fh:
    fh.write("/* Generated from the Charlotte-Mecklenburg Quality of Life Explorer open data\n"
             "   (github.com/tobinbradley/quality-of-life-explorer, MIT License). Do not edit by hand. */\n")
    fh.write("const QOL = " + json.dumps(out, separators=(",", ":")) + ";\n")
print("H", H, "npas", len(npas), "labels", [l["name"] for l in labels], "uptown", uptown_id)
for m in metrics: print(m["id"], m["years"], m["county"], len(m["values"][m["years"][-1]]))
