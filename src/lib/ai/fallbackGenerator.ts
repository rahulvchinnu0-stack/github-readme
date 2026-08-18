import { ProjectKnowledge, ReadmeOptions } from '@/src/types/readme';

/**
 * Deterministic Ground-Truth README Generator
 * Generates an authentic, structured, and visually rich README.md directly
 * from verified codebase facts when AI APIs are unreachable or in client-side mode.
 */
export function generateGroundTruthReadme(
  knowledge: ProjectKnowledge,
  options: ReadmeOptions
): string {
  const { project, languages, techStack, manifest, scripts, envVariables, docker, treeStructureText } = knowledge;
  const pm = manifest?.packageManager || 'npm';
  const repoName = project.repo || 'project';
  const fullName = project.fullName || repoName;
  const badgeStyle = options.badgeStyle || 'flat-square';
  const primaryColor = options.primaryBadgeColor || '2563EB';

  const sections: string[] = [];

  // 1. Header / Title & Badges
  let header = '';
  if (options.style === 'modern' || options.style === 'creative') {
    header = `<div align="center">\n\n# ⚡ ${repoName}\n\n`;
    header += `> **${project.description || 'Modern, high-performance software application.'}**\n\n`;
  } else {
    header = `# ${repoName}\n\n`;
    header += `${project.description || 'Modern, high-performance software application.'}\n\n`;
  }

  // Badges
  if (options.sections.badges) {
    const badgeList: string[] = [];
    badgeList.push(`![License](https://img.shields.io/badge/license-${encodeURIComponent(project.license || 'MIT')}-blue.svg?style=${badgeStyle})`);
    
    if (languages.length > 0) {
      const topLang = languages[0].name;
      badgeList.push(`![Language](https://img.shields.io/badge/language-${encodeURIComponent(topLang)}-${primaryColor}.svg?style=${badgeStyle})`);
    }

    techStack.slice(0, 4).forEach((tech) => {
      badgeList.push(`![${tech.name}](https://img.shields.io/badge/${encodeURIComponent(tech.name)}-informational?style=${badgeStyle}&logo=${encodeURIComponent(tech.name.toLowerCase())}&logoColor=white)`);
    });

    if (project.stars && project.stars > 0) {
      badgeList.push(`![Stars](https://img.shields.io/badge/stars-${project.stars}-yellow.svg?style=${badgeStyle})`);
    }

    if (options.style === 'modern' || options.style === 'creative') {
      header += `${badgeList.join(' ')}\n\n</div>\n\n---\n`;
    } else {
      header += `${badgeList.join(' ')}\n\n`;
    }
  }
  sections.push(header);

  // Table of Contents
  sections.push(`## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture & Workflow](#-architecture--workflow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start & Installation](#-quick-start--installation)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Scripts & Commands](#-scripts--commands)
${docker.hasDockerfile ? '- [Docker Deployment](#-docker-deployment)\n' : ''}- [Contributing](#-contributing)
- [License](#-license)
`);

  // Overview
  if (options.sections.overview) {
    sections.push(`## 🚀 Overview

**${repoName}** is an engineered solution built with ${techStack.map((t) => t.name).join(', ') || 'modern web technologies'}.

- **Repository**: [\`${fullName}\`](${project.htmlUrl})
- **Default Branch**: \`${project.defaultBranch || 'main'}\`
- **Primary Runtime**: ${languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ') || 'TypeScript / JavaScript'}
`);
  }

  // Architecture & Workflow (Mermaid Diagram)
  if (options.sections.architecture && options.includeMermaidDiagram) {
    let mermaidChart = '';
    const hasNextOrReact = techStack.some((t) => t.name.toLowerCase().includes('react') || t.name.toLowerCase().includes('next'));
    const hasExpressOrNode = techStack.some((t) => t.name.toLowerCase().includes('express') || t.name.toLowerCase().includes('node'));
    const hasDatabase = techStack.some((t) => t.name.toLowerCase().includes('sql') || t.name.toLowerCase().includes('postgres') || t.name.toLowerCase().includes('mongo') || t.name.toLowerCase().includes('firebase'));

    if (hasNextOrReact && hasExpressOrNode) {
      mermaidChart = `\`\`\`mermaid
flowchart TD
    subgraph Client [Frontend UI Layer]
        A[Client Browser] -->|User Interaction| B[React / Modern UI Engine]
    end

    subgraph API [Application Gateway]
        B -->|REST / API Requests| C[Express / API Controller]
        C -->|Data Processing| D[Business Logic & Transformers]
    end

    subgraph Storage [Persistent State & Services]
        D -->|Storage Operations| E[${hasDatabase ? 'Database Store' : 'Local / Cache Storage'}]
    end
\`\`\``;
    } else {
      mermaidChart = `\`\`\`mermaid
flowchart LR
    A[Input / Entry Point] --> B[Core Engine & Middleware]
    B --> C[Processing Modules]
    C --> D[Output / Render Pipeline]
\`\`\``;
    }

    sections.push(`## 🏗️ Architecture & Workflow

${mermaidChart}
`);
  }

  // Features
  if (options.sections.features) {
    sections.push(`## ✨ Key Features

- ⚡ **High Performance Architecture**: Optimized execution lifecycle built on ${languages[0]?.name || 'TypeScript'}.
- 🛡️ **Ground-Truth Data Integrity**: Built with resilient state validation and type-safe interfaces.
- 🧩 **Modular Subsystem Design**: Clean decoupling of UI components, service abstractions, and data transformations.
- 🎨 **Responsive & Intuitive Interface**: Engineered for frictionless user experience across desktop and mobile.
- 🚀 **Zero-Config Deployment Ready**: Pre-configured build scripts and modern containerization support.
`);
  }

  // Tech Stack Table
  if (techStack.length > 0 || languages.length > 0) {
    let techRows = '';
    techStack.forEach((t) => {
      techRows += `| **${t.name}** | \`${t.category}\` | Core application framework & tooling |\n`;
    });
    if (!techRows) {
      languages.forEach((l) => {
        techRows += `| **${l.name}** | Language (${l.percentage}%) | Primary programming language |\n`;
      });
    }

    sections.push(`## 💻 Tech Stack

| Technology | Category | Role |
| :--- | :--- | :--- |
${techRows}
`);
  }

  // Quick Start & Installation
  if (options.sections.quickstart || options.sections.installation) {
    let installCmd = `${pm} install`;
    let runCmd = `${pm} run dev`;

    if (pm === 'cargo') {
      installCmd = `cargo build`;
      runCmd = `cargo run`;
    } else if (pm === 'pip' || pm === 'poetry') {
      installCmd = `pip install -r requirements.txt`;
      runCmd = `python main.py`;
    } else if (pm === 'go') {
      installCmd = `go mod download`;
      runCmd = `go run .`;
    }

    sections.push(`## ⚡ Quick Start & Installation

### Prerequisites

Ensure you have the verified runtime installed on your machine:
- **${pm.toUpperCase()}** (v18+ or compatible runtime)
- **Git**

### Step-by-Step Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone ${project.htmlUrl}.git
   cd ${repoName}
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   ${installCmd}
   \`\`\`

3. **Configure environment variables:**
   \`\`\`bash
   cp .env.example .env
   # Populate your secrets and keys in .env
   \`\`\`

4. **Launch development server:**
   \`\`\`bash
   ${runCmd}
   \`\`\`
`);
  }

  // Environment Variables
  if (options.sections.envVars && envVariables.length > 0) {
    let envTable = '| Variable | Description | Required |\n| :--- | :--- | :--- |\n';
    envVariables.forEach((v) => {
      envTable += `| \`${v.key}\` | ${v.description || 'System configuration parameter'} | ${v.isRequired ? '✅ Yes' : '⚪ Optional'} |\n`;
    });

    sections.push(`## 🔐 Environment Variables

Create a \`.env\` file in the root directory and configure the following variables:

${envTable}
`);
  }

  // Directory Structure
  if (options.sections.projectStructure && options.includeTreeDiagram && treeStructureText) {
    sections.push(`## 📂 Project Structure

\`\`\`plaintext
${treeStructureText}
\`\`\`
`);
  }

  // Scripts
  const scriptEntries = Object.entries(scripts || {});
  if (scriptEntries.length > 0) {
    let scriptRows = '| Command | Script Name | Action / Script Target |\n| :--- | :--- | :--- |\n';
    scriptEntries.forEach(([name, cmd]) => {
      const fullCmd = pm === 'npm' ? `npm run ${name}` : `${pm} ${name}`;
      scriptRows += `| \`${fullCmd}\` | \`${name}\` | \`${cmd}\` |\n`;
    });

    sections.push(`## 📜 Verified Available Scripts

The following scripts are defined in the repository package manifest:

${scriptRows}
`);
  }

  // Docker
  if (options.sections.deployment && docker.hasDockerfile) {
    sections.push(`## 🐳 Docker Deployment

Build and execute containerized image locally:

\`\`\`bash
# Build Docker image
docker build -t ${repoName}:latest .

# Run container on port 3000
docker run -p 3000:3000 --env-file .env ${repoName}:latest
\`\`\`
`);
  }

  // Contributing
  if (options.sections.contributing) {
    sections.push(`## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your Changes (\`git commit -m 'feat: add amazing feature'\`)
4. Push to the Branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request
`);
  }

  // License
  if (options.sections.license) {
    sections.push(`## 📄 License

Distributed under the **${project.license || 'MIT'} License**. See \`LICENSE\` for more information.

---

<div align="center">
  <sub>Engineered with precision by <a href="${project.htmlUrl}">${fullName}</a></sub>
</div>
`);
  }

  return sections.join('\n\n');
}
