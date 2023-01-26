const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

//workspace path
const workspacePath = path.join(
   __dirname,
   '../',
   'ownvscodeextension-workspace'
);

//snapshot.json
let snapshotFile = undefined;
let snapshotJSON = undefined;
try {
   snapshotFile = path.join(workspacePath, 'snapshots.json');

   snapshotJSON = JSON.parse(fs.readFileSync(snapshotFile).toString());
} catch (e) {
   createWorkspace();

   snapshotFile = path.join(workspacePath, 'snapshots.json');

   snapshotJSON = JSON.parse(fs.readFileSync(snapshotFile).toString());
}

//advancedClipboardFile.json
let clipboardFile = undefined;
let clipboardJSON = undefined;
try {
   clipboardFile = path.join(workspacePath, 'advancedClipboardFile.json');

   clipboardJSON = JSON.parse(fs.readFileSync(clipboardFile).toString());
} catch (e) {
   createWorkspace();

   clipboardFile = path.join(workspacePath, 'advancedClipboardFile.json');

   clipboardJSON = JSON.parse(fs.readFileSync(clipboardFile).toString());
}

//install translate
let translate = undefined;
let dict = undefined;
try {
   translate = require('translate');
   const spelling = require('spelling');
   const dictionary = require('spelling/dictionaries/en_US');
   dict = new spelling(dictionary);
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
         if (selection.start.character == 0) {
            if (
               !vscode.workspace
                  .getConfiguration('ownvscodeextension.move')
                  .get('MoveBetweenLines')
            )
               return;
            let newLine = undefined;
            let newStartCharacter = undefined;
            let text = undefined;
            await vscode.window.activeTextEditor.edit(async (editBuilder) => {
               newLine = selection.start.line - 1;
               if (newLine < 0) return;
               newStartCharacter =
                  vscode.window.activeTextEditor.document.lineAt(newLine).text
                     .length;
               text =
                  vscode.window.activeTextEditor.document.getText(selection);
               editBuilder.delete(selection);
               editBuilder.insert(
                  new vscode.Position(newLine, newStartCharacter),
                  text
               );
            });
            if (newLine != undefined)
               vscode.window.activeTextEditor.selection = new vscode.Selection(
                  new vscode.Position(newLine, newStartCharacter),
                  new vscode.Position(newLine, newStartCharacter + text.length)
               );
            return;
         }
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
         ) {
            if (
               !vscode.workspace
                  .getConfiguration('ownvscodeextension.move')
                  .get('MoveBetweenLines')
            )
               return;
            let newLine = undefined;
            let text = undefined;
            await vscode.window.activeTextEditor.edit(async (editBuilder) => {
               newLine = selection.start.line + 1;
               text =
                  vscode.window.activeTextEditor.document.getText(selection);
               editBuilder.delete(selection);
               editBuilder.insert(new vscode.Position(newLine, 0), text);
            });
            if (newLine != undefined)
               vscode.window.activeTextEditor.selection = new vscode.Selection(
                  new vscode.Position(newLine, 0),
                  new vscode.Position(newLine, text.length)
               );
            return;
         }
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

   // translate
   vscode.commands.registerCommand(
      'ownvscodeextension.translateSelection',
      async function () {
         if (vscode.window.activeTextEditor == undefined) return;
         let selection = vscode.window.activeTextEditor.selection;

         //get selected text
         if (selection.isEmpty) {
            let newRange =
               vscode.window.activeTextEditor.document.getWordRangeAtPosition(
                  selection.start
               );
            if (newRange == undefined) {
               vscode.window.showInformationMessage('Select a Text!');
               return;
            }
            selection = new vscode.Selection(newRange.start, newRange.end);
         }
         //get selection text
         let text = vscode.window.activeTextEditor.document.getText(selection);

         //Get translation settings
         let from = undefined;
         let to = undefined;
         let settings = vscode.workspace.getConfiguration(
            'ownvscodeextension.translate'
         );
         if (settings['DefaultTranslate'].length == 0) {
            //Ask for translate settings
            //from
            from = await vscode.window.showInputBox({
               placeHolder: 'from-language',
               title: 'Translate: ' + text,
            });
            if (from == undefined) return;
            //to
            to = await vscode.window.showInputBox({
               placeHolder: 'to-language',
               title: 'Translate: ' + text,
            });
            if (to == undefined) return;
         } else {
            //Default translate
            let defaultTranslateSelection = undefined;
            let defaultOptions = settings['DefaultTranslate'].map(
               (value, index, array) => {
                  return 'From ' + value['from'] + ' to ' + value['to'];
               }
            );
            defaultOptions.push('Custom');
            await vscode.window
               .showQuickPick(defaultOptions, {
                  title: 'Translate: ' + text,
               })
               .then((value) => {
                  defaultTranslateSelection = value;
               });
            if (defaultTranslateSelection == undefined) return;
            if (defaultTranslateSelection == 'Custom') {
               //from
               from = await vscode.window.showInputBox({
                  placeHolder: 'from-language',
                  title: 'Translate: ' + text,
               });
               if (from == undefined) return;
               //to
               to = await vscode.window.showInputBox({
                  placeHolder: 'to-language',
                  title: 'Translate: ' + text,
               });
               if (to == undefined) return;
            } else {
               from = defaultTranslateSelection.split(' ')[1];
               to = defaultTranslateSelection.split(' ')[3];
            }
         }

         //translate
         let translatedText;
         translate.from = from.toLowerCase();
         try {
            translatedText = await translate(text, to.toLowerCase());
         } catch (e) {
            vscode.window.showErrorMessage('' + e);
            return;
         }
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
   //check spelling
   vscode.commands.registerCommand(
      'ownvscodeextension.checkSpelling',
      async function () {
         if (vscode.window.activeTextEditor == undefined) return;
         let selection = vscode.window.activeTextEditor.selection;

         //get selected text
         if (selection.isEmpty) {
            let newRange =
               vscode.window.activeTextEditor.document.getWordRangeAtPosition(
                  selection.start
               );
            if (newRange == undefined) {
               vscode.window.showInformationMessage('Select a Text!');
               return;
            }
            selection = new vscode.Selection(newRange.start, newRange.end);
         }
         //get selection text
         let text = vscode.window.activeTextEditor.document.getText(selection);
         let textArr = text.split(' ');
         let allRight = true;
         for (let i in textArr) {
            let lookup = dict.lookup(textArr[i]);
            if (!lookup['found']) {
               allRight = false;
               let suggestions = [];
               for (let j in lookup['suggestions']) {
                  suggestions.push(lookup['suggestions'][j]['word']);
               }
               if (suggestions.length == 0) {
                  vscode.window.showInformationMessage(
                     'Did not found "' + lookup['word'] + '"!'
                  );
                  continue;
               }
               vscode.window
                  .showInformationMessage(
                     'Did not found "' +
                        lookup['word'] +
                        '"! \nDid you mean: ' +
                        suggestions,
                     ...['Replace', 'Cancel']
                  )
                  .then(async (value) => {
                     if (value == 'Cancel' || value == undefined) return;
                     let replaceWord = undefined;
                     if (suggestions.length == 1) replaceWord = suggestions[0];
                     else {
                        //get replace word from suggestions
                        replaceWord = await vscode.window.showQuickPick(
                           suggestions,
                           { title: 'Replace: ' + lookup['word'] }
                        );
                     }
                     if (replaceWord == undefined) return;
                     text = text.replace(lookup['word'], replaceWord);

                     //replace word
                     vscode.window.activeTextEditor.edit((editBuilder) => {
                        editBuilder.replace(selection, text);
                     });

                     //Set new selection
                     let selectionLength =
                        selection.end.character - selection.start.character;
                     //make selection longer
                     if (selectionLength < text.length) {
                        selection = new vscode.Selection(
                           selection.start,
                           new vscode.Position(
                              selection.end.line,
                              selection.end.character +
                                 (text.length - selectionLength)
                           )
                        );
                     }
                     //make selection shorter
                     if (selectionLength > text.length) {
                        selection = new vscode.Selection(
                           selection.start,
                           new vscode.Position(
                              selection.end.line,
                              selection.end.character -
                                 (selectionLength - text.length)
                           )
                        );
                     }
                  });
            }
         }
         if (allRight)
            vscode.window.setStatusBarMessage(
               'Everthing spelled correct',
               3000
            );
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
   //copyToAdvancedClipboard
   vscode.commands.registerCommand(
      'ownvscodeextension.copyToAdvancedClipboard',
      async function () {
         let selection = vscode.window.activeTextEditor.selection;
         if (selection == undefined) {
            vscode.window.showWarningMessage('Could not find a selection');
            return;
         }
         let text = undefined;
         if (selection.isEmpty) {
            text =
               '\n' +
               vscode.window.activeTextEditor.document.lineAt(
                  selection.start.line
               ).text;
            if (text == undefined || text == '' || text == '\n') {
               vscode.window.showInformationMessage('Select a Text!');
               return;
            }
         } else {
            text = vscode.window.activeTextEditor.document.getText(selection);
         }
         if (clipboardJSON.includes(text)) return;
         if (
            vscode.workspace
               .getConfiguration('ownvscodeextension.clipboard')
               .get('EmptyClipboardWhenCopy')
         )
            clipboardJSON = [];
         clipboardJSON.push(text);
         vscode.window.setStatusBarMessage(
            clipboardJSON.length + ' Items in Clipboard',
            3000
         );
         saveClipboardFile();
      }
   );
   //pasteToAdvancedClipboard
   vscode.commands.registerCommand(
      'ownvscodeextension.pasteToAdvancedClipboard',
      async function () {
         let deleteClipboard = vscode.workspace
            .getConfiguration('ownvscodeextension.clipboard')
            .get('DeleteClipboardAfterPaste');
         let text = undefined;
         if (clipboardJSON.length == 0) return;
         else if (clipboardJSON.length == 1) {
            text = clipboardJSON[0];
            if (deleteClipboard) {
               clipboardJSON.pop();
            }
         } else {
            await vscode.window
               .showQuickPick(clipboardJSON, {
                  title: 'Paste from Advanced Clipboard',
               })
               .then((value) => {
                  text = value;
               });
            if (deleteClipboard) {
               for (let i in clipboardJSON) {
                  if (clipboardJSON[i] == text) {
                     clipboardJSON.splice(i, 1);
                     break;
                  }
               }
            }
         }
         if (text == undefined) return;
         vscode.window.activeTextEditor.edit(async (editBuilder) => {
            if (vscode.window.activeTextEditor.selection.isEmpty)
               editBuilder.insert(
                  vscode.window.activeTextEditor.selection.start,
                  text
               );
            else {
               editBuilder.replace(
                  vscode.window.activeTextEditor.selection,
                  text
               );
            }
            saveClipboardFile();
         });
      }
   );
   //deleteFromAdvancedClipboard
   vscode.commands.registerCommand(
      'ownvscodeextension.deleteFromAdvancedClipboard',
      async function () {
         if (clipboardJSON.length == 0) return;
         let text = undefined;
         await vscode.window
            .showQuickPick(clipboardJSON, {
               title: 'Delete from Advanced Clipboard',
            })
            .then((value) => {
               text = value;
            });
         if (text == undefined) return;
         for (let i in clipboardJSON) {
            if (clipboardJSON[i] == text) {
               clipboardJSON.splice(i, 1);
               break;
            }
         }

         saveClipboardFile();
      }
   );
   //clearToAdvancedClipboard
   vscode.commands.registerCommand(
      'ownvscodeextension.clearAdvancedClipboard',
      async function () {
         clipboardJSON = [];
         saveClipboardFile();
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

function saveClipboardFile() {
   fs.writeFileSync(clipboardFile, JSON.stringify(clipboardJSON, null, 2));
}

function createWorkspace() {
   //make workspace
   fs.mkdir(workspacePath, (err) => {
      if (err) throw err;
   });
   //make snapshot.json
   fs.writeFileSync(path.join(workspacePath, 'snapshots.json'), '[]');
   //make advancedClipboardFile.json
   fs.writeFileSync(
      path.join(workspacePath, 'advancedClipboardFile.json'),
      '[]'
   );
}

module.exports = {
   activate,
   deactivate,
};
