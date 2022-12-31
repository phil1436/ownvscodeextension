const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

//snapshot.json
const snapshotFile = path.join(__dirname, 'snapshots.json');
let snapshotJSON = JSON.parse(fs.readFileSync(snapshotFile).toString());

//install translate
let translate = undefined;
try {
   translate = require('translate');
} catch (err) {
   vscode.window
      .showErrorMessage('Install dependencies!', ...['Install'])
      .then(async (value) => {
         let terminal = vscode.window.createTerminal({
            name: 'OwnVscodeExtension install dependencies',
            hideFromUser: false,
         });
         terminal.sendText("cd '" + __dirname + "'");
         terminal.sendText('npm install');
         terminal.show();
      });
   translate = require('translate');
}
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
         if (selection.isEmpty) {
            vscode.window.showInformationMessage('Select a Text!');
            return;
         }
         let from = undefined;
         let to = undefined;
         let settings = vscode.workspace.getConfiguration(
            'ownvscodeextension.translate'
         );
         if (settings['DefaultTranslate'].length == 0) {
            //from
            from = await vscode.window.showInputBox({
               placeHolder: 'from-language',
               title: 'Translate From Language',
            });
            if (from == undefined) return;
            //to
            to = await vscode.window.showInputBox({
               placeHolder: 'to-language',
               title: 'Translate To Language',
            });
            if (to == undefined) return;
         } else {
            let defaultTranslateSelection = undefined;
            let defaultOptions = settings['DefaultTranslate'].map(
               (value, index, array) => {
                  return 'From ' + value['from'] + ' to ' + value['to'];
               }
            );
            defaultOptions.push('Custom');
            await vscode.window.showQuickPick(defaultOptions).then((value) => {
               defaultTranslateSelection = value;
            });
            if (defaultTranslateSelection == undefined) return;
            if (defaultTranslateSelection == 'Custom') {
               //from
               from = await vscode.window.showInputBox({
                  placeHolder: 'from-language',
                  title: 'Translate From Language',
               });
               if (from == undefined) return;
               //to
               to = await vscode.window.showInputBox({
                  placeHolder: 'to-language',
                  title: 'Translate To Language',
               });
               if (to == undefined) return;
            } else {
               from = defaultTranslateSelection.split(' ')[1];
               to = defaultTranslateSelection.split(' ')[3];
            }
         }

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
         //remove whitespaces if there are no whitespaces in the original text
         if (!text.includes(' '))
            translatedText = translatedText.replace(/\s/g, '');

         //replace
         vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.replace(selection, translatedText);
         });
      }
   );
   //createSnapshot
   vscode.commands.registerCommand(
      'ownvscodeextension.createSnapshot',
      async function () {
         //snapshot name
         let name = await vscode.window.showInputBox({
            placeHolder: 'Snapshot Name',
            title: 'Snapshot Name',
         });
         if (name == undefined) {
            return;
         }
         createSnapshot(name);
      }
   );
   //createSnapshot
   vscode.commands.registerCommand(
      'ownvscodeextension.restoreSnapshot',
      async function () {
         if (vscode.window.activeTextEditor == undefined) return;
         let snapshots = [];
         for (let i in snapshotJSON) {
            if (
               snapshotJSON[i]['path'] ==
               vscode.window.activeTextEditor.document.uri.fsPath
            ) {
               snapshots.push(snapshotJSON[i]);
            }
         }
         if (snapshots.length == 0) {
            vscode.window.showInformationMessage(
               'No Snapshot for active file!'
            );
            return;
         }
         let snapshotSelection = undefined;
         await vscode.window
            .showQuickPick(
               snapshots.map((value, index, array) => {
                  return (
                     'Snapshot from ' +
                     value['timestamp'] +
                     ' (' +
                     value['name'] +
                     ')'
                  );
               })
            )
            .then((value) => {
               snapshotSelection = value;
            });
         if (snapshotSelection == undefined) return;
         snapshotSelection = snapshotSelection.replace('Snapshot from ', '');
         let snapshot = undefined;
         for (let i in snapshots) {
            if (
               snapshots[i]['timestamp'] + ' (' + snapshots[i]['name'] + ')' ==
               snapshotSelection
            ) {
               snapshot = snapshots[i];
               break;
            }
         }
         if (snapshot == undefined) return;
         let settings = vscode.workspace.getConfiguration(
            'ownvscodeextension.snapshot'
         );
         //create snapshot
         if (settings['CreateSnapshotWhenRestore']) {
            createSnapshot();
         }
         //write snapshot
         fs.writeFileSync(snapshot['path'], snapshot['text']);
         //delete snapshot after restore
         if (settings['DeleteSnapshotAfterRestore']) {
            for (let i in snapshotJSON) {
               if (
                  snapshotJSON[i]['path'] == snapshot['path'] &&
                  snapshotJSON[i]['timestamp'] == snapshot['timestamp'] &&
                  snapshotJSON[i]['text'] == snapshot['text'] &&
                  snapshotJSON[i]['name'] == snapshot['name']
               ) {
                  snapshotJSON.splice(i, 1);
               }
            }
            saveSnapshots();
         }
      }
   );
   //delete snapshot
   vscode.commands.registerCommand(
      'ownvscodeextension.deleteSnapshot',
      async function () {
         if (snapshotJSON.length == 0) return;
         let snapshotSelection = undefined;
         await vscode.window
            .showQuickPick(
               snapshotJSON.map((value, index, array) => {
                  return (
                     value['name'] +
                     ': ' +
                     value['path'] +
                     ' | ' +
                     value['timestamp']
                  );
               })
            )
            .then((value) => {
               snapshotSelection = value;
            });
         if (snapshotSelection == undefined) return;
         for (let i in snapshotJSON) {
            if (
               snapshotJSON[i]['name'] +
                  ': ' +
                  snapshotJSON[i]['path'] +
                  ' | ' +
                  snapshotJSON[i]['timestamp'] ==
               snapshotSelection
            ) {
               snapshotJSON.splice(i, 1);
            }
         }
         saveSnapshots();
      }
   );
   //delete all snapshots from active file
   vscode.commands.registerCommand(
      'ownvscodeextension.deleteAllSnapshotsFromActiveFile',
      async function () {
         if (vscode.window.activeTextEditor == undefined) return;
         if (snapshotJSON.length == 0) return;
         let deleteAll = false;
         await vscode.window
            .showWarningMessage(
               'Delete all Snapshots from active file?',
               ...['Yes', 'Cancel']
            )
            .then((value) => {
               if (value == 'Cancel' || value == undefined) return;
               deleteAll = true;
            });
         if (!deleteAll) return;
         snapshotJSON = snapshotJSON.filter((value, index, arr) => {
            return (
               value['path'] !=
               vscode.window.activeTextEditor.document.uri.fsPath
            );
         });
         saveSnapshots();
      }
   );
   //delete all snapshots
   vscode.commands.registerCommand(
      'ownvscodeextension.deleteAllSnapshots',
      async function () {
         if (snapshotJSON.length == 0) return;
         let deleteAll = false;
         await vscode.window
            .showWarningMessage('Delete all Snapshots?', ...['Yes', 'Cancel'])
            .then((value) => {
               if (value == 'Cancel' || value == undefined) return;
               deleteAll = true;
            });
         if (!deleteAll) return;
         snapshotJSON = [];
         saveSnapshots();
      }
   );

   //view snapshot
   vscode.commands.registerCommand(
      'ownvscodeextension.viewSnapshot',
      async function () {
         if (snapshotJSON.length == 0) return;
         let snapshotSelection = undefined;
         await vscode.window
            .showQuickPick(
               snapshotJSON.map((value, index, array) => {
                  return (
                     value['name'] +
                     ': ' +
                     value['path'] +
                     ' | ' +
                     value['timestamp']
                  );
               })
            )
            .then((value) => {
               snapshotSelection = value;
            });
         if (snapshotSelection == undefined) return;
         for (let i in snapshotJSON) {
            if (
               snapshotJSON[i]['name'] +
                  ': ' +
                  snapshotJSON[i]['path'] +
                  ' | ' +
                  snapshotJSON[i]['timestamp'] ==
               snapshotSelection
            ) {
               viewSnapshot(snapshotJSON[i]);
               break;
            }
         }
         saveSnapshots();
      }
   );
   //view snapshot from active file
   vscode.commands.registerCommand(
      'ownvscodeextension.viewSnapshotFromActiveFile',
      async function () {
         if (vscode.window.activeTextEditor == undefined) return;
         if (snapshotJSON.length == 0) return;
         let snapshotSelection = undefined;
         let filteredSnapshots = snapshotJSON.filter((value) => {
            return (
               value['path'] ==
               vscode.window.activeTextEditor.document.uri.fsPath
            );
         });
         if (filteredSnapshots.length == 0) {
            vscode.window.showInformationMessage(
               'No Snapshot for active file!'
            );
            return;
         }
         await vscode.window
            .showQuickPick(
               filteredSnapshots.map((value, index, array) => {
                  return (
                     value['name'] +
                     ': ' +
                     value['path'] +
                     ' | ' +
                     value['timestamp']
                  );
               })
            )
            .then((value) => {
               snapshotSelection = value;
            });
         if (snapshotSelection == undefined) return;

         for (let i in snapshotJSON) {
            if (
               snapshotJSON[i]['name'] +
                  ': ' +
                  snapshotJSON[i]['path'] +
                  ' | ' +
                  snapshotJSON[i]['timestamp'] ==
               snapshotSelection
            ) {
               viewSnapshot(snapshotJSON[i]);
               break;
            }
         }
      }
   );
   context.subscriptions.push(disposable);
}
//FUNCTIONS------------------------------------------------------------------------------------

function viewSnapshot(snapshot) {
   let text =
      '/*\nSnapshot\npath: ' +
      snapshot['path'] +
      '\nfrom: ' +
      snapshot['timestamp'] +
      '\n';
   if (snapshot['name'] != '') text += 'name: ' + snapshot['name'] + '\n';
   text += '*/\n\n' + snapshot['text'];
   vscode.workspace.openTextDocument({ content: text }).then((a) => {
      vscode.window.showTextDocument(a, 1, false);
   });
}

function createSnapshot(name = '') {
   if (vscode.window.activeTextEditor == undefined) return;
   let fileText = fs.readFileSync(
      vscode.window.activeTextEditor.document.uri.fsPath,
      'utf-8'
   );
   let snapshotObj = {
      path: vscode.window.activeTextEditor.document.uri.fsPath,
      text: fileText,
      timestamp: new Date().toUTCString(),
      name: name,
   };
   snapshotJSON.push(snapshotObj);
   saveSnapshots();
}

function deactivate() {}

/**
 *Save the options file
 */
function saveSnapshots() {
   fs.writeFileSync(snapshotFile, JSON.stringify(snapshotJSON, null, 2));
}

module.exports = {
   activate,
   deactivate,
};
