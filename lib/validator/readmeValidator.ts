import {
  ProjectKnowledge,
  ValidationIssue,
  ValidationResult,
  ValidationStats,
} from '@/types/readme';

export class ReadmeValidator {
  /**
   * Validates markdown content against the verified repository knowledge
   */
  static validate(markdown: string, knowledge: ProjectKnowledge): ValidationResult {
    const issues: ValidationIssue[] = [];
    const lowerMarkdown = markdown.toLowerCase();

    // 1. Check Environment Variables
    const totalEnvVars = knowledge.environment_variables.length;
    let documentedEnvVars = 0;
    for (const envVar of knowledge.environment_variables) {
      if (markdown.includes(envVar.name)) {
        documentedEnvVars++;
      } else {
        issues.push({
          id: `missing-env-${envVar.name}`,
          type: 'warning',
          title: `Undocumented Environment Variable: \`${envVar.name}\``,
          description: `\`${envVar.name}\` is referenced in \`${envVar.sourceFile}\` but is missing in the README.`,
          fixSuggestion: `Add \`${envVar.name}\` to the Environment Variables configuration table.`,
          section: 'Environment Variables',
        });
      }
    }

    // 2. Check Scripts / Run Commands
    const totalScripts = knowledge.scripts.length;
    let documentedScripts = 0;
    for (const script of knowledge.scripts) {
      if (markdown.includes(script.command) || markdown.includes(script.name)) {
        documentedScripts++;
      }
    }

    if (totalScripts > 0 && documentedScripts === 0) {
      issues.push({
        id: 'no-scripts-documented',
        type: 'warning',
        title: 'Missing Runnable Scripts',
        description: 'Verified repository scripts (such as start, dev, build) were not found in the markdown.',
        fixSuggestion: `Include commands like \`${knowledge.scripts[0]?.command}\` in the Quickstart section.`,
        section: 'Installation & Usage',
      });
    } else if (documentedScripts > 0) {
      issues.push({
        id: 'scripts-verified',
        type: 'success',
        title: 'Runnable Commands Verified',
        description: `${documentedScripts} of ${totalScripts} verified repository scripts match the codebase.`,
      });
    }

    // 3. Check Tech Stack & Framework Accuracy
    const totalTech = knowledge.frameworks.length;
    let documentedTech = 0;
    for (const fw of knowledge.frameworks) {
      if (lowerMarkdown.includes(fw.name.toLowerCase())) {
        documentedTech++;
      }
    }

    // 4. Hallucination checks: Look for unverified database or auth claims
    let hallucinationHits = 0;
    const commonDbs = ['postgresql', 'postgres', 'mongodb', 'mysql', 'sqlite', 'redis', 'dynamodb', 'cassandra'];
    for (const dbName of commonDbs) {
      if (lowerMarkdown.includes(dbName)) {
        const verified = knowledge.database.some((d) => d.type.toLowerCase().includes(dbName));
        if (!verified) {
          hallucinationHits++;
          issues.push({
            id: `unverified-db-${dbName}`,
            type: 'error',
            title: `Potential Phantom Database Claim: "${dbName}"`,
            description: `The README mentions "${dbName}", but no corresponding database configuration or driver was found in the repository.`,
            fixSuggestion: `Remove reference to ${dbName} or clarify that it is optional/external.`,
            section: 'Database / Stack',
          });
        }
      }
    }

    const commonAuths = ['clerk', 'nextauth', 'supabase auth', 'auth0', 'firebase auth'];
    for (const authName of commonAuths) {
      if (lowerMarkdown.includes(authName)) {
        const verified = knowledge.authentication.some((a) => a.provider.toLowerCase().includes(authName));
        if (!verified) {
          hallucinationHits++;
          issues.push({
            id: `unverified-auth-${authName}`,
            type: 'error',
            title: `Potential Phantom Auth Claim: "${authName}"`,
            description: `The README mentions "${authName}", but no authenticating library was detected in repository manifests.`,
            fixSuggestion: `Remove reference to ${authName} or verify its source package.`,
            section: 'Authentication',
          });
        }
      }
    }

    // 5. Structure & Visual Quality Analysis
    const lines = markdown.split('\n');
    const headings = lines.filter((l) => /^#{1,6}\s/.test(l));
    const codeBlocks = (markdown.match(/```[a-z0-9_-]*/gi) || []).length / 2;
    const badgeCount = (markdown.match(/!\[.*?\]\(https:\/\/(?:img\.shields\.io|badge\.fury\.io).*?\)/g) || []).length;
    const words = markdown.trim().split(/\s+/).length;

    let hasInstallGuide = lowerMarkdown.includes('install') || lowerMarkdown.includes('getting started') || lowerMarkdown.includes('quick start') || lowerMarkdown.includes('setup');
    let hasLicenseSection = lowerMarkdown.includes('license');

    if (!hasInstallGuide) {
      issues.push({
        id: 'missing-install',
        type: 'error',
        title: 'Missing Installation Guide',
        description: 'No Installation or Quickstart section detected. Developers need clear setup steps.',
        fixSuggestion: 'Add an ## Installation section with clone and run commands.',
        section: 'Installation',
      });
    }

    if (knowledge.license && !hasLicenseSection) {
      issues.push({
        id: 'missing-license',
        type: 'warning',
        title: `License Section Missing (${knowledge.license.name})`,
        description: `Repository is licensed under ${knowledge.license.name} but does not have a license statement.`,
        fixSuggestion: `Add a ## License section specifying ${knowledge.license.name}.`,
        section: 'License',
      });
    }

    // Code block quality
    const unannotatedBlocks = (markdown.match(/```\s*\n/g) || []).length;
    if (unannotatedBlocks > 0) {
      issues.push({
        id: 'unannotated-code-blocks',
        type: 'info',
        title: 'Unannotated Code Blocks',
        description: `${unannotatedBlocks} code blocks lack language tags (e.g. \`\`\`bash, \`\`\`json).`,
        fixSuggestion: 'Add language identifiers after triple backticks for syntax highlighting.',
      });
    }

    // Compute Scores
    // Technical Accuracy
    let techAccuracy = 100 - hallucinationHits * 18;
    techAccuracy = Math.max(10, Math.min(100, techAccuracy));

    // Documentation Coverage
    const envCoverageRatio = totalEnvVars > 0 ? documentedEnvVars / totalEnvVars : 1;
    const scriptCoverageRatio = totalScripts > 0 ? Math.min(1, documentedScripts / Math.min(totalScripts, 3)) : 1;
    const techCoverageRatio = totalTech > 0 ? documentedTech / totalTech : 1;
    let docCoverage = Math.round((envCoverageRatio * 0.35 + scriptCoverageRatio * 0.35 + techCoverageRatio * 0.3) * 100);
    docCoverage = Math.max(30, Math.min(100, docCoverage));

    // Installation Accuracy
    let installAccuracy = hasInstallGuide ? 95 : 20;
    if (documentedScripts > 0) installAccuracy = 98;

    // Visual Quality
    let visualQuality = 70;
    if (headings.length >= 4) visualQuality += 10;
    if (badgeCount > 0) visualQuality += 10;
    if (markdown.includes('| ---')) visualQuality += 10; // Tables present
    visualQuality = Math.min(100, visualQuality);

    // Hallucination Risk
    let hallucinationRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (hallucinationHits >= 2) hallucinationRisk = 'High';
    else if (hallucinationHits === 1 || techAccuracy < 80) hallucinationRisk = 'Medium';

    // Overall Score
    const overallScore = Math.round(
      techAccuracy * 0.35 + docCoverage * 0.3 + installAccuracy * 0.2 + visualQuality * 0.15
    );

    const stats: ValidationStats = {
      documentedEnvVars,
      totalEnvVars,
      documentedScripts,
      totalScripts,
      documentedTech,
      totalTech,
      hasInstallGuide,
      hasLicenseSection,
      hasValidLinks: true,
      wordCount: words,
      headingCount: headings.length,
      codeBlockCount: Math.floor(codeBlocks),
      badgeCount,
    };

    return {
      overallScore,
      scores: {
        technicalAccuracy: techAccuracy,
        documentationCoverage: docCoverage,
        installationAccuracy: installAccuracy,
        visualQuality,
        hallucinationRisk,
      },
      issues,
      stats,
    };
  }
}
