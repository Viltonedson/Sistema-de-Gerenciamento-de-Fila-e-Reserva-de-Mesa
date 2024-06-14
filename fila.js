let fila = [];
let filaPrioritaria = [];
let senhaAtual = null;
let senhaAnterior = null;
let proximaSenha = 1;
let proximaSenhaPrioritaria = 1;
let historicoChamadas = [];
 
document.getElementById('gerarSenha').addEventListener('click', function() {
    fila.push({
        senha: proximaSenha,
        timestamp: Date.now()
    });
    proximaSenha++;
    atualizarFilas();
});
 
document.getElementById('gerarSenhaPrioritaria').addEventListener('click', function() {
    filaPrioritaria.unshift({
        senha: 'P' + proximaSenhaPrioritaria,
        timestamp: Date.now()
    });
    proximaSenhaPrioritaria++;
    atualizarFilas();
});
 
document.getElementById('proximaSenha').addEventListener('click', function() {
    if (fila.length === 0 && filaPrioritaria.length === 0) {
        alert('Não há mais senhas na fila');
        return;
    }
    senhaAnterior = senhaAtual;
    let chamada = null;
 
    if (filaPrioritaria.length > 0) {
        chamada = filaPrioritaria.pop();
    } else {
        chamada = fila.shift();
    }
 
    senhaAtual = chamada.senha;
 
    // Registrar a chamada no histórico
    historicoChamadas.push({
        senha: senhaAtual,
        chamadaEm: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: 'Em Espera'
    });
    atualizarHistoricoChamadas();
 
    document.getElementById('senhaAtual').textContent = 'Senha atual: ' + senhaAtual;
    document.getElementById('senhaAnterior').textContent = 'Senha anterior: ' + (senhaAnterior !== null ? senhaAnterior : 'Nenhuma');
 
    atualizarFilas();
});
 
function atualizarFilas() {
    atualizarFila('fila', fila);
    atualizarFila('filaPrioritaria', filaPrioritaria);
}
 
function atualizarFila(id, fila) {
    const container = document.getElementById(id);
    const now = Date.now();
    const filaFormatada = fila.map(item => {
        const espera = Math.floor((now - item.timestamp) / 1000);
        return `${item.senha} (espera: ${espera}s)`;
    }).join(', ');
    container.textContent = `${id === 'fila' ? 'Fila' : 'Fila Prioritária'}: ${filaFormatada}`;
}
 
function atualizarHistoricoChamadas() {
    const tbody = document.querySelector('#historicoChamadas tbody');
    tbody.innerHTML = historicoChamadas.map((item, index) =>
        `<tr>
            <td>${item.senha}</td>
            <td>${item.chamadaEm}</td>
            <td><button class="status-btn ${item.status === 'Atendido' ? 'atendido' : ''}" data-index="${index}">${item.status}</button></td>
        </tr>`
    ).join('');
 
    // Adiciona o evento de clique aos botões de status
    document.querySelectorAll('.status-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            historicoChamadas[index].status = historicoChamadas[index].status === 'Em Espera' ? 'Atendido' : 'Em Espera';
            atualizarHistoricoChamadas();
        });
    });
}
 
// Atualiza as filas periodicamente para mostrar o tempo de espera atualizado
setInterval(atualizarFilas, 1000);