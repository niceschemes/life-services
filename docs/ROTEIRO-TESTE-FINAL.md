# Roteiro de Teste Final - Life Services

Use este roteiro antes da apresentacao e depois de cada deploy no Render.

## 1. Acesso

- Abrir o sistema publicado no navegador.
- Fazer login com o usuario de teste configurado.
- Confirmar que o dashboard abre sem mensagem de sessao expirada.
- Clicar em Sair e entrar novamente.

## 2. Clientes

- Cadastrar um cliente com nome, telefone e endereco.
- Confirmar que o cliente aparece na lista sem trocar de pagina.
- Editar o cliente.
- Excluir apenas clientes de teste.

## 3. Estoque

- Cadastrar um produto com estoque atual, estoque minimo, custo e preco de venda.
- Registrar uma entrada de estoque.
- Registrar uma saida de estoque.
- Conferir se o saldo do produto foi atualizado.
- Validar se produtos abaixo do minimo aparecem em Alertas.

## 4. Orcamentos

- Criar um orçamento escolhendo um cliente pela sugestao.
- Adicionar dois ou mais itens no mesmo orçamento.
- Conferir se o total estimado muda automaticamente.
- Salvar e confirmar que o orçamento aparece na lista sem trocar de pagina.
- Gerar o PDF e conferir se ele ficou em uma unica pagina.
- Usar Enviar, Aprovar e Converter em OS.

## 5. Ordens

- Criar uma ordem selecionando um cliente pela sugestao.
- Conferir se a ordem aparece imediatamente na lista.
- Alterar o status para Em andamento.
- Marcar como Concluido.
- Baixar o PDF da ordem.

## 6. Financeiro

- Criar uma Entrada com produto/servico, quantidade e valor unitario.
- Conferir o total calculado antes de salvar.
- Criar uma Saida.
- Validar os cards de Entradas, Saidas e Saldo.
- Excluir apenas lancamentos de teste.

## 7. Mobile

- Abrir o sistema no celular ou no modo responsivo do navegador.
- Conferir menu superior, botao de tema e cards do dashboard.
- Abrir Clientes, Estoque, Orcamentos, Ordens e Financeiro.
- Confirmar que as listas aparecem em cards legiveis, sem depender de rolagem lateral.

## 8. Deploy

- Fazer commit e push das alteracoes.
- Aguardar o deploy no Render finalizar.
- Abrir o site publicado e usar Ctrl + F5 no computador.
- No celular, limpar dados do site se aparecer versao antiga.
