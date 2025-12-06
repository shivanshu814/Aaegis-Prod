/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aegis_vault.json`.
 */
export type AegisVault = {
  "address": "71Wb7tohP36AHMxCoBaSL2osriCnNuxgdRNLyM9FZRu8",
  "metadata": {
    "name": "aegisVault",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "aegis vault"
  },
  "instructions": [
    {
      "name": "addRole",
      "discriminator": [
        45,
        20,
        52,
        132,
        56,
        24,
        179,
        37
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "adminPubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        },
        {
          "name": "targetAccount"
        }
      ],
      "args": [
        {
          "name": "roleType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "createVaultType",
      "discriminator": [
        189,
        181,
        162,
        156,
        111,
        162,
        38,
        254
      ],
      "accounts": [
        {
          "name": "vaultType",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  45,
                  116,
                  121,
                  112,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "collateralMint"
              }
            ]
          }
        },
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
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
          "name": "collateralMint",
          "type": "pubkey"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "createVaultTypeParams"
            }
          }
        }
      ]
    },
    {
      "name": "depositCollateral",
      "discriminator": [
        156,
        131,
        142,
        116,
        146,
        247,
        162,
        120
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "vaultType",
          "relations": [
            "position"
          ]
        },
        {
          "name": "protocolState"
        },
        {
          "name": "userCollateralAccount",
          "writable": true
        },
        {
          "name": "vaultCollateralAccount",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "oraclePriceAccount"
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getLatestPrice",
      "discriminator": [
        195,
        49,
        189,
        171,
        219,
        140,
        79,
        207
      ],
      "accounts": [
        {
          "name": "protocolState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "oraclePriceAccount"
        }
      ],
      "args": [],
      "returns": "u64"
    },
    {
      "name": "initializeProtocol",
      "discriminator": [
        188,
        233,
        252,
        106,
        134,
        146,
        202,
        91
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
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
          "name": "treasuryPubkey",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "liquidatePosition",
      "discriminator": [
        187,
        74,
        229,
        149,
        102,
        81,
        221,
        68
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "position.owner",
                "account": "position"
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "vaultType",
          "relations": [
            "position"
          ]
        },
        {
          "name": "protocolState",
          "writable": true
        },
        {
          "name": "stablecoinMint",
          "writable": true
        },
        {
          "name": "liquidatorStablecoinAccount",
          "writable": true
        },
        {
          "name": "liquidatorCollateralAccount",
          "writable": true
        },
        {
          "name": "vaultCollateralAccount",
          "writable": true
        },
        {
          "name": "treasuryCollateralAccount",
          "docs": [
            "Treasury collateral account to receive protocol's share of penalty"
          ],
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "oraclePriceAccount"
        },
        {
          "name": "liquidator",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "repayAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintStablecoin",
      "discriminator": [
        196,
        235,
        215,
        70,
        211,
        5,
        214,
        238
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "vaultType",
          "relations": [
            "position"
          ]
        },
        {
          "name": "protocolState",
          "writable": true
        },
        {
          "name": "stablecoinMint",
          "writable": true
        },
        {
          "name": "userStablecoinAccount",
          "writable": true
        },
        {
          "name": "treasuryStablecoinAccount",
          "docs": [
            "Treasury stablecoin account to receive fees"
          ],
          "writable": true
        },
        {
          "name": "mintAuthority"
        },
        {
          "name": "oraclePriceAccount"
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "openPosition",
      "discriminator": [
        135,
        128,
        47,
        77,
        15,
        152,
        240,
        49
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "vaultType"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "removeRole",
      "discriminator": [
        74,
        69,
        168,
        163,
        248,
        3,
        130,
        0
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "adminPubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "roleType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "repayStablecoin",
      "discriminator": [
        111,
        17,
        16,
        248,
        213,
        201,
        133,
        107
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "vaultType",
          "relations": [
            "position"
          ]
        },
        {
          "name": "protocolState",
          "writable": true
        },
        {
          "name": "stablecoinMint",
          "writable": true
        },
        {
          "name": "userStablecoinAccount",
          "writable": true
        },
        {
          "name": "treasuryStablecoinAccount",
          "docs": [
            "Treasury stablecoin account to receive fees"
          ],
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setCollateralRatioBps",
      "discriminator": [
        143,
        179,
        226,
        207,
        4,
        137,
        191,
        9
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newCollateralRatioBps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setDefaultVaultDebtCeiling",
      "discriminator": [
        213,
        250,
        103,
        148,
        29,
        220,
        240,
        81
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newCeiling",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setGlobalDebtCeiling",
      "discriminator": [
        23,
        14,
        56,
        201,
        136,
        38,
        72,
        19
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newGlobalDebtCeiling",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setLiquidationPenaltyBps",
      "discriminator": [
        79,
        20,
        67,
        76,
        67,
        122,
        64,
        217
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newLiquidationPenaltyBps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setLiquidationThresholdBps",
      "discriminator": [
        240,
        171,
        134,
        1,
        231,
        151,
        240,
        201
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newLiquidationThresholdBps",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMintFeeBps",
      "discriminator": [
        75,
        255,
        91,
        143,
        214,
        189,
        40,
        99
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newMintFeeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setOracleTtlSeconds",
      "discriminator": [
        78,
        147,
        211,
        13,
        178,
        215,
        149,
        179
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newTtlSeconds",
          "type": "i64"
        }
      ]
    },
    {
      "name": "setRedeemFeeBps",
      "discriminator": [
        11,
        181,
        246,
        199,
        69,
        139,
        87,
        153
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newRedeemFeeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setStabilityFeeBps",
      "discriminator": [
        115,
        202,
        86,
        19,
        8,
        114,
        237,
        145
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newStabilityFeeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setStablecoinMint",
      "discriminator": [
        147,
        26,
        168,
        171,
        29,
        135,
        26,
        92
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "adminPubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "stablecoinMint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "toggleVaultActive",
      "discriminator": [
        158,
        40,
        6,
        178,
        102,
        199,
        254,
        73
      ],
      "accounts": [
        {
          "name": "vaultType",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  45,
                  116,
                  121,
                  112,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "vault_type.collateral_mint",
                "account": "vaultType"
              }
            ]
          }
        },
        {
          "name": "protocolState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "updateFeatureFlags",
      "discriminator": [
        139,
        88,
        184,
        214,
        40,
        6,
        55,
        247
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "guardianPubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateFeatureFlagsParams"
            }
          }
        }
      ]
    },
    {
      "name": "updateOracleAuthority",
      "discriminator": [
        69,
        65,
        130,
        209,
        32,
        196,
        23,
        43
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "adminPubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newAuthority",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateTreasury",
      "discriminator": [
        60,
        16,
        243,
        66,
        96,
        59,
        254,
        131
      ],
      "accounts": [
        {
          "name": "protocolState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governancePubkey",
          "signer": true,
          "relations": [
            "protocolState"
          ]
        }
      ],
      "args": [
        {
          "name": "newTreasury",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateVaultType",
      "discriminator": [
        143,
        242,
        47,
        136,
        79,
        121,
        83,
        103
      ],
      "accounts": [
        {
          "name": "vaultType",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  45,
                  116,
                  121,
                  112,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "vault_type.collateral_mint",
                "account": "vaultType"
              }
            ]
          }
        },
        {
          "name": "protocolState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updateVaultTypeParams"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawCollateral",
      "discriminator": [
        115,
        135,
        168,
        106,
        139,
        214,
        138,
        150
      ],
      "accounts": [
        {
          "name": "position",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "vaultType",
          "relations": [
            "position"
          ]
        },
        {
          "name": "protocolState"
        },
        {
          "name": "userCollateralAccount",
          "writable": true
        },
        {
          "name": "vaultCollateralAccount",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "vaultType"
              }
            ]
          }
        },
        {
          "name": "oraclePriceAccount"
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "position"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    },
    {
      "name": "protocolState",
      "discriminator": [
        33,
        51,
        173,
        134,
        35,
        140,
        195,
        248
      ]
    },
    {
      "name": "vaultType",
      "discriminator": [
        251,
        71,
        249,
        103,
        117,
        71,
        62,
        101
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6001,
      "name": "invalidFee",
      "msg": "Fee must be less than or equal to 100% (10000 basis points)."
    },
    {
      "code": 6002,
      "name": "mathOverflow",
      "msg": "Math operation overflow."
    },
    {
      "code": 6003,
      "name": "protocolPaused",
      "msg": "Protocol is currently paused."
    },
    {
      "code": 6004,
      "name": "protocolShutdown",
      "msg": "Protocol is shutdown."
    },
    {
      "code": 6005,
      "name": "oracleStale",
      "msg": "Oracle price is stale or invalid."
    },
    {
      "code": 6006,
      "name": "invalidAmount",
      "msg": "Invalid amount specified."
    },
    {
      "code": 6007,
      "name": "exceedsLtv",
      "msg": "Exceeds LTV ratio limit."
    },
    {
      "code": 6008,
      "name": "exceedsDebtCeiling",
      "msg": "Exceeds debt ceiling."
    },
    {
      "code": 6009,
      "name": "positionHealthy",
      "msg": "Position is healthy and cannot be liquidated."
    },
    {
      "code": 6010,
      "name": "insufficientCollateral",
      "msg": "Insufficient collateral in position."
    },
    {
      "code": 6011,
      "name": "insufficientBalance",
      "msg": "Insufficient token balance."
    },
    {
      "code": 6012,
      "name": "mintPaused",
      "msg": "Minting is currently paused."
    },
    {
      "code": 6013,
      "name": "redeemPaused",
      "msg": "Redemption is currently paused."
    }
  ],
  "types": [
    {
      "name": "createVaultTypeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oraclePriceAccount",
            "type": "pubkey"
          },
          {
            "name": "ltvBps",
            "type": "u64"
          },
          {
            "name": "liqThresholdBps",
            "type": "u64"
          },
          {
            "name": "liqPenaltyBps",
            "type": "u64"
          },
          {
            "name": "stabilityFeeBps",
            "type": "u16"
          },
          {
            "name": "mintFeeBps",
            "type": "u16"
          },
          {
            "name": "redeemFeeBps",
            "type": "u16"
          },
          {
            "name": "vaultDebtCeiling",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Owner of this position"
            ],
            "type": "pubkey"
          },
          {
            "name": "vaultType",
            "docs": [
              "Vault type this position belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "collateralAmount",
            "docs": [
              "Amount of collateral deposited (in collateral token decimals)"
            ],
            "type": "u64"
          },
          {
            "name": "debtAmount",
            "docs": [
              "Amount of stablecoin debt (in 6 decimals)"
            ],
            "type": "u64"
          },
          {
            "name": "createdAt",
            "docs": [
              "Timestamp when position was created"
            ],
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "docs": [
              "Timestamp when position was last updated"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "protocolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "adminPubkey",
            "type": "pubkey"
          },
          {
            "name": "governancePubkey",
            "type": "pubkey"
          },
          {
            "name": "guardianPubkey",
            "type": "pubkey"
          },
          {
            "name": "oracleUpdateAuthority",
            "type": "pubkey"
          },
          {
            "name": "treasuryPubkey",
            "type": "pubkey"
          },
          {
            "name": "treasuryAta",
            "type": "pubkey"
          },
          {
            "name": "stablecoinMint",
            "type": "pubkey"
          },
          {
            "name": "mintAuthorityBump",
            "type": "u8"
          },
          {
            "name": "baseCollateralRatioBps",
            "type": "u64"
          },
          {
            "name": "baseLiquidationThresholdBps",
            "type": "u64"
          },
          {
            "name": "baseLiquidationPenaltyBps",
            "type": "u64"
          },
          {
            "name": "baseStabilityFeeBps",
            "type": "u16"
          },
          {
            "name": "baseMintFeeBps",
            "type": "u16"
          },
          {
            "name": "baseRedeemFeeBps",
            "type": "u16"
          },
          {
            "name": "oracleTtlSeconds",
            "type": "i64"
          },
          {
            "name": "globalDebtCeiling",
            "type": "u64"
          },
          {
            "name": "defaultVaultDebtCeiling",
            "type": "u64"
          },
          {
            "name": "isProtocolPaused",
            "type": "bool"
          },
          {
            "name": "isMintPaused",
            "type": "bool"
          },
          {
            "name": "isRedeemPaused",
            "type": "bool"
          },
          {
            "name": "isShutdown",
            "type": "bool"
          },
          {
            "name": "totalProtocolDebt",
            "type": "u64"
          },
          {
            "name": "totalProtocolCollateralValue",
            "type": "u64"
          },
          {
            "name": "totalMintFeesCollected",
            "type": "u64"
          },
          {
            "name": "totalRedeemFeesCollected",
            "type": "u64"
          },
          {
            "name": "totalLiquidationFeesCollected",
            "type": "u64"
          },
          {
            "name": "configVersion",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                40
              ]
            }
          }
        ]
      }
    },
    {
      "name": "updateFeatureFlagsParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isProtocolPaused",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "isMintPaused",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "isRedeemPaused",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "isShutdown",
            "type": {
              "option": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "updateVaultTypeParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oraclePriceAccount",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "ltvBps",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "liqThresholdBps",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "liqPenaltyBps",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "stabilityFeeBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "mintFeeBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "redeemFeeBps",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "vaultDebtCeiling",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "vaultType",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vaultTypeId",
            "type": "u32"
          },
          {
            "name": "collateralMint",
            "type": "pubkey"
          },
          {
            "name": "oraclePriceAccount",
            "type": "pubkey"
          },
          {
            "name": "ltvBps",
            "type": "u64"
          },
          {
            "name": "liqThresholdBps",
            "type": "u64"
          },
          {
            "name": "liqPenaltyBps",
            "type": "u64"
          },
          {
            "name": "stabilityFeeBps",
            "type": "u16"
          },
          {
            "name": "mintFeeBps",
            "type": "u16"
          },
          {
            "name": "redeemFeeBps",
            "type": "u16"
          },
          {
            "name": "vaultDebtCeiling",
            "type": "u64"
          },
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          }
        ]
      }
    }
  ]
};
