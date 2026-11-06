# Especificação do Projeto: AutoLeilão MFE

## Contexto Acadêmico

- **Disciplina:** Arquitetura de Soluções
- **Tema:** Microfrontends com Module Federation
- **Nível:** Graduação em Engenharia de Software

---

## 🎯 Objetivo

Implementar uma plataforma web de leilão de veículos utilizando arquitetura de **Microfrontends (MFE)** com Vite Module Federation, demonstrando conceitos de:

- Decomposição de frontend em unidades independentes e implantáveis
- Integração em runtime via Module Federation
- Isolamento de dependências entre MFEs
- Comunicação Shell ↔ MFE via props e contexto React

---

## Funcionalidades

**Funcionalidades do mfe-cadastro (CadastroVeiculo.jsx):**
 - Formulário com campos: Marca (Select), Modelo (TextField), Ano (number), Placa, Cor (Select), Tipo (Select: Carro/SUV/Moto/Caminhão/Van/Pickup), Valor Mínimo (R$), Descrição (multiline)
 - Validação de campos obrigatórios com mensagens de erro
 - Tabela MUI com lista de veículos cadastrados (colunas: Veículo, Ano, Placa, Tipo, Cor, Valor Mínimo, Ações)
 - Exclusão com Dialog de confirmação
 - Feedback via MUI Snackbar + Alert
 - Dados iniciais de exemplo (3 veículos)

 **Funcionalidades do mfe-leilao (LanceLeilao.jsx):**
 - Grid de Cards de veículos com: nome, status (Ativo/Encerrado), lance atual, quantidade de lances, cronômetro regressivo (useEffect com setInterval)
 - Destaque visual no card selecionado
 - Painel lateral com detalhe do veículo selecionado
 - Formulário de lance: nome do licitante (TextField) + valor (TextField number, mínimo = lance atual + R$500)
 - Validação do lance com mensagens de erro
 - Histórico de lances (MUI List) do veículo selecionado
 - Chip "AO VIVO" animado (animate-pulse Tailwind)
 - LinearProgress de urgência quando < 600 segundos
 - Dados iniciais com histórico de lances

 **Shell (App.jsx):**
 - Componente `AppContent` separado para uso de hooks dentro do ThemeProvider
 - AppBar com Tabs de navegação (desktop via `sx={{ display: { xs: 'none', md: 'flex' } }}`)
 - Drawer mobile (hamburguer) para navegação em telas pequenas
 - Lazy loading dos MFEs com React.lazy + Suspense e fallback de CircularProgress
 - ThemeProvider MUI com tema personalizado: primary `#1565C0`, secondary `#E65100`
 - Chips informativos: "MFE: mfe-cadastro :3001", "MFE: mfe-leilao :3002", "Shell (Host) :3000"

 **Configuração Package.json raiz:**
 - Scripts: `install:all` (instala todas as deps), `build:remotes` (build dos MFEs), `start` (usando concurrently para preview dos MFEs + dev do shell)
 - devDependency: `concurrently` ^8.2.2

 **Configuração vite.config.js dos remotes (mfe-cadastro, mfe-leilao):**
 - `build.target: 'esnext'`, `build.minify: false`, `build.cssCodeSplit: false`
 - `server.cors: true`, `preview.cors: true`
 - `exposes` com o path relativo do componente principal

 **Configuração vite.config.js do shell:**
 - `build.target: 'esnext'`
 - `remotes` apontando para `http://localhost:PORT/assets/remoteEntry.js` de cada MFE

 Incluir README.md detalhado com: visão geral, diagrama de arquitetura ASCII, stack tecnológica, estrutura de pastas, passo a passo de execução (4 passos), fluxo do Module Federation, funcionalidades e conceitos demonstrados.

 Incluir SPEC.md com: contexto acadêmico, prompt base para reprodução, diagrama de arquitetura, dependências, checklist de avaliação e troubleshooting.

---

## 🏗️ Diagrama de Arquitetura

```
┌────────────────────────────────────────────────────────┐
│               SHELL HOST — localhost:3000              │
│                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐   │
│  │    mfe-cadastro      │  │    mfe-leilao         │   │
│  │   localhost:3001     │  │   localhost:3002      │   │
│  │                      │  │                       │   │
│  │  CadastroVeiculo     │  │  LanceLeilao          │   │
│  │  (remoteEntry.js)    │  │  (remoteEntry.js)     │   │
│  └──────────────────────┘  └──────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Module Federation

```
Shell (vite.config.js)          MFE Remote (vite.config.js)
  remotes: {                       exposes: {
    mfeCadastro: '...3001...'  ←     './CadastroVeiculo': './src/...'
    mfeLeilao:   '...3002...'  ←     './LanceLeilao': './src/...'
  }                              }
         ↓
  import('mfeCadastro/CadastroVeiculo')  → carregado em runtime
  import('mfeLeilao/LanceLeilao')        → carregado em runtime
```

---

## 📦 Dependências Chave .

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `vite` | ^5.x | Build tool / Dev server |
| `@vitejs/plugin-react` | ^4.x | React HMR + JSX transform |
| `@originjs/vite-plugin-federation` | ^1.3.5 | Module Federation para Vite |
| `@mui/material` | ^5.x | Componentes Material Design |
| `@emotion/react` | ^11.x | CSS-in-JS (dependência MUI) |
| `@emotion/styled` | ^11.x | Styled components (dependência MUI) |
| `@mui/icons-material` | ^5.x | Ícones Material |
| `tailwindcss` | ^3.x | Utility-first CSS framework |
| `autoprefixer` | ^10.x | PostCSS vendor prefixes |
| `concurrently` | ^8.x | Executar múltiplos processos |

---

## 🧪 Checklist de Avaliação

### Arquitetura (40%)
- [ ] Projeto corretamente dividido em 3 apps independentes
- [ ] `vite.config.js` do shell declara os `remotes`
- [ ] `vite.config.js` dos MFEs declaram `exposes` e `filename: 'remoteEntry.js'`
- [ ] Módulos `shared` configurados com `singleton: true`
- [ ] React e React-DOM como singletons para evitar instâncias duplicadas
- [ ] `remoteEntry.js` gerado em `/dist/assets/` de cada MFE

### Funcionalidades (40%)
- [ ] Formulário de cadastro com todos os campos e validação
- [ ] Tabela de veículos com listagem e exclusão funcionais
- [ ] Cards do leilão com cronômetro regressivo em tempo real
- [ ] Lance com validação (valor > lance atual)
- [ ] Histórico de lances atualizado em tempo real
- [ ] Shell carrega os MFEs com Lazy Loading + Suspense
- [ ] Navegação por tabs (desktop) e drawer (mobile) funciona

### Qualidade de Código (20%)
- [ ] Separação de responsabilidades (App.jsx vs componentes)
- [ ] Mix correto de Tailwind + MUI (sem conflitos de estilo)
- [ ] Scripts de npm no `package.json` raiz funcionando
- [ ] CssBaseline do MUI sem conflito com Tailwind
- [ ] Código limpo, sem console.error de PropTypes ou contexto

---

## 🔧 Troubleshooting Comum

| Problema | Causa | Solução |
|----------|-------|---------|
| `Cannot load remote module` | MFE não buildado ou não rodando | Execute `npm run build:remotes` antes de `npm start` |
| Estilos MUI quebrados | Conflito Tailwind preflight | Verificar `corePlugins: { preflight: false }` no tailwind.config.js |
| React duplicado (invariant) | Shared config incorreta | Usar `singleton: true` nos shared modules |
| CORS error no carregamento | MFE sem CORS habilitado | Verificar `cors: true` em `server` e `preview` no vite.config.js |
| Build falha em remotes | Target ESM incorreto | Verificar `build.target: 'esnext'` nos MFEs |
| Tema MUI não propagado | MUI não compartilhado | Adicionar `@mui/material` e `@emotion/react` ao `shared` |
| Port já em uso | Outro processo usando a porta | `npx kill-port 3001 3002 3000` |

---

## 📚 Referências

- [Vite Plugin Federation (originjs)](https://github.com/originjs/vite-plugin-federation)
- [Module Federation Official Docs](https://module-federation.io/)
- [Material UI v5 Documentation](https://mui.com/material-ui/)
- [Tailwind CSS + MUI Interoperability](https://mui.com/material-ui/guides/interoperability/#tailwind-css)
- [Microfrontends.dev Guide](https://microfrontends.dev/)
- [Martin Fowler — Micro Frontends](https://martinfowler.com/articles/micro-frontends.html)
