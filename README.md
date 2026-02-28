# PreparaSNS - MVP PWA

Aplicação web progressiva (PWA) em React + Vite para ajudar utentes portugueses na preparação de exames médicos.

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ e npm instalados

### Passos

1. **Instalar dependências** (já feito):
```bash
npm install
```

2. **Iniciar servidor de desenvolvimento**:
```bash
npm run dev
```
A aplicação abrirá automaticamente em `http://localhost:5173`

3. **Build para produção**:
```bash
npm run build
```

4. **Pré-visualizar build**:
```bash
npm run preview
```

## 📱 Funcionalidades

### Ecrã de Configuração
- ✅ Seleção de exame (Colonoscopia, Ecografia Abdominal, TAC com Contraste)
- ✅ Entrada de data e hora agendada
- ✅ Validação: não permite datas no passado
- ✅ Validação: alerta se tempo de preparação é insuficiente
- ✅ Exibição de avisos gerais do exame

### Timeline Interativa
- ✅ Lista cronológica ordenada de tarefas de preparação
- ✅ Cada tarefa mostra:
  - Hora exata em formato PT-PT (ex: "14 Março, 08:00")
  - Checkbox grande e touch-friendly
  - Descrição detalhada em português
- ✅ Estados visuais das tarefas:
  - **Concluída**: card esverdeado com checkbox preenchida
  - **Pendente**: card neutro
  - **Atrasada**: borda vermelha com etiqueta "Em atraso"

### Persistência
- ✅ Guarda exame selecionado no localStorage
- ✅ Guarda data/hora agendada
- ✅ Guarda array de IDs de tarefas concluídas
- ✅ Dados persistem ao fechar e reabrir a app

## 🎨 Design

### Paleta de Cores
- **Primary Blue**: `#005596`
- **Success Green**: `#00913d`
- **Warning Orange**: `#eab308`
- **Danger Red**: `#ef4444`

### Mobile-First
- Todos os elementos otimizados para toque
- Layout responsivo em todos os tamanhos
- Fontes e botões grandes para fácil interação

## 📁 Estrutura de Pastas

```
medicalexam_prep/
├── src/
│   ├── components/
│   │   ├── ExamForm.jsx       # Formulário de seleção/agendamento
│   │   ├── Timeline.jsx        # Lista de tarefas
│   │   ├── TaskCard.jsx        # Card individual de tarefa
│   │   └── AlertBox.jsx        # Componente de alertas
│   ├── data/
│   │   └── exames.js           # Dados dos exames e passos
│   ├── utils/
│   │   └── dateUtils.js        # Utilitários de manipulação de datas
│   ├── App.jsx                 # Componente principal
│   ├── index.css               # Estilos globais com Tailwind
│   └── main.jsx                # Ponto de entrada
├── index.html                  # HTML principal
├── vite.config.js              # Configuração Vite
├── tailwind.config.js          # Configuração Tailwind
├── postcss.config.js           # Configuração PostCSS
└── package.json                # Dependências
```

## 📦 Dependências Principais

- **React 18.2**: Framework UI
- **Vite 5.0**: Build tool e dev server
- **Tailwind CSS 3.3**: Utilitários CSS
- **date-fns 3.0**: Manipulação robusta de datas
- **lucide-react 0.294**: Ícones SVG limpos

## 🧪 Dados Mock

### Exames Incluídos

#### 1. Colonoscopia Total
- Preparação: 72 horas
- 5 passos: Dieta pobre em fibras → Dieta líquida → Preparado → Preparado 2 → Jejum

#### 2. Ecografia Abdominal e Pélvica
- Preparação: 8 horas
- 2 passos: Jejum → Beber água

#### 3. TAC com Contraste
- Preparação: 6 horas
- 2 passos: Jejum total → Remover objetos metálicos

## 🔧 Variáveis Customizáveis

Editar `src/data/exames.js` para:
- Adicionar novos exames
- Modificar horários de preparação
- Alterar descrições e avisos

## 📝 Notas Técnicas

- **Linguagem**: Português de Portugal (PT-PT)
- **Locale date-fns**: `ptBR` (BR é similar a PT)
- **localStorage key**: `prepara_sns_state`
- **Zona horária**: Usa horário local do utente

## 🐛 Troubleshooting

### Dependências não instalam
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 5173 já está em uso
```bash
npm run dev -- --port 3000
```

## 📄 Licença

MVP desenvolvido para fins educacionais.
