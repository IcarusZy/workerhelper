import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '../..');
const cacheParent = path.resolve(pkgRoot, '../..');
const markerPath = path.join(cacheParent, '.workerhelper-version');

const REPO_COMMITS_API = 'https://api.github.com/repos/IcarusZy/workerhelper/commits/main';
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

const extractBody = (content) => {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1] : content;
};

let _bootstrapCache = undefined;

const loadBootstrap = () => {
  if (_bootstrapCache !== undefined) return;
  const skillPath = path.join(pkgRoot, 'skills', 'using-workerhelper', 'SKILL.md');
  if (!fs.existsSync(skillPath)) { _bootstrapCache = null; return; }
  const content = fs.readFileSync(skillPath, 'utf8');
  _bootstrapCache = `<WORKERHELPER_IMPORTANT>
WorkerHelper workflow has been loaded.

**IMPORTANT: The content below has been loaded. Do NOT use the skill tool to load "using-workerhelper" again.**

${extractBody(content)}
</WORKERHELPER_IMPORTANT>`;
};

loadBootstrap();

(async () => {
  try {
    let marker = {};
    try { marker = JSON.parse(fs.readFileSync(markerPath, 'utf8')); } catch {}
    if (marker.checked && Date.now() - marker.checked < UPDATE_CHECK_INTERVAL) return;

    const res = await fetch(REPO_COMMITS_API, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'workerhelper-plugin' },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return;
    const { sha } = await res.json();
    const prevSha = marker.commit;
    fs.writeFileSync(markerPath, JSON.stringify({ checked: Date.now(), commit: sha }));

    if (prevSha && prevSha !== sha) {
      try { fs.rmSync(pkgRoot, { recursive: true, force: true }); } catch {}
      try { fs.rmSync(path.join(cacheParent, 'package-lock.json'), { force: true }); } catch {}
    }
  } catch {}
})();

export const WorkerHelperPlugin = async () => {
  const skillsDir = path.join(pkgRoot, 'skills');

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = _bootstrapCache;
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('WORKERHELPER_IMPORTANT'))) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    },
  };
};
