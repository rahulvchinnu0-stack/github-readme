import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeRepository } from './src/lib/github/parser';
import { generateReadmeWithAI, transformReadmeSectionWithAI } from './src/lib/ai/gemini';
import { generateReadmeWithNvidia, transformReadmeWithNvidia } from './src/lib/ai/nvidia';
import { generateGroundTruthReadme } from './src/lib/ai/fallbackGenerator';
import { commitReadmeToGitHub } from './src/lib/github/commit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 1. Analyze Repository endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { url, branch, token } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Repository URL or owner/repo is required.' });
    }

    const knowledge = await analyzeRepository(url, branch, token);
    res.json({ success: true, knowledge });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error analyzing repository:', msg);
    res.status(500).json({ error: msg });
  }
});

// 2. Generate README endpoint (NVIDIA Muse Glimmer 30B or Gemini or Ground-Truth)
app.post('/api/generate', async (req, res) => {
  try {
    const { knowledge, options, config } = req.body;
    if (!knowledge || !options) {
      return res.status(400).json({ error: 'Missing knowledge or options in request payload.' });
    }

    let markdown = '';
    const provider = config?.provider || 'nvidia';

    if (provider === 'nvidia' || config?.model?.startsWith('meta/')) {
      try {
        markdown = await generateReadmeWithNvidia(knowledge, options, config);
      } catch (nvidiaErr) {
        console.warn('NVIDIA API error, falling back to Gemini:', nvidiaErr);
        try {
          markdown = await generateReadmeWithAI(knowledge, options, {
            ...config,
            provider: 'gemini',
            model: 'gemini-2.5-flash',
          });
        } catch (geminiErr) {
          console.warn('Gemini API fallback error, using Ground-Truth synthesis:', geminiErr);
          markdown = generateGroundTruthReadme(knowledge, options);
        }
      }
    } else {
      try {
        markdown = await generateReadmeWithAI(knowledge, options, config);
      } catch (geminiErr) {
        console.warn('Gemini API error, using Ground-Truth synthesis:', geminiErr);
        markdown = generateGroundTruthReadme(knowledge, options);
      }
    }

    if (!markdown) {
      markdown = generateGroundTruthReadme(knowledge, options);
    }

    res.json({ success: true, markdown });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error generating README, utilizing Ground-Truth:', msg);
    const fallbackMd = req.body?.knowledge && req.body?.options
      ? generateGroundTruthReadme(req.body.knowledge, req.body.options)
      : '# README\n\nGenerated documentation.';
    res.json({ success: true, markdown: fallbackMd });
  }
});

// 3. Transform Section / Refactor endpoint
app.post('/api/transform', async (req, res) => {
  try {
    const { actionType, currentMarkdown, knowledge, config, customInstruction } = req.body;
    if (!currentMarkdown || !knowledge) {
      return res.status(400).json({ error: 'Missing currentMarkdown or knowledge.' });
    }

    let updatedMarkdown = '';
    const provider = config?.provider || 'nvidia';

    if (provider === 'nvidia' || config?.model?.startsWith('meta/')) {
      try {
        updatedMarkdown = await transformReadmeWithNvidia(
          actionType,
          currentMarkdown,
          knowledge,
          config,
          customInstruction
        );
      } catch (nvidiaErr) {
        console.warn('NVIDIA transform error, falling back to Gemini:', nvidiaErr);
        try {
          updatedMarkdown = await transformReadmeSectionWithAI(
            actionType,
            currentMarkdown,
            knowledge,
            { ...config, provider: 'gemini', model: 'gemini-2.5-flash' },
            customInstruction
          );
        } catch (geminiErr) {
          console.warn('Gemini transform error, applying deterministic section upgrade:', geminiErr);
        }
      }
    } else {
      try {
        updatedMarkdown = await transformReadmeSectionWithAI(
          actionType,
          currentMarkdown,
          knowledge,
          config,
          customInstruction
        );
      } catch (geminiErr) {
        console.warn('Gemini transform error, applying deterministic section upgrade:', geminiErr);
      }
    }

    if (!updatedMarkdown) {
      const pm = knowledge.manifest?.packageManager || 'npm';
      if (actionType === 'enhance-diagram') {
        const mermaidBlock = `\n\n## 🏗️ Architecture & Component Flow\n\n\`\`\`mermaid\nflowchart TD\n    A[Client / Web Browser] -->|HTTP / API| B[Application Gateway]\n    B -->|Services| C[Core Logic Engine]\n    C -->|State| D[(Persistent Data Store)]\n\`\`\`\n`;
        updatedMarkdown = currentMarkdown.includes('```mermaid')
          ? currentMarkdown.replace(/```mermaid[\s\S]*?```/, mermaidBlock.trim())
          : currentMarkdown + mermaidBlock;
      } else if (actionType === 'add-quickstart') {
        const quickstartBlock = `\n\n## ⚡ Quickstart Guide\n\n\`\`\`bash\n# Install verified dependencies\n${pm} install\n\n# Run development server\n${pm} run dev\n\`\`\`\n`;
        updatedMarkdown = currentMarkdown + quickstartBlock;
      } else if (actionType === 'add-troubleshooting') {
        const troubleshootBlock = `\n\n## 🔧 Troubleshooting & FAQ\n\n| Issue | Possible Cause | Resolution |\n| :--- | :--- | :--- |\n| \`Port 3000 in use\` | Another process is binding the port | Run with custom port or kill existing process |\n| \`Missing API Key\` | \`.env\` not loaded | Ensure \`cp .env.example .env\` and set keys |\n| \`Module Not Found\` | Stale node_modules cache | Run \`${pm} install\` |\n`;
        updatedMarkdown = currentMarkdown + troubleshootBlock;
      } else if (actionType === 'add-benchmarks') {
        const benchBlock = `\n\n## 📊 Performance & Feature Comparison\n\n| Feature | ${knowledge.project?.repo || 'This Project'} | Standard Solutions |\n| :--- | :--- | :--- |\n| **AST Grounding** | ✅ Real-time | ❌ Hallucinated |\n| **Package Manager** | \`${pm}\` | Generic |\n| **Mermaid Flowcharts** | ✅ Native | ❌ Plain text |\n`;
        updatedMarkdown = currentMarkdown + benchBlock;
      } else {
        updatedMarkdown = currentMarkdown + `\n\n<!-- Refactored: ${actionType} -->\n`;
      }
    }

    res.json({ success: true, markdown: updatedMarkdown });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error transforming section:', msg);
    res.json({ success: true, markdown: req.body?.currentMarkdown || '' });
  }
});

// 4. Commit to GitHub endpoint
app.post('/api/commit', async (req, res) => {
  try {
    const { owner, repo, branch, path: filePath, message, content, token, createNewBranch, newBranchName, author } = req.body;
    const result = await commitReadmeToGitHub({
      owner,
      repo,
      branch,
      path: filePath,
      message,
      content,
      token,
      createNewBranch,
      newBranchName,
      author,
    });
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error committing to GitHub:', msg);
    res.status(500).json({ success: false, error: msg });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Dev server or static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
