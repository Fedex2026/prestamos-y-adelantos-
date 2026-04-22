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
   FIREBASE CONFIG
========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyA2NnujJ6mhHGkE96tD5Wu7b9_TqL5xVz8",
  authDomain: "prestamos-y-adelantos-c5c7e.firebaseapp.com",
  projectId: "prestamos-y-adelantos-c5c7e",
  storageBucket: "prestamos-y-adelantos-c5c7e.firebasestorage.app",
  messagingSenderId: "357105218615",
  appId: "1:357105218615:web:855dc31356f4f06ef7bbb2"
};

/* =========================================================
   ADMINS
========================================================= */
const ADMIN_EMAILS = [
  "gruasmetro1@gmail.com"
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

const solicitudesPanel = document.getElementById("solicitudesPanel");
const reportesPanel = document.getElementById("reportesPanel");
const configPanel = document.getElementById("configPanel");

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
const historyModal = document.getElementById("historyModal");

const closeRegisterBtn = document.getElementById("closeRegisterBtn");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const closeActionBtn = document.getElementById("closeActionBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");

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
const openHistoryBtn = document.getElementById("openHistoryBtn");
const requestAdvanceBtn = document.getElementById("requestAdvanceBtn");
const requestLoanBtn = document.getElementById("requestLoanBtn");
const payDebtBtn = document.getElementById("payDebtBtn");
const updateSalaryBtn = document.getElementById("updateSalaryBtn");
const applyInterestBtn = document.getElementById("applyInterestBtn");
const markReviewedBtn = document.getElementById("markReviewedBtn");
const closeWeekBtn = document.getElementById("closeWeekBtn");

/* menú lateral */
const btnInicio = document.getElementById("btnInicio");
const btnPanel = document.getElementById("btnPanel");
const btnHistorial = document.getElementById("btnHistorial");
const btnSolicitudes = document.getElementById("btnSolicitudes");
const btnPersonas = document.getElementById("btnPersonas");
const btnReportes = document.getElementById("btnReportes");
const btnConfig = document.getElementById("btnConfig");

/* botones dentro del panel Solicitudes */
const solAdvanceBtn = document.getElementById("solAdvanceBtn");
const solLoanBtn = document.getElementById("solLoanBtn");
const solPayBtn = document.getElementById("solPayBtn");

const menuButtons = [
  btnInicio,
  btnPanel,
  btnHistorial,
  btnSolicitudes,
  btnPersonas,
  btnReportes,
  btnConfig
].filter(Boolean);

/* =========================================================
   STATE
========================================================= */
let currentUser = null;
let currentUserDoc = null;
let currentFinanceDoc = null;
let currentAction = null;
let amountsVisible = true;
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
  return ADMIN_EMAILS.includes(String(email).toLowerCase());
}

function getCurrentWeekLabel() {
  const now = new Date();
  const onejan = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${now.getFullYear()}-S${String(week).padStart(2, "0")}`;
}

function getInitials(name = "") {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function show(el) {
  if (el) el.classList.remove("hidden");
}

function hide(el) {
  if (el) el.classList.add("hidden");
}

function openModal(el) {
  if (el) show(el);
}

function closeModal(el) {
  if (el) hide(el);
}

function hideAllMainPanels() {
  hide(publicPanel);
  hide(personalPanel);
  hide(adminPanel);
  hide(solicitudesPanel);
  hide(reportesPanel);
  hide(configPanel);
}

function setActiveMenu(activeBtn) {
  menuButtons.forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function setClock() {
  const now = new Date();

  if (todayDate) {
    todayDate.textContent = now.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }

  if (todayTime) {
    todayTime.textContent = now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }
}
setClock();
setInterval(setClock, 1000);

function calcRestante(fin) {
  return Number(fin?.sueldo || 0) - Number(fin?.adelantos || 0);
}

function renderMaskedOrValue(value) {
  return amountsVisible ? money(value) : "***";
}

function clearSummary() {
  if (mSueldo) mSueldo.textContent = "***";
  if (mAdelantos) mAdelantos.textContent = "***";
  if (mPago) mPago.textContent = "***";
  if (mDeuda) mDeuda.textContent = "***";
  if (mRestante) mRestante.textContent = "***";
  if (mSemanaPagada) mSemanaPagada.textContent = "No";
  if (mSemanaCotejada) mSemanaCotejada.textContent = "No";
  if (lastUpdatedText) lastUpdatedText.textContent = "Actualizado: --";
}

function setSummary(fin) {
  if (!fin) return;

  if (mSueldo) mSueldo.textContent = renderMaskedOrValue(fin.sueldo || 0);
  if (mAdelantos) mAdelantos.textContent = renderMaskedOrValue(fin.adelantos || 0);
  if (mPago) mPago.textContent = renderMaskedOrValue(fin.pago || 0);
  if (mDeuda) mDeuda.textContent = renderMaskedOrValue(fin.deuda || 0);
  if (mRestante) mRestante.textContent = renderMaskedOrValue(calcRestante(fin));
  if (mSemanaPagada) mSemanaPagada.textContent = fin.semanaMarcada ? "Sí" : "No";
  if (mSemanaCotejada) mSemanaCotejada.textContent = fin.semanaCotejada ? "Sí" : "No";
  if (lastUpdatedText) {
    lastUpdatedText.textContent = `Actualizado: ${new Date().toLocaleString("es-MX")}`;
  }
}

function resetActionFields() {
  if (actionAmount) actionAmount.value = "";
  if (actionWeek) actionWeek.value = "";
  if (actionNote) actionNote.value = "";
  if (actionMsg) actionMsg.textContent = "";
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
   AUTO CREAR DOCS
========================================================= */
async function ensureUserDoc(user) {
  if (!user) return null;

  const userRef = doc(db, "usuarios", user.uid);
  let userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const safeName = user.displayName || user.email?.split("@")[0] || "Usuario";

    await setDoc(userRef, {
      uid: user.uid,
      nombre: safeName,
      email: user.email || "",
      rol: isAdmin(user.email || "") ? "admin" : "operador",
      createdAt: serverTimestamp()
    });

    userSnap = await getDoc(userRef);
  } else {
    const current = userSnap.data();
    const patch = {};

    if (!current.uid) patch.uid = user.uid;
    if (!current.nombre) patch.nombre = user.displayName || user.email?.split("@")[0] || "Usuario";
    if (!current.email) patch.email = user.email || "";
    if (!current.rol) patch.rol = isAdmin(user.email || "") ? "admin" : "operador";

    if (Object.keys(patch).length) {
      await updateDoc(userRef, patch);
      userSnap = await getDoc(userRef);
    }
  }

  const data = userSnap.data();

  if (isAdmin(user.email || "") && data.rol !== "admin") {
    await updateDoc(userRef, {
      rol: "admin",
      email: user.email || data.email || ""
    });
    userSnap = await getDoc(userRef);
  }

  return userSnap.data();
}

async function ensureFinanceDoc(uid) {
  const finRef = doc(db, "finanzas", uid);
  let finSnap = await getDoc(finRef);

  if (!finSnap.exists()) {
    await setDoc(finRef, {
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

    finSnap = await getDoc(finRef);
  }

  return finSnap.data();
}

/* =========================================================
   PERFIL PÚBLICO
========================================================= */
async function loadProfiles() {
  try {
    if (!profilesGrid) return;

    profilesGrid.innerHTML = `<div class="empty-state">Cargando operadores...</div>`;

    const snap = await getDocs(collection(db, "usuarios"));
    const operadores = [];

    snap.forEach((docSnap) => {
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
        if (loginEmail) loginEmail.value = u.email || "";
        if (loginPassword) loginPassword.value = "";
        if (loginMsg) loginMsg.textContent = "";
        openModal(loginModal);
      });

      profilesGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando perfiles:", error);
    if (profilesGrid) {
      profilesGrid.innerHTML = `<div class="empty-state">No se pudieron cargar los operadores.</div>`;
    }
  }
}

/* =========================================================
   REGISTRO
========================================================= */
async function registerOperator() {
  if (registerMsg) {
    registerMsg.textContent = "";
    registerMsg.style.color = "";
  }

  const name = registerName?.value.trim() || "";
  const email = registerEmail?.value.trim().toLowerCase() || "";
  const password = registerPassword?.value.trim() || "";

  if (!name || !email || !password) {
    if (registerMsg) registerMsg.textContent = "Completa todos los campos.";
    return;
  }

  if (password.length < 6) {
    if (registerMsg) registerMsg.textContent = "La contraseña debe tener mínimo 6 caracteres.";
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

    if (registerMsg) {
      registerMsg.style.color = "#20d38a";
      registerMsg.textContent = "Operador creado correctamente.";
    }

    if (registerName) registerName.value = "";
    if (registerEmail) registerEmail.value = "";
    if (registerPassword) registerPassword.value = "";

    await loadProfiles();
  } catch (error) {
    console.error("Error al registrar:", error);
    if (registerMsg) {
      registerMsg.style.color = "#ff9cab";
      registerMsg.textContent = error.message || "No se pudo registrar el operador.";
    }
  }
}

/* =========================================================
   LOGIN / LOGOUT
========================================================= */
async function loginUser() {
  if (loginMsg) loginMsg.textContent = "";

  const email = loginEmail?.value.trim().toLowerCase() || "";
  const password = loginPassword?.value.trim() || "";

  if (!email || !password) {
    if (loginMsg) loginMsg.textContent = "Escribe correo y contraseña.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal(loginModal);
    if (loginPassword) loginPassword.value = "";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    if (loginMsg) {
      loginMsg.textContent = "No se pudo iniciar sesión. Revisa correo y contraseña.";
    }
  }
}

async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
}

/* =========================================================
   CARGA DE PANEL
========================================================= */
async function loadCurrentPanel(uid) {
  try {
    const authUser = auth.currentUser;
    if (!authUser) return;

    currentUserDoc = await ensureUserDoc(authUser);
    currentFinanceDoc = await ensureFinanceDoc(uid);

    if (!currentUserDoc || !currentFinanceDoc) {
      alert("No se pudo cargar el panel.");
      return;
    }

    if (sessionStatus) {
      sessionStatus.textContent = currentUserDoc.rol === "admin"
        ? "Admin"
        : currentUserDoc.nombre;
    }

    if (panelTitle) {
      panelTitle.textContent = `PANEL DE ${String(currentUserDoc.nombre || "USUARIO").toUpperCase()}`;
    }

    if (panelSubtitle) {
      panelSubtitle.textContent = currentUserDoc.rol === "admin"
        ? "Control general y edición administrativa"
        : "Vista general de tu información financiera";
    }

    if (secureSessionText) {
      secureSessionText.textContent = currentUserDoc.rol === "admin"
        ? "🔐 Sesión segura (Admin)"
        : "🔒 Sesión segura";
    }

    hideAllMainPanels();
    show(personalPanel);
    show(logoutBtn);
    setActiveMenu(btnPanel);
    setSummary(currentFinanceDoc);

    document.querySelectorAll(".admin-only").forEach((el) => {
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
  } catch (error) {
    console.error("Error cargando panel:", error);
    alert("No se pudo cargar el panel. Revisa la consola.");
  }
}

async function loadActivity(uid) {
  try {
    if (!activityList) return;

    activityList.innerHTML = `<div class="empty-state">Cargando actividad...</div>`;

    const qRef = query(collection(db, "movimientos"), where("uid", "==", uid));
    const snap = await getDocs(qRef);

    const movements = [];
    snap.forEach((docSnap) => movements.push({ id: docSnap.id, ...docSnap.data() }));

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

    movements.forEach((mov) => {
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
  } catch (error) {
    console.error("Error cargando actividad:", error);
    if (activityList) {
      activityList.innerHTML = `<div class="empty-state">No se pudo cargar la actividad.</div>`;
    }
  }
}

/* =========================================================
   PANEL ADMIN
========================================================= */
async function loadAdminOperators() {
  try {
    if (!adminOperatorsList) return;

    adminOperatorsList.innerHTML = `<div class="empty-state">Cargando operadores...</div>`;

    const snap = await getDocs(collection(db, "usuarios"));
    const users = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.rol === "operador") users.push(data);
    });

    const filter = searchOperatorInput?.value.trim().toLowerCase() || "";
    const filtered = users.filter((u) =>
      (u.nombre || "").toLowerCase().includes(filter) ||
      (u.email || "").toLowerCase().includes(filter)
    );

    if (!filtered.length) {
      adminOperatorsList.innerHTML = `<div class="empty-state">No se encontraron operadores.</div>`;
      return;
    }

    adminOperatorsList.innerHTML = "";

    for (const user of filtered) {
      const finData = await ensureFinanceDoc(user.uid);

      const card = document.createElement("div");
      card.className = "operator-card-admin";
      card.innerHTML = `
        <div class="operator-info">
          <h3>${escapeHtml(user.nombre)}</h3>
          <p>${escapeHtml(user.email)}</p>
          <p>Sueldo: ${money(finData.sueldo || 0)}</p>
          <p>Adelantos semana: ${money(finData.adelantos || 0)}</p>
          <p>Deuda préstamo: ${money(finData.deuda || 0)}</p>
          <p>Semana pagada: ${finData?.semanaMarcada ? "Sí" : "No"} / Cotejada: ${finData?.semanaCotejada ? "Sí" : "No"}</p>
        </div>
        <div class="operator-actions">
          <button class="btn btn-login" data-action="open" data-uid="${user.uid}">Abrir panel</button>
          <button class="btn btn-outline" data-action="salary" data-uid="${user.uid}">Actualizar sueldo</button>
          <button class="btn btn-outline" data-action="review" data-uid="${user.uid}">Cotejar semana</button>
          <button class="btn btn-outline" data-action="interest" data-uid="${user.uid}">Aplicar interés</button>
          <button class="btn btn-outline" data-action="closeweek" data-uid="${user.uid}">Cerrar semana</button>
        </div>
      `;

      adminOperatorsList.appendChild(card);
    }

    adminOperatorsList.querySelectorAll("button").forEach((btn) => {
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

        if (action === "closeweek") {
          adminViewingUid = uid;
          await cerrarSemana(uid);
        }
      });
    });
  } catch (error) {
    console.error("Error cargando operadores admin:", error);
    if (adminOperatorsList) {
      adminOperatorsList.innerHTML = `<div class="empty-state">No se pudieron cargar los operadores.</div>`;
    }
  }
}

async function openAdminView(uid) {
  try {
    const userSnap = await getDoc(doc(db, "usuarios", uid));
    if (!userSnap.exists()) return;

    const user = userSnap.data();
    const fin = await ensureFinanceDoc(uid);

    if (panelTitle) panelTitle.textContent = `ADMIN VIENDO: ${String(user.nombre || "OPERADOR").toUpperCase()}`;
    if (panelSubtitle) panelSubtitle.textContent = `Operador: ${user.email || ""}`;
    currentFinanceDoc = fin;

    hideAllMainPanels();
    show(personalPanel);
    show(logoutBtn);
    setActiveMenu(btnPanel);

    setSummary(fin);
    await loadActivity(uid);
  } catch (error) {
    console.error("Error abriendo panel admin:", error);
  }
}

async function reviewWeek(uid) {
  try {
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
  } catch (error) {
    console.error("Error cotejando semana:", error);
  }
}

async function applyInterest(uid) {
  try {
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
  } catch (error) {
    console.error("Error aplicando interés:", error);
  }
}

async function cerrarSemana(uid) {
  try {
    const finRef = doc(db, "finanzas", uid);
    const finSnap = await getDoc(finRef);
    if (!finSnap.exists()) return;

    const fin = finSnap.data();
    const semanaCerrada = fin.semanaActual || getCurrentWeekLabel();

    await updateDoc(finRef, {
      adelantos: 0,
      pago: 0,
      semanaMarcada: false,
      semanaCotejada: true,
      semanaActual: getCurrentWeekLabel(),
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, "movimientos"), {
      uid,
      tipo: "Semana cerrada",
      monto: 0,
      semana: semanaCerrada,
      nota: "Semana cerrada por administrador",
      estado: "cerrado",
      createdAt: serverTimestamp()
    });

    const updatedSnap = await getDoc(finRef);
    currentFinanceDoc = updatedSnap.data();
    setSummary(currentFinanceDoc);

    if (adminViewingUid === uid || currentUser?.uid === uid) {
      await loadActivity(uid);
    }

    await loadAdminOperators();
  } catch (error) {
    console.error("Error cerrando semana:", error);
  }
}

/* =========================================================
   MODAL DE ACCIONES
========================================================= */
function openAction(type) {
  currentAction = type;
  resetActionFields();

  if (!actionTitle || !actionSubtitle) return;

  if (type === "advance") {
    actionTitle.textContent = "Solicitar adelanto";
    actionSubtitle.textContent = "Este adelanto se sumará a la semana actual.";
    hide(weekFieldWrap);
  }

  if (type === "loan") {
    actionTitle.textContent = "Solicitar préstamo";
    actionSubtitle.textContent = "Este préstamo aumentará la deuda total.";
    hide(weekFieldWrap);
  }

  if (type === "payment") {
    actionTitle.textContent = "Registrar pago";
    actionSubtitle.textContent = "Este pago bajará la deuda del préstamo.";
    hide(weekFieldWrap);
  }

  if (type === "salary") {
    actionTitle.textContent = "Actualizar sueldo";
    actionSubtitle.textContent = "Solo admin puede cambiar el sueldo semanal.";
    hide(weekFieldWrap);
  }

  openModal(actionModal);
}

async function saveAction() {
  if (actionMsg) actionMsg.textContent = "";

  const amount = Number(actionAmount?.value || 0);
  const note = actionNote?.value.trim() || "";

  const targetUid = (currentUserDoc?.rol === "admin" && adminViewingUid)
    ? adminViewingUid
    : currentUser?.uid;

  if (!targetUid) {
    if (actionMsg) actionMsg.textContent = "No hay usuario seleccionado.";
    return;
  }

  if (amount <= 0) {
    if (actionMsg) actionMsg.textContent = "Escribe un monto válido.";
    return;
  }

  try {
    const finRef = doc(db, "finanzas", targetUid);
    const finSnap = await getDoc(finRef);

    if (!finSnap.exists()) {
      if (actionMsg) actionMsg.textContent = "No se encontró el panel financiero.";
      return;
    }

    const fin = finSnap.data();
    const semanaActual = fin.semanaActual || getCurrentWeekLabel();

    if (currentAction === "advance") {
      await updateDoc(finRef, {
        adelantos: Number(fin.adelantos || 0) + amount,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "movimientos"), {
        uid: targetUid,
        tipo: "Adelanto semanal",
        monto: amount,
        semana: semanaActual,
        nota: note || "Adelanto registrado",
        estado: "activo",
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
        semana: semanaActual,
        nota: note || "Préstamo registrado",
        estado: "activo",
        createdAt: serverTimestamp()
      });
    }

    if (currentAction === "payment") {
      const currentDebt = Number(fin.deuda || 0);
      const pago = amount;
      const newDebt = Math.max(currentDebt - pago, 0);

      await updateDoc(finRef, {
        deuda: newDebt,
        pago: Number(fin.pago || 0) + pago,
        semanaMarcada: true,
        semanaCotejada: false,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "movimientos"), {
        uid: targetUid,
        tipo: "Pago semanal",
        monto: pago,
        semana: semanaActual,
        nota: note || "Pago aplicado a préstamo",
        estado: "pagado",
        createdAt: serverTimestamp()
      });
    }

    if (currentAction === "salary") {
      await updateDoc(finRef, {
        sueldo: amount,
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, "movimientos"), {
        uid: targetUid,
        tipo: "Sueldo actualizado",
        monto: amount,
        semana: semanaActual,
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
  } catch (error) {
    console.error("Error guardando acción:", error);
    if (actionMsg) {
      actionMsg.textContent = "No se pudo guardar la acción.";
    }
  }
}

/* =========================================================
   NAVEGACIÓN LATERAL
========================================================= */
if (btnInicio) {
  btnInicio.addEventListener("click", async () => {
    hideAllMainPanels();
    show(publicPanel);
    setActiveMenu(btnInicio);
    adminViewingUid = null;
    try {
      await loadProfiles();
    } catch (error) {
      console.error("Error cargando inicio:", error);
    }
  });
}

if (btnPanel) {
  btnPanel.addEventListener("click", async () => {
    if (!currentUser?.uid) return;
    adminViewingUid = null;
    await loadCurrentPanel(currentUser.uid);
    setActiveMenu(btnPanel);
  });
}

if (btnHistorial) {
  btnHistorial.addEventListener("click", async () => {
    const targetUid = adminViewingUid || currentUser?.uid;
    if (!targetUid) return;

    await loadActivity(targetUid);
    openModal(historyModal);
    setActiveMenu(btnHistorial);
  });
}

if (btnSolicitudes) {
  btnSolicitudes.addEventListener("click", () => {
    if (!currentUser?.uid) return;
    hideAllMainPanels();
    show(solicitudesPanel);
    setActiveMenu(btnSolicitudes);
  });
}

if (btnPersonas) {
  btnPersonas.addEventListener("click", async () => {
    if (currentUserDoc?.rol !== "admin") return;
    hideAllMainPanels();
    show(adminPanel);
    setActiveMenu(btnPersonas);
    await loadAdminOperators();
  });
}

if (btnReportes) {
  btnReportes.addEventListener("click", () => {
    if (!currentUser?.uid) return;
    hideAllMainPanels();
    show(reportesPanel);
    setActiveMenu(btnReportes);
  });
}

if (btnConfig) {
  btnConfig.addEventListener("click", () => {
    if (!currentUser?.uid) return;
    hideAllMainPanels();
    show(configPanel);
    setActiveMenu(btnConfig);
  });
}

/* =========================================================
   AUTH STATE
========================================================= */
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) {
    if (sessionStatus) sessionStatus.textContent = "Sin acceso";
    if (panelTitle) panelTitle.textContent = "PANEL PERSONAL";
    if (panelSubtitle) panelSubtitle.textContent = "Vista general de tu información financiera";
    if (secureSessionText) secureSessionText.textContent = "🔒 Sesión cerrada";

    hideAllMainPanels();
    show(publicPanel);
    hide(logoutBtn);
    setActiveMenu(btnInicio);

    document.querySelectorAll(".admin-only").forEach((el) => hide(el));

    currentUserDoc = null;
    currentFinanceDoc = null;
    adminViewingUid = null;
    amountsVisible = true;

    clearSummary();

    if (activityList) {
      activityList.innerHTML = `<div class="empty-state">Inicia sesión para ver actividad.</div>`;
    }

    try {
      await loadProfiles();
    } catch (error) {
      console.error("Error recargando perfiles públicos:", error);
    }

    return;
  }

  try {
    await loadCurrentPanel(user.uid);
    setActiveMenu(btnPanel);
  } catch (error) {
    console.error("Error cargando panel actual:", error);
  }
});

/* =========================================================
   EVENTS
========================================================= */
if (openRegisterBtn) {
  openRegisterBtn.addEventListener("click", () => {
    if (registerMsg) {
      registerMsg.textContent = "";
      registerMsg.style.color = "";
    }
    openModal(registerModal);
  });
}

if (openLoginBtn) {
  openLoginBtn.addEventListener("click", () => {
    if (loginMsg) loginMsg.textContent = "";
    openModal(loginModal);
  });
}

if (closeRegisterBtn) {
  closeRegisterBtn.addEventListener("click", () => closeModal(registerModal));
}

if (closeLoginBtn) {
  closeLoginBtn.addEventListener("click", () => closeModal(loginModal));
}

if (closeActionBtn) {
  closeActionBtn.addEventListener("click", () => closeModal(actionModal));
}

if (closeHistoryBtn) {
  closeHistoryBtn.addEventListener("click", () => closeModal(historyModal));
}

if (confirmRegisterBtn) {
  confirmRegisterBtn.addEventListener("click", registerOperator);
}

if (confirmLoginBtn) {
  confirmLoginBtn.addEventListener("click", loginUser);
}

if (confirmActionBtn) {
  confirmActionBtn.addEventListener("click", saveAction);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutUser);
}

if (openHistoryBtn) {
  openHistoryBtn.addEventListener("click", async () => {
    const targetUid = adminViewingUid || currentUser?.uid;
    if (!targetUid) return;
    await loadActivity(targetUid);
    openModal(historyModal);
  });
}

if (requestAdvanceBtn) {
  requestAdvanceBtn.addEventListener("click", () => openAction("advance"));
}

if (requestLoanBtn) {
  requestLoanBtn.addEventListener("click", () => openAction("loan"));
}

if (payDebtBtn) {
  payDebtBtn.addEventListener("click", () => openAction("payment"));
}

if (updateSalaryBtn) {
  updateSalaryBtn.addEventListener("click", () => openAction("salary"));
}

if (applyInterestBtn) {
  applyInterestBtn.addEventListener("click", async () => {
    const targetUid = adminViewingUid || currentUser?.uid;
    if (!targetUid) return;
    await applyInterest(targetUid);
  });
}

if (markReviewedBtn) {
  markReviewedBtn.addEventListener("click", async () => {
    const targetUid = adminViewingUid || currentUser?.uid;
    if (!targetUid) return;
    await reviewWeek(targetUid);
  });
}

if (closeWeekBtn) {
  closeWeekBtn.addEventListener("click", async () => {
    const targetUid = adminViewingUid || currentUser?.uid;
    if (!targetUid) return;
    await cerrarSemana(targetUid);
  });
}

if (toggleAmountsBtn) {
  toggleAmountsBtn.addEventListener("click", async () => {
    amountsVisible = !amountsVisible;

    if (currentFinanceDoc) setSummary(currentFinanceDoc);

    if (currentUser) {
      const targetUid = adminViewingUid || currentUser.uid;
      await loadActivity(targetUid);
    }
  });
}

if (reloadOperatorsBtn) {
  reloadOperatorsBtn.addEventListener("click", loadAdminOperators);
}

if (searchOperatorInput) {
  searchOperatorInput.addEventListener("input", loadAdminOperators);
}

/* botones del panel Solicitudes */
if (solAdvanceBtn) {
  solAdvanceBtn.addEventListener("click", () => openAction("advance"));
}

if (solLoanBtn) {
  solLoanBtn.addEventListener("click", () => openAction("loan"));
}

if (solPayBtn) {
  solPayBtn.addEventListener("click", () => openAction("payment"));
}

/* =========================================================
   INIT
========================================================= */
try {
  setActiveMenu(btnInicio);
  await loadProfiles();
} catch (error) {
  console.error("Error al iniciar app:", error);
}

