const planetImg = document.getElementById('planet-img');
planetImg.addEventListener('animationend', () => {
  planetImg.style.animation = 'movingAnimation 4s ease-in-out infinite';
});

const pedido = {
  tamanho:      { valor: null, preco: 0 },
  fruta:        { valor: null, preco: 0 },
  complementos: [],
  adicionais:   [],
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
      btn.classList.toggle('selecionado');
      const existe = pedido[grupo].findIndex(i => i.valor === valor);
      if (existe >= 0) {
        pedido[grupo].splice(existe, 1);
      } else {
        pedido[grupo].push({ valor, preco });
      }
    } else {
      document.querySelectorAll(`.opcao-btn[data-grupo="${grupo}"]`)
        .forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      pedido[grupo] = { valor, preco };
    }

    atualizarResumo();
  });
});

function calcularTotal() {
  let total = 0;
  if (pedido.tamanho.preco) total += pedido.tamanho.preco;
  pedido.complementos.forEach(c => total += c.preco);
  pedido.adicionais.forEach(a => a.preco && (total += a.preco));
  return total;
}

function atualizarResumo() {
  const container = document.getElementById('resumo-itens');
  container.innerHTML = '';

  const linhas = [];

  if (pedido.tamanho.valor) linhas.push(['Tamanho', pedido.tamanho.valor, `R$${pedido.tamanho.preco.toFixed(2).replace('.', ',')}`]);
  if (pedido.fruta.valor)   linhas.push(['Fruta', pedido.fruta.valor, '—']);
  if (pedido.complementos.length) linhas.push(['Complementos', pedido.complementos.map(c => c.valor).join(', '), '—']);
  if (pedido.adicionais.length)   linhas.push(['Adicionais', pedido.adicionais.map(a => a.valor).join(', '), `+R$${pedido.adicionais.reduce((s, a) => s + a.preco, 0).toFixed(2).replace('.', ',')}`]);
  if (pedido.pagamento.valor) linhas.push(['Pagamento', pedido.pagamento.valor, '—']);

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
  document.getElementById('valor-total').textContent = `R$${total.toFixed(2).replace('.', ',')}`;
}

document.getElementById('btn-whatsapp').addEventListener('click', () => {
  const endereco = document.getElementById('input-endereco').value.trim();

  if (!pedido.tamanho.valor)  return alert('Selecione o tamanho.');
  if (!pedido.fruta.valor)    return alert('Selecione uma fruta.');
  if (!pedido.pagamento.valor) return alert('Selecione a forma de pagamento.');
  if (!endereco)              return alert('Informe seu endereco.');

  const total = calcularTotal();

  const msg =
`*Pedido - Acai Galactico*

Tamanho: ${pedido.tamanho.valor}
Fruta: ${pedido.fruta.valor}
Complementos: ${pedido.complementos.length ? pedido.complementos.map(c => c.valor).join(', ') : 'Nenhum'}
Adicionais: ${pedido.adicionais.length ? pedido.adicionais.map(a => a.valor).join(', ') : 'Nenhum'}
Endereco: ${endereco}
Pagamento: ${pedido.pagamento.valor}
Total: R$${total.toFixed(2).replace('.', ',')}`;

  const numero = '5513988654970';
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank');
});