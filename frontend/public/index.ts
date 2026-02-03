const API_BASE = "/";

let currentUserId: string | null = null;
let currentRole: string | null = null;

function printOutput(msg: string) {
  const panel = document.getElementById("outputContent") as HTMLPreElement;
  const ts = new Date().toLocaleTimeString();
  panel.textContent += `[${ts}] ${msg}\n\n`;
  panel.scrollTop = panel.scrollHeight;
}

async function fetchJSON(url: string, options: any = {}) {
  const res = await fetch(url, options);
  return await res.json();
}

/* ------------------------- LOGIN ------------------------- */
const loginMsg = document.getElementById("loginMsg") as HTMLParagraphElement;
document.getElementById("btnLogin")!.onclick = async () => {
  const userId = (document.getElementById("loginUserId") as HTMLInputElement).value.trim();
  const password = (document.getElementById("loginPassword") as HTMLInputElement).value;

  if (!userId || !password) {
    loginMsg.textContent = "Enter both User ID and password.";
    return;
  }

  const data = await fetchJSON(API_BASE + "login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password }),
  });

  if (data.error) {
    loginMsg.textContent = "Login failed: " + data.error;
    return;
  }

  currentUserId = data.userId;
  currentRole = data.role;
  loginMsg.textContent = `Welcome ${data.userId} (${data.role})`;

  // Hide login section, show main controls
  (document.getElementById("loginSection") as HTMLDivElement).style.display = "none";
  (document.getElementById("mainControls") as HTMLDivElement).style.display = "block";

  printOutput(`User logged in: ${currentUserId} (${currentRole})`);
};

/* ------------------------- SHOW USERS ------------------------- */
document.getElementById("btnUsers")!.onclick = async () => {
  if (!currentUserId || !currentRole) return;

  const users = await fetchJSON(API_BASE + "users");

  if (currentRole === "admin") {
    printOutput("All Users:\n" + JSON.stringify(users, null, 2));
  } else {
    const user = users.find((u: any) => u.id === currentUserId);
    printOutput(`Your balance info:\n${user?.fname} ${user?.sname} (${currentUserId})`);
  }
};

/* ------------------------- MINT COINS ------------------------- */
document.getElementById("btnMint")!.onclick = async () => {
  if (currentRole !== "admin") {
    printOutput("Error: Only admin can mint coins");
    return;
  }

  const toUser = (document.getElementById("mintUser") as HTMLInputElement).value.trim();
  const amount = Number((document.getElementById("mintAmount") as HTMLInputElement).value);

  const data = await fetchJSON(API_BASE + "mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toUserId: toUser, amount, create: true }),
  });

  if (data.error) printOutput("Error: " + data.error);
  else printOutput(`${data.message}\nNew balance: ${data.balance}`);
};

/* ------------------------- TRANSFER COINS ------------------------- */
document.getElementById("btnTransfer")!.onclick = async () => {
  const fromUser = (document.getElementById("fromUser") as HTMLInputElement).value.trim();
  const toUser = (document.getElementById("toUser") as HTMLInputElement).value.trim();
  const amount = Number((document.getElementById("transferAmount") as HTMLInputElement).value);

  if (currentRole === "user" && fromUser !== currentUserId) {
    printOutput("Error: You can only transfer from your own account");
    return;
  }

  const data = await fetchJSON(API_BASE + "transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromUserId: fromUser, toUserId: toUser, amount, create: true }),
  });

  if (data.error) printOutput("Error: " + data.error);
  else printOutput(`${data.message}\n${fromUser} balance: ${data.fromBalance}\n${toUser} balance: ${data.toBalance}`);
};

/* ------------------------- SHOW LEDGER ------------------------- */
document.getElementById("btnLedger")!.onclick = async () => {
  if (currentRole !== "admin") {
    printOutput("Error: Only admin can view ledger");
    return;
  }

  const ledger = await fetchJSON(API_BASE + "ledger");
  printOutput("Ledger:\n" + JSON.stringify(ledger, null, 2));
};

/* ------------------------- CLEAR OUTPUT ------------------------- */
document.getElementById("clearBtn")!.onclick = () => {
  (document.getElementById("outputContent") as HTMLPreElement).textContent = "";
};
