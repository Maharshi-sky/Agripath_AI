/**
 * File delivery that works in both targets:
 *  - inside the claude.ai artifact viewer: the `downloads` capability (viewer confirms each save)
 *  - standalone deployment: a normal Blob download
 */
type DownloadsNS = { save: (r: { filename: string; data: Blob | string }) => Promise<{ status: string }> };
type ClaudeHost = { use?: (n: string) => Promise<unknown> };

const host = (): ClaudeHost | undefined => (window as unknown as { claude?: ClaudeHost }).claude;

/** True when the page runs inside the artifact viewer (printing is unavailable there). */
export const inArtifactViewer = () => typeof host()?.use === 'function';

let dl: Promise<DownloadsNS | null> | null = null;
const downloads = () => {
  if (!dl) dl = inArtifactViewer() ? (host()!.use!('downloads') as Promise<DownloadsNS | null>).catch(() => null) : Promise.resolve(null);
  return dl;
};

export type SaveOutcome = 'saved' | 'declined' | 'unavailable';

export async function saveFile(filename: string, data: Blob | string, mime = 'application/octet-stream'): Promise<SaveOutcome> {
  if (inArtifactViewer()) {
    const ns = await downloads();
    if (!ns) return 'unavailable';
    try {
      await ns.save({ filename, data });
      return 'saved';
    } catch (e) {
      const code = (e as { code?: string })?.code;
      return code === 'declined' ? 'declined' : 'unavailable';
    }
  }
  const blob = typeof data === 'string' ? new Blob([data], { type: mime }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'saved';
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
