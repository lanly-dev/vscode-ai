import * as vscode from 'vscode'

export class StatusTreeItem extends vscode.TreeItem {
  constructor(label: string) {
    super(label, vscode.TreeItemCollapsibleState.None)
    this.contextValue = 'statusItem'
    this.command = {
      command: 'ai.hunyuanLogin',
      title: 'Login',
      tooltip: 'Open Hunyuan 3D Login'
    }
    this.description = 'Not Login'
    this.iconPath = new vscode.ThemeIcon('account')
    this.contextValue = 'ai.notLoggedIn'
  }
}

export class StatusTreeDataProvider implements vscode.TreeDataProvider<StatusTreeItem> {

  getTreeItem(element: StatusTreeItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: StatusTreeItem): Promise<StatusTreeItem[]> {
    if (!element) {
      return Promise.resolve([
        new StatusTreeItem('Not Login')
      ])
    }
    return Promise.resolve([])
  }
}
