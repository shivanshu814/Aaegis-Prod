# 🏦 Aegis Protocol - Decentralized Stablecoin on Solana

A fully decentralized, over-collateralized stablecoin protocol built on Solana. Mint **AGSUSD** by depositing collateral and manage your positions through an intuitive interface.

![Aegis Protocol](https://avatars.githubusercontent.com/u/235737903?s=200&v=4)

## 🌟 Features

### Core Protocol
- ✅ **Over-Collateralized Positions** - Secure your debt with crypto collateral
- ✅ **Multi-Collateral Support** - Multiple vault types for different assets
- ✅ **Oracle Price Feeds** - Real-time Pyth oracle integration
- ✅ **Liquidation System** - Automated liquidations with penalties
- ✅ **Risk Parameters** - Customizable LTV ratios and thresholds
- ✅ **Emergency Controls** - Pause, shutdown, and safety mechanisms

### User Features
- 💎 **Open Positions** - Create vaults for any supported collateral
- 💵 **Deposit Collateral** - Lock assets to secure borrowing power
- 🏦 **Mint AGSUSD** - Borrow stablecoins up to your LTV limit
- 💰 **Repay Debt** - Burn AGSUSD to reduce your position
- 🔓 **Withdraw Collateral** - Remove assets while maintaining health
- 📊 **Dashboard** - Monitor all positions in real-time

### Admin Tools
- ⚙️ **Protocol Management** - Global parameters and feature flags
- 🏛️ **Vault Configuration** - Create and manage collateral types
- 🔮 **Oracle Management** - Update price feeds and authorities
- 💵 **Token Creation** - Setup AGSUSD and AGS tokens
- 👥 **Role Management** - Assign governance and guardian roles

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Solana CLI
- Anchor Framework
- Rust toolchain

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/aegis-protocol
cd aegis-protocol

# Install dependencies
pnpm install

# Build program
cd packages/program
anchor build

# Build SDK
cd ../sdk
pnpm build
```

### Deploy to Devnet

```bash
# Deploy program
cd packages/program
anchor deploy --provider.cluster devnet

# Run admin app
cd ../../apps/admin
pnpm dev
```

### Initialize Protocol

1. Navigate to `http://localhost:3000/admin/tokens`
2. Create AGSUSD stablecoin mint
3. Go to `/admin/initialize`
4. Fill in protocol parameters with AGSUSD mint
5. Transfer mint authority to protocol PDA

## 📁 Project Structure

```
aegis-protocol/
├── packages/
│   ├── program/          # Solana smart contract
│   │   └── programs/
│   │       └── aegis_vault/
│   │           ├── src/
│   │           │   ├── instructions/  # Program instructions
│   │           │   ├── state/        # Account structures
│   │           │   ├── errors/       # Error codes
│   │           │   └── utils/        # Helper functions
│   │           └── tests/
│   └── sdk/              # TypeScript SDK
│       ├── src/
│       │   ├── base-client.ts    # Main client
│       │   └── program/          # Generated IDL/types
│       ├── scripts/              # Utility scripts
│       └── metadata/             # Token metadata
├── apps/
│   ├── admin/            # Admin dashboard
│   │   └── app/
│   │       └── admin/
│   │           ├── initialize/   # Protocol setup
│   │           ├── vaults/       # Vault management
│   │           ├── protocol/     # Global controls
│   │           ├── positions/    # Position testing
│   │           └── tokens/       # Token creation
│   └── web/              # User-facing app
│       └── app/
│           ├── page.tsx          # Landing page
│           ├── vaults/           # Browse vaults
│           ├── vault/[id]/       # Vault details
│           └── dashboard/        # User dashboard
├── services/
│   ├── backend/          # tRPC API + Indexer
│   │   ├── src/
│   │   │   ├── server/          # HTTP server
│   │   │   ├── router/          # tRPC routers
│   │   │   ├── models/          # MongoDB models
│   │   │   ├── indexer/         # Data indexer
│   │   │   └── db.ts
│   │   └── package.json
│   └── guardian/         # Liquidation engine
│       ├── src/
│       │   ├── index.ts         # Main service
│       │   ├── notifications.ts  # Discord webhooks
│       │   └── db.ts
│       └── package.json
└── docs/                 # Documentation
```

## 🎯 Core Concepts

### Positions
Users open **positions** by:
1. Selecting a collateral type (vault)
2. Depositing collateral
3. Borrowing AGSUSD up to their LTV limit
4. Managing debt and collateral

### Vaults
Each **vault type** has:
- Collateral mint (e.g., SOL, wBTC)
- Oracle price feed
- Risk parameters (LTV, liquidation threshold, penalty)
- Debt ceiling

### Liquidations
Positions become liquidatable when:
- Current LTV > Liquidation Threshold
- Liquidators repay debt and receive collateral + penalty

## 🔧 Key Instructions

### Protocol Management
- `initialize_protocol` - One-time setup
- `add_role` / `remove_role` - Manage authorities
- `update_feature_flags` - Emergency controls

### Vault Management
- `create_vault_type` - Add new collateral type
- `update_vault_type` - Modify parameters
- `toggle_vault_active` - Enable/disable

### Position Management
- `open_position` - Initialize user position
- `deposit_collateral` - Add collateral
- `mint_stablecoin` - Borrow AGSUSD
- `repay_stablecoin` - Reduce debt
- `withdraw_collateral` - Remove collateral
- `liquidate_position` - Liquidate unhealthy position

## 🎨 Tokens

### AGSUSD (Stablecoin)
- **Symbol**: AGSUSD
- **Decimals**: 6
- **Peg**: $1.00 USD
- **Backed**: Over-collateralized positions
- **Mint Authority**: Protocol PDA

### AGS (Governance)
- **Symbol**: AGS
- **Decimals**: 9
- **Purpose**: Governance & utility
- **Mint Authority**: Admin wallet

See [TOKEN_SETUP.md](./TOKEN_SETUP.md) for detailed setup instructions.

## 📊 Default Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Base LTV | 150% (15000 bps) | Max borrow ratio |
| Liq. Threshold | 130% (13000 bps) | Liquidation trigger |
| Liq. Penalty | 10% (1000 bps) | Liquidator bonus |
| Stability Fee | 0% | Annual interest |
| Mint Fee | 0% | One-time minting fee |
| Redeem Fee | 0% | Redemption fee |

## 🔐 Security

- ✅ Over-collateralization required
- ✅ Oracle price validation with TTL
- ✅ Emergency pause mechanisms
- ✅ Role-based access control
- ✅ Liquidation incentives

## 🛠️ Development

### Run Tests
```bash
cd packages/program
anchor test
```

### Local Validator
```bash
solana-test-validator
```

### Generate IDL
```bash
anchor build
cp target/idl/aegis_vault.json packages/sdk/src/program/idl.json
```

## 📖 Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Token Setup](./TOKEN_SETUP.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

Apache 2.0

## 🔗 Links

- **Website**: https://aaegis-web.onrender.com
- **Docs**: Coming soon
- **Discord**: Coming soon
- **Twitter**: Coming soon

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Not audited for production use.

---

Built with ❤️ on Solana using Anchor Framework
