/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';
import {CsolutionService} from './csolution-rpc-client';

export function activate(context: vscode.ExtensionContext) {

  console.log('The extension "csolution-rpc-client-example" is active!');

  const csolution = new CsolutionService();

  const getVersion = vscode.commands.registerCommand('csolution-rpc-client-example.getVersion', async () => {
    const version = await csolution.getVersion();
    vscode.window.showInformationMessage(`csolution-rpc version: ${version}`);
  });
  const shutdown = vscode.commands.registerCommand('csolution-rpc-client-example.shutdown', async () => {
    if (await csolution.shutdown()) {
        vscode.window.showInformationMessage(`csolution-rpc server is closed`);
    }
  });
  context.subscriptions.push(
    getVersion,
    shutdown,
  );
}

export function deactivate() {}
