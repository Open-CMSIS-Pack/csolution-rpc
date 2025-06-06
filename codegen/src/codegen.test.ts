/*
 * Copyright (c) 2025 Arm Limited. All rights reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {Codegen} from './codegen.js';
import fs from 'fs';

describe('codegen', () => {
  let codegen: Codegen;

  beforeEach(() => {
    codegen = new Codegen();
  });

  it('calls codegen with csolution-openapi.yml schema', () => {
    fs.rmSync("./generated", { recursive: true, force: true });
    codegen.run(["node", "codegen", "../api/csolution-openapi.yml",
      "--client", "./generated/rpc-interface.ts",
      "--server", "./generated/RpcInterface.h"]);
    expect(fs.existsSync("./generated/rpc-interface.ts")).toBe(true);
    expect(fs.existsSync("./generated/RpcInterface.h")).toBe(true);
  });
});
