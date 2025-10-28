import * as vscode from 'vscode'

export class LoginTreeItem extends vscode.TreeItem {
  constructor(contextValue: string, label: string, email: string | undefined) {
    super(label, vscode.TreeItemCollapsibleState.None)
    this.contextValue = contextValue
    this.description = contextValue === 'HY-LOGGED-IN' ? email : 'Not Login'
    this.iconPath = new vscode.ThemeIcon('account')
  }
}


export class StatusTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {

  // eslint-disable-next-line no-unused-vars
  constructor(private context: vscode.ExtensionContext) { }

  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter()
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element
  }

  async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      const isLoggedIn = await this.context.secrets.get('hunyuan3d-cookie')
      const email = await this.context.secrets.get('HY-EMAIL')
      const statusLoggedIn = isLoggedIn ? 'Logged In' : 'Not Logged In'
      const contextValue = isLoggedIn ? 'HY-LOGGED-IN' : 'HY-NOT-LOGGED-IN'
      return Promise.resolve([new LoginTreeItem(contextValue, statusLoggedIn, email)])
    }
    return Promise.resolve([])
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }
}
