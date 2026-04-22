import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

/* =========================================================
   1) PEGA AQUÍ TU CONFIG DE FIREBASE
========================================================= */
const firebaseConfig = { 
  apiKey : "AIzaSyA2NnujJ6mhHGkE96tD5Wu7b9_TqL5xVz8" , 
  authDomain : "prestamos-y-adelantos-c5c7e.firebaseapp.com" , 
  projectId : "prestamos-y-adelantos-c5c7e" , 
  storageBucket : "prestamos-y-adelantos-c5c7e.firebasestorage.app" , 
  messagingSenderId : "357105218615" , 
  appId : "1:357105218615:web:855dc31356f4f06ef7bbb2" 
};

/* =========================================================
   2) PON AQUÍ TU CORREO DE ADMIN
========================================================= */
const ADMIN_EMAILS = [
  "tu_correo_admin@ejemplo.com"
];

/* =========================================================
   FIREBASE
========================================================= */
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================================================
   DOM
========================================================= */
const todayDate = document.getElementById("todayDate");
const todayTime = document.getElementById("todayTime");
const sessionStatus = document.getElementById("sessionStatus");

const publicPanel = document.getElementById("publicPanel");
const personalPanel = document.getElementById("personalPanel");
const adminPanel = document.getElementById("adminPanel");

const profilesGrid = document.getElementById("profilesGrid");
const adminOperatorsList = document.getElementById("adminOperatorsList");
const searchOperatorInput = document.getElementById("searchOperatorInput");

const openRegisterBtn = document.getElementById("openRegisterBtn");
const openLoginBtn = document.getElementById("openLoginBtn");
const reloadOperatorsBtn = document.getElementById("reloadOperatorsBtn");
const logoutBtn = document.getElementById("logoutBtn");

const registerModal = document.getElementById("registerModal");
const loginModal = document.getElementById("loginModal");
const actionModal = document.getElementById("actionModal");

const closeRegisterBtn = document.getElementById("closeRegisterBtn");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const closeActionBtn = document.getElementById("closeActionBtn");

const confirmRegisterBtn = document.getElementById("confirmRegisterBtn");
const confirmLoginBtn = document.getElementById("confirmLoginBtn");
const confirmActionBtn = document.getElementById("confirmActionBtn");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerMsg = document.getElementById("registerMsg");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMsg = document.getElementById("loginMsg");

const actionTitle = document.getElementById("actionTitle");
const actionSubtitle = document.getElementById("actionSubtitle");
const actionAmount = document.getElementById("actionAmount");
const actionWeek = document.getElementById("actionWeek");
const actionNote = document.getElementById("actionNote");
const actionMsg = document.getElementById("actionMsg");
const weekFieldWrap = document.getElementById("weekFieldWrap");

const panelTitle = document.getElementById("panelTitle");
const panelSubtitle = document.getElementById("panelSubtitle");
const secureSessionText = document.getElementById("secureSessionText");

const mSueldo = document.getElementById("mSueldo");
const mAdelantos = document.getElementById("mAdelantos");
const mPago = document.getElementById("mPago");
const mDeuda = document.getElementById("mDeuda");
const mRestante = document.getElementById("mRestante");
const mSemanaPagada = document.getElementById("mSemanaPagada");
const mSemanaCotejada = document.getElementById("mSemanaCotejada");
const lastUpdatedText = document.getElementById("lastUpdatedText");

const activityList = document.getElementById("activityList");

const toggleAmountsBtn = document.getElementById("toggleAmountsBtn");
const requestAdvanceBtn = document.getElementById("requestAdvanceBtn");
const requestLoanBtn = document.getElementById("requestLoanBtn");
const payDebtBtn = document.getElementById("payDebtBtn");
const updateSalaryBtn = document.getElementById("updateSalaryBtn");
const applyInterestBtn = document.getElementById("applyInterestBtn");
const markReviewedBtn = document.getElementById("markReviewedBtn");

/* =========================================================
   STATE
========================================================= */
let currentUser = null;
let currentUserDoc = null;
let currentFinanceDoc = null;
let currentAction = null;
let amountsVisible = false;
let adminViewingUid = null;

/* =========================================================
   HELPERS
========================================================= */
function money(value = 0) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2
  }).format(Number(value || 0));
}

function isAdmin(email = "") {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function getCurrentWeekLabel() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-S${String(week).padStart(2, "0")}`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");
}

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function openModal(el) {
  show(el);
}

function closeModal(el) {
  hide(el);
}

function setClock() {
  const now = new Date();
  todayDate.textContent = now.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  todayTime.textContent = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit"
  });
}
setClock();
setInterval(setClock, 1000);

function calcRestante(fin) {
  return Number(fin.sueldo || 0) - Number(fin.adelantos || 0) - Number(fin.pago || 0);
}

function renderMaskedOrValue(value) {
  return amountsVisible ? money(value) : "***";
}

function clearSummary() {
  mSueldo.textContent = "***";
  mAdelantos.textContent = "***";
  mPago.textContent = "***";
  mDeuda.textContent = "***";
  mRestante.textContent = "***";
  mSemanaPagada.textContent = "No";
  mSemanaCotejada.textContent = "No";
  lastUpdatedText.textContent = "Actualizado: --";
}

function setSummary(fin) {
  if (!fin) return;

  mSueldo.textContent = renderMaskedOrValue(fin.sueldo || 0);
  mAdelantos.textContent = renderMaskedOrValue(fin.adelantos || 0);
  mPago.textContent = renderMaskedOrValue(fin.pago || 0);
  mDeuda.textContent = renderMaskedOrValue(fin.deuda || 0);
  mRestante.textContent = renderMaskedOrValue(calcRestante(fin));
  mSemanaPagada.textContent = fin.semanaMarcada ? "Sí" : "No";
  mSemanaCotejada.textContent = fin.semanaCotejada ? "Sí" : "No";
  lastUpdatedText.textContent = Actualizado: ${new Date().toLocaleString("es-MX")};
}

function resetActionFields() {
  actionAmount.value = "";
  actionWeek.value = "";
  actionNote.value = "";
  actionMsg.textContent = "";
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   PERFIL PÚBLICO
========================================================= */
async function loadProfiles() {
  profilesGrid.innerHTML = `<div class="empty-state">Cargando operadores...</div>○;

  const snap = await getDocs(collection(db, "usuarios"));
  const operadores = [];

  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.rol === "operador") operadores.push(data);
  });

  if (!operadores.length) {
    profilesGrid.innerHTML = `<div class="empty-state">Aún no hay operadores registrados.</div>`;
    return;
  }

  profilesGrid.innerHTML = "";

  operadores.forEach((u, index) => {
    const tone = index % 2 === 0 ? "green" : "purple";

    const card = document.createElement("div");
    card.className = `profile-card ${tone}`;
    card.innerHTML = `
      <div class="profile-top">
        <div class="avatar-wrap">
          <div class="avatar">${getInitials(u.nombre)}</div>
          <div>
            <div class="profile-name">${escapeHtml(u.nombre)}</div>
            <div class="tag ${tone}">ACTIVO</div>
            <div class="profile-info">
              <div>Rol: Operador</div>
              <div>Panel privado y seguro</div>
              <div>Acceso exclusivo</div>
            </div>
          </div>
        </div>
        <div class="finger">🔐</div>
      </div>
      <button class="enter-btn ${tone}">INGRESAR A MI PANEL →</button>
    `;

    card.addEventListener("click", () => {
      loginEmail.value = u.email || "";
      loginPassword.value = "";
      loginMsg.textContent = "";
      openModal(loginModal);
    });

    profilesGrid.appendChild(card);
  });
}

/* =========================================================
   REGISTRO
========================================================= */
async function registerOperator() {
  registerMsg.textContent = "";

  const name = registerName.value.trim();
  const email = registerEmail.value.trim().toLowerCase();
  const password = registerPassword.value.trim();

  if (!name || !email || !password) {
    registerMsg.textContent = "Completa todos los campos.";
    return;
  }

  if (password.length < 6) {
    registerMsg.textContent = "La contraseña debe tener mínimo 6 caracteres.";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const role = isAdmin(email) ? "admin" : "operador";

    await setDoc(doc(db, "usuarios", uid), {
      uid,
      nombre: name,
      email,
      rol: role,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "finanzas", uid), {
      uid,
      sueldo: 0,
      adelantos: 0,
      pago: 0,
      deuda: 0,
      semanaMarcada: false,
      semanaCotejada: false,
      semanaActual: getCurrentWeekLabel(),
      updatedAt: serverTimestamp()
    });

    registerMsg.style.color = "#20d38a";
    registerMsg.textContent = "Operador creado correctamente.";

    registerName.value = "";
    registerEmail.value = "";
    registerPassword.value = "";

    await loadProfiles();
  } catch (error) {
    registerMsg.style.color = "#ff9cab";
    registerMsg.textContent = error.message;
  }
}

/* =========================================================
   LOGIN / LOGOUT
========================================================= */
async function loginUser() {
  loginMsg.textContent = "";

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    loginMsg.textContent = "Escribe correo y contraseña.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal(loginModal);
    loginPassword.value = "";
  } catch (error) {
    loginMsg.textContent = "No se pudo iniciar sesión. Revisa correo y contraseña.";
  }
}

async function logoutUser() {
  await signOut(auth);
}

/* =========================================================
   CARGA DE PANEL
========================================================= */
async function loadCurrentPanel(uid) {
  const userSnap = await getDoc(doc(db, "usuarios", uid));
  const finSnap = await getDoc(doc(db, "finanzas", uid));

  if (!userSnap.exists() || !finSnap.exists()) return;

  currentUserDoc = userSnap.data();
  currentFinanceDoc = finSnap.data();

  sessionStatus.textContent = currentUserDoc.rol === "admin"
    ? "Admin"
    : currentUserDoc.nombre;

  panelTitle.textContent = `PANEL DE ${currentUserDoc.nombre.toUpperCase()}`;
  panelSubtitle.textContent = currentUserDoc.rol === "admin"
    ? "Control general y edición administrativa"
    : "Vista general de tu información financiera";

  secureSessionText.textContent = currentUserDoc.rol === "admin"
    ? "🔐 Sesión segura (Admin)"
    : "🔒 Sesión segura";

  show(personalPanel);
  show(logoutBtn);
  setSummary(currentFinanceDoc);

  document.querySelectorAll(".admin-only").forEach(el => {
    if (currentUserDoc.rol === "admin") show(el);
    else hide(el);
  });

  if (currentUserDoc.rol === "admin") {
    show(adminPanel);
    await loadAdminOperators();
  } else {
    hide(adminPanel);
  }

  await loadActivity(uid);
}

async function loadActivity(uid) {
  activityList.innerHTML = `<div class="empty-state">Cargando actividad...</div>`;

  const qRef = query(collection(db, "movimientos"), where("uid", "==", uid));
  const snap = await getDocs(qRef);

  const movements = [];
  snap.forEach(docSnap => movements.push({ id: docSnap.id, ...docSnap.data() }));

  movements.sort((a, b) => {
    const at = a.createdAt?.seconds || 0;
    const bt = b.createdAt?.seconds || 0;
    return bt - at;
  });

  if (!movements.length) {
    activityList.innerHTML = `<div class="empty-state">No hay movimientos registrados.</div>`;
    return;
  }

  activityList.innerHTML = "";

  movements.slice(0, 10).forEach(mov => {
    const div = document.createElement("div");
    div.className = "activity-item";
    div.innerHTML = `
      <div>
        <div class="activity-title">${escapeHtml(mov.tipo || "Movimiento")}</div>
        <div class="activity-sub">
          ${escapeHtml(mov.nota || "Sin nota")}<br>
          Semana: ${escapeHtml(mov.semana || "--")}<br>
          Estado: ${escapeHtml(mov.estado || "registrado")}
        </div>
      </div>
      <div class="activity-right">
        <div>${amountsVisible ? money(mov.monto || 0) : "$**"}</div>
        <div style="margin-top:4px;">
          ${mov.createdAt?.toDate ? mov.createdAt.toDate().toLocaleString("es-MX") : "--"}
        </div>
      </div>
    `;
    activityList.appendChild(div);
  });
}

/* =========================================================
   PANEL ADMIN
========================================================= */
async function loadAdminOperators() {
  adminOperatorsList.innerHTML = `<div class="empty-state">Cargando operadores...</div>`;

  const snap = await getDocs(collection(db, "usuarios"));
  const users = [];

  snap.forEach(docSnap => {
    const data = docSnap.data();
    if (data.rol === "operador") users.push(data);
  });

  const filter = searchOperatorInput.value.trim().toLowerCase();
  const filtered = users.filter(u =>
    u.nombre.toLowerCase().includes(filter) ||
    u.email.toLowerCase().includes(filter)
  );

  if (!filtered.length) {
    adminOperatorsList.innerHTML = `<div class="empty-state">No se encontraron operadores.</div>`;
    return;
  }

  adminOperatorsList.innerHTML = "";

  for (const user of filtered) {
    const finSnap = await getDoc(doc(db, "finanzas", user.uid));
    const fin = finSnap.exists() ? finSnap.data() : null;

    const card = document.createElement("div");
    card.className = "operator-card-admin";
    card.innerHTML = `
      <div class="operator-info">
        <h3>${escapeHtml(user.nombre)}</h3>
        <p>${escapeHtml(user.email)}</p>
        <p>Sueldo: ${fin ? money(fin.sueldo || 0) : "$0.00"}</p>
        <p>Deuda: ${fin ? money(fin.deuda || 0) : "$0.00"}</p>
        <p>Semana marcada: ${fin?.semanaMarcada ? "Sí" : "No"} / Cotejada: ${fin?.semanaCotejada ? "Sí" : "No"}</p>
      </div>
      <div class="operator-actions">
        <button class="btn btn-login" data-action="open" data-uid="${user.uid}">Abrir panel</button>
        <button class="btn btn-outline" data-action="salary" data-uid="${user.uid}">Actualizar sueldo</button>
        <button class="btn btn-outline" data-action="review" data-uid="${user.uid}">Cotejar semana</button>
        <button class="btn btn-outline" data-action="interest" data-uid="${user.uid}">Aplicar interés</button>
      </div>
    `;

    adminOperatorsList.appendChild(card);
  }

  adminOperatorsList.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.dataset.uid;
      const action = btn.dataset.action;

      if (action === "open") {
        adminViewingUid = uid;
        await openAdminView(uid);
      }

      if (action === "salary") {
        adminViewingUid = uid;
        openAction("salary");
      }

      if (action === "review") {
        adminViewingUid = uid;
        await reviewWeek(uid);
      }

      if (action === "interest") {
        adminViewingUid = uid;
        await applyInterest(uid);
      }
    });
  });
}

async function openAdminView(uid) {
  const userSnap = await getDoc(doc(db, "usuarios", uid));
  const finSnap = await getDoc(doc(db, "finanzas", uid));

  if (!userSnap.exists() || !finSnap.exists()) return;

  const user = userSnap.data();
  const fin = finSnap.data();

  panelTitle.textContent = `ADMIN VIENDO: ${user.nombre.toUpperCase()}`;
  panelSubtitle.textContent = `Operador: ${user.email}`;
  currentFinanceDoc = fin;

  setSummary(fin);
  await loadActivity(uid);
}

async function reviewWeek(uid) {
  const finRef = doc(db, "finanzas", uid);
  const finSnap = await getDoc(finRef);
  if (!finSnap.exists()) return;

  const fin = finSnap.data();

  await updateDoc(finRef, {
    semanaCotejada: true,
    updatedAt: serverTimestamp()
  });

  await addDoc(collection(db, "movimientos"), {
    uid,
    tipo: "Semana cotejada",
    monto: 0,
    semana: fin.semanaActual || getCurrentWeekLabel(),
    nota: "Cotejada por administrador",
    estado: "aprobado",
    createdAt: serverTimestamp()
  });

  const updatedSnap = await getDoc(finRef);
  currentFinanceDoc = updatedSnap.data();
  setSummary(currentFinanceDoc);

  if (adminViewingUid === uid || currentUser?.uid === uid) {
    await loadActivity(uid);
  }

  await loadAdminOperators();
}

async function applyInterest(uid) {
  const finRef = doc(db, "finanzas", uid);
  const finSnap = await getDoc(finRef);
  if (!finSnap.exists()) return;

  const fin = finSnap.data();
  const currentDebt = Number(fin.deuda || 0);
  const interest = +(currentDebt * 0.10).toFixed(2);
  const newDebt = +(currentDebt + interest).toFixed(2);

  await updateDoc(finRef, {
    deuda: newDebt,
    updatedAt: serverTimestamp()
  });

  await addDoc(collection(db, "movimientos"), {
    uid,
    tipo: "Interés aplicado",
    monto: interest,
    semana: fin.semanaActual || getCurrentWeekLabel(),
    nota: "Interés mensual del 10%",
    estado: "aprobado",
    createdAt: serverTimestamp()
  });

  const updatedSnap = await getDoc(finRef);
  currentFinanceDoc = updatedSnap.data();
  setSummary(currentFinanceDoc);

  if (adminViewingUid === uid || currentUser?.uid === uid) {
    await loadActivity(uid);
  }

  await loadAdminOperators();
}

/* =========================================================
   MODAL DE ACCIONES
========================================================= */
function resetActionFields() {
  actionAmount.value = "";
  actionWeek.value = "";
  actionNote.value = "";
  actionMsg.textContent = "";
}

function openAction(type) {
  currentAction = type;
  resetActionFields();

  if (type === "advance") {
    actionTitle.textContent = "Solicitar adelanto";
    actionSubtitle.textContent = "Se registrará como adelanto directo.";
    hide(weekFieldWrap);
  }

  if (type === "loan") {
    actionTitle.textContent = "Solicitar préstamo";
    actionSubtitle.textContent = "Se registrará como préstamo directo.";
    hide(weekFieldWrap);
  }

  if (type === "payment") {
    actionTitle.textContent = "Registrar pago";
    actionSubtitle.textContent = "Esto marcará toda la semana para cotejo del admin.";
    show(weekFieldWrap);
    actionWeek.value = currentFinanceDoc?.semanaActual || getCurrentWeekLabel();
  }

  if (type === "salary") {
    actionTitle.textContent = "Actualizar sueldo";
    actionSubtitle.textContent = "Solo admin puede cambiar el sueldo semanal.";
    hide(weekFieldWrap);
  }

  openModal(actionModal);
}

async function saveAction() {
  actionMsg.textContent = "";

  const amount = Number(actionAmount.value || 0);
  const note = actionNote.value.trim();
  const week = actionWeek.value.trim() || getCurrentWeekLabel();

  const targetUid = (currentUserDoc?.rol === "admin" && adminViewingUid)
    ? adminViewingUid
    : currentUser?.uid;

  if (!targetUid) {
    actionMsg.textContent = "No hay usuario seleccionado.";
    return;
  }

  if (amount <= 0) {
    actionMsg.textContent = "Escribe un monto válido.";
    return;
  }

  const finRef = doc(db, "finanzas", targetUid);
  const finSnap = await getDoc(finRef);
  if (!finSnap.exists()) {
    actionMsg.textContent = "No se encontró el panel financiero.";
    return;
  }

  const fin = finSnap.data();

  if (currentAction === "advance") {
    await updateDoc(finRef, {
      adelantos: Number(fin.adelantos || 0) + amount,
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, "movimientos"), {
      uid: targetUid,
      tipo: "Adelanto",
      monto: amount,
      semana: fin.semanaActual || getCurrentWeekLabel(),
      nota: note || "Adelanto registrado",
      estado: "aprobado",
      createdAt: serverTimestamp()
    });
  }

  if (currentAction === "loan") {
    await updateDoc(finRef, {
      deuda: Number(fin.deuda || 0) + amount,
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, "movimientos"), {
      uid: targetUid,
      tipo: "Préstamo",
      monto: amount,
      semana: fin.semanaActual || getCurrentWeekLabel(),
      nota: note || "Préstamo registrado",
      estado: "aprobado",
      createdAt: serverTimestamp()
    });
  }

  if (currentAction === "payment") {
    const currentDebt = Number(fin.deuda || 0);
    const newDebt = Math.max(currentDebt - amount, 0);
    const newPago = Number(fin.pago || 0) + amount;

    await updateDoc(finRef, {
      deuda: newDebt,
      pago: newPago,
      semanaMarcada: true,
      semanaCotejada: false,
      semanaActual: week,
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, "movimientos"), {
      uid: targetUid,
      tipo: "Pago",
      monto: amount,
      semana: week,
      nota: note || "Pago registrado",
      estado: "pendiente_cotejo",
      createdAt: serverTimestamp()
    });
  }

  if (currentAction === "salary") {
    await updateDoc(finRef, {
      sueldo: amount,
      semanaActual: getCurrentWeekLabel(),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, "movimientos"), {
      uid: targetUid,
      tipo: "Sueldo actualizado",
      monto: amount,
      semana: getCurrentWeekLabel(),
      nota: note || "Sueldo semanal actualizado",
      estado: "aprobado",
      createdAt: serverTimestamp()
    });
  }

  closeModal(actionModal);

  const updatedSnap = await getDoc(finRef);
  currentFinanceDoc = updatedSnap.data();
  setSummary(currentFinanceDoc);
  await loadActivity(targetUid);

  if (currentUserDoc?.rol === "admin") {
    await loadAdminOperators();
  }
}

/* =========================================================
   AUTH STATE
========================================================= */
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) {
    sessionStatus.textContent = "Sin acceso";
    panelTitle.textContent = "PANEL PERSONAL";
    panelSubtitle.textContent = "Vista general de tu información financiera";
    secureSessionText.textContent = "🔒 Sesión cerrada";

    hide(personalPanel);
    hide(adminPanel);
    hide(logoutBtn);

    document.querySelectorAll(".admin-only").forEach(el => hide(el));

    currentUserDoc = null;
    currentFinanceDoc = null;
    adminViewingUid = null;
    amountsVisible = false;

    clearSummary();
    activityList.innerHTML = <div class="empty-state">Inicia sesión para ver actividad.</div>;
    return;
  }

  await loadCurrentPanel(user.uid);
});

/* =========================================================
   EVENTS
========================================================= */
openRegisterBtn.addEventListener("click", () => {
  registerMsg.textContent = "";
  openModal(registerModal);
});

openLoginBtn.addEventListener("click", () => {
  loginMsg.textContent = "";
  openModal(loginModal);
});

closeRegisterBtn.addEventListener("click", () => closeModal(registerModal));
closeLoginBtn.addEventListener("click", () => closeModal(loginModal));
closeActionBtn.addEventListener("click", () => closeModal(actionModal));

confirmRegisterBtn.addEventListener("click", registerOperator);
confirmLoginBtn.addEventListener("click", loginUser);
confirmActionBtn.addEventListener("click", saveAction);

logoutBtn.addEventListener("click", logoutUser);

requestAdvanceBtn.addEventListener("click", () => openAction("advance"));
requestLoanBtn.addEventListener("click", () => openAction("loan"));
payDebtBtn.addEventListener("click", () => openAction("payment"));
updateSalaryBtn.addEventListener("click", () => openAction("salary"));

applyInterestBtn.addEventListener("click", async () => {
  const targetUid = adminViewingUid || currentUser?.uid;
  if (!targetUid) return;
  await applyInterest(targetUid);
});

markReviewedBtn.addEventListener("click", async () => {
  const targetUid = adminViewingUid || currentUser?.uid;
  if (!targetUid) return;
  await reviewWeek(targetUid);
});

toggleAmountsBtn.addEventListener("click", async () => {
  amountsVisible = !amountsVisible;
  if (currentFinanceDoc) setSummary(currentFinanceDoc);
  if (currentUser) {
    const targetUid = adminViewingUid || currentUser.uid;
    await loadActivity(targetUid);
  }
});

reloadOperatorsBtn.addEventListener("click", loadAdminOperators);
searchOperatorInput.addEventListener("input", loadAdminOperators);

/* =========================================================
   INIT
========================================================= */
await loadProfiles();
