import { ProjectKnowledge } from '@/src/types/readme';

export type SocialCardTheme =
  | 'obsidian'
  | 'cyberpunk'
  | 'aurora'
  | 'emerald'
  | 'minimal'
  | 'terminal'
  | 'bento';

export type SocialCardAspectRatio = 'og' | 'banner' | 'square';

export interface SocialCardConfig {
  title: string;
  subtitle: string;
  summary: string;
  theme: SocialCardTheme;
  aspectRatio: SocialCardAspectRatio;
  tags: string[];
  owner: string;
  authorAvatarUrl?: string;
  stars: number;
  forks: number;
  license?: string;
  version?: string;
  showMetrics: boolean;
  showAvatar: boolean;
  showTags: boolean;
  showVerifiedBadge: boolean;
  customWatermark?: string;
  imageUrl?: string;
}

export const THEME_PRESETS: {
  id: SocialCardTheme;
  name: string;
  desc: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  subTextColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
}[] = [
  {
    id: 'obsidian',
    name: 'Cosmic Obsidian',
    desc: 'Deep space obsidian with glowing indigo/violet mesh nebula',
    bgGradient: 'from-[#0b0f19] via-[#0f172a] to-[#1e1b4b]',
    accentColor: '#6366f1',
    textColor: '#f8fafc',
    subTextColor: '#94a3b8',
    badgeBg: 'rgba(99, 102, 241, 0.15)',
    badgeBorder: 'rgba(99, 102, 241, 0.35)',
    badgeText: '#a5b4fc',
    cardBg: 'rgba(15, 23, 42, 0.85)',
    cardBorder: 'rgba(99, 102, 241, 0.25)',
  },
  {
    id: 'cyberpunk',
    name: 'Midnight Neon',
    desc: 'Dark carbon background with electric cyan and magenta highlights',
    bgGradient: 'from-[#05050a] via-[#0a0e1a] to-[#041e24]',
    accentColor: '#06b6d4',
    textColor: '#f1f5f9',
    subTextColor: '#94a3b8',
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    badgeBorder: 'rgba(6, 182, 212, 0.4)',
    badgeText: '#67e8f9',
    cardBg: 'rgba(10, 14, 26, 0.85)',
    cardBorder: 'rgba(6, 182, 212, 0.3)',
  },
  {
    id: 'aurora',
    name: 'Sunset Aurora',
    desc: 'Rich indigo with warm coral, amber & lavender radiant glow',
    bgGradient: 'from-[#1e1b4b] via-[#311042] to-[#18181b]',
    accentColor: '#ec4899',
    textColor: '#ffffff',
    subTextColor: '#cbd5e1',
    badgeBg: 'rgba(236, 72, 153, 0.15)',
    badgeBorder: 'rgba(236, 72, 153, 0.4)',
    badgeText: '#f472b6',
    cardBg: 'rgba(30, 27, 75, 0.85)',
    cardBorder: 'rgba(236, 72, 153, 0.3)',
  },
  {
    id: 'emerald',
    name: 'Forest Emerald',
    desc: 'Deep titanium slate with glowing matrix mint and emerald accents',
    bgGradient: 'from-[#022c22] via-[#061e19] to-[#090d16]',
    accentColor: '#10b981',
    textColor: '#f8fafc',
    subTextColor: '#a7f3d0',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeBorder: 'rgba(16, 185, 129, 0.4)',
    badgeText: '#6ee7b7',
    cardBg: 'rgba(6, 30, 25, 0.85)',
    cardBorder: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: 'terminal',
    name: 'Hacker Terminal',
    desc: 'Retro monospace CLI console with prompt headers and green phosphor',
    bgGradient: 'from-[#090d10] via-[#0c1218] to-[#04080c]',
    accentColor: '#22c55e',
    textColor: '#4ade80',
    subTextColor: '#86efac',
    badgeBg: 'rgba(34, 197, 94, 0.12)',
    badgeBorder: 'rgba(34, 197, 94, 0.4)',
    badgeText: '#86efac',
    cardBg: 'rgba(12, 18, 24, 0.9)',
    cardBorder: 'rgba(34, 197, 94, 0.3)',
  },
  {
    id: 'bento',
    name: 'Bento Grid',
    desc: 'Structured modern cards partitioned with clean geometric hierarchy',
    bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    accentColor: '#38bdf8',
    textColor: '#f8fafc',
    subTextColor: '#94a3b8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeBorder: 'rgba(56, 189, 248, 0.35)',
    badgeText: '#7dd3fc',
    cardBg: 'rgba(30, 41, 59, 0.7)',
    cardBorder: 'rgba(148, 163, 184, 0.2)',
  },
  {
    id: 'minimal',
    name: 'Paper & Swiss Minimal',
    desc: 'High-contrast light slate canvas with architectural typography',
    bgGradient: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    accentColor: '#2563eb',
    textColor: '#0f172a',
    subTextColor: '#475569',
    badgeBg: 'rgba(37, 99, 235, 0.08)',
    badgeBorder: 'rgba(37, 99, 235, 0.25)',
    badgeText: '#1d4ed8',
    cardBg: 'rgba(255, 255, 255, 0.9)',
    cardBorder: 'rgba(203, 213, 225, 0.8)',
  },
];

export function getDimensions(aspectRatio: SocialCardAspectRatio): { width: number; height: number; ratio: string } {
  switch (aspectRatio) {
    case 'og':
      return { width: 1200, height: 630, ratio: '1.91:1' };
    case 'banner':
      return { width: 1280, height: 640, ratio: '2:1' };
    case 'square':
      return { width: 1080, height: 1080, ratio: '1:1' };
    default:
      return { width: 1200, height: 630, ratio: '1.91:1' };
  }
}

/**
 * Initializes default Social Card configuration based on parsed repository facts
 */
export function buildDefaultSocialCardConfig(knowledge: ProjectKnowledge): SocialCardConfig {
  const { project, techStack, languages, manifest } = knowledge;
  
  // Extract up to 5 best tags
  const tags: string[] = [];
  if (techStack && techStack.length > 0) {
    techStack.slice(0, 4).forEach((t) => tags.push(t.name));
  }
  if (languages && languages.length > 0 && tags.length < 5) {
    languages.slice(0, 2).forEach((l) => {
      if (!tags.includes(l.name)) tags.push(l.name);
    });
  }
  if (tags.length === 0) {
    tags.push('TypeScript', 'Open Source', 'GitHub');
  }

  return {
    title: project.repo || project.fullName || 'Awesome Project',
    subtitle: project.fullName ? `${project.fullName} • Documentation` : 'Documentation & Architecture',
    summary:
      project.description ||
      'Anti-hallucination verified documentation with interactive diagrams and automated workflows.',
    theme: 'obsidian',
    aspectRatio: 'og',
    tags: tags.slice(0, 5),
    owner: project.owner || 'github-user',
    authorAvatarUrl: project.avatarUrl || 'https://github.com/github.png',
    stars: project.stars || 0,
    forks: project.forks || 0,
    license: project.license || 'MIT License',
    version: manifest?.version || 'v1.0.0',
    showMetrics: true,
    showAvatar: true,
    showTags: true,
    showVerifiedBadge: true,
    customWatermark: 'README Architect • Verified Ground Truth',
  };
}

/**
 * Generates OpenGraph HTML meta tags
 */
export function generateOpenGraphHtml(config: SocialCardConfig, repoUrl?: string): string {
  const { width, height } = getDimensions(config.aspectRatio);
  const targetUrl = repoUrl || `https://github.com/${config.owner}/${config.title}`;
  const bannerPath = `./assets/social-card.png`;

  return `<!-- Open Graph / Facebook / LinkedIn Meta Tags -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${targetUrl}" />
<meta property="og:title" content="${config.title} — ${config.summary.slice(0, 60)}" />
<meta property="og:description" content="${config.summary}" />
<meta property="og:image" content="${config.imageUrl || bannerPath}" />
<meta property="og:image:width" content="${width}" />
<meta property="og:image:height" content="${height}" />
<meta property="og:site_name" content="${config.title}" />

<!-- Twitter / X Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${targetUrl}" />
<meta name="twitter:title" content="${config.title}" />
<meta name="twitter:description" content="${config.summary.slice(0, 150)}" />
<meta name="twitter:image" content="${config.imageUrl || bannerPath}" />
<meta name="twitter:creator" content="@${config.owner}" />`;
}

/**
 * Generates Markdown embed code for README header
 */
export function generateReadmeBannerMarkdown(config: SocialCardConfig): string {
  const bannerPath = config.imageUrl || `./assets/social-card.png`;
  return `<div align="center">
  <img src="${bannerPath}" alt="${config.title} Social Banner" width="100%" />
</div>`;
}

/**
 * Injects or replaces social banner in markdown
 */
export function insertSocialCardIntoReadme(
  currentMarkdown: string,
  mode: 'banner' | 'meta-tags' | 'both',
  config: SocialCardConfig,
  repoUrl?: string
): string {
  let headerBlock = '';

  if (mode === 'banner' || mode === 'both') {
    headerBlock += `${generateReadmeBannerMarkdown(config)}\n\n`;
  }

  if (mode === 'meta-tags' || mode === 'both') {
    headerBlock += `<!--\n${generateOpenGraphHtml(config, repoUrl)}\n-->\n\n`;
  }

  // If there's already an alignment banner at the top, replace it or prepend
  const bannerRegex = /<div align="center">\s*<img src="[^"]*social-card[^"]*".*?<\/div>/is;
  if (bannerRegex.test(currentMarkdown)) {
    return currentMarkdown.replace(bannerRegex, generateReadmeBannerMarkdown(config));
  }

  // Prepend to top of markdown
  return headerBlock + currentMarkdown.trimStart();
}

/**
 * Draws the social card on a Canvas element
 */
export function renderSocialCardToCanvas(
  canvas: HTMLCanvasElement,
  config: SocialCardConfig
): void {
  const { width, height } = getDimensions(config.aspectRatio);
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const theme = THEME_PRESETS.find((t) => t.id === config.theme) || THEME_PRESETS[0];
  const isLight = config.theme === 'minimal';

  // 1. Background Fill
  if (config.theme === 'obsidian') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Nebula blobs
    const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 450);
    glow1.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    glow1.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
    glow1.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width * 0.1, height * 0.9, 20, width * 0.1, height * 0.9, 400);
    glow2.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
    glow2.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);
  } else if (config.theme === 'cyberpunk') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#05070e');
    bgGrad.addColorStop(1, '#081724');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.8, height * 0.3, 10, width * 0.8, height * 0.3, 500);
    glow.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
    glow.addColorStop(0.6, 'rgba(236, 72, 153, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (config.theme === 'aurora') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1e1035');
    bgGrad.addColorStop(0.5, '#2e1065');
    bgGrad.addColorStop(1, '#180d2b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.75, height * 0.25, 20, width * 0.75, height * 0.25, 550);
    glow.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
    glow.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (config.theme === 'emerald') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#022c22');
    bgGrad.addColorStop(0.6, '#06201b');
    bgGrad.addColorStop(1, '#051311');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.85, height * 0.2, 10, width * 0.85, height * 0.2, 450);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  } else if (config.theme === 'terminal') {
    ctx.fillStyle = '#0a0f14';
    ctx.fillRect(0, 0, width, height);

    // Matrix scanline / grid
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  } else if (config.theme === 'bento') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Minimal light
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#ffffff');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle architectural grid
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
  }

  // 2. Subtle Background Geometric Grid Lines (for dark themes)
  if (!isLight && config.theme !== 'terminal') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // 3. Draw Outer Card Container
  const pad = 48;
  const cardX = pad;
  const cardY = pad;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;
  const radius = 24;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.92)' : theme.cardBg;
  ctx.fill();
  ctx.strokeStyle = isLight ? 'rgba(203, 213, 225, 0.9)' : theme.cardBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.clip();

  // Terminal top bar
  if (config.theme === 'terminal') {
    ctx.fillStyle = 'rgba(22, 27, 34, 0.95)';
    ctx.fillRect(cardX, cardY, cardW, 44);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.strokeRect(cardX, cardY + 44, cardW, 1);

    // Terminal dots
    const dots = ['#ef4444', '#eab308', '#22c55e'];
    dots.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(cardX + 24 + i * 18, cardY + 22, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    ctx.fillStyle = '#86efac';
    ctx.font = '500 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillText(`bash - ${config.title} ~ 1200x630`, cardX + 90, cardY + 26);
  }

  // 4. Content Layout
  const innerLeft = cardX + 44;
  let cursorY = cardY + (config.theme === 'terminal' ? 88 : 56);

  // Top Row: Watermark & Verified Badge
  ctx.font = '600 13px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isLight ? '#475569' : '#94a3b8';
  ctx.fillText(config.subtitle.toUpperCase(), innerLeft, cursorY);

  if (config.showVerifiedBadge) {
    const badgeText = '✓ GROUND TRUTH VERIFIED';
    ctx.font = '700 11px ui-monospace, SFMono-Regular, monospace';
    const bWidth = ctx.measureText(badgeText).width + 20;
    const bHeight = 24;
    const bX = cardX + cardW - bWidth - 44;
    const bY = cursorY - 16;

    ctx.fillStyle = isLight ? 'rgba(16, 185, 129, 0.12)' : 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.beginPath();
    ctx.roundRect(bX, bY, bWidth, bHeight, 12);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLight ? '#059669' : '#34d399';
    ctx.fillText(badgeText, bX + 10, bY + 16);
  }

  cursorY += 48;

  // Title with Gradient or Bold Styling
  ctx.font = `800 ${config.aspectRatio === 'square' ? '54px' : '62px'} ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  if (config.theme === 'terminal') {
    ctx.font = `700 52px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.fillStyle = '#4ade80';
    ctx.fillText(`$ ${config.title}`, innerLeft, cursorY);
  } else if (!isLight) {
    const titleGrad = ctx.createLinearGradient(innerLeft, cursorY - 40, innerLeft + 600, cursorY);
    titleGrad.addColorStop(0, '#ffffff');
    titleGrad.addColorStop(0.7, '#e2e8f0');
    titleGrad.addColorStop(1, theme.accentColor);
    ctx.fillStyle = titleGrad;
    ctx.fillText(config.title, innerLeft, cursorY);
  } else {
    ctx.fillStyle = '#0f172a';
    ctx.fillText(config.title, innerLeft, cursorY);
  }

  cursorY += 42;

  // Description / Summary (Multi-line wrap)
  ctx.font = '400 22px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';

  const maxSummaryWidth = cardW - 120;
  const words = config.summary.split(' ');
  let line = '';
  let lineCount = 0;
  const maxLines = config.aspectRatio === 'square' ? 5 : 3;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxSummaryWidth && n > 0) {
      ctx.fillText(line, innerLeft, cursorY);
      line = words[n] + ' ';
      cursorY += 34;
      lineCount++;
      if (lineCount >= maxLines - 1 && n < words.length - 1) {
        line += words.slice(n + 1).join(' ');
        if (ctx.measureText(line).width > maxSummaryWidth) {
          while (ctx.measureText(line + '...').width > maxSummaryWidth && line.length > 0) {
            line = line.slice(0, -1);
          }
          line = line.trim() + '...';
        }
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, innerLeft, cursorY);
  cursorY += 46;

  // Tech Stack Tags
  if (config.showTags && config.tags.length > 0) {
    let tagX = innerLeft;
    const tagY = cursorY;
    ctx.font = '600 13px ui-monospace, SFMono-Regular, monospace';

    config.tags.forEach((tag) => {
      const textWidth = ctx.measureText(tag).width;
      const tagW = textWidth + 24;
      const tagH = 30;

      if (tagX + tagW < cardX + cardW - 40) {
        ctx.fillStyle = theme.badgeBg;
        ctx.strokeStyle = theme.badgeBorder;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = theme.badgeText;
        ctx.fillText(tag, tagX + 12, tagY + 20);
        tagX += tagW + 10;
      }
    });
  }

  // 5. Bottom Status Bar & Stats (Stars, Forks, License, Version)
  const footerY = cardY + cardH - 44;

  // Author / Brand info on bottom left
  ctx.font = '600 15px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  ctx.fillText(`github.com/${config.owner}/${config.title}`, innerLeft, footerY);

  // Right Side Metrics (Stars, Forks, License)
  if (config.showMetrics) {
    const stats: string[] = [];
    if (config.stars > 0) stats.push(`★ ${config.stars >= 1000 ? (config.stars / 1000).toFixed(1) + 'k' : config.stars}`);
    if (config.forks > 0) stats.push(`⑂ ${config.forks >= 1000 ? (config.forks / 1000).toFixed(1) + 'k' : config.forks}`);
    if (config.license) stats.push(config.license);
    if (config.version) stats.push(config.version);

    let statRight = cardX + cardW - 44;
    ctx.font = '600 13px ui-monospace, SFMono-Regular, monospace';

    stats.reverse().forEach((stat) => {
      const sWidth = ctx.measureText(stat).width + 20;
      const sHeight = 28;
      const sX = statRight - sWidth;
      const sY = footerY - 20;

      ctx.fillStyle = isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(255, 255, 255, 0.07)';
      ctx.strokeStyle = isLight ? 'rgba(203, 213, 225, 0.8)' : 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.roundRect(sX, sY, sWidth, sHeight, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isLight ? '#334155' : '#cbd5e1';
      ctx.fillText(stat, sX + 10, sY + 18);

      statRight = sX - 8;
    });
  }

  ctx.restore();
}

/**
 * Generates an SVG string representation of the Social Card
 */
export function generateSocialCardSVG(config: SocialCardConfig): string {
  const { width, height } = getDimensions(config.aspectRatio);
  const theme = THEME_PRESETS.find((t) => t.id === config.theme) || THEME_PRESETS[0];
  const isLight = config.theme === 'minimal';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${isLight ? '#ffffff' : '#090d16'}" />
      <stop offset="50%" stop-color="${isLight ? '#f8fafc' : '#0f172a'}" />
      <stop offset="100%" stop-color="${isLight ? '#f1f5f9' : '#1e1b4b'}" />
    </linearGradient>
    <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${isLight ? '#0f172a' : '#ffffff'}" />
      <stop offset="100%" stop-color="${theme.accentColor}" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Inner Card -->
  <rect x="48" y="48" width="${width - 96}" height="${height - 96}" rx="24" fill="${isLight ? '#ffffff' : theme.cardBg}" stroke="${theme.cardBorder}" stroke-width="1.5" />

  <!-- Subtitle / Watermark -->
  <text x="92" y="104" fill="${theme.subTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" letter-spacing="1">
    ${config.subtitle.toUpperCase()}
  </text>

  <!-- Title -->
  <text x="92" y="176" fill="url(#titleGrad)" font-family="system-ui, -apple-system, sans-serif" font-size="58" font-weight="800">
    ${config.title}
  </text>

  <!-- Summary -->
  <text x="92" y="236" fill="${theme.subTextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400">
    ${config.summary.slice(0, 100)}...
  </text>

  <!-- Footer -->
  <text x="92" y="${height - 92}" fill="${theme.textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600">
    github.com/${config.owner}/${config.title}
  </text>
</svg>`;
}
