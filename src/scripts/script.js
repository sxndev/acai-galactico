const planetImg = document.getElementById('planet-img');
planetImg.addEventListener('animationend', () => {
  planetImg.style.animation = 'movingAnimation 4s ease-in-out infinite';
});

// Dados dos tamanhos
const TAMANHOS = {
  '200ml': { preco: 9.00,  limiteComplementos: 2 },
  '300ml': { preco: 13.00, limiteComplementos: 3 },
  '400ml': { preco: 16.00, limiteComplementos: 4 },
  '500ml': { preco: 18.00, limiteComplementos: 5 },
  '700ml': { preco: 23.00, limiteComplementos: 6 },
};

const pedido = {
  tamanho:      { valor: null, preco: 0 },
  frutas:       [],
  complementos: [],
  coberturas:   [],
  adicionais:   [],
  cremes:       [],
  pagamento:    { valor: null, preco: 0 },
};

// Troca de abas
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.painel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// Selecao de opcoes
document.querySelectorAll('.opcao-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const grupo = btn.dataset.grupo;
    const valor = btn.dataset.valor;
    const preco = parseFloat(btn.dataset.preco);
    const isMulti = btn.classList.contains('multi');

    if (isMulti) {
      // Verifica limite de frutas
      if (grupo === 'frutas' && !btn.classList.contains('selecionado')) {
        if (pedido.frutas.length >= 3) {
          alert('Voce pode escolher no maximo 3 frutas.');
          return;
        }
      }

      // Verifica limite de complementos
      if (grupo === 'complementos' && !btn.classList.contains('selecionado')) {
        if (!pedido.tamanho.valor) {
          alert('Selecione o tamanho primeiro para saber quantos complementos voce pode escolher.');
          return;
        }
        const limite = TAMANHOS[pedido.tamanho.valor].limiteComplementos;
        if (pedido.complementos.length >= limite) {
          alert(`Para o tamanho ${pedido.tamanho.valor} voce pode escolher no maximo ${limite} complementos.`);
          return;
        }
      }

      btn.classList.toggle('selecionado');
      const existe = pedido[grupo].findIndex(i => i.valor === valor);
      if (existe >= 0) {
        pedido[grupo].splice(existe, 1);
      } else {
        pedido[grupo].push({ valor, preco });
      }

    } else {
      // Selecao unica
      document.querySelectorAll(`.opcao-btn[data-grupo="${grupo}"]`)
        .forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      pedido[grupo] = { valor, preco };

      // Se mudou o tamanho, desmarca complementos que passaram do novo limite
      if (grupo === 'tamanho') {
        const novoLimite = TAMANHOS[valor].limiteComplementos;
        if (pedido.complementos.length > novoLimite) {
          const removidos = pedido.complementos.splice(novoLimite);
          removidos.forEach(r => {
            const btnComp = document.querySelector(
              `.opcao-btn[data-grupo="complementos"][data-valor="${r.valor}"]`
            );
            if (btnComp) btnComp.classList.remove('selecionado');
          });
        }
        atualizarAvisoComplementos();
      }
    }

    atualizarResumo();
  });
});

function atualizarAvisoComplementos() {
  const aviso = document.getElementById('aviso-complementos');
  if (!pedido.tamanho.valor) {
    aviso.textContent = 'Selecione o tamanho primeiro para ver quantos complementos voce pode escolher';
    return;
  }
  const limite = TAMANHOS[pedido.tamanho.valor].limiteComplementos;
  const usados = pedido.complementos.length;
  aviso.textContent = `${usados} de ${limite} complementos selecionados`;
}

function calcularTotal() {
  let total = pedido.tamanho.preco || 0;
  pedido.adicionais.forEach(a => total += a.preco);
  pedido.cremes.forEach(c => total += c.preco);
  return total;
}

function atualizarResumo() {
  const container = document.getElementById('resumo-itens');
  container.innerHTML = '';

  const linhas = [];

  if (pedido.tamanho.valor)
    linhas.push(['Tamanho', pedido.tamanho.valor, `R$${pedido.tamanho.preco.toFixed(2).replace('.', ',')}`]);
  if (pedido.frutas.length)
    linhas.push(['Frutas', pedido.frutas.map(f => f.valor).join(', '), '—']);
  if (pedido.complementos.length)
    linhas.push(['Complementos', pedido.complementos.map(c => c.valor).join(', '), '—']);
  if (pedido.coberturas.length)
    linhas.push(['Coberturas', pedido.coberturas.map(c => c.valor).join(', '), '—']);
  if (pedido.adicionais.length) {
    const total = pedido.adicionais.reduce((s, a) => s + a.preco, 0);
    linhas.push(['Adicionais', pedido.adicionais.map(a => a.valor).join(', '), `+R$${total.toFixed(2).replace('.', ',')}`]);
  }
  if (pedido.cremes.length) {
    const total = pedido.cremes.reduce((s, c) => s + c.preco, 0);
    linhas.push(['Cremes Gourmet', pedido.cremes.map(c => c.valor).join(', '), `+R$${total.toFixed(2).replace('.', ',')}`]);
  }
  if (pedido.pagamento.valor)
    linhas.push(['Pagamento', pedido.pagamento.valor, '—']);

  if (linhas.length === 0) {
    container.innerHTML = '<p class="resumo-vazio">Nenhuma opcao selecionada ainda.</p>';
  } else {
    linhas.forEach(([label, val, preco]) => {
      const div = document.createElement('div');
      div.className = 'resumo-linha';
      div.innerHTML = `<span><strong>${label}:</strong> ${val}</span><span>${preco}</span>`;
      container.appendChild(div);
    });
  }

  const total = calcularTotal();
  document.getElementById('valor-total').textContent =
    `R$${total.toFixed(2).replace('.', ',')}`;
}

document.getElementById('btn-whatsapp').addEventListener('click', () => {
  const nome     = document.getElementById('input-nome').value.trim();
  const endereco = document.getElementById('input-endereco').value.trim();

  if (!pedido.tamanho.valor)   return alert('Selecione o tamanho.');
  if (!pedido.pagamento.valor) return alert('Selecione a forma de pagamento.');
  if (!nome)                   return alert('Informe seu nome.');
  if (!endereco)               return alert('Informe seu endereco.');

  const total = calcularTotal();

  const msg =
`*Pedido - Acai Galactico*

Nome: ${nome}
Tamanho: ${pedido.tamanho.valor}
Frutas: ${pedido.frutas.length ? pedido.frutas.map(f => f.valor).join(', ') : 'Nenhuma'}
Complementos: ${pedido.complementos.length ? pedido.complementos.map(c => c.valor).join(', ') : 'Nenhum'}
Coberturas: ${pedido.coberturas.length ? pedido.coberturas.map(c => c.valor).join(', ') : 'Nenhuma'}
Adicionais: ${pedido.adicionais.length ? pedido.adicionais.map(a => a.valor).join(', ') : 'Nenhum'}
Cremes Gourmet: ${pedido.cremes.length ? pedido.cremes.map(c => c.valor).join(', ') : 'Nenhum'}
Endereco: ${endereco}
Pagamento: ${pedido.pagamento.valor}
Total: R$${total.toFixed(2).replace('.', ',')}`;

  const numero = '5513981354028';
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
});