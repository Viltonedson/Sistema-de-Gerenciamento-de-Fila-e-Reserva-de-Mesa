const limparDadosAntigos = () => {
    const agora = new Date().getTime();
    const dadosExpiracao = localStorage.getItem('expiracao');
    if (dadosExpiracao && agora - dadosExpiracao > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('participantes');
        localStorage.removeItem('expiracao');
    }
};

const carregarParticipantes = () => {
    limparDadosAntigos();
    const participantesSalvos = localStorage.getItem('participantes');
    return participantesSalvos ? JSON.parse(participantesSalvos) : [];
};

let participantes = carregarParticipantes();


const criarNovoParticipante = (reserva) => {
    const formatarData = (data) => {
        return data ? dayjs(data).format('DD/MM/YYYY HH:mm') : 'Aguardando Check-in';
    };
    
    const dataInscricao = formatarData(reserva.dataInscricao);
    const botaoCheckIn = reserva.dataCheckIn ? '' : `<button data-telefone="${reserva.telefone}
    " onclick="fazerCheckIn(this)">Confirmar</button>`;    
    const dataCheckIn = reserva.dataCheckIn ? formatarData(reserva.dataCheckIn) : '';

    return `
    <tr>
            <td><strong>${reserva.nome}</strong><br><small>${reserva.telefone}</small></td>
            <td>${dataInscricao}</td>
            <td>${reserva.quantidadePessoas || 1}</td>
            <td>${dataCheckIn || 'Aguardando check-in'} ${botaoCheckIn}</td>
            <td>
                <button onclick="excluirReserva('${reserva.telefone}')">Excluir</button>
            </td>
        </tr>
    `;
};

const atualizarlista = (participantes) => {
    let output = "";
    let numero = 1; 

    participantes.forEach(participante => {
        const dataInscricao = participante.dataInscricao ? dayjs(participante.dataInscricao).format('DD/MM/YYYY HH:mm') : 'Aguardando Check-in';
        const dataCheckIn = participante.dataCheckIn ? dayjs(participante.dataCheckIn).format('DD/MM/YYYY HH:mm') : `<button data-telefone="${participante.telefone}" onclick="fazerCheckIn(this)">Confirmar</button>`;
        output += `
            <tr>
                <td>${numero++}</td>
                <td><strong>${participante.nome}</strong><br><small>${participante.telefone}</small></td>
                <td>${dataInscricao}</td>
                <td>${participante.quantidadePessoas || 1}</td>
                <td>${dataCheckIn}</td>
                <td>
                    <button onclick="excluirReserva('${participante.telefone}')">Excluir</button>
                </td>
            </tr>
        `;
    });
    document.querySelector('tbody').innerHTML = output;
    localStorage.setItem('participantes', JSON.stringify(participantes));
};

document.addEventListener('DOMContentLoaded', () => {
    atualizarlista(participantes);
});


const adicionarParticipante = (event) =>{
     event.preventDefault()

     const dadosDoFormulario = new FormData(event.target)
     
     const participante = {
        nome: dadosDoFormulario.get("nome"),
        telefone: dadosDoFormulario.get("telefone"),
        quantidadePessoas: parseInt(dadosDoFormulario.get("quantidadePessoas"), 10),
        mais65: event.target.mais65.checked,
        pcd: event.target.pcd.checked,
        dataInscricao: new Date(),
        dataCheckIn: null
    };
    if (participante.mais65 || participante.pcd) {
        participantes.unshift(participante);
    } else {
        participantes.push(participante);
    }
    
    participantes.sort((a, b) => {
        if (a.mais65 || a.pcd) return -1;
        if (b.mais65 || b.pcd) return 1;
        return 0;
      });
    
    atualizarlista(participantes);

    event.target.querySelector('[name="nome"]').value = "";
    event.target.querySelector('[name="telefone"]').value = "";
}

const fazerCheckIn = (botao) => {
    const mensagemDeConfirmacao = "Tem certeza que deseja fazer o check-in?";
    if (!confirm(mensagemDeConfirmacao)) {
        return;
    }

    const telefone = botao.dataset.telefone;
    const participante = participantes.find(p => p.telefone === telefone);
    if (participante) {
        participante.dataCheckIn = new Date();
        atualizarlista(participantes);

    
        fetch('https://sheetdb.io/api/v1/rwkub161yi5pn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    "Nome": participante.nome,
                    "Contato": participante.telefone,
                    "QuantidadePessoas": participante.quantidadePessoas,
                    "DataInscricao": dayjs(participante.dataInscricao).format('DD/MM/YYYY HH:mm'),
                    "DataCheckIn": dayjs(participante.dataCheckIn).format('DD/MM/YYYY HH:mm')
                }
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Erro ao enviar os dados para a API da SheetsDB');
            }
        }).catch(error => {
            console.error('Erro:', error);
        });
    }
};

const excluirReserva = (telefone) => {
    participantes = participantes.filter(participante => participante.telefone !== telefone);
    atualizarlista(participantes);
};

