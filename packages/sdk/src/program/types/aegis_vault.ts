/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aegis_vault.json`.
 */
export type AegisVault = {
  "address": "8nj2vusE752EDbTE8mWJZ2qQsPohrrkBpwqKgMxJysyw",
  "metadata": {
    "name": "aegisVault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "aegis vault"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "messageAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "messageAccount",
      "discriminator": [
        97,
        144,
        24,
        58,
        225,
        40,
        89,
        223
      ]
    }
  ],
  "types": [
    {
      "name": "messageAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "string"
          }
        ]
      }
    }
  ]
};
