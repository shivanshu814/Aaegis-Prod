import { expect } from "chai";
import { AegisClient } from "../src";
// import * as anchor from "@coral-xyz/anchor";

describe("Aegis Client", () => {
  it("should be able to initialize the client", () => {
    // Mock provider
    const provider = {
      connection: {},
      wallet: {},
    } as any;

    const client = new AegisClient(provider);
    expect(client).to.not.be.undefined;
  });
});
