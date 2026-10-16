# Car model viewer

A three.js studio viewer: loads a car model, scales it to real size, stands it on
the ground, lights it and lets you orbit and zoom around it.

Open `index.html` through a web server (not by double-clicking it — browsers block
module imports on `file://`):

```bash
python3 -m http.server 8099
```

then visit <http://localhost:8099>. On GitHub Pages it just works.

## The model

`assets/models/car.glb` &mdash; **Mercedes-Benz S 580 Maybach (W223)** by
*GT Cars: Hyperspeed*, CC Attribution 4.0, 293k triangles, full interior.
<https://sketchfab.com/3d-models/mercedes-benz-s-580-maybach-w223-6125a32ee10048ca96eee0c28b9c8b6c>

The Sketchfab download is 17.5 MB (`scene.gltf` + a 15 MB `scene.bin` + PNG
textures). That is recompressed for the web with
[glTF-Transform](https://gltf-transform.dev):

```bash
npx @gltf-transform/cli optimize scene.gltf car.glb \
  --compress meshopt --texture-compress webp --simplify false
```

**17.5 MB → 2.7 MB**, about 1.8 MB gzipped over the wire. `--simplify false`
matters: simplification is on by default and would discard triangles. Nothing
was simplified, so the mesh is identical to the original.

Meshopt was chosen over Draco deliberately. Draco produced a slightly smaller
file (1.68 MB gzipped vs 1.79 MB) but decodes much more slowly, which is the
wrong trade on a low-powered laptop for a 6% size saving.

To swap in a different car, drop it at any path listed in `SOURCES` at the top
of `assets/js/main.js`, and update `EXPECTED_BYTES` so the loading bar stays
accurate.

## Seeing inside

Several of the sensors you need to label live in the cabin &mdash; the temperature
sensor, the humidity sensor, the microphone and the seat pressure pad. Tick
**Cutaway** (bottom left) and drag the slider to slice the near side of the car
away, so the interior is visible and clickable. It works by clipping geometry,
so it needs no special preparation of the model.

Add `?cut=0.2` to the URL to open a view with the cutaway already on.

## Adjusting

Everything you are likely to change is at the top of `assets/js/main.js`:

| Setting | What it does |
|---|---|
| `SOURCES` | file paths that are tried, in order |
| `TARGET_LENGTH` | real-world length in metres the model is scaled to |
| `MODEL_YAW` | turn the car if it loads facing the wrong way (0 / 90 / 180 / 270) |

You can also test angles without editing anything by adding a query string:

- `?cam=side` — also `front`, `rear`, `top`, `hero`, `front34`, `rear34`, `low`
- `?yaw=180` — rotate the model

## Layout

```
index.html              the page
assets/css/style.css    styling
assets/js/main.js       scene, lighting, camera, model loading
assets/models/car.glb   the model (replace this)
vendor/                 three.js r169 + loaders, vendored so there is no CDN
```
