// Groundwork demo dataset.
// Product facts verified on the public page https://magmaiscuidado.com.br/ on 2026-11-01.
// Every feedback item below is SYNTHETIC: invented for this demo, no real customer data.

export type Channel = 'ticket' | 'review' | 'whatsapp' | 'social' | 'call';

export const channelLabel: Record<Channel, string> = {
  ticket: 'Support ticket',
  review: 'App store review',
  whatsapp: 'WhatsApp message',
  social: 'Social comment',
  call: 'Call note',
};

export interface FeedbackItem {
  id: string;
  channel: Channel;
  author: string;
  date: string; // ISO
  text: string;
  gold: string[]; // gold-standard theme ids
  dupOf?: string;
}

export const goldThemes: { id: string; title: string; kind: 'actionable' | 'informational'; note?: string }[] = [
  { id: 'g-pix-delay', title: 'Pix credit for medication: delays and unpredictability', kind: 'actionable' },
  { id: 'g-pix-rules', title: 'Pix credit rules are unclear (rollover, scope, per-person)', kind: 'actionable' },
  { id: 'g-network', title: 'Accredited-network discounts inconsistent or hard to find', kind: 'actionable' },
  { id: 'g-tele', title: '24h online care and telemedicine experience', kind: 'actionable' },
  { id: 'g-atestado', title: 'Medical certificates from teleconsult (validity, CID, employer refusal)', kind: 'actionable' },
  { id: 'g-dih', title: 'Daily hospitalization benefit (DIH): claim process and payout timing', kind: 'actionable' },
  { id: 'g-surgery', title: 'Surgery coverage disputes (rare, severe)', kind: 'actionable' },
  { id: 'g-plan', title: 'Product-vs-health-plan expectation mismatch', kind: 'actionable' },
  { id: 'g-whats', title: 'WhatsApp service flow: bot friction before human handoff', kind: 'actionable' },
  { id: 'g-cancel', title: 'Cancellation and refund timing', kind: 'actionable' },
  { id: 'g-raffle', title: 'Weekly raffle trust', kind: 'actionable' },
  { id: 'g-misc', title: 'Emerging delight: vet, nutrition, check-up, coach, psychologist', kind: 'informational', note: 'Praise-only. Missing it is acceptable; it informs marketing, not the roadmap.' },
];

export const feedback: FeedbackItem[] = [
  // --- g-pix-delay (10, incl. one duplicate)
  { id: 'FB-001', channel: 'ticket', author: 'Marcos V.', date: '2026-10-02', gold: ['g-pix-delay'], text: 'Faz 6 dias que pedi o crédito do remédio e até agora nada do Pix. O remédio é de uso contínuo, não dá pra esperar.' },
  { id: 'FB-002', channel: 'whatsapp', author: 'Dona Célia', date: '2026-10-05', gold: ['g-pix-delay'], text: 'bom dia, o pix dos remédios não caiu esse mês. mês passado veio dia 5' },
  { id: 'FB-003', channel: 'review', author: 'J. Almeida', date: '2026-10-08', gold: ['g-pix-delay'], text: 'Propaganda diz crédito pra remédio todo mês mas o meu demorou 9 dias. Quase fiquei sem o genérico do diabetes.' },
  { id: 'FB-004', channel: 'ticket', author: 'Patrícia R.', date: '2026-10-11', gold: ['g-pix-delay'], text: 'Solicitei o crédito Pix dia 3, hoje é dia 11 e nada. A atendente disse que o prazo é de 5 dias úteis, mas ninguém avisa isso na hora da venda.' },
  { id: 'FB-005', channel: 'social', author: 'Rogério T.', date: '2026-10-14', gold: ['g-pix-delay'], text: 'alguém mais com o pix do remédio atrasado? o meu veio certinho nos 2 primeiros meses e agora nada' },
  { id: 'FB-006', channel: 'whatsapp', author: 'Seu Antônio', date: '2026-10-18', gold: ['g-pix-delay'], text: 'o dinheiro do remédio caiu ontem, demorou mas veio. deviam avisar o prazo direitinho' },
  { id: 'FB-007', channel: 'ticket', author: 'Luciana M.', date: '2026-10-21', gold: ['g-pix-delay'], text: 'Pix do medicamento não caiu. Segunda vez. Preciso de previsibilidade, o remédio é de uso contínuo.' },
  { id: 'FB-008', channel: 'social', author: 'Karina S.', date: '2026-10-24', gold: ['g-pix-delay'], text: 'o crédito de remédio deles é no pix mesmo, gostei. mas o meu atrasou uma semana' },
  { id: 'FB-009', channel: 'whatsapp', author: 'Ivone P.', date: '2026-10-28', gold: ['g-pix-delay'], text: 'pedi o credito segunda e hoje sexta nada. antes era mais rapido' },
  { id: 'FB-010', channel: 'whatsapp', author: 'Ivone P.', date: '2026-10-28', gold: ['g-pix-delay'], dupOf: 'FB-009', text: 'ainda sobre o credito do remédio: continua sem cair' },
  // --- g-pix-rules (6)
  { id: 'FB-011', channel: 'whatsapp', author: 'Douglas F.', date: '2026-09-30', gold: ['g-pix-rules'], text: 'o crédito de 50 reais acumula se eu não usar no mês?' },
  { id: 'FB-012', channel: 'ticket', author: 'Renata C.', date: '2026-10-04', gold: ['g-pix-rules'], text: 'Posso usar o crédito do Pix em qualquer farmácia ou só na rede credenciada? E serve pra qualquer remédio ou só genérico?' },
  { id: 'FB-013', channel: 'social', author: 'Tiago M.', date: '2026-10-09', gold: ['g-pix-rules'], text: 'fiquei na dúvida: o crédito de remédio é por pessoa ou por contrato? minha esposa é dependente' },
  { id: 'FB-014', channel: 'whatsapp', author: 'Maria José', date: '2026-10-16', gold: ['g-pix-rules'], text: 'o valor do credito muda se eu mudar de plano? to no essencial pensando no premium' },
  { id: 'FB-015', channel: 'ticket', author: 'Eduardo L.', date: '2026-10-20', gold: ['g-pix-rules'], text: 'O crédito Pix pode ser usado para vitamina e suplemento ou só medicamento com receita?' },
  { id: 'FB-016', channel: 'review', author: 'C. Nogueira', date: '2026-10-26', gold: ['g-pix-rules'], text: 'Não ficou claro se o crédito vira saldo livre ou precisa mandar a receita antes. Mandei receita e caiu.' },
  // --- g-network (8)
  { id: 'FB-017', channel: 'ticket', author: 'Sandra P.', date: '2026-09-29', gold: ['g-network'], text: 'Cheguei na clínica credenciada aqui em Sorocaba e falaram que não conheciam o desconto do +Cuidado. Paguei cheio.' },
  { id: 'FB-018', channel: 'review', author: 'Wellington', date: '2026-10-02', gold: ['g-network'], text: 'rede credenciada fraca no interior, o laboratório mais perto que aceita fica a 40km' },
  { id: 'FB-019', channel: 'whatsapp', author: 'Neide A.', date: '2026-10-06', gold: ['g-network'], text: 'fiz exame com desconto numa rede grande em Campinas, deu tudo certo e saiu bem mais barato' },
  { id: 'FB-020', channel: 'ticket', author: 'Rafael D.', date: '2026-10-09', gold: ['g-network'], text: 'Como faço pra achar os laboratórios credenciados? No app não achei a lista.' },
  { id: 'FB-021', channel: 'social', author: 'Creusa', date: '2026-10-13', gold: ['g-network'], text: 'a clínica aqui do bairro falou que parou de dar desconto pra esses cartão, fiquei sem entender' },
  { id: 'FB-022', channel: 'ticket', author: 'Márcio H.', date: '2026-10-18', gold: ['g-network'], text: 'Desconto de consulta não foi aplicado no agendamento online da clínica, tive que pagar valor cheio e pedir estorno.' },
  { id: 'FB-023', channel: 'whatsapp', author: 'Tereza', date: '2026-10-22', gold: ['g-network'], text: 'quanto é o desconto mais ou menos nas consultas? varia por lugar?' },
  { id: 'FB-024', channel: 'review', author: 'Ana Beatriz', date: '2026-10-29', gold: ['g-network'], text: 'uso bastante os descontos em exame, pena que nem toda cidade tem credenciado' },
  // --- g-tele (10)
  { id: 'FB-025', channel: 'review', author: 'Fernanda L.', date: '2026-09-28', gold: ['g-tele'], text: 'Meu filho passou mal 2h da manhã e o pediatra online atendeu em minutos. Só por isso já vale.' },
  { id: 'FB-026', channel: 'whatsapp', author: 'Carlos E.', date: '2026-10-01', gold: ['g-tele'], text: 'o médico online me atendeu rápido e resolveu, evitei pronto socorro' },
  { id: 'FB-027', channel: 'ticket', author: 'Robson A.', date: '2026-10-05', gold: ['g-tele'], text: 'Fiquei 40 minutos na fila do atendimento online de madrugada. Achei que 24h era na hora.' },
  { id: 'FB-028', channel: 'social', author: 'Simone', date: '2026-10-08', gold: ['g-tele'], text: 'telemedicina deles é boa demais, médico atencioso, receita digital na hora' },
  { id: 'FB-029', channel: 'whatsapp', author: 'Davi', date: '2026-10-12', gold: ['g-tele'], text: 'o atendimento online nao tem ginecologista de madrugada? precisei e só tinha clínico' },
  { id: 'FB-030', channel: 'review', author: 'Paulo S.', date: '2026-10-15', gold: ['g-tele'], text: 'Usei a telemedicina com especialista, consegui cardiologista em 3 dias. No SUS seria mês.' },
  { id: 'FB-031', channel: 'ticket', author: 'Vânia', date: '2026-10-19', gold: ['g-tele'], text: 'A chamada de vídeo travou duas vezes e tive que recomeçar a consulta. O médico era bom.' },
  { id: 'FB-032', channel: 'whatsapp', author: 'Seu Rubens', date: '2026-10-23', gold: ['g-tele'], text: 'me ajudaram no whatsapp a entrar na consulta, tenho 67 anos e consegui' },
  { id: 'FB-033', channel: 'social', author: 'Amanda K.', date: '2026-10-26', gold: ['g-tele'], text: 'o clínico 24h me poupou uma noite no pronto socorro com a minha filha' },
  { id: 'FB-034', channel: 'ticket', author: 'João V.', date: '2026-10-30', gold: ['g-tele'], text: 'Médico da teleconsulta não podia renovar minha receita de uso contínuo. Fiquei sem entender o porquê.' },
  // --- g-atestado (3)
  { id: 'FB-035', channel: 'ticket', author: 'Bruno T.', date: '2026-10-03', gold: ['g-atestado'], text: 'A empresa não aceitou o atestado da teleconsulta. Disseram que só vale presencial. Perdi o dia.' },
  { id: 'FB-036', channel: 'whatsapp', author: 'Michele', date: '2026-10-17', gold: ['g-atestado'], text: 'o medico online nao quis dar atestado, disse que sem exame presencial nao podia. mas o site fala que emite atestado' },
  { id: 'FB-037', channel: 'review', author: 'R. Castro', date: '2026-10-27', gold: ['g-atestado'], text: 'Atestado veio sem CID e o RH recusou. Tive que pedir de novo pelo WhatsApp.' },
  // --- g-dih (7)
  { id: 'FB-038', channel: 'ticket', author: 'Helena B.', date: '2026-10-06', gold: ['g-dih'], text: 'Meu marido ficou 5 dias internado. Como aciono a diária de internação? Ninguém explicou no hospital.' },
  { id: 'FB-039', channel: 'call', author: 'Call center note', date: '2026-10-08', gold: ['g-dih'], text: 'Cliente perguntou se diária cobre UTI e se o valor é o mesmo. Encaminhado para condições gerais.' },
  { id: 'FB-040', channel: 'ticket', author: 'Osvaldo', date: '2026-10-10', gold: ['g-dih'], text: 'Internação aprovada pelo convênio público, fiquei 12 dias. O pedido da diária foi negado por carência de 90 dias. Ninguém falou de carência na venda.' },
  { id: 'FB-041', channel: 'whatsapp', author: 'Sueli', date: '2026-10-14', gold: ['g-dih'], text: 'recebi a diária certinho depois de 9 dias internada, o dinheiro ajudou muito. o processo de documentos foi confuso' },
  { id: 'FB-042', channel: 'ticket', author: 'Anderson P.', date: '2026-10-19', gold: ['g-dih'], text: 'Qual documento preciso pra pedir a diária? Mandei alta hospitalar e pediram mais coisa.' },
  { id: 'FB-043', channel: 'social', author: 'Marlene', date: '2026-10-25', gold: ['g-dih'], text: 'alguém sabe se a diária de internação vale pra acompanhante? minha filha internou e eu fiquei com ela' },
  { id: 'FB-044', channel: 'review', author: 'G. Freitas', date: '2026-10-31', gold: ['g-dih'], text: 'Diária demorou 22 dias pra pagar depois do pedido. Ajuda financeira que chega tarde ajuda menos.' },
  // --- g-surgery (2, rare but severe)
  { id: 'FB-045', channel: 'ticket', author: 'Marlene D.', date: '2026-10-16', gold: ['g-surgery'], text: 'Minha cirurgia de vesícula foi negada dizendo que era condição pré-existente. Fiz 4 meses de carência direitinho, paguei tudo em dia. Vou procurar meus direitos. É um absurdo.' },
  { id: 'FB-046', channel: 'ticket', author: 'José Carlos', date: '2026-10-27', gold: ['g-surgery'], text: 'Negaram a cobertura de cirurgia do meu plano Premium dizendo exclusão. Contrato diz até R$10.000. Quero revisão urgente, a cirurgia é semana que vem.' },
  // --- g-plan (6)
  { id: 'FB-047', channel: 'social', author: 'Fábio', date: '2026-10-01', gold: ['g-plan'], text: 'achei que era plano de saúde quando contratei, agora vi que é seguro de vida com assistências. deviam deixar mais claro' },
  { id: 'FB-048', channel: 'ticket', author: 'Cintia R.', date: '2026-10-07', gold: ['g-plan'], text: 'O vendedor disse que cobria qualquer internação. Lendo o contrato vi que é diária limitada. Me senti enganada.' },
  { id: 'FB-049', channel: 'review', author: 'Marcelo Q.', date: '2026-10-11', gold: ['g-plan'], text: 'Não é plano de saúde, é um seguro com benefícios. Sabendo disso antes, o produto é bom. O problema é a expectativa.' },
  { id: 'FB-050', channel: 'whatsapp', author: 'Valdir', date: '2026-10-15', gold: ['g-plan'], text: 'isso substitui plano de saúde ou complementa?' },
  { id: 'FB-051', channel: 'ticket', author: 'Sílvia N.', date: '2026-10-21', gold: ['g-plan'], text: 'Por 59,90 achei que teria consulta grátis. O desconto ajuda mas não é grátis. Ajustar a comunicação.' },
  { id: 'FB-052', channel: 'social', author: 'Kléber', date: '2026-10-28', gold: ['g-plan'], text: 'minha mãe jurou que tinha "plano da MAG", expliquei que é outra coisa' },
  // --- g-whats (7)
  { id: 'FB-053', channel: 'whatsapp', author: 'Tatiane', date: '2026-09-30', gold: ['g-whats'], text: 'o robozinho do whatsapp fica em loop e não me passa pra atendente' },
  { id: 'FB-054', channel: 'ticket', author: 'Vitor H.', date: '2026-10-05', gold: ['g-whats'], text: 'Pedi segunda via do boleto pelo WhatsApp e o bot resolveu em 2 minutos. Bom.' },
  { id: 'FB-055', channel: 'whatsapp', author: 'Dona Rosa', date: '2026-10-09', gold: ['g-whats'], text: 'nao sei mexer nesses negocio, queria falar com gente. depois de muito tentar me atenderam' },
  { id: 'FB-056', channel: 'social', author: 'Érica', date: '2026-10-13', gold: ['g-whats'], text: 'atendimento pelo whatsapp é prático mas o menu do bot é confuso' },
  { id: 'FB-057', channel: 'review', author: 'N. Batista', date: '2026-10-18', gold: ['g-whats'], text: 'o canal oficial é WhatsApp, o que facilita. mas fora do horário o bot não avisa que só vai responder depois' },
  { id: 'FB-058', channel: 'whatsapp', author: 'Cícero', date: '2026-10-24', gold: ['g-whats'], text: 'demorou 3h pra um humano assumir a conversa no whatsapp' },
  { id: 'FB-059', channel: 'call', author: 'Call center note', date: '2026-10-29', gold: ['g-whats'], text: 'Cliente relatou que não conseguiu acionar telemedicina pelo WhatsApp porque o bot não entendeu o pedido. Orientado.' },
  // --- g-cancel (5)
  { id: 'FB-060', channel: 'ticket', author: 'Priscila', date: '2026-10-02', gold: ['g-cancel'], text: 'Cancelei dia 20 e veio cobrança no cartão dia 28. Quero estorno.' },
  { id: 'FB-061', channel: 'whatsapp', author: 'Marcela', date: '2026-10-10', gold: ['g-cancel'], text: 'como faço pra cancelar? não acho a opção' },
  { id: 'FB-062', channel: 'review', author: 'O. Lima', date: '2026-10-16', gold: ['g-cancel'], text: 'Cancelamento fácil mesmo como prometem, sem ficar te segurando. Estorno em 5 dias.' },
  { id: 'FB-063', channel: 'ticket', author: 'Fernando A.', date: '2026-10-23', gold: ['g-cancel'], text: 'Estorno do cancelamento ainda não caiu depois de 15 dias.' },
  { id: 'FB-064', channel: 'social', author: 'Bianca', date: '2026-10-30', gold: ['g-cancel'], text: 'cancelei porque apertou o orçamento, gostava do produto. voltaria' },
  // --- g-raffle (4)
  { id: 'FB-065', channel: 'social', author: 'Zeca', date: '2026-10-04', gold: ['g-raffle'], text: 'esse sorteio semanal é verdade? nunca vi ninguém postar que ganhou' },
  { id: 'FB-066', channel: 'whatsapp', author: 'Lourdes', date: '2026-10-12', gold: ['g-raffle'], text: 'onde sai o resultado do sorteio?' },
  { id: 'FB-067', channel: 'social', author: 'Betão', date: '2026-10-19', gold: ['g-raffle'], text: '30 mil por semana? cheiro de pegadinha. se for real, mostrem os ganhadores' },
  { id: 'FB-068', channel: 'ticket', author: 'Antônia', date: '2026-10-26', gold: ['g-raffle'], text: 'Meu número da sorte veio no email mas não sei onde acompanhar. Podiam mandar o resultado no WhatsApp.' },
  // --- g-misc (5, incl. one duplicate)
  { id: 'FB-069', channel: 'review', author: 'Camila V.', date: '2026-10-03', gold: ['g-misc'], text: 'A teleconsulta veterinária salvou meu gato num domingo. Nem lembrava que tinha isso no plano.' },
  { id: 'FB-070', channel: 'whatsapp', author: 'Jéssica', date: '2026-10-08', gold: ['g-misc'], text: 'a nutricionista online montou meu plano alimentar, muito atenciosa' },
  { id: 'FB-071', channel: 'social', author: 'Roberta', date: '2026-10-14', gold: ['g-misc'], text: 'fiz o check-up anual incluso, descobri colesterol alto cedo. obrigada!' },
  { id: 'FB-072', channel: 'whatsapp', author: 'Jéssica', date: '2026-10-09', gold: ['g-misc'], dupOf: 'FB-070', text: 'só reforçando: adorei a nutricionista' },
  { id: 'FB-073', channel: 'review', author: 'T. Moraes', date: '2026-10-22', gold: ['g-misc'], text: 'o treinador online é básico mas ajuda a manter rotina. psicólogo ainda não usei.' },
];
// --- Synthesis run R1: the AI output under review -------------------------
// Produced offline by an LLM pipeline over the synthetic base above.
// It is deliberately imperfect: it contains one invented theme, one duplicated
// theme, two misplaced citations, and it misses three actionable gold themes
// (one of them rare but severe). The product exists to catch exactly this.

export interface AITheme {
  id: string;
  title: string;
  summary: string;
  citations: string[]; // feedback item ids; quotes are taken verbatim from the item text
  goldMatch: string | null; // evaluation mapping, never shown in the review queue
  suggestion: { impact: 'high' | 'medium' | 'low'; effort: 'high' | 'medium' | 'low'; rationale: string };
}

export const aiThemes: AITheme[] = [
  {
    id: 't-pix-delay',
    title: 'Medication Pix credit arrives late or unpredictably',
    summary: 'Customers on continuous medication report the monthly Pix credit arriving 5 to 9 days after request, with no stated SLA at sale time. The complaint repeats across tickets, WhatsApp and app store reviews.',
    citations: ['FB-001', 'FB-003', 'FB-004', 'FB-005', 'FB-007'],
    goldMatch: 'g-pix-delay',
    suggestion: { impact: 'high', effort: 'medium', rationale: 'High volume (largest cluster in the base), hits a promise made in marketing, and continuous-medication users face real harm when the credit is late. Suggested: publish a stated SLA and send proactive status messages.' },
  },
  {
    id: 't-pix-notpaid',
    title: 'Monthly medication credit not credited',
    summary: 'Customers say the monthly medication credit simply did not land in the expected month, breaking a routine they had learned (e.g. “always arrives on the 5th”).',
    citations: ['FB-002', 'FB-009', 'FB-010'],
    goldMatch: 'g-pix-delay',
    suggestion: { impact: 'medium', effort: 'low', rationale: 'Small cluster; sounds operational. Suggested: check the payout job for failed transfers.' },
  },
  {
    id: 't-network',
    title: 'Accredited network: discount not honored, coverage gaps outside big cities',
    summary: 'Customers arrive at listed clinics or labs and the discount is refused or unknown; outside capitals the nearest accredited lab can be 40 km away. One positive report shows the benefit works well where the network is dense.',
    citations: ['FB-017', 'FB-018', 'FB-020', 'FB-022', 'FB-051'],
    goldMatch: 'g-network',
    suggestion: { impact: 'high', effort: 'high', rationale: 'Core daily-use benefit failing at the point of use. Suggested: published accredited-directory, network education at POS, expansion criteria for smaller cities.' },
  },
  {
    id: 't-tele',
    title: '24h online care: strong praise, wait-time and scope friction at night',
    summary: 'The 24h urgent care is the most praised benefit (night pediatric cases avoided ER visits), but night queues reached 40 minutes, video calls dropped mid-consult, and specialist scope at night is unclear.',
    citations: ['FB-025', 'FB-027', 'FB-030', 'FB-033', 'FB-034'],
    goldMatch: 'g-tele',
    suggestion: { impact: 'medium', effort: 'medium', rationale: 'Mostly praise: protect the strength. Friction is concentrated in night staffing and call stability. Suggested: measure night queue, publish what “24h” covers.' },
  },
  {
    id: 't-dih',
    title: 'Hospitalization daily benefit (DIH): claim process and payout timing',
    summary: 'Customers who were hospitalized do not know how to claim the daily benefit at the moment it matters, documentation requests come in rounds, one claim hit the 90-day waiting period the customer says was never mentioned, and payouts took up to 22 days.',
    citations: ['FB-038', 'FB-040', 'FB-041', 'FB-042', 'FB-044'],
    goldMatch: 'g-dih',
    suggestion: { impact: 'high', effort: 'medium', rationale: 'Moments of truth: hospitalized customers. A single documented checklist plus proactive payout status would address most of the cluster. Waiting-period disclosure is a sales-compliance point.' },
  },
  {
    id: 't-plan',
    title: '“I thought it was a health plan”: expectation mismatch at sale time',
    summary: 'Several customers contracted believing +Cuidado was a health plan or that consultations were free. Some discovered the real structure only when reading the contract or after a denial.',
    citations: ['FB-047', 'FB-048', 'FB-049', 'FB-051'],
    goldMatch: 'g-plan',
    suggestion: { impact: 'medium', effort: 'low', rationale: 'Expectation mismatch created at sale time drives later distrust and cancellations. Suggested: sales-script and landing-page clarity check.' },
  },
  {
    id: 't-whats',
    title: 'WhatsApp service flow: bot friction before a human takes over',
    summary: 'The official channel is WhatsApp. Simple requests are solved in minutes by the bot, but complex ones loop in the menu and human handoff can take hours; elderly customers struggle most.',
    citations: ['FB-053', 'FB-055', 'FB-056', 'FB-058'],
    goldMatch: 'g-whats',
    suggestion: { impact: 'medium', effort: 'medium', rationale: 'The single front door for a low-digital-literacy base. Suggested: faster human handoff trigger and bot menu simplification.' },
  },
  {
    id: 't-cancel',
    title: 'Cancellation works, but charges and refunds lag',
    summary: 'Cancellation itself is reported as easy, yet one customer was charged 8 days after canceling and one refund took 15+ days.',
    citations: ['FB-060', 'FB-063', 'FB-064'],
    goldMatch: 'g-cancel',
    suggestion: { impact: 'medium', effort: 'low', rationale: 'Low volume but touches trust in the “easy to cancel” promise. Suggested: align billing cutoff with cancellation date and publish refund SLA.' },
  },
  {
    id: 't-raffle',
    title: 'Weekly raffle: customers doubt it is real',
    summary: 'Customers ask where results are published and say they have never seen a winner. Skepticism about the R$15k–30k weekly raffle appears in social comments.',
    citations: ['FB-065', 'FB-067', 'FB-068'],
    goldMatch: 'g-raffle',
    suggestion: { impact: 'low', effort: 'low', rationale: 'Small cluster, reputational rather than functional. Suggested: publish winners (with consent) and send results on WhatsApp.' },
  },
  {
    id: 't-app-crash',
    title: 'App instability on Android',
    summary: 'Reports of the app freezing during use suggest stability problems on Android.',
    citations: ['FB-031'],
    goldMatch: null,
    suggestion: { impact: 'medium', effort: 'high', rationale: 'Mobile stability work is expensive; flagged for investigation.' },
  },
];

// --- Evaluation of run R1 against the gold standard (computed, not typed) ---

export interface EvalResult {
  itemsTotal: number;
  itemsCited: number;
  themesProposed: number;
  goldActionable: number;
  goldCovered: number;
  duplicatePairs: [string, string][];
  invented: string[];
  missedActionable: { id: string; title: string; items: string[] }[];
  missedInformational: { id: string; title: string; items: string[] }[];
  citationsTotal: number;
  misplaced: { themeId: string; itemId: string }[];
}

export function evaluate(): EvalResult {
  const itemById = new Map(feedback.map((f) => [f.id, f]));
  const cited = new Set<string>();
  const misplaced: { themeId: string; itemId: string }[] = [];
  const byGold = new Map<string, string[]>();
  for (const t of aiThemes) {
    for (const c of t.citations) {
      cited.add(c);
      if (t.goldMatch) {
        const item = itemById.get(c);
        if (item && !item.gold.includes(t.goldMatch)) misplaced.push({ themeId: t.id, itemId: c });
      }
    }
    if (t.goldMatch) byGold.set(t.goldMatch, [...(byGold.get(t.goldMatch) ?? []), t.id]);
  }
  const duplicatePairs: [string, string][] = [];
  for (const ids of byGold.values()) if (ids.length > 1) duplicatePairs.push([ids[0], ids[1]]);
  const invented = aiThemes.filter((t) => !t.goldMatch).map((t) => t.id);
  const actionable = goldThemes.filter((g) => g.kind === 'actionable');
  const covered = new Set([...byGold.keys()]);
  const missedActionable = actionable
    .filter((g) => !covered.has(g.id))
    .map((g) => ({ id: g.id, title: g.title, items: feedback.filter((f) => f.gold.includes(g.id)).map((f) => f.id) }));
  const missedInformational = goldThemes
    .filter((g) => g.kind === 'informational' && !covered.has(g.id))
    .map((g) => ({ id: g.id, title: g.title, items: feedback.filter((f) => f.gold.includes(g.id)).map((f) => f.id) }));
  return {
    itemsTotal: feedback.length,
    itemsCited: cited.size,
    themesProposed: aiThemes.length,
    goldActionable: actionable.length,
    goldCovered: actionable.filter((g) => covered.has(g.id)).length,
    duplicatePairs,
    invented,
    missedActionable,
    missedInformational,
    citationsTotal: aiThemes.reduce((n, t) => n + t.citations.length, 0),
    misplaced,
  };
}

export const feedbackById = new Map(feedback.map((f) => [f.id, f]));
