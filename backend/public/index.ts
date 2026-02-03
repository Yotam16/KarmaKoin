/*--------------------------------------------------------
    DON'T FORGET TO COMPILE ME!
    npx tsc public/index.ts --outFile public/index.js --target ES6 --module system
----------------------------------------------------------*/

(() => {
  const API_BASE = "/";
  let currentUserId: string | null = null;
  let currentRole: string | null = null;

  function printOutput(msg: string): void {
    const panel = document.getElementById("outputContent") as HTMLPreElement;
    const ts = new Date().toLocaleTimeString();
    panel.textContent += `[${ts}] ${msg}\n\n`;
    panel.parentElement!.scrollTop = panel.parentElement!.scrollHeight;
  }

  async function fetchJSON(url: string, options: RequestInit = {}): Promise<any> {
    const res = await fetch(url, options);
    return await res.json();
  }

  // ---------------- Handlers ----------------

  const btnUsers = document.getElementById("btnUsers") as HTMLButtonElement;
  btnUsers.onclick = async () => {
    const users = await fetchJSON(API_BASE + "users");
    printOutput("Users:\n" + JSON.stringify(users, null, 2));
  };

  const btnMint = document.getElementById("btnMint") as HTMLButtonElement;
  btnMint.onclick = async () => {
    const user = (document.getElementById("mintUser") as HTMLInputElement).value.trim();
    const amount = Number((document.getElementById("mintAmount") as HTMLInputElement).value);
    const data = await fetchJSON(API_BASE + "mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: user, amount, create: true })
    });
    if (data.error) printOutput("Error: " + data.error);
    else printOutput(`${data.message}\nNew balance: ${data.balance}`);
  };

  const btnTransfer = document.getElementById("btnTransfer") as HTMLButtonElement;
  btnTransfer.onclick = async () => {
    const fromUser = (document.getElementById("fromUser") as HTMLInputElement).value.trim();
    const toUser = (document.getElementById("toUser") as HTMLInputElement).value.trim();
    const amount = Number((document.getElementById("transferAmount") as HTMLInputElement).value);

    const data = await fetchJSON(API_BASE + "transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromUserId: fromUser, toUserId: toUser, amount, create: true })
    });

    if (data.error) printOutput("Error: " + data.error);
    else printOutput(`${data.message}\n${fromUser} balance: ${data.fromBalance}\n${toUser} balance: ${data.toBalance}`);
  };

  const btnLedger = document.getElementById("btnLedger") as HTMLButtonElement;
  btnLedger.onclick = async () => {
    const ledger = await fetchJSON(API_BASE + "ledger");
    printOutput("Ledger:\n" + JSON.stringify(ledger, null, 2));
  };

  const btnClear = document.getElementById("clearBtn") as HTMLButtonElement;
  btnClear.onclick = () => {
    const output = document.getElementById("outputContent") as HTMLPreElement;
    output.textContent = "";
  };

})();
