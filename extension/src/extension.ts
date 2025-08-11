import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('leanweb.open', async () => {
    const panel = vscode.window.createWebviewPanel(
      'leanweb',
      'Lean Web',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'media', 'client', 'dist')
        ]
      }
    )

    const config = vscode.workspace.getConfiguration('leanweb')
    const serverBase = (config.get<string>('serverBaseUrl') || '').trim()
    const wsBaseConfig = (config.get<string>('wsBaseUrl') || '').trim()

    const inferredWsBase = serverBase
      ? serverBase.replace(/^http(s?):\/\//, 'ws$1://')
      : ''
    const wsBase = wsBaseConfig || inferredWsBase

    // Compute URIs for built assets
    const distRoot = vscode.Uri.joinPath(context.extensionUri, 'media', 'client', 'dist')

    // Find index js and css by reading dist assets directory
    const assetsDir = vscode.Uri.joinPath(distRoot, 'assets')
    const assets = await vscode.workspace.fs.readDirectory(assetsDir)

    const indexJsName = assets.find(([name]) => /index-.*\.js$/.test(name))?.[0]
    if (!indexJsName) {
      vscode.window.showErrorMessage('Lean Web extension: could not find client build (assets/index-*.js). Build the client and copy it to extension/media/client/dist.')
      return
    }
    const indexCssName = assets.find(([name]) => /index-.*\.css$/.test(name))?.[0]

    const indexJsUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(assetsDir, indexJsName))
    const indexCssUri = indexCssName ? panel.webview.asWebviewUri(vscode.Uri.joinPath(assetsDir, indexCssName)) : undefined

    const baseUri = panel.webview.asWebviewUri(distRoot)

    const csp = [
      "default-src 'none'",
      `style-src ${panel.webview.cspSource} 'unsafe-inline'`,
      `img-src ${panel.webview.cspSource} https: data:`,
      `font-src ${panel.webview.cspSource} https: data:`,
      `script-src ${panel.webview.cspSource}`,
      `connect-src https: http: ws: wss:`
    ].join('; ')

    panel.webview.html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${indexCssUri ? `<link href="${indexCssUri}" rel="stylesheet">` : ''}
    <base href="${baseUri}/">
    <title>Lean Web</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.__LEANWEB_API_BASE__ = ${JSON.stringify(serverBase)};
      window.__LEANWEB_WS_BASE__ = ${JSON.stringify(wsBase)};
    </script>
    <script type="module" src="${indexJsUri}"></script>
  </body>
</html>`
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}