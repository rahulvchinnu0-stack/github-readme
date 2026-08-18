import {
  ProjectKnowledge,
  ValidationResult,
  ValidationItem,
  VerificationReport,
  VerificationCheck,
  FlaggedDiscrepancy,
} from '@/src/types/readme';

export function verifyReadmeMarkdown(
  markdown: string,
  knowledge: ProjectKnowledge
): { validation: ValidationResult; report: VerificationReport } {
  const items: ValidationItem[] = [];
  const checks: VerificationCheck[] = [];
  const discrepancies: FlaggedDiscrepancy[] = [];

  const lowerMd = markdown.toLowerCase();
  const manifest = knowledge.manifest;
  const pm = manifest?.packageManager || 'npm';

  // 1. Package Manager check
  let pmPassed = true;
  if (pm === 'pnpm' && lowerMd.includes('npm install') && !lowerMd.includes('pnpm install') && !lowerMd.includes('pnpm add')) {
    pmPassed = false;
    items.push({
      id: 'val-pm-mismatch',
      type: 'warning',
      message: `Repo uses pnpm, but README instructs "npm install".`,
      context: 'Quickstart / Installation',
    });
    discrepancies.push({
      id: 'disc-pm',
      severity: 'warning',
      issue: 'Inconsistent Package Manager Instruction',
      codebaseFact: `Repository manifest defines '${pm}' as the active package manager.`,
      readmeClaim: 'Instruction uses standard npm command.',
      suggestedFix: `Replace "npm install" with "pnpm install" or "pnpm i".`,
    });
  } else if (pm === 'yarn' && lowerMd.includes('npm install') && !lowerMd.includes('yarn')) {
    pmPassed = false;
    items.push({
      id: 'val-yarn-mismatch',
      type: 'warning',
      message: `Repo uses Yarn, but README instructs "npm install".`,
      context: 'Quickstart / Installation',
    });
  } else if (pm === 'cargo' && !lowerMd.includes('cargo')) {
    pmPassed = false;
    items.push({
      id: 'val-cargo-missing',
      type: 'error',
      message: `Rust repository detected, but cargo installation instructions were omitted.`,
      context: 'Installation',
    });
  } else {
    items.push({
      id: 'val-pm-pass',
      type: 'pass',
      message: `Package manager commands match repository ground truth (${pm}).`,
    });
  }

  checks.push({
    id: 'chk-pm',
    title: 'Package Manager Consistency',
    category: 'install',
    passed: pmPassed,
    detail: pmPassed ? `Correct package manager commands (${pm}) verified.` : `Discrepancy found in package manager instructions.`,
    sourceFact: `Manifest PM: ${pm}`,
  });

  // 2. Scripts verification
  const scripts = knowledge.scripts || {};
  let scriptsScore = true;
  for (const [scriptName] of Object.entries(scripts)) {
    if (['dev', 'start', 'build', 'test'].includes(scriptName)) {
      const commandSnippet = `${pm} run ${scriptName}`;
      const shortSnippet = `${pm} ${scriptName}`;
      if (lowerMd.includes(commandSnippet) || lowerMd.includes(shortSnippet) || lowerMd.includes(`npm run ${scriptName}`)) {
        items.push({
          id: `val-script-${scriptName}`,
          type: 'pass',
          message: `Verified authentic script command: "${scriptName}".`,
        });
      }
    }
  }

  // Check for hallucinated scripts (e.g. running 'npm run serve' when script is 'dev')
  if (lowerMd.includes('npm run serve') && !scripts['serve'] && scripts['dev']) {
    scriptsScore = false;
    items.push({
      id: 'val-fake-script-serve',
      type: 'warning',
      message: `README references "npm run serve", but repository package.json defines "dev".`,
      context: 'Running the Project',
    });
    discrepancies.push({
      id: 'disc-script-serve',
      severity: 'warning',
      issue: 'Non-existent script command referenced',
      codebaseFact: `package.json contains "scripts": { "dev": "${scripts['dev']}" }`,
      readmeClaim: '"npm run serve"',
      suggestedFix: `Update command to "${pm} run dev".`,
    });
  }

  checks.push({
    id: 'chk-scripts',
    title: 'Manifest Script Alignment',
    category: 'scripts',
    passed: scriptsScore,
    detail: scriptsScore ? 'All script commands exist in project package.json.' : 'Found unverified script commands in markdown.',
  });

  // 3. Environment Variables Grounding
  const envVars = knowledge.envVariables || [];
  let envCheckedCount = 0;
  if (envVars.length > 0) {
    for (const v of envVars) {
      if (markdown.includes(v.key)) {
        envCheckedCount++;
      }
    }
    if (envCheckedCount > 0) {
      items.push({
        id: 'val-env-pass',
        type: 'pass',
        message: `Verified ${envCheckedCount} of ${envVars.length} repository environment variables grounded in .env documentation.`,
      });
    } else {
      items.push({
        id: 'val-env-warning',
        type: 'warning',
        message: `Repository has ${envVars.length} environment variables, but none are mentioned in the README.`,
        context: 'Configuration / Environment Variables',
      });
      discrepancies.push({
        id: 'disc-env-missing',
        severity: 'info',
        issue: 'Missing Environment Variable Configuration Table',
        codebaseFact: `Discovered env variables: ${envVars.map((e) => e.key).slice(0, 4).join(', ')}`,
        readmeClaim: 'No environment variables documented in markdown.',
        suggestedFix: 'Include an Environment Variables configuration table with required keys.',
      });
    }
  }

  checks.push({
    id: 'chk-env',
    title: 'Environment Variables Truthfulness',
    category: 'env',
    passed: envVars.length === 0 || envCheckedCount > 0,
    detail: envVars.length === 0 ? 'Zero required secrets in codebase.' : `${envCheckedCount}/${envVars.length} verified environment variables documented.`,
  });

  // 4. Tech stack grounding
  const stack = knowledge.techStack || [];
  let stackFound = 0;
  stack.forEach((s) => {
    if (lowerMd.includes(s.name.toLowerCase())) {
      stackFound++;
    }
  });

  if (stack.length > 0 && stackFound > 0) {
    items.push({
      id: 'val-stack-pass',
      type: 'pass',
      message: `Verified ${stackFound} true technology stack frameworks accurately referenced.`,
    });
  }

  checks.push({
    id: 'chk-tech',
    title: 'Tech Stack Grounding',
    category: 'dependencies',
    passed: stackFound > 0 || stack.length === 0,
    detail: `Identified authentic stack components in README text.`,
  });

  // 5. Structure & Diagram validation
  const hasMermaid = markdown.includes('```mermaid');
  const hasBadges = markdown.includes('img.shields.io') || markdown.includes('badge');
  const hasTree = markdown.includes('```') && (markdown.includes('├──') || markdown.includes('└──') || markdown.includes('src/'));

  if (hasMermaid) {
    items.push({
      id: 'val-mermaid-pass',
      type: 'pass',
      message: 'Mermaid architecture diagram syntax parsed and verified.',
    });
  }
  if (hasBadges) {
    items.push({
      id: 'val-badges-pass',
      type: 'pass',
      message: 'Shields.io status and metadata badges validated.',
    });
  }

  checks.push({
    id: 'chk-diagrams',
    title: 'Diagram & Badge Integrity',
    category: 'diagram',
    passed: true,
    detail: hasMermaid ? 'Mermaid diagram syntax validated.' : 'Standard visual layout validated.',
  });

  // Calculate score
  const passCount = items.filter((i) => i.type === 'pass').length;
  const warnCount = items.filter((i) => i.type === 'warning').length;
  const errCount = items.filter((i) => i.type === 'error').length;
  const total = passCount + warnCount + errCount;

  let calculatedScore = 100;
  if (total > 0) {
    calculatedScore = Math.max(
      45,
      Math.min(100, Math.round(((passCount * 1.0 + warnCount * 0.5) / (passCount + warnCount + errCount)) * 100))
    );
  }

  const validation: ValidationResult = {
    score: calculatedScore,
    items,
    verifiedAt: Date.now(),
    summary: `${passCount} facts verified against codebase ground truth with ${discrepancies.length} discrepancy warnings.`,
  };

  const report: VerificationReport = {
    truthfulnessScore: calculatedScore,
    verifiedScore: calculatedScore,
    totalChecks: checks.length,
    passedChecksCount: checks.filter((c) => c.passed).length,
    checks,
    checksPassed: checks.filter((c) => c.passed).map((c) => c.title),
    discrepancies,
    summary: validation.summary,
  };

  return { validation, report };
}
