// Utility to extract transparent piece sprites directly from the user's uploaded 2000s Fritz chess image

const PIECE_COORDINATES: Record<string, { col: number; row: number; bg: 'light' | 'dark' }> = {
  // Black pieces (row 0 - 2)
  b_r: { col: 0, row: 0, bg: 'light' }, // a8
  b_q: { col: 3, row: 0, bg: 'light' }, // d8
  b_k: { col: 4, row: 0, bg: 'dark' },  // e8
  b_b: { col: 5, row: 0, bg: 'light' }, // f8
  b_n: { col: 1, row: 2, bg: 'light' }, // b6
  b_p: { col: 1, row: 1, bg: 'light' }, // b7

  // White pieces (row 5 - 7)
  w_r: { col: 7, row: 7, bg: 'light' }, // h1
  w_q: { col: 3, row: 6, bg: 'light' }, // d2
  w_k: { col: 2, row: 7, bg: 'dark' },  // c1
  w_b: { col: 4, row: 5, bg: 'dark' },  // e3
  w_n: { col: 5, row: 5, bg: 'light' }, // f3
  w_p: { col: 0, row: 6, bg: 'light' }, // a2
};

let cachedSprites: Record<string, string> | null = null;
let loadPromise: Promise<Record<string, string>> | null = null;

export function loadRetroPieceSprites(): Promise<Record<string, string>> {
  if (cachedSprites) {
    return Promise.resolve(cachedSprites);
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/assets/aistudio/image_e04436da.png';

    img.onload = () => {
      try {
        const sprites: Record<string, string> = {};
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve({});
          return;
        }

        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = img.width;
        sourceCanvas.height = img.height;
        const sCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
        if (!sCtx) {
          resolve({});
          return;
        }
        sCtx.drawImage(img, 0, 0);

        for (const [pieceKey, coord] of Object.entries(PIECE_COORDINATES)) {
          ctx.clearRect(0, 0, 32, 32);

          // Grid coordinates: 1px border offset, 32px per square
          const sx = 1 + coord.col * 32;
          const sy = 1 + coord.row * 32;

          ctx.drawImage(sourceCanvas, sx, sy, 32, 32, 0, 0, 32, 32);

          const imgData = ctx.getImageData(0, 0, 32, 32);
          const data = imgData.data;

          // Corner sample (0,0) gives the background square color
          const bgR = data[0];
          const bgG = data[1];
          const bgB = data[2];

          // Edge flood-fill or chromakey of background color
          // We mark visited pixels connected to outer boundary with similar color
          const visited = new Uint8Array(32 * 32);
          const queue: [number, number][] = [];

          // Push 4 border edges into queue
          for (let x = 0; x < 32; x++) {
            queue.push([x, 0]);
            queue.push([x, 31]);
          }
          for (let y = 1; y < 31; y++) {
            queue.push([0, y]);
            queue.push([31, y]);
          }

          while (queue.length > 0) {
            const [qx, qy] = queue.pop()!;
            const idx = qy * 32 + qx;
            if (visited[idx]) continue;
            visited[idx] = 1;

            const pIdx = idx * 4;
            const r = data[pIdx];
            const g = data[pIdx + 1];
            const b = data[pIdx + 2];

            // Color distance to background sample
            const dist = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);

            // If it's the background square color
            if (dist < 45) {
              data[pIdx + 3] = 0; // make transparent

              // Propagate to 4 neighbors
              if (qx > 0 && !visited[idx - 1]) queue.push([qx - 1, qy]);
              if (qx < 31 && !visited[idx + 1]) queue.push([qx + 1, qy]);
              if (qy > 0 && !visited[idx - 32]) queue.push([qx, qy - 1]);
              if (qy < 31 && !visited[idx + 32]) queue.push([qx, qy + 1]);
            }
          }

          ctx.putImageData(imgData, 0, 0);
          sprites[pieceKey] = canvas.toDataURL('image/png');
        }

        cachedSprites = sprites;
        resolve(sprites);
      } catch (err) {
        console.error('Error slicing sprites:', err);
        resolve({});
      }
    };

    img.onerror = () => {
      resolve({});
    };
  });

  return loadPromise;
}
