/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';
import { ChildProcess, spawn } from 'node:child_process';
import { MessageConnection, ParameterStructures } from 'vscode-jsonrpc';
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { RpcMethods, RpcInterface } from './rpc-interface';
export * from './rpc-interface';

export class CsolutionService extends RpcMethods implements RpcInterface {

    private child: ChildProcess | undefined;
    private connection: MessageConnection | undefined;

    async get<TArgs, TResponse>(remoteMethod: string, args?: TArgs): Promise<TResponse> {
        const response = await this.transceive<TResponse>(remoteMethod, args);
        return (response ?? {}) as TResponse;
    }

    private async transceive<TResponse>(method: string, params?: ParameterStructures | unknown, ..._rest: unknown[]):
        Promise<TResponse | undefined> {
        if ((!this.child || !this.child.pid) && !this.launch()) {
            return undefined;
        }
        console.log('csolution rpc request:', method);
        const start = Date.now();
        const response = params ?
            await this.connection?.sendRequest<TResponse>(method, params) :
            await this.connection?.sendRequest<TResponse>(method);
        console.log(`csolution rpc response took ${Date.now() - start}ms:`, response);
        return response;
    }

    private launch(): boolean {
        this.child = spawn('csolution', ['rpc', '--content-length', '--debug'],
            { cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? './' }
        );
        this.child.on('error', (error) => {
            console.error('csolution rpc child process error:', error);
            this.child = undefined;
            return false;
        });
        this.child.on('exit', (code) => {
            console.warn(`csolution rpc child process exited (${code})`);
            this.child = undefined;
            return false;
        });
        this.child.on('disconnect', () => {
            console.warn('csolution rpc child process disconnected');
            this.child = undefined;
            return false;
        });
        this.child.stderr?.on('data', (data) => {
            console.error('csolution rpc child process stderr:', data.toString());
        });

        if (!this.child || !this.child.pid || !this.child.stdout || !this.child.stdin) {
            console.error('csolution rpc launch failed');
            return false;
        }
        console.warn('csolution rpc started');

        // Use stdin and stdout for communication
        this.connection = createMessageConnection(
            new StreamMessageReader(this.child.stdout),
            new StreamMessageWriter(this.child.stdin)
        );

        // Listen for child process close event
        this.child.on('close', (code) => {
            console.warn(`csolution rpc child process closed (${code})`);
            this.child = undefined;
            return false;
        });

        // Listen for rpc connection errors
        this.connection.onError((error) => {
            console.error('csolution rpc connection error:', error);
            throw error;
        });

        // Start listening
        this.connection.listen();
        return true;
    }
}
