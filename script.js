// ==========================================
// CONFIGURAÇÃO OFICIAL - WATERCONTROL PRO
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyACu6wWRDw9r3bJ0tC0U8OcPSk52OTsjQo",
  authDomain: "watercontrolweb.firebaseapp.com",
  projectId: "watercontrolweb",
  storageBucket: "watercontrolweb.firebasestorage.app",
  messagingSenderId: "54339291903",
  appId: "1:54339291903:web:3cc86982980912c4ce1aca",
  databaseURL: "https://watercontrolweb-default-rtdb.firebaseio.com" // Padrão do Realtime Database
};

// Inicializa o Firebase se ele ainda não foi iniciado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// ==========================================
// LÓGICA DA TELA DE LOGIN
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede a página de recarregar

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessageElement = document.getElementById('error-message');

        // Esconde mensagens de erro anteriores
        errorMessageElement.style.display = 'none';

        // Autenticação no Firebase
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Sucesso! Vai para o Painel de Controle
                window.location.href = "dashboard.html";
            })
            .catch((error) => {
                // Tratamento de erros amigável
                errorMessageElement.style.display = 'block';
                if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                    errorMessageElement.innerText = "E-mail ou senha incorretos.";
                } else if (error.code === 'auth/invalid-email') {
                    errorMessageElement.innerText = "Formato de e-mail inválido.";
                } else {
                    errorMessageElement.innerText = "Erro ao entrar: " + error.message;
                }
            });
    });
}

// ==========================================
// SEGURANÇA DA DASHBOARD E LEITURA DO SENSOR
// ==========================================
if (window.location.pathname.includes('dashboard.html')) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Se tentar burlar a URL sem logar, volta para o login
            window.location.href = "login.html";
        } else {
            // Usuário validado! Conecta ao banco de dados em tempo real
            const database = firebase.database();
            const nivelRef = database.ref('dispositivos/sensor_01/nivel');

            // Escuta ativa: mudou no sensor, muda no site na mesma hora
            nivelRef.on('value', (snapshot) => {
                const valor = snapshot.val();
                if (valor !== null) {
                    // Executa a função de atualizar a interface que criamos no style/html
                    if (typeof updateWaterLevel === 'function') {
                        updateWaterLevel(valor);
                    }
                }
            });
        }
    });
}

// ==========================================
// FUNÇÃO DE LOGOUT (SAIR DO SISTEMA)
// ==========================================
function fazerLogout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}