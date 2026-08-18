import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const error = req.nextUrl.searchParams.get('error');
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (error || !code) {
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>GitHub Auth Failed</title></head>
        <body style="font-family:system-ui;padding:24px;background:#0d1117;color:#c9d1d9;">
          <h2>Authentication Error</h2>
          <p>${error || 'No authorization code was provided.'}</p>
          <button onclick="window.close()" style="background:#238636;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">Close Window</button>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(tokenData.error_description || 'Failed to exchange token with GitHub');
    }

    // Fetch user details
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'AI-GitHub-Readme-Generator',
      },
    });
    const userData = await userRes.json();

    const payload = JSON.stringify({
      type: 'OAUTH_AUTH_SUCCESS',
      token: accessToken,
      user: {
        id: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        avatar_url: userData.avatar_url,
        email: userData.email,
      },
    });

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>GitHub Authentication Successful</title></head>
        <body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0d1117;color:#c9d1d9;">
          <div style="text-align:center;padding:32px;background:#161b22;border:1px solid #30363d;border-radius:12px;">
            <h2 style="color:#58a6ff;margin-top:0;">Authenticated Successfully</h2>
            <p>Welcome, <b>${userData.login}</b>! You can return to AI GitHub README Generator.</p>
            <p style="color:#8b949e;font-size:14px;">This window will close automatically...</p>
          </div>
          <script>
            try {
              if (window.opener) {
                window.opener.postMessage(${payload}, '*');
                setTimeout(function() { window.close(); }, 800);
              } else {
                window.location.href = '/';
              }
            } catch (e) {
              console.error(e);
            }
          </script>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head><title>GitHub Auth Failed</title></head>
        <body style="font-family:system-ui;padding:24px;background:#0d1117;color:#c9d1d9;">
          <h2>Authentication Error</h2>
          <p>${msg}</p>
          <button onclick="window.close()" style="background:#238636;color:white;padding:8px 16px;border:none;border-radius:6px;cursor:pointer;">Close Window</button>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
