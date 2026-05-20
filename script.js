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
    databaseURL: "https://watercontrolweb-default-rtdb.firebaseio.com"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// ==========================================
// MODO CLARO / ESCURO (THEME TOGGLE)
// ==========================================
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    // Salva a preferência do usuário no navegador
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

// Aplica o tema salvo ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// ==========================================
// LÓGICA DE LOGIN
// ==========================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-message');
        errorMsg.style.display = 'none';

        auth.signInWithEmailAndPassword(email, password)
            .then(() => { window.location.href = "dashboard.html"; })
            .catch((error) => {
                errorMsg.style.display = 'block';
                errorMsg.innerText = "Erro ao entrar: Verifique e-mail e senha.";
            });
    });
}

// ==========================================
// LÓGICA DE CADASTRO
// ==========================================
// ==========================================
// LÓGICA DE CADASTRO (COM DADOS COMPLETOS)
// ==========================================

// Função para mostrar/esconder o CNPJ dependendo do tipo de conta
// ==========================================
// 1. LÓGICA DE MOSTRAR/ESCONDER CNPJ
// ==========================================
const radiosConta = document.querySelectorAll('input[name="tipoConta"]');
const cnpjGroup = document.getElementById('cnpj-group');

if (radiosConta.length > 0) {
    radiosConta.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'empresarial') {
                cnpjGroup.style.display = 'block';
                document.getElementById('cnpj').setAttribute('required', 'true');
            } else {
                cnpjGroup.style.display = 'none';
                document.getElementById('cnpj').removeAttribute('required');
            }
        });
    });
}

// ==========================================
// 2. LÓGICA DE FINALIZAR CADASTRO
// ==========================================
const cadastroForm = document.getElementById('cadastro-form');

if (cadastroForm) {
    cadastroForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Isso impede a página de recarregar (o famoso erro do '?')
        
        // Coleta os dados digitados
        const tipoConta = document.querySelector('input[name="tipoConta"]:checked').value;
        const nome = document.getElementById('nome').value;
        const cnpj = document.getElementById('cnpj').value;
        const telefone = document.getElementById('telefone').value;
        const endereco = document.getElementById('endereco').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-message');
        
        // Esconde a mensagem de erro toda vez que tenta enviar
        errorMsg.style.display = 'none';

        // --- TRAVA DE SEGURANÇA (SENHA FORTE) ---
        const senhaForteRegex = /^(?=.*[A-Z])(?=.*[!@#$&*]).{8,}$/;
        
        if (!senhaForteRegex.test(password)) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "A senha deve ter no mínimo 8 caracteres, uma letra maiúscula e um símbolo (!@#$&*).";
            return; // Interrompe o processo aqui mesmo
        }

        // --- ENVIANDO PARA O FIREBASE ---
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Conta criada no Auth! Agora vamos salvar os dados no Banco.
                const usuario = userCredential.user;
                const database = firebase.database();
                
                return database.ref('clientes/' + usuario.uid).set({
                    nome: nome,
                    tipoConta: tipoConta,
                    cnpj: tipoConta === 'empresarial' ? cnpj : "N/A",
                    telefone: telefone,
                    endereco: endereco,
                    email: email,
                    dataCadastro: new Date().toISOString()
                });
            })
            .then(() => { 
                // Tudo deu certo
                alert("Conta criada com sucesso! Bem-vindo ao WaterControl Pro.");
                window.location.href = "dashboard.html"; 
            })
            .catch((error) => {
                // Se der erro (ex: email já existe)
                errorMsg.style.display = 'block';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMsg.innerText = "Este e-mail já está cadastrado. Faça login.";
                } else {
                    errorMsg.innerText = "Erro ao criar conta: " + error.message;
                }
            });
    });
}
// ==========================================
// LÓGICA DE RECUPERAÇÃO DE SENHA
// ==========================================
const recuperarForm = document.getElementById('recuperar-form');
if (recuperarForm) {
    recuperarForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const msgBox = document.getElementById('status-message');
        msgBox.style.display = 'none';

        auth.sendPasswordResetEmail(email)
            .then(() => {
                msgBox.style.display = 'block';
                msgBox.style.color = '#4ade80';
                msgBox.innerText = "E-mail de redefinição enviado! Verifique sua caixa de entrada.";
            })
            .catch((error) => {
                msgBox.style.display = 'block';
                msgBox.style.color = '#ff4d4d';
                msgBox.innerText = "Erro: " + error.message;
            });
    });
}

// ==========================================
// DASHBOARD E LEITURA DO SENSOR
// ==========================================
if (window.location.pathname.includes('dashboard.html')) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            const database = firebase.database();
            const nivelRef = database.ref('dispositivos/sensor_01/nivel');
            nivelRef.on('value', (snapshot) => {
                const valor = snapshot.val();
                if (valor !== null && typeof updateWaterLevel === 'function') {
                    updateWaterLevel(valor);
                }
            });
        }
    });
}

// Função de Logout (Certifique-se de que está no seu script.js)
function fazerLogout() {
    auth.signOut().then(() => {
        // Redireciona para a tela de login após sair
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Erro ao sair: ", error);
        alert("Erro ao tentar sair. Tente novamente.");
    });
}