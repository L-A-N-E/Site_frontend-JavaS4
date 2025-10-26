// ============================================
// CONFIGURAÇÃO DA API
// ============================================

const API_BASE_URL = 'http://localhost:8080/api';

// Variável para armazenar o token JWT (armazenado no localStorage, mas NUNCA exibido)
let tokenJWT = localStorage.getItem('tokenJWT') || null;

// ============================================
// INICIALIZAÇÃO DA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    atualizarEstadoNavegacao();
    
    if (tokenJWT) {
        mostrarSecao('relatorio');
    } else {
        mostrarSecao('login');
    }
});

// ============================================
// GERENCIAMENTO DE NAVEGAÇÃO E SEÇÕES
// ============================================

/**
 * Atualiza o estado dos botões de navegação baseado no status de autenticação
 */
function atualizarEstadoNavegacao() {
    const navLogin = document.getElementById('navLogin');
    const navRegistro = document.getElementById('navRegistro');
    const navRelatorio = document.getElementById('navRelatorio');
    const navLista = document.getElementById('navLista');
    const navLogout = document.getElementById('navLogout');

    if (tokenJWT) {
        // Usuário autenticado
        navLogin.style.display = 'none';
        navRegistro.style.display = 'none';
        navRelatorio.style.display = 'flex';
        navLista.style.display = 'flex';
        navLogout.style.display = 'flex';
    } else {
        // Usuário não autenticado
        navLogin.style.display = 'flex';
        navRegistro.style.display = 'flex';
        navRelatorio.style.display = 'none';
        navLista.style.display = 'none';
        navLogout.style.display = 'none';
    }
}

/**
 * Mostra/oculta seções da página
 * @param {string} secao - ID da seção a exibir
 */
function mostrarSecao(secao) {
    // Ocultar todas as seções
    const secoes = document.querySelectorAll('.secao');
    secoes.forEach(s => s.classList.remove('secao-ativa'));

    // Mostrar a seção desejada
    const secaoElement = document.getElementById(`secao${secao.charAt(0).toUpperCase() + secao.slice(1)}`);
    
    if (secao === 'relatorio' || secao === 'listaRelatorios') {
        if (!tokenJWT) {
            mostrarMensagem('loginMensagem', 'Você precisa estar logado para acessar esta seção!', 'error');
            mostrarSecao('login');
            return;
        }
    }

    if (secaoElement) {
        secaoElement.classList.add('secao-ativa');
    }
}

/**
 * Exibe uma mensagem ao usuário
 * @param {string} elementId - ID do elemento onde exibir a mensagem
 * @param {string} texto - Texto da mensagem
 * @param {string} tipo - Tipo da mensagem ('success', 'error', 'info')
 */
function mostrarMensagem(elementId, texto, tipo = 'info') {
    const elemento = document.getElementById(elementId);
    if (elemento) {
        elemento.textContent = texto;
        elemento.className = `mensagem show ${tipo}`;
        
        // Auto-hide mensagens de sucesso após 5 segundos
        if (tipo === 'success') {
            setTimeout(() => {
                elemento.classList.remove('show');
            }, 5000);
        }
    }
}

// ============================================
// AUTENTICAÇÃO - REGISTRO
// ============================================

/**
 * Realiza o registro de um novo usuário
 * @param {Event} event - Evento do formulário
 */
async function fazerRegistro(event) {
    event.preventDefault();

    const username = document.getElementById('registroUsername').value.trim();
    const password = document.getElementById('registroPassword').value;

    // Validação básica
    if (!username || !password) {
        mostrarMensagem('registroMensagem', 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (password.length < 6) {
        mostrarMensagem('registroMensagem', 'A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            mostrarMensagem('registroMensagem', 'Conta criada com sucesso! Redirecionando para login...', 'success');
            
            // Limpar o formulário
            document.getElementById('registroUsername').value = '';
            document.getElementById('registroPassword').value = '';
            
            // Redirecionar para login após 2 segundos
            setTimeout(() => {
                mostrarSecao('login');
            }, 2000);
        } else {
            const erro = await response.text();
            mostrarMensagem('registroMensagem', `Erro ao criar conta: ${erro}`, 'error');
        }
    } catch (error) {
        mostrarMensagem('registroMensagem', `Erro de conexão: ${error.message}`, 'error');
    }
}

// ============================================
// AUTENTICAÇÃO - LOGIN
// ============================================

/**
 * Realiza o login do usuário
 * @param {Event} event - Evento do formulário
 */
async function fazerLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validação básica
    if (!username || !password) {
        mostrarMensagem('loginMensagem', 'Por favor, preencha todos os campos.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            // Armazenar o token JWT no localStorage (sem exibir)
            tokenJWT = await response.text();
            localStorage.setItem('tokenJWT', tokenJWT);
            
            mostrarMensagem('loginMensagem', 'Login realizado com sucesso!', 'success');
            
            // Limpar o formulário
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
            
            // Atualizar navegação e redirecionar
            atualizarEstadoNavegacao();
            setTimeout(() => {
                mostrarSecao('relatorio');
            }, 1500);
        } else {
            mostrarMensagem('loginMensagem', 'Erro: Credenciais inválidas!', 'error');
        }
    } catch (error) {
        mostrarMensagem('loginMensagem', `Erro de conexão: ${error.message}`, 'error');
    }
}

// ============================================
// AUTENTICAÇÃO - LOGOUT
// ============================================

/**
 * Realiza o logout do usuário
 */
function logout() {
    // Limpar o token
    tokenJWT = null;
    localStorage.removeItem('tokenJWT');
    
    // Atualizar navegação
    atualizarEstadoNavegacao();
    
    // Exibir mensagem e redirecionar
    mostrarMensagem('loginMensagem', 'Logout realizado com sucesso!', 'success');
    mostrarSecao('login');
}

// ============================================
// RELATÓRIOS - CRIAR
// ============================================

/**
 * Cria um novo relatório de macroscopia
 * @param {Event} event - Evento do formulário
 */
async function criarRelatorio(event) {
    event.preventDefault();

    // Verificar autenticação
    if (!tokenJWT) {
        mostrarMensagem('relatorioMensagem', 'Você precisa estar logado para criar um relatório!', 'error');
        return;
    }

    // Coletar dados do formulário
    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const autor = document.getElementById('autor').value.trim();
    const crm = document.getElementById('crm').value.trim();
    const largura = parseFloat(document.getElementById('largura').value);
    const comprimento = parseFloat(document.getElementById('comprimento').value);
    const espessura = parseFloat(document.getElementById('espessura').value);

    // Validação básica
    if (!titulo || !autor || !crm || !largura || !comprimento || !espessura) {
        mostrarMensagem('relatorioMensagem', 'Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    if (largura <= 0 || comprimento <= 0 || espessura <= 0) {
        mostrarMensagem('relatorioMensagem', 'As dimensões devem ser maiores que zero.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/relatorios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenJWT}`
            },
            body: JSON.stringify({
                titulo: titulo,
                descricao: descricao,
                autor: autor,
                crm: crm,
                largura: largura,
                comprimento: comprimento,
                espessura: espessura
            })
        });

        if (response.ok) {
            const relatorio = await response.json();
            mostrarMensagem('relatorioMensagem', `Relatório criado com sucesso! ID: ${relatorio.id}`, 'success');
            
            // Limpar o formulário
            document.getElementById('titulo').value = '';
            document.getElementById('descricao').value = '';
            document.getElementById('autor').value = '';
            document.getElementById('crm').value = '';
            document.getElementById('largura').value = '';
            document.getElementById('comprimento').value = '';
            document.getElementById('espessura').value = '';
        } else if (response.status === 401) {
            mostrarMensagem('relatorioMensagem', 'Erro: Token expirado ou inválido. Faça login novamente.', 'error');
            logout();
        } else {
            const erro = await response.text();
            mostrarMensagem('relatorioMensagem', `Erro ao criar relatório: ${erro}`, 'error');
        }
    } catch (error) {
        mostrarMensagem('relatorioMensagem', `Erro de conexão: ${error.message}`, 'error');
    }
}

// ============================================
// RELATÓRIOS - LISTAR
// ============================================

/**
 * Lista todos os relatórios do usuário autenticado
 */
async function listarRelatorios() {
    // Verificar autenticação
    if (!tokenJWT) {
        mostrarMensagem('relatorioMensagem', 'Você precisa estar logado para listar relatórios!', 'error');
        return;
    }

    const containerElement = document.getElementById('listaRelatorios');
    containerElement.innerHTML = '<div class="relatorio-empty"><i class="fas fa-spinner"></i><p>Carregando relatórios...</p></div>';

    try {
        const response = await fetch(`${API_BASE_URL}/relatorios`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenJWT}`
            }
        });

        if (response.ok) {
            const relatorios = await response.json();
            
            if (relatorios.length === 0) {
                containerElement.innerHTML = `
                    <div class="relatorio-empty">
                        <i class="fas fa-inbox"></i>
                        <p>Nenhum relatório encontrado. Crie um novo relatório para começar!</p>
                    </div>
                `;
                return;
            }

            // Renderizar relatórios como cards
            let html = '';
            relatorios.forEach(rel => {
                html += criarCardRelatorio(rel);
            });
            
            containerElement.innerHTML = html;
        } else if (response.status === 401) {
            mostrarMensagem('relatorioMensagem', 'Token expirado ou inválido. Faça login novamente.', 'error');
            logout();
        } else {
            containerElement.innerHTML = '<div class="relatorio-empty"><i class="fas fa-exclamation-circle"></i><p>Erro ao listar relatórios</p></div>';
        }
    } catch (error) {
        containerElement.innerHTML = `<div class="relatorio-empty"><i class="fas fa-exclamation-circle"></i><p>Erro de conexão: ${error.message}</p></div>`;
    }
}

/**
 * Cria o HTML de um card de relatório
 * @param {Object} rel - Objeto do relatório
 * @returns {string} HTML do card
 */
function criarCardRelatorio(rel) {
    return `
        <div class="relatorio-card">
            <div class="relatorio-header">
                <h3 class="relatorio-title">${escapeHtml(rel.titulo)}</h3>
                <span class="relatorio-id">#${rel.id}</span>
            </div>
            
            <div class="relatorio-info">
                <div class="relatorio-info-item">
                    <span class="relatorio-info-label">
                        <i class="fas fa-user-md"></i>
                        Autor
                    </span>
                    <span class="relatorio-info-value">${escapeHtml(rel.autor)}</span>
                </div>
                
                <div class="relatorio-info-item">
                    <span class="relatorio-info-label">
                        <i class="fas fa-id-card"></i>
                        CRM
                    </span>
                    <span class="relatorio-info-value">${escapeHtml(rel.crm)}</span>
                </div>
                
                <div class="relatorio-info-item">
                    <span class="relatorio-info-label">
                        <i class="fas fa-calendar"></i>
                        Data Criação
                    </span>
                    <span class="relatorio-info-value">${formatarData(rel.dataCriacao)}</span>
                </div>
                
                <div class="relatorio-info-item">
                    <span class="relatorio-info-label">
                        <i class="fas fa-clock"></i>
                        Hora
                    </span>
                    <span class="relatorio-info-value">${rel.horaMedicao || 'N/A'}</span>
                </div>
                
                <div class="relatorio-info-item">
                    <span class="relatorio-info-label">
                        <i class="fas fa-ruler"></i>
                        Dimensões
                    </span>
                    <span class="relatorio-info-value">L: ${rel.largura}cm × C: ${rel.comprimento}cm × E: ${rel.espessura}cm</span>
                </div>
            </div>
            
            <div class="relatorio-actions">
                <button onclick="gerarPDF(${rel.id})" class="btn btn-primary" title="Gerar PDF do relatório">
                    <i class="fas fa-file-pdf"></i>
                    PDF
                </button>
            </div>
        </div>
    `;
}

// ============================================
// RELATÓRIOS - GERAR PDF
// ============================================

/**
 * Gera e faz download do PDF de um relatório
 * @param {number} id - ID do relatório
 */
async function gerarPDF(id) {
    // Verificar autenticação
    if (!tokenJWT) {
        mostrarMensagem('relatorioMensagem', 'Você precisa estar logado!', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/relatorios/${id}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenJWT}`
            }
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else if (response.status === 401) {
            mostrarMensagem('relatorioMensagem', 'Token expirado ou inválido. Faça login novamente.', 'error');
            logout();
        } else {
            mostrarMensagem('relatorioMensagem', 'Erro ao gerar PDF', 'error');
        }
    } catch (error) {
        mostrarMensagem('relatorioMensagem', `Erro de conexão: ${error.message}`, 'error');
    }
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Formata uma data para o padrão brasileiro
 * @param {string} data - Data em formato ISO ou string
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
function formatarData(data) {
    if (!data) return 'N/A';
    
    try {
        const date = new Date(data);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const ano = date.getFullYear();
        return `${dia}/${mes}/${ano}`;
    } catch (e) {
        return data;
    }
}

