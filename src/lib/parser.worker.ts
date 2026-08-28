import { parseTimelineText } from './parse';
import type { WorkerResponse } from './types';

self.onmessage = async (event: MessageEvent<{ file: File }>) => {
  const file = event.data.file;
  const send = (message: WorkerResponse) => self.postMessage(message);
  try {
    send({ type: 'progress', progress: 5, message: 'Reading the local file…' });
    const reader = file.stream().getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let bytesRead = 0;
    let lastPercent = -1;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytesRead += value.byteLength;
      chunks.push(decoder.decode(value, { stream: true }));
      const percent = Math.round((bytesRead / Math.max(file.size, 1)) * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        send({ type: 'progress', progress: Math.min(40, 5 + Math.round(percent * .35)), message: `Reading the local file… ${percent}%` });
      }
    }
    chunks.push(decoder.decode());
    const text = chunks.join('');
    send({ type: 'progress', progress: 42, message: 'Checking JSON structure…' });
    send({ type: 'progress', progress: 65, message: 'Building the day ledger…' });
    const dataset = parseTimelineText(text, file.name);
    send({ type: 'progress', progress: 92, message: 'Preparing the saved timeline…' });
    send({ type: 'complete', dataset });
  } catch (error) {
    send({ type: 'error', message: error instanceof Error ? error.message : 'The file could not be read.' });
  }
};
