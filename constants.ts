import { Flow, ServiceEntity, QueueEntity } from './types';

export const MOCK_SERVICES: ServiceEntity[] = [
  { id: 'srv_triage', name: 'Triagem Inicial', category: 'Medical' },
  { id: 'srv_xray', name: 'Raio-X', category: 'Exam' },
  { id: 'srv_lab', name: 'Exame de Sangue', category: 'Lab' },
  { id: 'srv_payment', name: 'Pagamento / Tesouraria', category: 'Admin' },
];

export const MOCK_QUEUES: QueueEntity[] = [
  { id: 'q_prio', name: 'Prioritária', location: 'Térreo' },
  { id: 'q_gen', name: 'Geral', location: 'Térreo' },
  { id: 'q_lab', name: 'Laboratório', location: '1º Andar' },
];

export const INITIAL_FLOW: Flow = {
  flow_id: "default-clinic-flow",
  location_id: "unit-downtown",
  start_screen_id: "welcome",
  screens: {
    "welcome": {
      id: "welcome",
      title: "Bem-vindo à Filazero Clinic",
      subtitle: "Por favor, selecione uma opção para iniciar",
      type: "menu",
      components: [
        {
          id: "btn_checkin",
          type: "button",
          label: "Tenho Agendamento",
          action: "goto_screen",
          target: "checkin_cpf",
          primary: true
        },
        {
          id: "btn_walkin",
          type: "button",
          label: "Sem Agendamento (Retirada de Senha)",
          action: "goto_screen",
          target: "service_selection",
          primary: false
        }
      ]
    },
    "checkin_cpf": {
      id: "checkin_cpf",
      title: "Identificação",
      subtitle: "Digite seu CPF para localizar o agendamento",
      type: "form",
      components: [
        {
          id: "inp_cpf",
          type: "input_cpf",
          placeholder: "000.000.000-00"
        },
        {
          id: "btn_confirm_cpf",
          type: "button",
          label: "Buscar Agendamento",
          action: "goto_screen",
          target: "success_checkin",
          primary: true
        },
        {
          id: "btn_back",
          type: "button",
          label: "Voltar",
          action: "goto_screen",
          target: "welcome",
          primary: false
        }
      ]
    },
    "service_selection": {
      id: "service_selection",
      title: "Selecione o Serviço",
      type: "menu",
      components: [
        {
          id: "btn_exams",
          type: "button",
          label: "Exames Laboratoriais",
          action: "goto_screen",
          target: "queue_lab",
          primary: true
        },
        {
          id: "btn_admin",
          type: "button",
          label: "Tesouraria / Financeiro",
          action: "goto_screen",
          target: "queue_general",
          primary: true
        },
         {
          id: "btn_back_home",
          type: "button",
          label: "Voltar ao Início",
          action: "goto_screen",
          target: "welcome",
          primary: false
        }
      ]
    },
    "queue_lab": {
      id: "queue_lab",
      title: "Aguarde sua vez",
      subtitle: "Você foi adicionado à fila do Laboratório.",
      type: "success",
      components: [
        {
          id: "txt_ticket",
          type: "text_block",
          value: "Sua senha: LAB-042"
        },
        {
          id: "btn_finish",
          type: "button",
          label: "Concluir",
          action: "restart",
          primary: true
        }
      ]
    },
    "queue_general": {
      id: "queue_general",
      title: "Tudo certo!",
      subtitle: "Aguarde no painel principal.",
      type: "success",
      components: [
         {
          id: "txt_ticket_g",
          type: "text_block",
          value: "Sua senha: GEN-105"
        },
        {
          id: "btn_finish_g",
          type: "button",
          label: "Concluir",
          action: "restart",
          primary: true
        }
      ]
    },
    "success_checkin": {
      id: "success_checkin",
      title: "Check-in Realizado!",
      subtitle: "Bem-vindo(a), Maria. Dirija-se ao consultório 3.",
      type: "success",
      components: [
        {
          id: "btn_ok",
          type: "button",
          label: "Finalizar",
          action: "restart",
          primary: true
        }
      ]
    }
  }
};