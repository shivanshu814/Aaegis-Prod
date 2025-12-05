# Aegis Backend Services

This folder contains the backend infrastructure for the Aegis Protocol.

## Services

### 1. Backend (tRPC API + Indexer)

**Location**: `services/backend`

The backend service provides a tRPC API for querying protocol data and includes an indexer for syncing on-chain data to MongoDB.

#### Features
- **tRPC API**: Type-safe API endpoints for frontend consumption
- **MongoDB**: Data storage for positions, vaults, and protocol state
- **Indexer**: Syncs on-chain data from Solana to MongoDB

#### Setup
```bash
cd services/backend
pnpm install
```

#### Environment Variables
Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/aegis
CONNECTION_URL=https://api.devnet.solana.com
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Running

**Development**:
```bash
pnpm dev
```

**Production**:
```bash
pnpm build
pnpm start
```

**Run Indexer** (one-time or scheduled):
```bash
pnpm indexer
```

#### API Endpoints

The tRPC API is accessible at `http://localhost:4000/v1`

**Available Procedures**:
- `health.check` - Health check
- `positions.getByOwner({ owner: string })` - Get positions for a user
- `positions.getAll()` - Get all positions
- `positions.getRisky({ threshold: number })` - Get risky positions
- `vaults.getAll()` - Get all vault types
- `protocol.getStats()` - Get protocol statistics

---

### 2. Guardian (Liquidation Engine)

**Location**: `services/guardian`

The Guardian service monitors positions and automatically triggers liquidations when positions become unsafe.

#### Features
- **Automated Liquidation**: Monitors positions every minute
- **Health Check**: Calculates position health based on collateral value and debt
- **Risk Management**: Triggers liquidations when LTV threshold is breached

#### Setup
```bash
cd services/guardian
pnpm install
```

#### Environment Variables
Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/aegis
CONNECTION_URL=https://api.devnet.solana.com
```

#### Running

**Development**:
```bash
pnpm dev
```

**Production**:
```bash
pnpm build
pnpm start
```

#### How It Works

1. **Cron Schedule**: Runs every minute (`* * * * *`)
2. **Fetch Positions**: Queries MongoDB for all positions
3. **Calculate Health**: For each position:
   - Fetches current Oracle price
   - Calculates collateral value in USD
   - Compares debt to liquidation threshold
4. **Liquidate**: If position is unsafe, calls `client.liquidatePosition()`

#### Liquidation Logic

```typescript
// Collateral Value = (Collateral Amount / 10^9) * Price
// Liquidation Limit = Collateral Value * Liquidation Threshold
// If Debt > Liquidation Limit, liquidate 50% of debt
```

---

## Deployment

Both services are configured in `render.yaml`:

```yaml
# Backend API
- type: web
  name: aaegis-backend
  buildCommand: pnpm install --prod=false && pnpm turbo run build --filter=@aegis/backend...
  startCommand: cd services/backend && pnpm start

# Guardian Worker
- type: worker
  name: aaegis-guardian
  buildCommand: pnpm install --prod=false && pnpm turbo run build --filter=@aegis/guardian...
  startCommand: cd services/guardian && pnpm start
```

---

## Database Schema

### Position
```typescript
{
  owner: string;
  vaultType: string;
  collateralAmount: number;
  debtAmount: number;
  updatedAt: number;
  healthFactor: number;
}
```

### VaultType
```typescript
{
  collateralMint: string;
  oraclePriceAccount: string;
  ltvBps: number;
  liqThresholdBps: number;
  liqPenaltyBps: number;
  stabilityFeeBps: number;
  mintFeeBps: number;
  redeemFeeBps: number;
  vaultDebtCeiling: number;
  isActive: boolean;
  totalCollateral: number;
  totalDebt: number;
}
```

### ProtocolState
```typescript
{
  adminPubkey: string;
  treasuryPubkey: string;
  stablecoinMint: string;
  totalProtocolDebt: number;
  globalDebtCeiling: number;
  updatedAt: number;
}
```

---

## Development Workflow

1. **Start MongoDB**:
   ```bash
   mongod --dbpath ./data
   ```

2. **Run Backend API**:
   ```bash
   cd services/backend
   pnpm dev
   ```

3. **Run Indexer** (in another terminal):
   ```bash
   cd services/backend
   pnpm indexer
   ```

4. **Run Guardian** (in another terminal):
   ```bash
   cd services/guardian
   pnpm dev
   ```

5. **Connect Frontend**:
   Update frontend `.env`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/v1
   ```

---

## Monitoring

- **Backend Logs**: Check winston logs for API requests and indexer activity
- **Guardian Logs**: Monitor for liquidation attempts and position health checks
- **MongoDB**: Use MongoDB Compass or CLI to inspect data

---

## Future Enhancements

- [ ] Real-time WebSocket updates for position changes
- [ ] Redis caching for frequently accessed data
- [ ] Metrics dashboard (Prometheus + Grafana)
- [ ] Alert system (Discord/Email notifications)
- [ ] Multi-signature support for guardian liquidations
- [ ] Historical data tracking for analytics
