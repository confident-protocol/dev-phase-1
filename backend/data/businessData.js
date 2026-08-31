const VALID_EMAIL = "admin@confidentialpay.com";
const VALID_PASSWORD = "00000";

const ADMIN_USER = {
  email: VALID_EMAIL,
  name: "Admin User",
  role: "admin",
  company: "ConfidentialPay Inc",
};

const employees = [
  { id: "e1", name: "Alice Johnson", wallet: "0x7f3eA4b21cD9f08B5a6c11E0B23F8a9D4cE7b210", role: "Engineer", salary: 8500, status: "active", lastPaid: "2024-05-01", email: "alice@confidentialpay.com", startDate: "2024-01-15", chain: "BNB" },
  { id: "e2", name: "Bob Smith", wallet: "0x9a1Bd4eF87C3a2B6D9E5fA01237c4D5e6F7890Ab", role: "Designer", salary: 7200, status: "active", lastPaid: "2024-04-28", email: "bob@confidentialpay.com", startDate: "2024-02-10", chain: "ETH" },
  { id: "e3", name: "Carol White", wallet: "0x3e7C2d11AbCDef0123456789abcDEF0123456789", role: "Manager", salary: 11000, status: "active", lastPaid: "2024-05-01", email: "carol@confidentialpay.com", startDate: "2023-11-02", chain: "BNB" },
  { id: "e4", name: "David Park", wallet: "0x4f8DDeAa11223344556677889900AaBbCcDdEeFf", role: "Engineer", salary: 9200, status: "active", lastPaid: "2024-05-01", email: "david@confidentialpay.com", startDate: "2024-03-12", chain: "SOL" },
  { id: "e5", name: "Eva Martinez", wallet: "0x5a9EeBbcc11deeff0011223344556677889900aA", role: "PM", salary: 10500, status: "pending", lastPaid: "—", email: "eva@confidentialpay.com", startDate: "2024-05-10", chain: "BNB" },
  { id: "e6", name: "Frank Liu", wallet: "0x6b0FfCcDD22ee001122334455667788990011BB", role: "Engineer", salary: 8800, status: "active", lastPaid: "2024-04-28", email: "frank@confidentialpay.com", startDate: "2024-01-22", chain: "BASE" },
  { id: "e7", name: "Grace Kim", wallet: "0x7c1AaDDee33ff112233445566778899001122CC", role: "Marketing", salary: 6800, status: "active", lastPaid: "2024-05-01", email: "grace@confidentialpay.com", startDate: "2024-02-28", chain: "ETH" },
  { id: "e8", name: "Henry Yang", wallet: "0x8d2BbEEff44001122334455667788990011223D", role: "Engineer", salary: 9100, status: "inactive", lastPaid: "2024-03-30", email: "henry@confidentialpay.com", startDate: "2023-10-01", chain: "BNB" },
  { id: "e9", name: "Ivy Chen", wallet: "0x9e3CcFf005511223344556677889900112233EE", role: "Designer", salary: 7400, status: "active", lastPaid: "2024-04-28", email: "ivy@confidentialpay.com", startDate: "2024-04-05", chain: "SOL" },
  { id: "e10", name: "Jack Wilson", wallet: "0xae4Dd00116622334455667788990011223344FF", role: "Sales", salary: 7900, status: "active", lastPaid: "2024-05-01", email: "jack@confidentialpay.com", startDate: "2024-01-08", chain: "BNB" },
  { id: "e11", name: "Kate Brown", wallet: "0xbf5Ee11227733445566778899001122334455A0", role: "Engineer", salary: 9600, status: "active", lastPaid: "2024-05-01", email: "kate@confidentialpay.com", startDate: "2023-12-01", chain: "ETH" },
  { id: "e12", name: "Leo Garcia", wallet: "0xc06Ff22338844556677889900112233445566B1", role: "DevOps", salary: 10200, status: "active", lastPaid: "2024-05-01", email: "leo@confidentialpay.com", startDate: "2024-02-14", chain: "BNB" },
];

const transactions = [
  { id: "0x7f3e8a", type: "payroll", amount: 45230, status: "completed", chain: "BNB", date: "2024-05-01T09:00:00Z", employees: 12, fee: 12.5 },
  { id: "0x9a1cd2", type: "bridge", amount: 12000, status: "processing", chain: "ETH", date: "2024-05-01T08:00:00Z", from: "BNB", to: "SOL", fee: 8.2 },
  { id: "0x3e7b91", type: "payroll", amount: 23500, status: "completed", chain: "ETH", date: "2024-04-28T14:30:00Z", employees: 5, fee: 18.4 },
  { id: "0xa12fc4", type: "deposit", amount: 100000, status: "completed", chain: "BNB", date: "2024-04-25T10:00:00Z", fee: 1.2 },
  { id: "0xb84d05", type: "payroll", amount: 38900, status: "completed", chain: "SOL", date: "2024-04-15T09:00:00Z", employees: 8, fee: 4.5 },
  { id: "0xc92e16", type: "withdraw", amount: 5000, status: "completed", chain: "BNB", date: "2024-04-10T11:20:00Z", fee: 2.5 },
  { id: "0xd03f27", type: "payroll", amount: 41200, status: "failed", chain: "BASE", date: "2024-04-05T09:00:00Z", employees: 9, fee: 6.1 },
  { id: "0xe14038", type: "bridge", amount: 8500, status: "completed", chain: "ETH", date: "2024-04-01T15:00:00Z", from: "ETH", to: "BNB", fee: 14.3 },
];

const scheduled = [
  { id: "s1", date: "2024-05-15T09:00:00Z", employees: 12, amount: 45230, chain: "BNB", template: "Monthly Engineering" },
  { id: "s2", date: "2024-05-15T14:00:00Z", employees: 8, amount: 28100, chain: "ETH", template: "Designers Bi-weekly" },
  { id: "s3", date: "2024-05-22T09:00:00Z", employees: 5, amount: 19500, chain: "SOL", template: "Contractors" },
];

const templates = [
  { id: "t1", name: "Monthly Engineering", employees: 12, amount: 45230, chain: "BNB", lastUsed: "2024-05-01" },
  { id: "t2", name: "Designers Bi-weekly", employees: 8, amount: 28100, chain: "ETH", lastUsed: "2024-04-28" },
  { id: "t3", name: "Contractors", employees: 5, amount: 19500, chain: "SOL", lastUsed: "2024-04-15" },
];

const services = [
  { id: "svc-1", name: "Payroll Automation", category: "Operations", description: "Automate multi-chain confidential payroll distribution", price: 2500, active: true },
  { id: "svc-2", name: "Treasury Vault", category: "Treasury", description: "Secure treasury balances and policy controls", price: 3800, active: true },
  { id: "svc-3", name: "Compliance Review", category: "Compliance", description: "KYC and AML screening with selective disclosure keys", price: 1800, active: true },
  { id: "svc-4", name: "ZK Proof Cluster", category: "Privacy", description: "Ligero/Arc batch proving for payroll and shielded transfers", price: 4200, active: true },
  { id: "svc-5", name: "FHE Roster Engine", category: "Privacy", description: "Encrypted salary state with Fhenix/Zama-compatible handles", price: 5100, active: true },
  { id: "svc-6", name: "CCTP Bridge Desk", category: "Settlement", description: "Circle CCTP burn-and-mint orchestration across domains", price: 2900, active: true },
  { id: "svc-7", name: "Hyperlane Sync", category: "Settlement", description: "Cross-VM state synchronization for payroll attestations", price: 2400, active: true },
  { id: "svc-8", name: "Agentic Micropayments", category: "Agents", description: "Private AI-agent payroll and usage-based settlements", price: 1600, active: true },
];

const dashboardStats = {
  totalPayroll: 1234567.89,
  payrollChange: 12.5,
  activeEmployees: 147,
  activeBreakdown: { active: 128, pending: 12, inactive: 7 },
  crossChainTransactions: 342,
  chainDistribution: { BNB: 65, ETH: 20, SOL: 10, BASE: 5 },
  privacyScore: 96,
  privacySubscores: { zk: 95, fhe: 92, compliance: 96 },
};

const complianceData = {
  policyHealth: "98%",
  auditTrail: "24",
  openIssues: "2",
  checks: [
    { id: "c1", name: "KYC Review", detail: "All treasury admins verified", status: "passed" },
    { id: "c2", name: "AML Screening", detail: "No high-risk matches detected", status: "passed" },
    { id: "c3", name: "Privacy Controls", detail: "Selective disclosure keys active", status: "pending" },
  ],
};

const settingsData = {
  company: "ConfidentialPay Inc",
  defaultChain: "BNB",
  privacyLevel: "high",
  timezone: "UTC-5",
  wallets: [
    { name: "Treasury Vault", chain: "BNB", address: "0x7f3eA4b21cD9f08B5a6c11E0B23F8a9D4cE7b210" },
    { name: "Operations Wallet", chain: "ETH", address: "0x9a1Bd4eF87C3a2B6D9E5fA01237c4D5e6F7890Ab" },
  ],
};

const bridgeData = {
  amount: 50000,
  history: [
    { id: "b1", label: "Reserve deposit", status: "Completed", detail: "BNB → ETH bridge confirmed" },
    { id: "b2", label: "Privacy checkpoint", status: "Queued", detail: "ZK proof pending attestation" },
  ],
};

const treasuryBalances = {
  total: 1234567,
  available: 1200000,
  reserved: 45230,
  gasFees: 1234,
  tokens: [
    { symbol: "USDC", chain: "BNB", balance: 125000, value: 125000 },
    { symbol: "BNB", chain: "BNB", balance: 45.5, value: 27300 },
    { symbol: "USDC", chain: "ETH", balance: 25000, value: 25000 },
    { symbol: "ETH", chain: "ETH", balance: 8.2, value: 24600 },
    { symbol: "USDC", chain: "SOL", balance: 15000, value: 15000 },
    { symbol: "USDC", chain: "BASE", balance: 8000, value: 8000 },
  ],
};

function buildActivitySeries(range = "monthly") {
  const points = range === "weekly" ? 7 : range === "yearly" ? 12 : 30;
  const labels = range === "yearly" ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : Array.from({ length: points }, (_, i) => `D${i + 1}`);

  return labels.map((label, i) => ({
    label,
    BNB: Math.round(20000 + Math.sin(i / 2) * 9000 + ((i * 37) % 5000)),
    ETH: Math.round(8000 + Math.cos(i / 2) * 4000 + ((i * 53) % 3000)),
    SOL: Math.round(4000 + Math.sin(i / 3) * 2000 + ((i * 29) % 1500)),
    BASE: Math.round(1800 + ((i * 41) % 1200)),
  }));
}

module.exports = {
  VALID_EMAIL,
  VALID_PASSWORD,
  ADMIN_USER,
  employees,
  transactions,
  scheduled,
  templates,
  services,
  dashboardStats,
  complianceData,
  settingsData,
  bridgeData,
  treasuryBalances,
  buildActivitySeries,
};
