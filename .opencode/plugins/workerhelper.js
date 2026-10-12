import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Plugin } from '@opencode/plugin';

// OpenCode V2 plugin (Plugin.define + setup(ctx)).
// V1 of this file returned a hooks object with `config` and
// `experimental.chat.messages.transform`; V2 does not run that shape.
// Migration reference: https://opencode.ai/v2/docs/build/plugins/migrate-v1

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '../..');
const skillsDir = path.join(pkgRoot, 'skills');

const parseFrontmatter = (content) => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return {};
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (kv && !(kv[1] in meta)) meta[kv[1]] = kv[2].trim();
  }
  return meta;
};

const listSkills = () => {
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const skillPath = path.join(skillsDir, e.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) return null;
      const content = fs.readFileSync(skillPath, 'utf8');
      const meta = parseFrontmatter(content);
      return {
        id: e.name,
        name: meta.name || e.name,
        description: meta.description || '',
        path: skillPath,
        content,
      };
    })
    .filter(Boolean);
};

const loadBootstrap = () => {
  const skillPath = path.join(skillsDir, 'using-workerhelper', 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;
  const content = fs.readFileSync(skillPath, 'utf8');
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  return `<WORKERHELPER_IMPORTANT>
WorkerHelper workflow has been loaded.

**IMPORTANT: The content below has been loaded. Do NOT use the skill tool to load "using-workerhelper" again.**

${body}
</WORKERHELPER_IMPORTANT>`;
};

export default Plugin.define({
  id: 'workerhelper',
  async setup(ctx) {
    // Register every bundled skill with the skill registry.
    const skills = listSkills();
    if (skills.length > 0) {
      await ctx.skill.transform((editor) => {
        for (const skill of skills) editor.add(skill);
      });
    }

    // Inject the workflow bootstrap into each model request's system context.
    // The per-request event is fresh, so this cannot accumulate; the guard
    // covers transformed/replayed requests that already carry the marker.
    const bootstrap = loadBootstrap();
    if (bootstrap) {
      await ctx.session.hook('context', (event) => {
        if (!event.system) return;
        if (event.system.some((part) => part?.text?.includes('WORKERHELPER_IMPORTANT'))) return;
        event.system.push({ type: 'text', text: bootstrap });
      });
    }
  },
});
