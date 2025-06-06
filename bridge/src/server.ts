/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChildProcess, spawn } from "node:child_process";
import express from 'express';
import cors from 'cors';

let child: ChildProcess|undefined;
const app = express();
const port = 3000;

function launch(): boolean {
  child = spawn('csolution', ['rpc'], { cwd: './' });

  child.on('error', (err) => {
      console.error(err.message);
      child = undefined;
      return false;
  });

  if (!child || !child.pid || !child.stdout || !child.stdin) {
      console.error(`csolution rpc launch failed`);
      return false;
  }
  console.warn(`csolution rpc started`);

  child.on('close', () => {
      console.warn(`csolution rpc closed`);
      child = undefined;
  });
  return true;
}

function getResponse(): Promise<string> {
  return new Promise((resolve) => {
    let collected = '';
    const onData = (chunk: Buffer) => {
      collected += chunk.toString();
      try {
        JSON.parse(collected);
        child!.stdout?.off('data', onData);
        resolve(collected);
      } catch(e) {
        console.error(e);
      }
    };
    child!.stdout?.on('data', onData);
  });
}

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

app.post('/rpc/*method', async (req, res) => {
  const request = req.body;
  console.log('request:', JSON.stringify(request));

  if (!child && !launch()) {
    res.status(404).send('csolution rpc not found');
    return;
  }

  child?.stdin?.write(JSON.stringify(request));

  const response = await getResponse();
  console.log('csolution rpc response:', response.toString());

  res.status(200).json(JSON.parse(response));
});

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
