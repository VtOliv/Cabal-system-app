import { Component, inject, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, NgClass } from '@angular/common';
import atributosData from '../baseJsons/atributos.json';
import { ApiService, Faixa } from '../../../service/api-service';
import { CharacterService } from '../../../service/character.service';

interface StatusDef {
  id: string;
  nome: string;
  tier: 1 | 2 | 3;
  valorMax: number;
  unidade: string;
  custo?: number;
  isEstrela?: boolean;
  semExpandida?: boolean;
  maxNivelCustom?: number;
}

interface TotalDef {
  nome: string;
  ids: string[];
  unidade: string;
  maxTotal: number;
}

interface GrupoPlatina {
  id: string;
  nome: string;
  status: StatusDef[];
  totais: TotalDef[];
}

interface EstrelaStatus {
  nome: string;
  unidade: string;
  valores: (number | null)[]; // índice 0 = 1 estrela, índice 5 = 6 estrelas
}

export interface EstrelaResultado {
  nome: string;
  unidade: string;
  estrelas: number;
  valor: number | null;
}

interface SlotTempo { caos: number; divino: number; tempo: string; }

@Component({
  selector: 'app-platina',
  imports: [FormsModule, DecimalPipe, NgClass],
  templateUrl: './platina.html',
  styleUrl: './platina.css',
  host: { class: 'h-full' },
})
export class Platina implements OnInit {
  private readonly api = inject(ApiService);
  private readonly characterService = inject(CharacterService);

  valor = 0;
  dados: Faixa[] = [];
  carregando = true;
  erroCarregamento = false;

  // Sincroniza automaticamente quando um personagem é selecionado
  private readonly _syncChar = effect(() => {
    const p = this.characterService.personagemAtivo();
    if (p) this.valor = p.meritoPlatina ?? 0;
  });

  ngOnInit(): void {
    this.api.getMeritFaixas('Platina').subscribe({
      next: faixas => {
        this.dados = faixas;
        this.carregando = false;
        const personagem = this.characterService.personagemAtivo();
        if (personagem) this.valor = personagem.meritoPlatina ?? 0;
      },
      error: () => { this.erroCarregamento = true; this.carregando = false; },
    });
  }

  get faixaAtual(): Faixa | null {
    return this.dados.find(f => this.valor >= f.de && this.valor < f.ate) ?? null;
  }

  get porcentagem(): number {
    if (!this.faixaAtual) return 100;
    const { de, ate } = this.faixaAtual;
    return Math.min(100, ((this.valor - de) / (ate - de)) * 100);
  }

  get meritoAcumulado(): number {
    return this.dados.filter(f => f.ate <= this.valor).reduce((acc, f) => acc + f.pg, 0);
  }

  get recompensaProxima(): number { return this.faixaAtual?.pg ?? 0; }
  get proximoMarco(): number { return this.faixaAtual?.ate ?? this.valor; }
  get valorMaximo(): number { return this.dados[this.dados.length - 1]?.ate ?? 0; }

  clampValor(): void {
    if (this.valorMaximo > 0 && this.valor > this.valorMaximo) this.valor = this.valorMaximo;
    if (this.valor < 0) this.valor = 0;
  }

  // ─── Tier config ────────────────────────────────────────────────────────────
  readonly maxNivelPorTier: Record<1 | 2 | 3, number> = { 1: 5, 2: 10, 3: 15 };
  readonly custoPorNivelPorTier: Record<1 | 2 | 3, number> = { 1: 3, 2: 5, 3: 7 };
  readonly custoExpandidaPorTier: Record<1 | 2 | 3, number> = { 1: 15, 2: 30, 3: 45 };

  // ─── Tabelas de Tempo de Liberação ──────────────────────────────────────────
  // Espírito Feroz / Vontade Feroz — 19 slots
  readonly temposEF: SlotTempo[] = [
    { caos: 2,  divino: 2,  tempo: '15 min'   },
    { caos: 4,  divino: 4,  tempo: '45 min'   },
    { caos: 6,  divino: 6,  tempo: '8 h'      },
    { caos: 8,  divino: 8,  tempo: '16 h'     },
    { caos: 10, divino: 10, tempo: '2d 12h'   },
    { caos: 12, divino: 12, tempo: '4d 12h'   },
    { caos: 14, divino: 14, tempo: '7 dias'   },
    { caos: 16, divino: 16, tempo: '10 dias'  },
    { caos: 18, divino: 18, tempo: '14 dias'  },
    { caos: 20, divino: 20, tempo: '24 dias'  },
    { caos: 22, divino: 22, tempo: '35 dias'  },
    { caos: 24, divino: 24, tempo: '47 dias'  },
    { caos: 26, divino: 26, tempo: '60 dias'  },
    { caos: 28, divino: 28, tempo: '84 dias'  },
    { caos: 30, divino: 30, tempo: '103 dias' },
    { caos: 32, divino: 32, tempo: '124 dias' },
    { caos: 34, divino: 34, tempo: '156 dias' },
    { caos: 36, divino: 36, tempo: '192 dias' },
    { caos: 38, divino: 38, tempo: '218 dias' },
  ];

  // Assassino / Guardião de Guerra — 17 slots
  readonly temposAG: SlotTempo[] = [
    { caos: 3,  divino: 3,  tempo: '15 min'   },
    { caos: 5,  divino: 5,  tempo: '45 min'   },
    { caos: 7,  divino: 7,  tempo: '8 h'      },
    { caos: 9,  divino: 9,  tempo: '16 h'     },
    { caos: 10, divino: 10, tempo: '2d 12h'   },
    { caos: 12, divino: 12, tempo: '4d 12h'   },
    { caos: 14, divino: 14, tempo: '9 dias'   },
    { caos: 16, divino: 16, tempo: '15 dias'  },
    { caos: 18, divino: 18, tempo: '26 dias'  },
    { caos: 20, divino: 20, tempo: '39 dias'  },
    { caos: 22, divino: 22, tempo: '52 dias'  },
    { caos: 24, divino: 24, tempo: '67 dias'  },
    { caos: 26, divino: 26, tempo: '85 dias'  },
    { caos: 28, divino: 28, tempo: '106 dias' },
    { caos: 32, divino: 32, tempo: '130 dias' },
    { caos: 34, divino: 34, tempo: '158 dias' },
    { caos: 36, divino: 36, tempo: '190 dias' },
  ];

  // Lâmina Afiada / Bloqueio Rápido — 11 slots
  readonly temposLA: SlotTempo[] = [
    { caos: 2,  divino: 2,  tempo: '1 h'      },
    { caos: 4,  divino: 4,  tempo: '1 dia'    },
    { caos: 7,  divino: 7,  tempo: '2 dias'   },
    { caos: 10, divino: 10, tempo: '3 dias'   },
    { caos: 14, divino: 14, tempo: '5 dias'   },
    { caos: 18, divino: 18, tempo: '10 dias'  },
    { caos: 23, divino: 23, tempo: '34 dias'  },
    { caos: 28, divino: 28, tempo: '62 dias'  },
    { caos: 34, divino: 34, tempo: '95 dias'  },
    { caos: 38, divino: 38, tempo: '135 dias' },
    { caos: 42, divino: 42, tempo: '194 dias' },
  ];

  // Ordem fixa dos slots por quadrante (status → expandidas)
  readonly slotOrdem: Record<string, string[]> = {
    espirito_feroz: [
      'ef_at_1', 'ef_at_2', 'ef_at_3',
      'ef_ird_1', 'ef_ird_2', 'ef_ird_3',
      'ef_amp_1', 'ef_dc_1', 'ef_pf_1', 'ef_estrela',
      'ef_at_1_exp', 'ef_at_2_exp', 'ef_at_3_exp',
      'ef_ird_1_exp', 'ef_ird_2_exp', 'ef_ird_3_exp',
      'ef_amp_1_exp', 'ef_dc_1_exp', 'ef_pf_1_exp',
    ],
    vontade_feroz: [
      'vf_hp_1', 'vf_hp_2', 'vf_hp_3',
      'vf_ip_1', 'vf_ip_2', 'vf_ip_3',
      'vf_def_1', 'vf_def_2', 'vf_ft_1', 'vf_estrela',
      'vf_hp_1_exp', 'vf_hp_2_exp', 'vf_hp_3_exp',
      'vf_ip_1_exp', 'vf_ip_2_exp', 'vf_ip_3_exp',
      'vf_def_1_exp', 'vf_def_2_exp', 'vf_ft_1_exp',
    ],
    assassino_guerra: [
      'ag_cip_1', 'ag_cip_2', 'ag_cip_3',
      'ag_rdc_1', 'ag_rdc_2', 'ag_rdc_3',
      'ag_rta_1', 'ag_rta_2', 'ag_rta_3', 'ag_estrela',
      'ag_cip_1_exp', 'ag_cip_2_exp', 'ag_cip_3_exp',
      'ag_rdc_1_exp', 'ag_rdc_2_exp',
      'ag_rta_1_exp', 'ag_rta_2_exp',
    ],
    guardiao_guerra: [
      'gg_cird_1', 'gg_cird_2', 'gg_cird_3',
      'gg_rdc_1', 'gg_rdc_2', 'gg_rdc_3',
      'gg_rta_1', 'gg_rta_2', 'gg_rta_3',
      'gg_red_1', 'gg_red_2', 'gg_estrela',
      'gg_cird_1_exp', 'gg_cird_2_exp', 'gg_cird_3_exp',
      'gg_rdc_1_exp', 'gg_rdc_2_exp',
      'gg_rta_1_exp', 'gg_rta_2_exp',
      'gg_red_1_exp', 'gg_red_2_exp',
    ],
    lamina_afiada: [
      'la_ib_1', 'la_ib_2', 'la_ib_3',
      'la_pr_1', 'la_pr_2', 'la_estrela',
      'la_ib_1_exp', 'la_ib_2_exp', 'la_ib_3_exp',
      'la_pr_1_exp', 'la_pr_2_exp',
    ],
    bloqueio_rapido: [
      'br_ia_1', 'br_ia_2', 'br_ia_3',
      'br_ev_1', 'br_ev_2', 'br_estrela',
      'br_ia_1_exp', 'br_ia_2_exp', 'br_ia_3_exp',
      'br_ev_1_exp', 'br_ev_2_exp',
    ],
  };

  // ─── Grupos ─────────────────────────────────────────────────────────────────
  readonly grupos: GrupoPlatina[] = [
    {
      id: 'espirito_feroz',
      nome: 'Espírito Feroz',
      status: [
        { id: 'ef_at_1',  nome: 'Todos os Ataques I',       tier: 1, valorMax: 10,  unidade: '' },
        { id: 'ef_at_2',  nome: 'Todos os Ataques II',      tier: 2, valorMax: 30,  unidade: '' },
        { id: 'ef_at_3',  nome: 'Todos os Ataques III',     tier: 3, valorMax: 60,  unidade: '' },
        { id: 'ef_ird_1', nome: 'Ign. Red. de Danos I',     tier: 1, valorMax: 10,  unidade: '' },
        { id: 'ef_ird_2', nome: 'Ign. Red. de Danos II',    tier: 2, valorMax: 30,  unidade: '' },
        { id: 'ef_ird_3', nome: 'Ign. Red. de Danos III',   tier: 3, valorMax: 60,  unidade: '' },
        { id: 'ef_amp_1', nome: 'Todas as Téc. Amp I',      tier: 1, valorMax: 10,  unidade: '%' },
        { id: 'ef_dc_1',  nome: 'Danos Críticos I',         tier: 1, valorMax: 15,  unidade: '%' },
        { id: 'ef_pf_1',  nome: 'Perfurar I',               tier: 1, valorMax: 20,  unidade: '' },
        { id: 'ef_estrela', nome: 'Estrela',                   tier: 1, valorMax: 0,   unidade: '', custo: 50, isEstrela: true },
      ],
      totais: [
        { nome: 'Todos os Ataques',   ids: ['ef_at_1','ef_at_2','ef_at_3'],    unidade: '', maxTotal: 100 },
        { nome: 'Ign. Red. de Danos', ids: ['ef_ird_1','ef_ird_2','ef_ird_3'], unidade: '', maxTotal: 100 },
        { nome: 'Todas as Téc. Amp.', ids: ['ef_amp_1'],                        unidade: '%', maxTotal: 10 },
        { nome: 'Danos Críticos',     ids: ['ef_dc_1'],                         unidade: '%', maxTotal: 15 },
        { nome: 'Perfurar',           ids: ['ef_pf_1'],                         unidade: '', maxTotal: 20 },
      ],
    },
    {
      id: 'vontade_feroz',
      nome: 'Vontade Feroz',
      status: [
        { id: 'vf_hp_1',  nome: 'HP I',                  tier: 1, valorMax: 50,  unidade: '' },
        { id: 'vf_hp_2',  nome: 'HP II',                 tier: 2, valorMax: 150, unidade: '' },
        { id: 'vf_hp_3',  nome: 'HP III',                tier: 3, valorMax: 300, unidade: '' },
        { id: 'vf_ip_1',  nome: 'Ignorar Perfuração I',  tier: 1, valorMax: 5,   unidade: '' },
        { id: 'vf_ip_2',  nome: 'Ignorar Perfuração II', tier: 2, valorMax: 20,  unidade: '' },
        { id: 'vf_ip_3',  nome: 'Ignorar Perfuração III',tier: 3, valorMax: 45,  unidade: '' },
        { id: 'vf_def_1', nome: 'Defesa I',              tier: 1, valorMax: 25,  unidade: '' },
        { id: 'vf_def_2', nome: 'Defesa II',             tier: 2, valorMax: 80,  unidade: '' },
        { id: 'vf_ft_1',  nome: 'Furto Máx HP I',        tier: 1, valorMax: 15,  unidade: '' },
        { id: 'vf_estrela', nome: 'Estrela',              tier: 1, valorMax: 0,   unidade: '', custo: 50, isEstrela: true },
      ],
      totais: [
        { nome: 'HP',                ids: ['vf_hp_1','vf_hp_2','vf_hp_3'],   unidade: '', maxTotal: 500 },
        { nome: 'Ignorar Perfuração',ids: ['vf_ip_1','vf_ip_2','vf_ip_3'],   unidade: '', maxTotal: 70 },
        { nome: 'Defesa',            ids: ['vf_def_1','vf_def_2'],            unidade: '', maxTotal: 105 },
        { nome: 'Furto Máx. HP',     ids: ['vf_ft_1'],                        unidade: '', maxTotal: 15 },
      ],
    },
    {
      id: 'assassino_guerra',
      nome: 'Assassino de Guerra',
      status: [
        { id: 'ag_cip_1', nome: 'Canc. Ignorar Perfurar I',       tier: 1, valorMax: 5,  unidade: '' },
        { id: 'ag_cip_2', nome: 'Canc. Ignorar Perfurar II',      tier: 2, valorMax: 20, unidade: '' },
        { id: 'ag_cip_3', nome: 'Canc. Ignorar Perfurar III',     tier: 3, valorMax: 45, unidade: '' },
        { id: 'ag_rdc_1', nome: 'Ign. Res. Danos Críticos I',     tier: 1, valorMax: 6,  unidade: '%', custo: 4, maxNivelCustom: 3 },
        { id: 'ag_rdc_2', nome: 'Ign. Res. Danos Críticos II',    tier: 2, valorMax: 15, unidade: '%', custo: 6, maxNivelCustom: 5 },
        { id: 'ag_rdc_3', nome: 'Ign. Res. Danos Críticos III',   tier: 3, valorMax: 28, unidade: '%', custo: 8, maxNivelCustom: 7, semExpandida: true },
        { id: 'ag_rta_1', nome: 'Ign. Res. Téc. Amp I',           tier: 1, valorMax: 3,  unidade: '%', custo: 4, maxNivelCustom: 3 },
        { id: 'ag_rta_2', nome: 'Ign. Res. Téc. Amp II',          tier: 2, valorMax: 5,  unidade: '%', custo: 6, maxNivelCustom: 5 },
        { id: 'ag_rta_3', nome: 'Ign. Res. Téc. Amp III',         tier: 3, valorMax: 14, unidade: '%', custo: 8, maxNivelCustom: 7, semExpandida: true },
        { id: 'ag_estrela', nome: 'Estrela',                           tier: 1, valorMax: 0,  unidade: '', custo: 50, isEstrela: true },
      ],
      totais: [
        { nome: 'Canc. Ignorar Perfurar',   ids: ['ag_cip_1','ag_cip_2','ag_cip_3'], unidade: '', maxTotal: 70 },
        { nome: 'Ign. Res. Danos Críticos', ids: ['ag_rdc_1','ag_rdc_2','ag_rdc_3'], unidade: '%', maxTotal: 49 },
        { nome: 'Ign. Res. Téc. Amp',       ids: ['ag_rta_1','ag_rta_2','ag_rta_3'], unidade: '%', maxTotal: 22 },
      ],
    },
    {
      id: 'guardiao_guerra',
      nome: 'Guardião da Guerra',
      status: [
        { id: 'gg_cird_1', nome: 'Canc. Ign. Red. Danos I',   tier: 1, valorMax: 5,  unidade: '' },
        { id: 'gg_cird_2', nome: 'Canc. Ign. Red. Danos II',  tier: 2, valorMax: 20, unidade: '' },
        { id: 'gg_cird_3', nome: 'Canc. Ign. Red. Danos III', tier: 3, valorMax: 45, unidade: '' },
        { id: 'gg_rdc_1',  nome: 'Res. Danos Críticos I',     tier: 1, valorMax: 6,  unidade: '%', custo: 4, maxNivelCustom: 3 },
        { id: 'gg_rdc_2',  nome: 'Res. Danos Críticos II',    tier: 2, valorMax: 15, unidade: '%', custo: 6, maxNivelCustom: 5 },
        { id: 'gg_rdc_3',  nome: 'Res. Danos Críticos III',   tier: 3, valorMax: 21, unidade: '%', custo: 8, maxNivelCustom: 7, semExpandida: true },
        { id: 'gg_rta_1',  nome: 'Res. Técnica Amp I',        tier: 1, valorMax: 3,  unidade: '%', custo: 4, maxNivelCustom: 3 },
        { id: 'gg_rta_2',  nome: 'Res. Técnica Amp II',       tier: 2, valorMax: 5,  unidade: '%', custo: 6, maxNivelCustom: 5 },
        { id: 'gg_rta_3',  nome: 'Res. Técnica Amp III',      tier: 3, valorMax: 7,  unidade: '%', custo: 8, maxNivelCustom: 7, semExpandida: true },
        { id: 'gg_red_1',  nome: 'Redução de Danos I',        tier: 1, valorMax: 10, unidade: '' },
        { id: 'gg_red_2',  nome: 'Redução de Danos II',       tier: 2, valorMax: 30, unidade: '' },
        { id: 'gg_estrela', nome: 'Estrela',                   tier: 1, valorMax: 0,  unidade: '', custo: 50, isEstrela: true },
      ],
      totais: [
        { nome: 'Canc. Ign. Red. Danos', ids: ['gg_cird_1','gg_cird_2','gg_cird_3'], unidade: '', maxTotal: 70 },
        { nome: 'Res. Danos Críticos',   ids: ['gg_rdc_1','gg_rdc_2','gg_rdc_3'],    unidade: '%', maxTotal: 42 },
        { nome: 'Res. Técnica Amp',      ids: ['gg_rta_1','gg_rta_2','gg_rta_3'],    unidade: '%', maxTotal: 15 },
        { nome: 'Redução de Danos',      ids: ['gg_red_1','gg_red_2'],               unidade: '', maxTotal: 40 },
      ],
    },
    {
      id: 'lamina_afiada',
      nome: 'Lâmina Afiada',
      status: [
        { id: 'la_ib_1', nome: 'Ignorar Bloqueio I',   tier: 1, valorMax: 25,  unidade: '' },
        { id: 'la_ib_2', nome: 'Ignorar Bloqueio II',  tier: 2, valorMax: 100, unidade: '' },
        { id: 'la_ib_3', nome: 'Ignorar Bloqueio III', tier: 3, valorMax: 225, unidade: '' },
        { id: 'la_pr_1', nome: 'Precisão I',           tier: 1, valorMax: 150, unidade: '' },
        { id: 'la_pr_2', nome: 'Precisão II',          tier: 2, valorMax: 600, unidade: '' },
        { id: 'la_estrela', nome: 'Estrela',            tier: 1, valorMax: 0,   unidade: '', custo: 45, isEstrela: true },
      ],
      totais: [
        { nome: 'Ignorar Bloqueio', ids: ['la_ib_1','la_ib_2','la_ib_3'], unidade: '', maxTotal: 350 },
        { nome: 'Precisão',         ids: ['la_pr_1','la_pr_2'],           unidade: '', maxTotal: 750 },
      ],
    },
    {
      id: 'bloqueio_rapido',
      nome: 'Bloqueio Rápido',
      status: [
        { id: 'br_ia_1', nome: 'Ignorar Acerto I',   tier: 1, valorMax: 30,  unidade: '' },
        { id: 'br_ia_2', nome: 'Ignorar Acerto II',  tier: 2, valorMax: 120, unidade: '' },
        { id: 'br_ia_3', nome: 'Ignorar Acerto III', tier: 3, valorMax: 270, unidade: '' },
        { id: 'br_ev_1', nome: 'Evasão I',           tier: 1, valorMax: 150, unidade: '' },
        { id: 'br_ev_2', nome: 'Evasão II',          tier: 2, valorMax: 400, unidade: '' },
        { id: 'br_estrela', nome: 'Estrela',          tier: 1, valorMax: 0,   unidade: '', custo: 45, isEstrela: true },
      ],
      totais: [
        { nome: 'Ignorar Acerto', ids: ['br_ia_1','br_ia_2','br_ia_3'], unidade: '', maxTotal: 420 },
        { nome: 'Evasão',         ids: ['br_ev_1','br_ev_2'],           unidade: '', maxTotal: 550 },
      ],
    },
  ];

  private readonly _statusById = new Map<string, StatusDef>();

  constructor() {
    for (const g of this.grupos) {
      for (const s of g.status) {
        this._statusById.set(s.id, s);
      }
    }
  }

  // ─── Quadrante activo (menu lateral) ────────────────────────────────────────
  grupoAtivoId: string = 'espirito_feroz';

  get grupoAtivo(): GrupoPlatina {
    return this.grupos.find(g => g.id === this.grupoAtivoId) ?? this.grupos[0];
  }

  // ─── Estado dos níveis ───────────────────────────────────────────────────────
  niveis: Record<string, number> = {};
  expandidas: Record<string, boolean> = {};

  temExpandida(s: StatusDef): boolean {
    return !s.isEstrela && !s.semExpandida;
  }

  isExpandida(id: string): boolean {
    return this.expandidas[id] ?? false;
  }

  custoExpandida(tier: 1 | 2 | 3): number {
    return this.custoExpandidaPorTier[tier];
  }

  canExpandir(id: string, tier: 1 | 2 | 3): boolean {
    return !this.isExpandida(id) && this.pontosDisponiveis >= this.custoExpandida(tier);
  }

  toggleExpandida(id: string, tier: 1 | 2 | 3): void {
    if (this.isExpandida(id)) {
      delete this.expandidas[id];
    } else if (this.canExpandir(id, tier)) {
      this.expandidas[id] = true;
    }
  }

  nivelAtual(id: string): number { return this.niveis[id] ?? 0; }
  maxNivel(tier: 1 | 2 | 3): number { return this.maxNivelPorTier[tier]; }
  custoPorNivel(tier: 1 | 2 | 3): number { return this.custoPorNivelPorTier[tier]; }

  custoEfetivo(id: string, tier: 1 | 2 | 3): number {
    const custo = this._statusById.get(id)?.custo;
    return custo ?? this.custoPorNivelPorTier[tier];
  }

  maxNivelDeStatus(id: string, tier: 1 | 2 | 3): number {
    const s = this._statusById.get(id);
    if (s?.isEstrela) return 1;
    if (s?.maxNivelCustom !== undefined) return s.maxNivelCustom;
    return this.maxNivelPorTier[tier];
  }

  custoGasto(id: string, tier: 1 | 2 | 3): number {
    return this.nivelAtual(id) * this.custoEfetivo(id, tier);
  }

  valorAtual(id: string, tier: 1 | 2 | 3, valorMax: number): number {
    const nivel = this.nivelAtual(id);
    if (nivel === 0) return 0;
    return Math.round((nivel / this.maxNivelDeStatus(id, tier)) * valorMax);
  }

  totalAtual(ids: string[]): number {
    return ids.reduce((acc, id) => {
      const s = this._statusById.get(id);
      return s ? acc + this.valorAtual(id, s.tier, s.valorMax) : acc;
    }, 0);
  }

  get pontosGastos(): number {
    const statusCost = this.grupos
      .flatMap(g => g.status)
      .reduce((acc, s) => acc + this.custoGasto(s.id, s.tier), 0);
    const expandidaCost = Object.keys(this.expandidas)
      .filter(id => this.expandidas[id])
      .reduce((acc, id) => {
        const s = this._statusById.get(id);
        return s ? acc + this.custoExpandidaPorTier[s.tier] : acc;
      }, 0);
    return statusCost + expandidaCost;
  }

  get pontosDisponiveis(): number {
    return Math.max(0, this.meritoAcumulado - this.pontosGastos);
  }

  canIncrement(id: string, tier: 1 | 2 | 3): boolean {
    return this.nivelAtual(id) < this.maxNivelDeStatus(id, tier)
      && this.pontosDisponiveis >= this.custoEfetivo(id, tier);
  }

  incrementar(id: string, tier: 1 | 2 | 3): void {
    if (!this.canIncrement(id, tier)) return;
    this.niveis[id] = this.nivelAtual(id) + 1;
  }

  decrementar(id: string, tier: 1 | 2 | 3): void {
    const atual = this.nivelAtual(id);
    if (atual <= 0) return;
    this.niveis[id] = atual - 1;
    if (this.niveis[id] === 0) {
      delete this.expandidas[id];
      if (this._statusById.get(id)?.isEstrela) {
        const grupo = this.grupos.find(g => g.status.some(s => s.id === id));
        if (grupo) delete this.resultadosEstrela[grupo.id];
      }
    }
  }

  grupoTemAlgumNivel(grupo: GrupoPlatina): boolean {
    return grupo.status.some(s => this.nivelAtual(s.id) > 0);
  }

  resetGrupo(grupo: GrupoPlatina): void {
    for (const s of grupo.status) {
      delete this.niveis[s.id];
      delete this.expandidas[s.id];
    }
    delete this.resultadosEstrela[grupo.id];
  }

  // ─── Ícones de Status ────────────────────────────────────────────────────────
  private readonly _iconParaStatus: Record<string, string> = {
    'ef_at':   'todos_ataques.png',
    'ef_ird':  'ignorar_reducao_danos.png',
    'ef_amp':  'todas_tec_amp.png',
    'ef_dc':   'danos_criticos.png',
    'ef_pf':   'perfuracao.png',
    'vf_hp':   'HP.png',
    'vf_ip':   'ignorar_perfuracao.png',
    'vf_def':  'defesa.png',
    'vf_ft':   'furto.png',
    'ag_cip':  'cancelar_ignorar_perfuracao.png',
    'ag_rdc':  'ignorar_resistencia_danos_criticos.png',
    'ag_rta':  'ignorar_resistencia_tecnica_amp.png',
    'gg_cird': 'cancelar_ignorar_reducao_danos.png',
    'gg_rdc':  'res_danos_criticos.png',
    'gg_rta':  'res_todas_tec_amp.png',
    'gg_red':  'reducao_danos.png',
    'la_ib':   'ignorar_bloqueio.png',
    'la_pr':   'precisao.png',
    'br_ia':   'ignorar_acerto.png',
    'br_ev':   'evasao.png',
  };

  iconDeStatus(id: string): string | null {
    if (this._statusById.get(id)?.isEstrela) return 'assets/estrela.jpg';
    const prefixo = Object.keys(this._iconParaStatus)
      .sort((a, b) => b.length - a.length)
      .find(k => id.startsWith(k));
    return prefixo ? `assets/${this._iconParaStatus[prefixo]}` : null;
  }

  // ─── Estrela ─────────────────────────────────────────────────────────────────
  readonly estrelaPool: Record<string, EstrelaStatus[]> = {
    espirito_feroz: [
      { nome: 'Perfurar',               unidade: '',  valores: [5, 10, 15, 25, 35, 55] },
      { nome: 'Danos Críticos',         unidade: '%', valores: [1, 3, 5, 7, 9, 12] },
      { nome: 'Todas as Téc. Amp.',     unidade: '%', valores: [1, 1, 2, 3, 4, 6] },
      { nome: 'Todos os Ataques',       unidade: '',  valores: [10, 20, 30, 40, 50, 75] },
      { nome: 'Aumento do Dano Normal', unidade: '%', valores: [2, 4, 6, 8, 10, 14] },
      { nome: 'Dano Adicional',         unidade: '',  valores: [20, 30, 40, 50, 60, 85] },
    ],
    vontade_feroz: [
      { nome: 'Canc. Ign. Red. Danos', unidade: '', valores: [5, 10, 15, 25, 35, 55] },
      { nome: 'Ignorar Perfurar',      unidade: '', valores: [5, 10, 15, 25, 35, 55] },
      { nome: 'Defesa',                unidade: '', valores: [20, 30, 40, 55, 70, 100] },
      { nome: 'Furto HP',              unidade: '', valores: [4, 8, 12, 16, 20, 25] },
      { nome: 'HP',                    unidade: '', valores: [100, 180, 260, 380, 500, 700] },
    ],
    assassino_guerra: [
      { nome: 'Aumento do Dano Final',       unidade: '%', valores: [1, 1, 1, 1, 2, 3] },
      { nome: 'Canc. Ignorar Perfuração',    unidade: '',  valores: [10, 15, 20, 30, 40, 60] },
      { nome: 'Ignorar Res. Técnica Amp.',   unidade: '%', valores: [1, 2, 3, 4, 5, 7] },
      { nome: 'Ignorar Res. Danos Críticos', unidade: '%', valores: [1, 3, 5, 7, 9, 15] },
      { nome: 'Aumento do Dano Normal',      unidade: '%', valores: [2, 4, 6, 8, 10, 14] },
      { nome: 'Canc. Ign. Red. Danos',       unidade: '',  valores: [25, 35, 45, 55, 65, 90] },
    ],
    guardiao_guerra: [
      { nome: 'Redução do Dano Final', unidade: '%', valores: [1, 1, 1, 1, 2, 3] },
      { nome: 'Redução de Danos',      unidade: '',  valores: [5, 10, 15, 20, 25, 40] },
      { nome: 'Ignorar Perfuração',    unidade: '',  valores: [5, 10, 15, 25, 35, 55] },
      { nome: 'Res. Técnica Amp.',     unidade: '%', valores: [2, 3, 4, 5, 6, 8] },
      { nome: 'Res. Danos Críticos',   unidade: '%', valores: [2, 4, 6, 8, 10, 16] },
    ],
    lamina_afiada: [
      { nome: 'Ign. Res. à Taxa Crítica', unidade: '%', valores: [1, 1, 1, 1, 1, 2] },
      { nome: 'Acerto',                   unidade: '',  valores: [100, 150, 200, 250, 300, 400] },
      { nome: 'Precisão',                 unidade: '',  valores: [150, 200, 250, 300, 350, 450] },
      { nome: 'Ignorar Bloqueio',         unidade: '',  valores: [150, 200, 250, 300, 350, 450] },
      { nome: 'FOR',                      unidade: '',  valores: [4, 5, 6, 8, 10, 15] },
      { nome: 'INT',                      unidade: '',  valores: [4, 5, 6, 8, 10, 15] },
    ],
    bloqueio_rapido: [
      { nome: 'Res. à Taxa Crítica', unidade: '%', valores: [1, 1, 1, 1, 1, 2] },
      { nome: 'Ignorar Bloqueio',    unidade: '',  valores: [100, 150, 200, 250, 300, 400] },
      { nome: 'Evasão',              unidade: '',  valores: [150, 200, 250, 300, 350, 450] },
      { nome: 'Ignorar Acerto',      unidade: '',  valores: [150, 200, 250, 300, 350, 450] },
      { nome: 'DEX',                 unidade: '',  valores: [4, 5, 6, 8, 10, 15] },
    ],
  };

  resultadosEstrela: Record<string, EstrelaResultado[]> = {};

  // ─── Poder ──────────────────────────────────────────────────────────────────
  private readonly _atributoParaStatus: Record<string, string> = {
    'ef_at':   'Aumentou todos os Ataques',
    'ef_ird':  'Ignorar Redução de Danos',
    'ef_amp':  'Todas as Téc. Amp.',
    'ef_dc':   'Danos Críticos',
    'ef_pf':   'Perfuração',
    'vf_hp':   'HP',
    'vf_ip':   'Ignorar Perfuração',
    'vf_def':  'Defesa',
    'ag_cip':  'Cancelar Ignorar Perfuração',
    'ag_rdc':  'Ignorar Resistência a Danos Críticos',
    'ag_rta':  'Ignorar Resistência a Técnica de Amp',
    'gg_cird': 'Desfazer Ignorar Redução de Danos',
    'gg_rdc':  'Res. Danos Críticos',
    'gg_rta':  'Res. Todas as Téc. Amp.',
    'gg_red':  'Redução de Danos',
    'la_ib':   'Ignorar Bloqueio',
    'la_pr':   'Precisão',
    'br_ia':   'Ignorar Acerto',
    'br_ev':   'Evasão',
  };

  private readonly _atributoPoder = new Map<string, number>(
    (atributosData as { atributo: string; poder: number }[]).map(a => [a.atributo, a.poder])
  );

  poderPorId(id: string): number {
    const prefixo = Object.keys(this._atributoParaStatus)
      .sort((a, b) => b.length - a.length)
      .find(k => id.startsWith(k));
    if (!prefixo) return 0;
    return this._atributoPoder.get(this._atributoParaStatus[prefixo]) ?? 0;
  }

  poderAtualStatus(id: string, tier: 1 | 2 | 3, valorMax: number): number {
    return this.valorAtual(id, tier, valorMax) * this.poderPorId(id);
  }

  poderEstrelaGrupo(grupoId: string): number {
    const resultados = this.resultadosEstrela[grupoId];
    if (!resultados?.length) return 0;
    return resultados.reduce((acc, r) => {
      if (r.valor === null) return acc;
      const poder = this._atributoPoder.get(r.nome) ?? 0;
      return acc + r.valor * poder;
    }, 0);
  }

  get poderTotal(): number {
    return this.grupos.reduce((acc, g) => acc + this.poderTotalGrupo(g), 0);
  }

  poderTotalGrupo(grupo: GrupoPlatina): number {
    const statusPoder = grupo.status
      .filter(s => !s.isEstrela)
      .reduce((acc, s) => acc + this.poderAtualStatus(s.id, s.tier, s.valorMax), 0);
    return statusPoder + this.poderEstrelaGrupo(grupo.id);
  }

  // ─── Contagem de status ativos / totais ─────────────────────────────────────
  statusAtivosGrupo(grupo: GrupoPlatina): number {
    const ativos = grupo.status.filter(s => this.nivelAtual(s.id) > 0).length;
    const expandidasAtivas = grupo.status
      .filter(s => !s.isEstrela && !s.semExpandida && this.isExpandida(s.id)).length;
    return ativos + expandidasAtivas;
  }

  statusTotaisGrupo(grupo: GrupoPlatina): number {
    const total = grupo.status.length;
    const expandidas = grupo.status.filter(s => !s.isEstrela && !s.semExpandida).length;
    return total + expandidas;
  }

  estrelasAtiva(grupoId: string): boolean {
    const grupo = this.grupos.find(g => g.id === grupoId);
    const estrela = grupo?.status.find(s => s.isEstrela);
    return estrela ? this.nivelAtual(estrela.id) > 0 : false;
  }

  rolarEstrela(grupoId: string): void {
    const pool = this.estrelaPool[grupoId];
    if (!pool?.length) return;
    const picks: EstrelaResultado[] = [];
    for (let i = 0; i < 2; i++) {
      const s = pool[Math.floor(Math.random() * pool.length)];
      const estrelas = Math.floor(Math.random() * 6) + 1;
      const valor = s.valores[estrelas - 1];
      picks.push({ nome: s.nome, unidade: s.unidade, estrelas, valor });
    }
    this.resultadosEstrela[grupoId] = picks;
  }

  // ─── Tempo de Liberação de Slots ─────────────────────────────────────────────
  tabelaDoGrupo(grupoId: string): SlotTempo[] {
    if (grupoId === 'assassino_guerra' || grupoId === 'guardiao_guerra') return this.temposAG;
    if (grupoId === 'lamina_afiada'    || grupoId === 'bloqueio_rapido')  return this.temposLA;
    return this.temposEF;
  }

  slotNumero(grupoId: string, slotKey: string): number {
    return (this.slotOrdem[grupoId]?.indexOf(slotKey) ?? -1) + 1;
  }

  slotTempo(grupoId: string, slotKey: string): SlotTempo {
    const tabela = this.tabelaDoGrupo(grupoId);
    const idx = Math.min(this.slotNumero(grupoId, slotKey) - 1, tabela.length - 1);
    return tabela[Math.max(0, idx)];
  }

  slotAtivo(slotKey: string): boolean {
    if (slotKey.endsWith('_exp')) return this.isExpandida(slotKey.slice(0, -4));
    return this.nivelAtual(slotKey) > 0;
  }

  totalCaosGrupo(grupoId: string): number {
    return (this.slotOrdem[grupoId] ?? [])
      .filter(k => this.slotAtivo(k))
      .reduce((acc, k) => acc + this.slotTempo(grupoId, k).caos, 0);
  }

  totalDivinoGrupo(grupoId: string): number {
    return (this.slotOrdem[grupoId] ?? [])
      .filter(k => this.slotAtivo(k))
      .reduce((acc, k) => acc + this.slotTempo(grupoId, k).divino, 0);
  }

  get totalCaosGlobal(): number {
    return this.grupos.reduce((acc, g) => acc + this.totalCaosGrupo(g.id), 0);
  }

  get totalDivinoGlobal(): number {
    return this.grupos.reduce((acc, g) => acc + this.totalDivinoGrupo(g.id), 0);
  }

  titleExpandida(grupoId: string, statusId: string, tier: 1 | 2 | 3): string {
    const slotKey = statusId + '_exp';
    const n = this.slotNumero(grupoId, slotKey);
    const t = this.slotTempo(grupoId, slotKey);
    const info = `slot #${n} | ${t.caos}c ${t.divino}d | ${t.tempo} | ${this.custoExpandida(tier)} pts merito`;
    return this.isExpandida(statusId)
      ? `EXP ativa (${info}) - clique para remover`
      : `Abrir slot EXP (${info})`;
  }

  // ─── Tempo Total de Liberação ────────────────────────────────────────────────
  parseMinutos(tempo: string): number {
    const diaHoraMatch = tempo.match(/(\d+)d\s*(\d+)h/);
    if (diaHoraMatch) return +diaHoraMatch[1] * 1440 + +diaHoraMatch[2] * 60;
    const diasMatch = tempo.match(/(\d+)\s*dia/);
    if (diasMatch) return +diasMatch[1] * 1440;
    const horasMatch = tempo.match(/(\d+)\s*h/);
    if (horasMatch) return +horasMatch[1] * 60;
    const minMatch = tempo.match(/(\d+)\s*min/);
    if (minMatch) return +minMatch[1];
    return 0;
  }

  formatMinutos(m: number): string {
    if (m < 60) return `${m} min`;
    if (m < 1440) {
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return rem > 0 ? `${h}h ${rem}min` : `${h}h`;
    }
    const d = Math.floor(m / 1440);
    const h = Math.floor((m % 1440) / 60);
    return h > 0 ? `${d}d ${h}h` : `${d} dias`;
  }

  tempoMinutosGrupo(grupoId: string): number {
    return (this.slotOrdem[grupoId] ?? [])
      .filter(k => this.slotAtivo(k))
      .reduce((acc, k) => acc + this.parseMinutos(this.slotTempo(grupoId, k).tempo), 0);
  }

  get tempoMinutosGlobal(): number {
    return this.grupos.reduce((acc, g) => acc + this.tempoMinutosGrupo(g.id), 0);
  }

  tempoFormatadoGrupo(grupoId: string): string {
    return this.formatMinutos(this.tempoMinutosGrupo(grupoId));
  }

  get tempoFormatadoGlobal(): string {
    return this.formatMinutos(this.tempoMinutosGlobal);
  }

  // ─── Checkpoint por Quadrante ────────────────────────────────────────────────
  pontosTotaisGrupo(grupo: GrupoPlatina): number {
    const statusCost = grupo.status.reduce((acc, s) =>
      acc + this.maxNivelDeStatus(s.id, s.tier) * this.custoEfetivo(s.id, s.tier), 0);
    const expandidaCost = grupo.status
      .filter(s => !s.isEstrela && !s.semExpandida)
      .reduce((acc, s) => acc + this.custoExpandidaPorTier[s.tier], 0);
    return statusCost + expandidaCost;
  }

  /** Retorna o EXP de mérito mínimo para acumular ao menos `pontos` pts de mérito. */
  expNecessariaParaPontos(pontos: number): number {
    let acc = 0;
    for (const f of this.dados) {
      acc += f.pg;
      if (acc >= pontos) return f.ate;
    }
    return this.dados[this.dados.length - 1]?.ate ?? 0;
  }

  expCheckpointGrupo(grupo: GrupoPlatina): number {
    return this.expNecessariaParaPontos(this.pontosTotaisGrupo(grupo));
  }

  checkpointPct(grupo: GrupoPlatina): number {
    const expAlvo = this.expCheckpointGrupo(grupo);
    return expAlvo === 0 ? 100 : Math.min(100, (this.valor / expAlvo) * 100);
  }
}
