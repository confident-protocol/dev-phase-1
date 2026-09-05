// Mock data mirror of the backend — used when the Node backend isn't running
// (for example, in the local preview). Keeps the UI fully demo-able.

export const ADMIN_USER = {
  email: "admin@confidentialpay.com",
  name: "Admin User",
  role: "admin" as const,
  company: "ConfidentialPay Inc",
};

export const mockEmployees = [
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

export const mockTransactions = [
  { id: "0x7f3e8a", type: "payroll", amount: 45230, status: "completed", chain: "BNB", date: new Date(Date.now() - 1000 * 60 * 2).toISOString(), employees: 12, fee: 12.5 },
  { id: "0x9a1cd2", type: "bridge", amount: 12000, status: "processing", chain: "ETH", date: new Date(Date.now() - 1000 * 60 * 60).toISOString(), from: "BNB", to: "SOL", fee: 8.2 },
  { id: "0x3e7b91", type: "payroll", amount: 23500, status: "completed", chain: "ETH", date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), employees: 5, fee: 18.4 },
  { id: "0xa12fc4", type: "deposit", amount: 100000, status: "completed", chain: "BNB", date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), fee: 1.2 },
  { id: "0xb84d05", type: "payroll", amount: 38900, status: "completed", chain: "SOL", date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), employees: 8, fee: 4.5 },
  { id: "0xc92e16", type: "withdraw", amount: 5000, status: "completed", chain: "BNB", date: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(), fee: 2.5 },
  { id: "0xd03f27", type: "payroll", amount: 41200, status: "failed", chain: "BASE", date: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(), employees: 9, fee: 6.1 },
  { id: "0xe14038", type: "bridge", amount: 8500, status: "completed", chain: "ETH", date: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(), from: "ETH", to: "BNB", fee: 14.3 },
];

export const mockScheduled = [
  { id: "s1", date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), employees: 12, amount: 45230, chain: "BNB", template: "Monthly Engineering" },
  { id: "s2", date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), employees: 8, amount: 28100, chain: "ETH", template: "Designers Bi-weekly" },
  { id: "s3", date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(), employees: 5, amount: 19500, chain: "SOL", template: "Contractors" },
];

export const mockTemplates = [
  { id: "t1", name: "Monthly Engineering", employees: 12, amount: 45230, chain: "BNB", lastUsed: "2024-05-01" },
  { id: "t2", name: "Designers Bi-weekly", employees: 8, amount: 28100, chain: "ETH", lastUsed: "2024-04-28" },
  { id: "t3", name: "Contractors", employees: 5, amount: 19500, chain: "SOL", lastUsed: "2024-04-15" },
];

export const mockStats = {
  totalPayroll: 1234567.89,
  payrollChange: 12.5,
  activeEmployees: 147,
  activeBreakdown: { active: 128, pending: 12, inactive: 7 },
  crossChainTransactions: 342,
  chainDistribution: { BNB: 65, ETH: 20, SOL: 10, BASE: 5 },
  privacyScore: 96,
  privacySubscores: { zk: 95, fhe: 92, compliance: 96 },
};

export const mockActivity = (range: string) => {
  const points = range === "weekly" ? 7 : range === "yearly" ? 12 : 30;
  const labels =
    range === "yearly"
      ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      : Array.from({ length: points }, (_, i) => `D${i + 1}`);
  return labels.map((label, i) => ({
    label,
    BNB: Math.round(20000 + Math.sin(i / 2) * 9000 + ((i * 37) % 5000)),
    ETH: Math.round(8000 + Math.cos(i / 2) * 4000 + ((i * 53) % 3000)),
    SOL: Math.round(4000 + Math.sin(i / 3) * 2000 + ((i * 29) % 1500)),
    BASE: Math.round(1800 + ((i * 41) % 1200)),
  }));
};

export const mockBalances = {
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

export const mockComplianceScore = { score: 96, kyc: 95, aml: 88, tax: 92, privacy: 96 };

export const mockComplianceStatus = {
  company: { verified: true, documents: 3, total: 3 },
  employees: mockEmployees.slice(0, 6).map((e, i) => ({
    id: e.id,
    name: e.name,
    level: i % 2 === 0 ? "Full" : "Basic",
    documents: i % 2 === 0 ? 3 : 1,
    total: 3,
    status: i % 3 === 0 ? "verified" : "pending",
  })),
};

export const mockTeam = [
  { id: "u1", name: "Admin User", email: "admin@confidentialpay.com", role: "Owner" },
  { id: "u2", name: "Sara Lopez", email: "sara@confidentialpay.com", role: "Admin" },
  { id: "u3", name: "Mike Tanaka", email: "mike@confidentialpay.com", role: "Viewer" },
];

export function mockGet(url: string): unknown {
  const u = url.split("?")[0];
  const q = new URLSearchParams(url.split("?")[1] ?? "");

  if (u === "/api/dashboard/stats") return mockStats;
  if (u === "/api/dashboard/transactions") return { items: mockTransactions };
  if (u === "/api/dashboard/payroll-activity") return { series: mockActivity(q.get("range") ?? "monthly") };
  if (u === "/api/dashboard/upcoming-payrolls") return { items: mockScheduled };

  if (u === "/api/payroll/employees" || u === "/api/employees") return { items: mockEmployees };
  if (u === "/api/payroll/scheduled") return { items: mockScheduled };
  if (u === "/api/payroll/history") return { items: mockTransactions.filter((t) => t.type === "payroll") };
  if (u === "/api/payroll/templates") return { items: mockTemplates };

  if (u === "/api/treasury/balances") return mockBalances;
  if (u === "/api/treasury/transactions") return { items: mockTransactions };

  if (u === "/api/compliance")
    return {
      policyHealth: "98%",
      auditTrail: "24",
      openIssues: "2",
      checks: [
        { id: "c1", name: "KYC Review", detail: "All treasury admins verified", status: "passed" },
        { id: "c2", name: "AML Screening", detail: "No high-risk matches detected", status: "passed" },
        { id: "c3", name: "Privacy Controls", detail: "Selective disclosure keys active", status: "pending" },
      ],
      score: mockComplianceScore,
      status: mockComplianceStatus,
    };
  if (u === "/api/compliance/score") return mockComplianceScore;
  if (u === "/api/compliance/status") return mockComplianceStatus;
  if (u === "/api/compliance/audit")
    return { items: mockTransactions.map((t) => ({ ...t, audit: t.status === "completed" ? "pass" : "review" })) };

  if (u === "/api/settings")
    return {
      company: "ConfidentialPay Inc",
      defaultChain: "BNB",
      privacyLevel: "high",
      timezone: "UTC-5",
      protocol: "ConfidentialPay",
      version: "0.9.4-orchestrator",
      feeBpsDefault: 45,
    };
  if (u === "/api/settings/team") return { items: mockTeam };

  if (u === "/api/notifications")
    return {
      items: [
        {
          id: "ntf_seed_1",
          title: "Payroll ready",
          message: "March bi-weekly batch is ready for review on BNB Chain.",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        },
        {
          id: "ntf_seed_2",
          title: "Compliance clear",
          message: "AML mesh cleared 12 employee wallets this hour.",
          read: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        },
        {
          id: "ntf_seed_3",
          title: "Treasury deposit",
          message: "USDC deposit of $10,000 confirmed on BNB.",
          read: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
      ],
    };

  if (u === "/api/auth/me") return { user: ADMIN_USER };
  return null;
}
