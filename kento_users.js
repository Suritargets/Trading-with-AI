// ─────────────────────────────────────────────────────────────────────────────
// ST-Trading-EDU — User Database
// Beheer gebruikers via admin.html — niet handmatig hier bewerken
// Gegenereerd: 2026-03-27
// ─────────────────────────────────────────────────────────────────────────────

// Pakketten:
//   'admin'  → volledige toegang, 24u sessie, toegang tot admin.html
//   'full'   → alle 3 maanden, 24u sessie
//   'maand1' → alleen Maand 1, 2u sessie
//   'maand2' → Maand 1+2, 2u sessie
//   'maand3' → alle maanden, 2u sessie

// Rollen:
//   'admin'   → Beheerder
//   'mentor'  → Mentor / Coach
//   'trader'  → Actieve Trader
//   'student' → Leerling (standaard)

var KENTO_ROLES = {
  admin:   { label: '⚙️ Beheerder',       color: '#ff6b35' },
  mentor:  { label: '🎓 Mentor',          color: '#9c27b0' },
  trader:  { label: '📈 Actieve Trader',  color: '#ffc107' },
  student: { label: '📚 Leerling',        color: '#2196F3' }
};

var KENTO_USERS_DEFAULT = [
  {
    id: 'u_admin',
    name: 'ST-Trading-EDU (Admin)',
    email: 'admin',
    passwordHash: '5c4f8952d502e909cd4463284f07839adc1807204e09a37f70f5ce973e006356',
    package: 'admin',
    role: 'admin',
    status: 'active',
    createdAt: '2026-03-27',
    lastLogin: null,
    note: 'Standaard admin account — wachtwoord: kento2025'
  }
];

// Runtime: load from localStorage or fall back to defaults
(function() {
  try {
    var stored = localStorage.getItem('kento_users_db');
    if (stored) {
      window.KENTO_USERS = JSON.parse(stored);
    } else {
      window.KENTO_USERS = JSON.parse(JSON.stringify(KENTO_USERS_DEFAULT));
      localStorage.setItem('kento_users_db', JSON.stringify(window.KENTO_USERS));
    }
  } catch(e) {
    window.KENTO_USERS = JSON.parse(JSON.stringify(KENTO_USERS_DEFAULT));
  }

  // Package config
  window.KENTO_PACKAGES = {
    admin:  { label: '⚙️ Admin',       sessionHours: 24, months: [1,2,3], color: '#ff6b35' },
    full:   { label: '🏆 Full (3M)',   sessionHours: 24, months: [1,2,3], color: '#ffc107' },
    maand1: { label: '📗 Maand 1',     sessionHours: 2,  months: [1],     color: '#26a69a' },
    maand2: { label: '📙 Maand 1+2',   sessionHours: 2,  months: [1,2],   color: '#ff9800' },
    maand3: { label: '📘 Maand 1+2+3', sessionHours: 2,  months: [1,2,3], color: '#2196F3' }
  };

  // Export roles config globally
  window.KENTO_ROLES = KENTO_ROLES;

  // Helper: save users back to localStorage
  window.KENTO_SAVE_USERS = function() {
    try { localStorage.setItem('kento_users_db', JSON.stringify(window.KENTO_USERS)); } catch(e) {}
  };
})();
