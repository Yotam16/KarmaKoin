/*--------------------------------------------------------
    DON'T FORGET TO COMPILE ME!
    tsc public/index.ts --target ES6
----------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const API_BASE = "/";
function printOutput(msg) {
    const panel = document.getElementById("outputContent");
    const ts = new Date().toLocaleTimeString();
    panel.textContent += `[${ts}] ${msg}\n\n`;
    panel.parentElement.scrollTop = panel.parentElement.scrollHeight;
}
function fetchJSON(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, options = {}) {
        const res = yield fetch(url, options);
        return yield res.json();
    });
}
// ---------------- Handlers ----------------
// Show users
const btnUsers = document.getElementById("btnUsers");
btnUsers.onclick = () => __awaiter(this, void 0, void 0, function* () {
    const users = yield fetchJSON(API_BASE + "users");
    printOutput("Users:\n" + JSON.stringify(users, null, 2));
});
// Mint coins
const btnMint = document.getElementById("btnMint");
btnMint.onclick = () => __awaiter(this, void 0, void 0, function* () {
    const user = document.getElementById("mintUser").value.trim();
    const amount = Number(document.getElementById("mintAmount").value);
    const data = yield fetchJSON(API_BASE + "mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: user, amount, create: true })
    });
    if (data.error)
        printOutput("Error: " + data.error);
    else
        printOutput(`${data.message}\nNew balance: ${data.balance}`);
});
// Transfer coins
const btnTransfer = document.getElementById("btnTransfer");
btnTransfer.onclick = () => __awaiter(this, void 0, void 0, function* () {
    const fromUser = document.getElementById("fromUser").value.trim();
    const toUser = document.getElementById("toUser").value.trim();
    const amount = Number(document.getElementById("transferAmount").value);
    const data = yield fetchJSON(API_BASE + "transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUserId: fromUser, toUserId: toUser, amount, create: true })
    });
    if (data.error)
        printOutput("Error: " + data.error);
    else
        printOutput(`${data.message}\n${fromUser} balance: ${data.fromBalance}\n${toUser} balance: ${data.toBalance}`);
});
// Show ledger
const btnLedger = document.getElementById("btnLedger");
btnLedger.onclick = () => __awaiter(this, void 0, void 0, function* () {
    const ledger = yield fetchJSON(API_BASE + "ledger");
    printOutput("Ledger:\n" + JSON.stringify(ledger, null, 2));
});
// Clear messages
const btnClear = document.getElementById("clearBtn");
btnClear.onclick = () => {
    const output = document.getElementById("outputContent");
    output.textContent = "";
};
