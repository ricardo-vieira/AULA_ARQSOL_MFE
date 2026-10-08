# AutoLeilão — Plataforma de Leilão de Veículos com Microfrontends

> Projeto didático da disciplina **Arquitetura de Soluções** demonstrando a arquitetura de **Microfrontends (MFE)** com **Vite Module Federation**.

---

## 🚗 Visão Geral

Aplicação de leilão de veículos construída com arquitetura de **Microfrontends**, onde cada funcionalidade é um projeto React independente, integrado em runtime pelo Shell via Module Federation.

| Aplicação | Porta | Descrição |
|-----------|-------|-----------|
| `shell` | **4000** | Host application — orquestra os MFEs |
| `mfe-cadastro` | **3001** | Microfrontend de cadastro de veículos |
| `mfe-leilao` | **3002** | Microfrontend de lance de leilão |

---

## 🏗️ Arquitetura

```
┌────────────────────────────────────────────────────────┐
│               SHELL HOST — localhost:3000              │
│                                                        │
│  ┌──────────────────────┐  ┌───────────────────────┐   │
│  │    mfe-cadastro      │  │    mfe-leilao         │   │
│  │   localhost:3001     │  │   localhost:3002      │   │
│  │                      │  │                       │   │
│  │  CadastroVeiculo     │  │  LanceLeilao          │   │
│  │  (remoteEntry.js)    │  │  (remoteEntry.js)     │   │
│  └──────────────────────┘  └───────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### Fluxo Module Federation

```
Shell (Consumer)                   MFE Remotes (Providers)
     │
     ├── import('mfeCadastro/CadastroVeiculo') ──► localhost:3001/assets/remoteEntry.js
     │
     └── import('mfeLeilao/LanceLeilao')       ──► localhost:3002/assets/remoteEntry.js
```

1. **MFEs** declaram o que **expõem** (`exposes`) em seu `vite.config.js`
2. **Shell** declara os **remotes** apontando para a URL de cada MFE
3. **Shell** carrega os componentes remotos em runtime via `React.lazy + Suspense`
4. **Módulos compartilhados** (`react`, `@mui/material`, etc.) são configurados como `singleton` para evitar duplicação

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Papel |
|------------|--------|-------|
| **React** | ^18.3 | Biblioteca de UI |
| **Vite** | ^5.3 | Build tool & dev server |
| **@originjs/vite-plugin-federation** | ^1.3.5 | Module Federation |
| **Material UI (MUI)** | ^5.15 | Componentes Material Design |
| **Tailwind CSS** | ^3.4 | Utility-first CSS |
| **@emotion/react + styled** | ^11.11 | CSS-in-JS (dep. MUI) |
| **@mui/icons-material** | ^5.15 | Ícones Material |
| **concurrently** | ^8.2 | Orquestração multi-processo |

---

## 📁 Estrutura de Pastas

```
AULA_ARQSOL_MFE/
├── package.json              ← Raiz: scripts de orquestração + concurrently
├── README.md
├── SPEC.md                   ← Especificação pedagógica do projeto
│
├── shell/                    ← Host application (port 4000)
│   ├── src/
│   │   ├── App.jsx           ← AppBar, Drawer, lazy load dos MFEs
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js        ← Declara os remotes
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
│
├── mfe-cadastro/             ← Remote MFE (port 3001)
│   ├── src/
│   │   ├── components/
│   │   │   └── CadastroVeiculo.jsx   ← Componente exposto
│   │   ├── App.jsx           ← Wrapper standalone
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js        ← Declara exposes + filename
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── package.json
│
└── mfe-leilao/               ← Remote MFE (port 3002)
    ├── src/
    │   ├── components/
    │   │   └── LanceLeilao.jsx       ← Componente exposto
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── package.json
```

---

## 🚀 Como Executar — Passo a Passo

### Pré-requisitos

- **Node.js** >= 18.x (`node -v`)
- **npm** >= 9.x (`npm -v`)

---

### Passo 1 — Instalar dependências de todos os projetos

Na raiz do projeto, execute:

```bash
npm run install:all
```

Isso instala as dependências da raiz, do `shell`, do `mfe-cadastro` e do `mfe-leilao`.

> Alternativamente, entre em cada pasta e execute `npm install`.

---

### Passo 2 — Build dos Microfrontends (Remotes)

Os MFEs precisam ser **compilados** para gerar o `remoteEntry.js` antes que o Shell possa consumi-los:

```bash
npm run build:remotes
```

> Este comando executa `vite build` no `mfe-cadastro` e no `mfe-leilao`.  
> Os artefatos são gerados em `mfe-cadastro/dist/` e `mfe-leilao/dist/`.

---

### Passo 3 — Iniciar todos os serviços

```bash
npm start
```

Este comando usa `concurrently` para iniciar simultaneamente:
- `mfe-cadastro` em modo **preview** (servindo o build) na porta **3001**
- `mfe-leilao` em modo **preview** (servindo o build) na porta **3002**
- `shell` em modo **dev** (Vite HMR) na porta **3000**

> **Alternativa com 3 terminais separados:**
>
> ```bash
> # Terminal 1
> cd mfe-cadastro && npm run preview
>
> # Terminal 2
> cd mfe-leilao && npm run preview
>
> # Terminal 3
> cd shell && npm run dev
> ```

---

### Passo 4 — Acessar a aplicação

Abra no navegador: **http://localhost:4000**

| URL | Conteúdo |
|-----|----------|
| http://localhost:4000 | Shell — aplicação completa |
| http://localhost:3001 | MFE Cadastro standalone |
| http://localhost:3002 | MFE Leilão standalone |

---

## 🧩 Funcionalidades

### Cadastro de Veículos (`mfe-cadastro`)
- Formulário com campos: Marca, Modelo, Ano, Placa, Cor, Tipo, Valor Mínimo, Descrição
- Validação de campos obrigatórios com mensagens de erro inline
- Tabela MUI com lista de veículos cadastrados
- Exclusão com Dialog de confirmação
- Feedback via Snackbar (`success` / `info`)

### Leilão de Veículos (`mfe-leilao`)
- Grid de Cards com veículos em leilão (Ativo / Encerrado)
- Cronômetro regressivo em tempo real por lote (`useEffect + setInterval`)
- Seleção de veículo com painel lateral de detalhes
- Formulário de lance com validação (valor mínimo = lance atual + R$ 500)
- Histórico de lances com destaque para o maior lance
- LinearProgress de urgência quando faltam menos de 10 min
- Alert de encerramento com nome do arrematante

### Shell (Host)
- AppBar com Tabs de navegação (desktop) e Drawer hamburguer (mobile)
- Lazy Loading dos MFEs com `React.lazy + Suspense` e fallback de `CircularProgress`
- `ThemeProvider` MUI com tema personalizado propagado para os MFEs
- Chips informativos exibindo a arquitetura MFE com portas

---

## 📚 Conceitos de Microfrontends Demonstrados

| Conceito | Implementação |
|----------|---------------|
| **Isolamento** | Cada MFE tem seu próprio `package.json`, dependências e pipeline de build |
| **Integração em runtime** | MFEs carregados dinamicamente via `remoteEntry.js` |
| **Shared dependencies** | `react`, `react-dom`, `@mui/material` como `singleton` |
| **Loose coupling** | MFEs não se comunicam diretamente entre si |
| **Tema compartilhado** | `ThemeProvider` do Shell propagado via contexto React singleton |
| **Independent deployability** | Cada MFE pode ser implantado e atualizado independentemente |

---

## 🔧 Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| `Cannot load remote module` | MFE não buildado ou não está rodando | Execute `npm run build:remotes` e depois `npm start` |
| Estilos MUI quebrados | Conflito com Tailwind preflight | Verificar `corePlugins: { preflight: false }` em todos os `tailwind.config.js` |
| `Invariant: different React instances` | React duplicado | Verificar `singleton: true` nos `shared` modules dos `vite.config.js` |
| CORS error ao carregar MFE | MFE sem CORS habilitado | Verificar `cors: true` em `server` e `preview` do `vite.config.js` do MFE |
| Porta já em uso | Outro processo | `npx kill-port 3000 3001 3002` |

---

## 📄 Licença

MIT — Uso livre para fins educacionais.
