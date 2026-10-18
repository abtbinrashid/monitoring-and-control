# Monitoring and control systems

A three.js studio viewer: loads a car model, scales it to real size, stands it on
the ground, lights it and lets you orbit and zoom around it.

Open `index.html` through a web server (not by double-clicking it — browsers block
module imports on `file://`):

```bash
python3 -m http.server 8099
```

then visit <http://localhost:8099>. On GitHub Pages it just works.

## Pages

| Page | What it is |
|---|---|
| `index.html` | the car on its own, with a cutaway slider |
| `sensors.html` | **Monitor or control?** &mdash; click the eight numbered sensors on the car, read how each one works, then classify it |

## Night driving (not on the site yet)

`multibeam.html` is finished but deliberately **not linked from `index.html`**.
Open it directly when you want it. To put it on the site, add a link to
`index.html`.

It is a static scene &mdash; a diagram of what the systems do, not a driving
simulation. Nothing moves except the headlamp LEDs themselves.

Two systems share the same headlamps. Both are control systems rather than
monitoring ones, because each ends in an actuator instead of a display.

**MULTIBEAM.** A camera sensor finds oncoming vehicles. The microprocessor works
out which of the 42 LED segments in each headlamp are pointing at them and
switches just those off, leaving full beam everywhere else. The dark corridor it
carves travels with the other car.

**Night View Assist.** An infrared sensor sees heat out to 185 m, well past the
142 m the headlights reach. When it finds a person or an animal out there, the
segments aimed at it are flashed as a warning and the hazard is bracketed.

Untick either box to see what the system is really doing: with masking off the
oncoming driver is dazzled, and with Night View Assist off the deer stays
invisible until it is nearly too late.

The sensors read the road again every frame, so the beam is corrected
continuously. That returning measurement is the **feedback** that makes these
control systems rather than monitoring ones.

## The model

`assets/models/car.glb` &mdash; **Mercedes-Benz S 580 Maybach (W223)** by
*GT Cars: Hyperspeed*, CC Attribution 4.0, 293k triangles, full interior.
<https://sketchfab.com/3d-models/mercedes-benz-s-580-maybach-w223-6125a32ee10048ca96eee0c28b9c8b6c>

The Sketchfab download is 16 files (`scene.gltf` + a 15 MB `scene.bin` + PNG
textures). It is repackaged into a single `.glb`, which is a **lossless**
container change &mdash; no geometry and no texture data is altered:

```bash
npx @gltf-transform/cli copy scene.gltf car.glb
```

Verified by rendering both and comparing: **100.00% of pixels identical, maximum
channel difference 0.**

### Why it is not compressed further

Lossy compression was tried and rejected. Measured against a render of the
original, at the same camera:

| Build | Over the wire | Pixels identical |
|---|---|---|
| Lossless single `.glb` (shipped) | 9.6 MB | **100.00%** |
| meshopt geometry, PNG textures kept | 4.4 MB | 94.68% |
| meshopt + lossy WebP textures | 1.8 MB | 90.06% |

The small builds are visibly different &mdash; the lighting and interior change.
Looking exactly like the original was the requirement, so the lossless build is
shipped and the first load is around 9.6 MB. The loading bar exists because of
this.

The model download is kicked off by a small inline script in `index.html`
rather than waiting for `main.js`. Otherwise the 9.6 MB download cannot start
until the 1.3 MB three.js module graph has been fetched and parsed; starting it
during HTML parse runs the two in parallel. `main.js` reuses that in-flight
response, so the file is still only requested once.

If a faster load ever matters more than being pixel-perfect, the middle row is
the best trade:

```bash
npx @gltf-transform/cli meshopt scene.gltf car.glb
```

Then set `EXPECTED_BYTES` in `assets/js/main.js` to the new file size so the
loading bar stays accurate.

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
