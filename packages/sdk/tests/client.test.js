"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const anchor = __importStar(require("@coral-xyz/anchor"));
const chai_1 = require("chai");
const utils_1 = require("../src/utils");
describe("Aegis SDK Client", () => {
    // Use the environment provider (wallet and cluster from env or defaults)
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const client = new src_1.AegisClient(provider);
    it("should initialize a message", async () => {
        const messageKeypair = anchor.web3.Keypair.generate();
        const message = "Hello SDK Test";
        utils_1.logger.info(`Initializing message account: ${messageKeypair.publicKey.toBase58()}`);
        try {
            const tx = await client.initMessage(messageKeypair, message);
            utils_1.logger.info(`Transaction signature: ${tx}`);
            chai_1.assert.ok(tx, "Transaction signature should exist");
            // Fetch the message to verify
            const account = await client.fetchMessage(messageKeypair.publicKey);
            utils_1.logger.info(`Fetched message: ${account.message}`);
            chai_1.assert.equal(account.message, message, "Message should match");
        }
        catch (err) {
            utils_1.logger.error(`Error: ${err}`);
            throw err;
        }
    });
});
