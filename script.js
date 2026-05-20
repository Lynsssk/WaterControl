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
// ==========================================
// Espera o HTML carregar completamente antes de rodar qualquer coisa
document.addEventListener('DOMContentLoaded', () => {
    
    // Verifica se estamos na página de cadastro
    const cadastroForm = document.getElementById('cadastro-form');
    
    // Se o formulário não existir nesta página, o script para aqui e não dá erro
    if (!cadastroForm) return; 

    // ==========================================
    // 1. MOSTRAR/ESCONDER CNPJ
    // ==========================================
    const radiosConta = document.querySelectorAll('input[name="tipoConta"]');
    const cnpjGroup = document.getElementById('cnpj-group');
    const cnpjInput = document.getElementById('cnpj');

    radiosConta.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'empresarial') {
                cnpjGroup.style.display = 'block';
                if(cnpjInput) cnpjInput.setAttribute('required', 'true');
            } else {
                cnpjGroup.style.display = 'none';
                if(cnpjInput) cnpjInput.removeAttribute('required');
            }
        });
    });

    // ==========================================
    // 2. LÓGICA DA SENHA (OLHINHO E CORES)
    // ==========================================
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqSymbol = document.getElementById('req-symbol');
    const reqNumber = document.getElementById('req-number'); // Novo requisito

    // Olhinho
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye-slash');
    });

    // Checagem em tempo real
    let isPasswordValid = false;

    passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        
        const validLength = val.length >= 8;
        const validUpper = /[A-Z]/.test(val);
        const validSymbol = /[!@#$&*]/.test(val);
        const validNumber = /[0-9]/.test(val); // Verifica se tem número

        // Atualiza a interface
        const updateReq = (element, isValid, text) => {
            element.style.color = isValid ? '#4ade80' : '#ff4d4d';
            element.innerHTML = isValid ? `<i class="fas fa-check"></i> ${text}` : `<i class="fas fa-times"></i> ${text}`;
        };

        updateReq(reqLength, validLength, 'Mínimo de 8 caracteres');
        updateReq(reqUpper, validUpper, 'Pelo menos 1 letra maiúscula');
        updateReq(reqSymbol, validSymbol, 'Pelo menos 1 símbolo (!@#$&*)');
        updateReq(reqNumber, validNumber, 'Pelo menos 1 número');

        isPasswordValid = validLength && validUpper && validSymbol && validNumber;
    });

    // ==========================================
    // 3. FINALIZAR CADASTRO
    // ==========================================
    cadastroForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const errorMsg = document.getElementById('error-message');
        errorMsg.style.display = 'none';

        if (!isPasswordValid) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Sua senha precisa atender a todos os requisitos (ficar tudo verde).";
            return; 
        }

        const tipoConta = document.querySelector('input[name="tipoConta"]:checked').value;
        const nome = document.getElementById('nome').value;
        const cnpj = cnpjInput ? cnpjInput.value : "N/A";
        const telefone = document.getElementById('telefone').value;
        const endereco = document.getElementById('endereco').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        // Cadastro Firebase
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const usuario = userCredential.user;
                return firebase.database().ref('clientes/' + usuario.uid).set({
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
                alert("Conta criada com sucesso!");
                window.location.href = "dashboard.html"; 
            })
            .catch((error) => {
                errorMsg.style.display = 'block';
                if (error.code === 'auth/email-already-in-use') {
                    errorMsg.innerText = "Este e-mail já está cadastrado. Tente fazer login.";
                } else {
                    errorMsg.innerText = "Erro: " + error.message;
                }
            });
    });
});
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