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

Installed at `assets/models/mercedes-benz_s_580_maybach_w223/`:

**Mercedes-Benz S 580 Maybach (W223)** by *GT Cars: Hyperspeed*
CC Attribution 4.0 &middot; 293k triangles &middot; full interior
<https://sketchfab.com/3d-models/mercedes-benz-s-580-maybach-w223-6125a32ee10048ca96eee0c28b9c8b6c>

To swap in a different car later, drop it at any of the paths listed in
`SOURCES` at the top of `assets/js/main.js` &mdash; a `.glb`, or an unzipped
Sketchfab folder containing `scene.gltf`, `scene.bin` and `textures/`.

The CC Attribution licence requires you to **credit the author**. This is already
filled in on the `#credit` line in `index.html` &mdash; leave it there:

> This work is based on "Mercedes-Benz S 580 Maybach (W223)" by GT Cars: Hyperspeed,
> licensed under CC-BY-4.0.

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
