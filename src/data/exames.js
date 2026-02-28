export const examesData = [
  {
    id: "colonoscopia",
    nome: "Colonoscopia Total",
    avisos_gerais: "Atenção: Se toma medicação para a diabetes, anticoagulantes (ex: Aspirina, Varfine) ou suplementos de ferro, contacte o seu médico 5 dias antes.",
    passos: [
      {
        id: "col-72",
        horas_antecedencia: 72,
        titulo: "Iniciar Dieta Pobre em Fibras",
        descricao_pt: "Proibido comer: frutas com casca ou grainhas, legumes, sementes, cereais integrais e leguminosas (grão, feijão). Pode comer: carne/peixe cozido, arroz branco, massa, ovos."
      },
      {
        id: "col-24",
        horas_antecedencia: 24,
        titulo: "Início da Dieta Líquida",
        descricao_pt: "A partir de agora só pode ingerir líquidos claros: água, chá, caldos coados (sem pedaços) e sumos sem polpa. Não beba nada de cor vermelha ou roxa."
      },
      {
        id: "col-14",
        horas_antecedencia: 14,
        titulo: "Primeira Toma do Preparado",
        descricao_pt: "Beba a primeira dose do laxante prescrito pelo médico, diluído em água, conforme as instruções da embalagem. Mantenha-se perto de uma casa de banho."
      },
      {
        id: "col-6",
        horas_antecedencia: 6,
        titulo: "Segunda Toma do Preparado",
        descricao_pt: "Beba a segunda e última dose do preparado. As dejeções devem estar a sair como líquido claro/amarelado."
      },
      {
        id: "col-4",
        horas_antecedencia: 4,
        titulo: "Jejum Absoluto (Zero Líquidos)",
        descricao_pt: "Pare de beber qualquer tipo de líquido, incluindo água. Não pode ingerir mais nada até à hora do exame."
      }
    ]
  },
  {
    id: "ecografia_abdominal",
    nome: "Ecografia Abdominal e Pélvica",
    avisos_gerais: "Traga consigo os exames anteriores. Vista roupa confortável de duas peças (calças/saia e camisola).",
    passos: [
      {
        id: "eco-8",
        horas_antecedencia: 8,
        titulo: "Início do Jejum",
        descricao_pt: "Não comer qualquer tipo de alimento sólido ou beber leite nas 8 horas antes do exame."
      },
      {
        id: "eco-2",
        horas_antecedencia: 2,
        titulo: "Beber Água (Bexiga Cheia)",
        descricao_pt: "Beba cerca de 3 a 4 copos de água (aproximadamente 1 litro). A partir deste momento, não deve urinar até que o exame seja realizado."
      }
    ]
  },
  {
    id: "tac_contraste",
    nome: "TAC com Contraste",
    avisos_gerais: "Se tem alergia ao iodo ou marisco, ou se sofre de insuficiência renal, avise o técnico antes de iniciar o exame.",
    passos: [
      {
        id: "tac-6",
        horas_antecedencia: 6,
        titulo: "Jejum Total",
        descricao_pt: "Não comer nem beber. Se precisar de tomar medicação habitual, faça-o com o mínimo de água possível (apenas um gole)."
      },
      {
        id: "tac-1",
        horas_antecedencia: 1,
        titulo: "Remover Objetos Metálicos",
        descricao_pt: "Retire brincos, colares, relógios, piercings ou roupas com fechos metálicos antes de sair de casa ou ao chegar à clínica."
      }
    ]
  },
  {
    id: "endoscopia_digestiva",
    nome: "Endoscopia Digestiva Alta",
    avisos_gerais: "Remova dentaduras, lentes de contacto e objectos do bolso antes do exame. Venha acompanhado por alguém.",
    passos: [
      {
        id: "endo-8",
        horas_antecedencia: 8,
        titulo: "Jejum Total",
        descricao_pt: "Não comer nem beber nada, incluindo água. Se toma medicação habitual, faça-o com apenas um gole de água."
      },
      {
        id: "endo-2",
        horas_antecedencia: 2,
        titulo: "Enxaguamento de Boca",
        descricao_pt: "Faça um enxaguamento rápido da boca com água (sem engolir). Pode ser útil para remover partículas de alimentos."
      }
    ]
  },
  {
    id: "analises_sangue",
    nome: "Análises ao Sangue",
    avisos_gerais: "Apresente-se com roupa com mangas soltas. Traga o cartão de seguidor e requisição do médico. Mantenha-se tranquilo antes do exame.",
    passos: [
      {
        id: "sang-12",
        horas_antecedencia: 12,
        titulo: "Jejum Obrigatório",
        descricao_pt: "Não comer nem beber nada (apenas água é permitida) nas 12 horas antes do exame. O jejum é importante para ler resultados de colesterol e glicose."
      },
      {
        id: "sang-6",
        horas_antecedencia: 6,
        titulo: "Hidratação",
        descricao_pt: "Beba água de forma normal. A hidratação ajuda a dilatação das veias, tornando mais fácil a colheita de sangue."
      },
      {
        id: "sang-2",
        horas_antecedencia: 2,
        titulo: "Preparação Final",
        descricao_pt: "Vista-se com roupas confortáveis e de mangas soltas. Descanse um pouco para evitar quedas de tensão durante o exame."
      }
    ]
  }
];
