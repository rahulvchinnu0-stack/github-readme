import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.APP_URL || req.nextUrl.origin;

  if (!clientId) {
    return NextResponse.json({
      configured: false,
      message: 'GITHUB_CLIENT_ID is not configured in environment variables. You can also connect directly with a Personal Access Token in Settings.',
    });
  }

  const redirectUri = `${appUrl}/api/auth/github/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'repo,read:user,user:email',
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;

  return NextResponse.json({
    configured: true,
    url: authUrl,
    redirectUri,
  });
}
