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
const database = firebase.database();

// ==========================================
// MODO CLARO / ESCURO (THEME TOGGLE)
// ==========================================
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
});

// ==========================================
// LÓGICA DE LOGIN
// ==========================================
// ==========================================
// LÓGICA DE LOGIN APRIMORADA
// ==========================================
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('error-message');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        // Proteção: só tenta acessar o estilo se o elemento existir na página
        if (errorMsg) errorMsg.style.display = 'none';

        // Feedback visual
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Entrando...";
        submitBtn.disabled = true;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => { 
                window.location.href = "dashboard.html"; 
            })
            .catch((error) => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                    errorMsg.innerText = "E-mail ou senha incorretos.";
                } else {
                    alert("Erro ao entrar: E-mail ou senha incorretos.");
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
// LÓGICA DE CADASTRO DEFINITIVA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const cadastroForm = document.getElementById('cadastro-form');
    if (!cadastroForm) return; 

    // 1. Mostrar/Esconder CNPJ
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

    // 2. Olhinho e Cores da Senha
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqSymbol = document.getElementById('req-symbol');
    const reqNumber = document.getElementById('req-number');

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }

    let isPasswordValid = false;

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            
            const validLength = val.length >= 8;
            const validUpper = /[A-Z]/.test(val);
            const validNumber = /[0-9]/.test(val);
            // Nova Regra: Aceita QUALQUER símbolo especial (não apenas os básicos)
            const validSymbol = /[^a-zA-Z0-9\s]/.test(val); 

            const updateReq = (element, isValid, text) => {
                if(!element) return;
                element.style.color = isValid ? '#4ade80' : '#ff4d4d';
                element.innerHTML = isValid ? `<i class="fas fa-check"></i> ${text}` : `<i class="fas fa-times"></i> ${text}`;
            };

            updateReq(reqLength, validLength, 'Mínimo de 8 caracteres');
            updateReq(reqUpper, validUpper, 'Pelo menos 1 letra maiúscula');
            updateReq(reqSymbol, validSymbol, 'Pelo menos 1 símbolo');
            updateReq(reqNumber, validNumber, 'Pelo menos 1 número');

            isPasswordValid = validLength && validUpper && validSymbol && validNumber;
        });
    }

    // 3. Finalizar Cadastro
    cadastroForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        
        const errorMsg = document.getElementById('error-message');
        const submitBtn = cadastroForm.querySelector('button[type="submit"]');
        errorMsg.style.display = 'none';

        // Trava de segurança da senha
        if (!isPasswordValid) {
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Atenção: A senha precisa atender a todos os requisitos (ficar tudo verde).";
            return; 
        }

        // Coletando dados
        const tipoConta = document.querySelector('input[name="tipoConta"]:checked').value;
        const nome = document.getElementById('nome').value;
        const cnpj = cnpjInput ? cnpjInput.value : "N/A";
        const telefone = document.getElementById('telefone').value;
        const endereco = document.getElementById('endereco').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        // Feedback visual de carregamento
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Cadastrando...";
        submitBtn.disabled = true;

        // Envio pro Firebase
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const usuario = userCredential.user;
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
                alert("Conta criada com sucesso! Bem-vindo(a) ao WaterControl Pro.");
                window.location.href = "dashboard.html"; 
            })
            .catch((error) => {
                // Se der erro, volta o botão ao normal e mostra o aviso
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                errorMsg.style.display = 'block';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMsg.innerText = "Este e-mail já está cadastrado. Faça login.";
                } else if (error.code === 'auth/operation-not-allowed') {
                    errorMsg.innerText = "Erro: O login por E-mail e Senha não está ativado no seu painel do Firebase.";
                } else {
                    errorMsg.innerText = "Erro do Firebase: " + error.message;
                }
            });
    });
});

// ==========================================
// DASHBOARD E LEITURA DO SENSOR
// ==========================================
if (window.location.pathname.includes('dashboard.html')) {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
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

function fazerLogout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        alert("Erro ao tentar sair. Tente novamente.");
    });
}