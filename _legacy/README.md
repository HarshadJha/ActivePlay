# ActivePlay — Local Run & Camera Test

This project uses MediaPipe Pose and the webcam to drive a simple game.

## Quick test (recommended)

1. Open a terminal in the project directory (the folder containing `index.html`).

2. Start a local server (this is needed because camera access normally requires a secure context; `localhost` is considered secure):

```powershell
# From the project directory on Windows PowerShell
python -m http.server 8000
# or, if `python` points to Python 2 on your system, try:
py -m http.server 8000
```

3. Open your browser and go to:

```
http://localhost:8000/
```

4. Click the `Start Camera` button on the page. Allow the browser to access your camera when prompted.

5. The status message under the game will show whether the webcam started.

## Notes & troubleshooting

- If the camera doesn't start and you see an error about permissions or secure context, make sure:
  - You served the page via `http://localhost` (not `file://`).
  - Your browser allows camera permissions for the page.
  - No extension or OS policy is blocking camera access.

- Supported browsers: recent Chrome, Edge, Firefox. Safari on some versions may behave differently.

If anything fails, copy the status text and any console errors and I can help debug further.
