const vscode = require('vscode');
const translate = require('translate');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
   //move selection to left
   let disposable = vscode.commands.registerCommand(
      'ownvscodeextension.moveSelectionToLeft',
      async function () {
         if (vscode.window.activeTextEditor == undefined) {
            return;
         }
         let selection = vscode.window.activeTextEditor.selection;
         if (selection.isEmpty) return;
         //return if at start of line
         if (selection.start.character == 0) return;
         let c = vscode.window.activeTextEditor.document.getText(
            new vscode.Range(
               new vscode.Position(
                  selection.start.line,
                  selection.start.character - 1
               ),
               new vscode.Position(
                  selection.start.line,
                  selection.start.character
               )
            )
         );
         await vscode.window.activeTextEditor.edit(async (editBuilder) => {
            editBuilder.delete(
               new vscode.Selection(
                  new vscode.Position(
                     selection.start.line,
                     selection.start.character - 1
                  ),
                  new vscode.Position(
                     selection.start.line,
                     selection.start.character
                  )
               )
            );
            editBuilder.insert(
               new vscode.Position(selection.end.line, selection.end.character),
               c
            );
         });
         vscode.window.activeTextEditor.selection = new vscode.Selection(
            new vscode.Position(
               selection.start.line,
               selection.start.character - 1
            ),
            new vscode.Position(selection.end.line, selection.end.character - 1)
         );
      }
   );
   //move selection to left
   vscode.commands.registerCommand(
      'ownvscodeextension.moveSelectionToRight',
      async function () {
         if (vscode.window.activeTextEditor == undefined) {
            return;
         }
         let selection = vscode.window.activeTextEditor.selection;
         if (selection.isEmpty) return;
         //return if at end of line
         if (
            selection.end.character ==
            vscode.window.activeTextEditor.document.lineAt(selection.start.line)
               .range.end.character
         )
            return;
         //get character after selection
         let c = vscode.window.activeTextEditor.document.getText(
            new vscode.Range(
               new vscode.Position(selection.end.line, selection.end.character),
               new vscode.Position(
                  selection.end.line,
                  selection.end.character + 1
               )
            )
         );
         await vscode.window.activeTextEditor.edit(async (editBuilder) => {
            editBuilder.delete(
               new vscode.Selection(
                  new vscode.Position(
                     selection.end.line,
                     selection.end.character
                  ),
                  new vscode.Position(
                     selection.end.line,
                     selection.end.character + 1
                  )
               )
            );
            editBuilder.insert(
               new vscode.Position(
                  selection.start.line,
                  selection.start.character
               ),
               c
            );
         });
         vscode.window.activeTextEditor.selection = new vscode.Selection(
            new vscode.Position(
               selection.start.line,
               selection.start.character + 1
            ),
            new vscode.Position(selection.end.line, selection.end.character + 1)
         );
      }
   );

   vscode.commands.registerCommand(
      'ownvscodeextension.translateSelection',
      async function () {
         if (vscode.window.activeTextEditor == undefined) return;
         let selection = vscode.window.activeTextEditor.selection;
         if (selection.isEmpty) return;
         //from
         let from = await vscode.window.showInputBox({
            placeHolder: 'from-language',
            title: 'Translate From Language',
         });
         if (from == undefined) return;
         //to
         let to = await vscode.window.showInputBox({
            placeHolder: 'to-language',
            title: 'Translate To Language',
         });
         if (to == undefined) return;
         //get selection text
         let text = vscode.window.activeTextEditor.document.getText(selection);
         //translate
         translate.from = from.toLowerCase();
         let translatedText = await translate(text, to.toLowerCase());
         //make first character to lower or upper case
         if (text.charAt(0).toUpperCase() == text.charAt(0)) {
            translatedText =
               translatedText.charAt(0).toUpperCase() + translatedText.slice(1);
         } else {
            translatedText =
               translatedText.charAt(0).toLowerCase() + translatedText.slice(1);
         }

         //replace
         vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(selection, translatedText);
         });
      }
   );

   context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
   activate,
   deactivate,
};
