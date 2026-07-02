interface DownloadMessage {
  type: 'download';
  urls: string[];
  cacheName: string;
}

interface CancelMessage {
  type: 'cancel';
}

interface ProgressMessage {
  type: 'progress';
  current: number;
  total: number;
  percent: number;
}

interface CompleteMessage {
  type: 'complete';
  failed: string[];
}

interface ErrorMessage {
  type: 'error';
  message: string;
}

type WorkerMessage = DownloadMessage | CancelMessage;
type WorkerResponse = ProgressMessage | CompleteMessage | ErrorMessage;

let isCancelled = false;

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'cancel') {
    isCancelled = true;
    return;
  }

  if (e.data.type === 'download') {
    const { urls, cacheName } = e.data;
    isCancelled = false;
    const failed: string[] = [];
    const cache = await caches.open(cacheName);

    for (let i = 0; i < urls.length; i++) {
      if (isCancelled) {
        self.postMessage({ type: 'error', message: 'Descarga cancelada' } satisfies WorkerResponse);
        return;
      }

      try {
        const cached = await cache.match(urls[i]);
        if (cached) continue;

        const response = await fetch(urls[i]);
        if (response.ok) {
          await cache.put(urls[i], response.clone());
        } else {
          failed.push(urls[i]);
        }
      } catch {
        failed.push(urls[i]);
      }

      self.postMessage({
        type: 'progress',
        current: i + 1,
        total: urls.length,
        percent: Math.round(((i + 1) / urls.length) * 100),
      } satisfies WorkerResponse);
    }

    self.postMessage({ type: 'complete', failed } satisfies WorkerResponse);
  }
};
