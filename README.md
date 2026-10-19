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
| `index.html` | **Monitor or control?** &mdash; the home page: click the eight numbered sensors on the car, read how each one works, then classify it |
| `model.html` | the car on its own, with a cutaway slider |
| `sensors.html` | a redirect, kept so old links to the quiz still work |

## The three steps

`assets/js/guide.js` runs a small guide at the top of the left-hand column.
It is the order the page wants to be used in, and it ticks itself off:

1. **Read** &mdash; open *Control systems* and *Monitor systems*. Until both are
   open, those two buttons wear a pulsing ring.
2. **Drag** &mdash; a press on the canvas that travels more than 28 px. A click on
   a hotspot and a wheel zoom both leave the camera alone, so neither counts.
3. **Quiz** &mdash; classify all eight sensors. While this is the current step the
   progress panel is ringed.

Nothing is locked. Doing the steps out of order just ticks them off out of
order, and the line under the list always names the step you are on.

The **drag me** hint is not one of the cues: nothing about the canvas says it
can be spun, so a finger swipes over the car until the first touch of it, which
retires the hint for good. It is placed on the car rather than in the middle of
the window, and kept out of the panels' box &mdash; beside the column on a
desktop, below it on a phone.

The hint waits for the model, since the loading panel covers the canvas until
then.

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
textures). What ships is a single compressed `.glb`, built from it like this:

```bash
GT="npx @gltf-transform/cli"
$GT prune scene.gltf p1.glb --keep-attributes false --keep-solid-textures true
$GT dedup   p1.glb p2.glb      # merge identical accessors and materials
$GT weld    p2.glb p3.glb      # merge duplicate vertices
$GT webp    p3.glb p4.glb --lossless true
$GT meshopt p4.glb car.glb
```

Then set `window.__modelBytes` in `assets/js/preload.js` to the new file size,
or the loading bar lies.

### What each step buys, and what it costs

The weight was never the textures &mdash; all fourteen of them come to 2.7 MB,
at most 1024&times;1024. It was geometry: 270k vertices carrying float32
positions, normals, tangents and **three** UV sets, most of which no material
ever reads. So the big win is lossless: `prune --keep-attributes false` throws
away the attributes nothing uses.

| Build | Over the wire (gzip) | Load on a 5 Mbit line |
|---|---|---|
| Lossless single `.glb` (was shipped) | 9.16 MB | ~15 s |
| meshopt only | 4.16 MB | ~7 s |
| **prune + dedup + weld + meshopt + lossless WebP (shipped)** | **2.88 MB** | **~4.6 s** |
| the same with WebP quality 92 | 2.03 MB | ~3.3 s |

`--lossless true` means the textures are **bit-identical** to the PNGs; WebP
just stores them better. Only the geometry is approximated, by meshopt's
quantisation. Rendered against the original at two cameras, 82% of pixels come
out bit-identical, 0.1% differ by more than 24/255, and the mean difference is
**0.63/255** &mdash; the changes are single-pixel shifts in highlights along
chrome and wheel spokes, and are not visible side by side.

Quality 92 WebP would take another 0.85 MB off, at the cost of touching the
texture data. It was not needed to make the page feel quick.

The model download is kicked off by a small inline script in `index.html`
rather than waiting for the module graph. Otherwise the download cannot start
until the 1.3 MB of three.js has been fetched and parsed; starting it during
HTML parse runs the two in parallel. `viewer.js` reuses that in-flight
response, so the file is still only requested once.

## Seeing inside

Several of the sensors you need to label live in the cabin &mdash; the temperature
sensor, the humidity sensor, the microphone and the seat pressure pad. Tick
**Cutaway** (bottom left) and drag the slider to slice the near side of the car
away, so the interior is visible and clickable. It works by clipping geometry,
so it needs no special preparation of the model.

Add `?cut=0.2` to the URL to open a view with the cutaway already on.

## Adjusting

Everything you are likely to change is at the top of `assets/js/viewer.js`:

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
assets/js/viewer.js     scene, lighting, camera, model loading
assets/models/car.glb   the model (replace this)
vendor/                 three.js r169 + loaders, vendored so there is no CDN
```
