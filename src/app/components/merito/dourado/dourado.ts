import { Component, inject, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, DecimalPipe } from '@angular/common';
import atributosData from '../baseJsons/atributos.json';
import { ApiService, Faixa } from '../../../service/api-service';
import { CharacterService } from '../../../service/character.service';

interface Habilidade { nome: string; status: number; bonus: number | null; }
interface Expansao { nome: string; valor: number; }
interface ArvoreStatus { id: string; nome: string; custo: number; habilidades: Habilidade[]; expansoes: Expansao[]; }

@Component({
  selector: 'app-dourado',
  imports: [FormsModule, NgClass, DecimalPipe],
  templateUrl: './dourado.html',
  styleUrl: './dourado.css',
  host: { class: 'h-full' },
})
export class Dourado implements OnInit {
  private readonly api = inject(ApiService);
  private readonly characterService = inject(CharacterService);

  valor = 0;
  dados: Faixa[] = [];
  carregando = true;
  erroCarregamento = false;

  // Sincroniza automaticamente quando um personagem é selecionado
  private readonly _syncChar = effect(() => {
    const p = this.characterService.personagemAtivo();
    if (p) this.valor = p.meritoDourado ?? 0;
  });

  ngOnInit(): void {
    this.api.getMeritFaixas('Dourado').subscribe({
      next: faixas => {
        this.dados = faixas;
        this.carregando = false;
        const personagem = this.characterService.personagemAtivo();
        if (personagem) this.valor = personagem.meritoDourado;
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

  // --- Árvores de Status ---
  readonly arvoresDourado: ArvoreStatus[] = [
    {
      id: 'ignorar_evasao',
      nome: 'Ignorar Evasão',
      custo: 390,
      habilidades: [
        { nome: 'Acerto I',            status: 50,  bonus: null },
        { nome: 'Acerto II',           status: 120, bonus: 100  },
        { nome: 'Acerto III',          status: 190, bonus: 150  },
        { nome: 'Precisão I',          status: 180, bonus: null },
        { nome: 'Precisão II',         status: 330, bonus: 200  },
        { nome: 'Precisão III',        status: 480, bonus: 300  },
        { nome: 'Ignorar Bloqueio I',  status: 40,  bonus: null },
        { nome: 'Ignorar Bloqueio II', status: 85,  bonus: 21   },
        { nome: 'Ignorar Bloqueio III',status: 130, bonus: 34   },
      ],
      expansoes: [
        { nome: 'Expansão Acerto',   valor: 610  },
        { nome: 'Expansão Precisão', valor: 1490 },
      ],
    },
    {
      id: 'ignorar_reducao',
      nome: 'Ignorar Redução de Dano',
      custo: 390,
      habilidades: [
        { nome: 'Perfurar I',                  status: 5,  bonus: null },
        { nome: 'Perfurar II',                 status: 12, bonus: 10  },
        { nome: 'Perfurar III',                status: 19, bonus: 15  },
        { nome: 'Dano Adicional I',            status: 13, bonus: null },
        { nome: 'Dano Adicional II',           status: 25, bonus: 12  },
        { nome: 'Dano Adicional III',          status: 37, bonus: 17  },
        { nome: 'Ignorar Redução de Dano I',   status: 5,  bonus: null },
        { nome: 'Ignorar Redução de Dano II',  status: 10, bonus: 10  },
        { nome: 'Ignorar Redução de Dano III', status: 15, bonus: 15  },
      ],
      expansoes: [
        { nome: 'Expansão Perfurar',       valor: 61  },
        { nome: 'Expansão Dano Adicional', valor: 104 },
      ],
    },
    {
      id: 'ignorar_precisao',
      nome: 'Ignorar Precisão',
      custo: 455,
      habilidades: [
        { nome: 'Bloqueio I',                   status: 40,  bonus: null },
        { nome: 'Bloqueio II',                  status: 85,  bonus: 60  },
        { nome: 'Bloqueio III',                 status: 130, bonus: 85  },
        { nome: 'Evasão I',                     status: 130, bonus: null },
        { nome: 'Evasão II',                    status: 250, bonus: 190 },
        { nome: 'Evasão III',                   status: 410, bonus: 290 },
        { nome: 'Ignorar Acerto I',             status: 50,  bonus: null },
        { nome: 'Ignorar Acerto II',            status: 120, bonus: 21  },
        { nome: 'Ignorar Acerto III',           status: 190, bonus: 34  },
        { nome: 'Desfazer Ignorar Bloqueio I',  status: 105, bonus: null },
        { nome: 'Desfazer Ignorar Bloqueio II', status: 205, bonus: 25  },
      ],
      expansoes: [
        { nome: 'Expansão Bloqueio', valor: 400  },
        { nome: 'Expansão Evasão',   valor: 1270 },
      ],
    },
    {
      id: 'ignorar_perfuracao',
      nome: 'Ignorar Perfuração',
      custo: 455,
      habilidades: [
        { nome: 'Redução de Dano I',                    status: 11, bonus: null },
        { nome: 'Redução de Dano II',                   status: 25, bonus: 10  },
        { nome: 'Redução de Dano III',                  status: 37, bonus: 15  },
        { nome: 'Defesa I',                             status: 19, bonus: null },
        { nome: 'Defesa II',                            status: 39, bonus: 14  },
        { nome: 'Defesa III',                           status: 59, bonus: 19  },
        { nome: 'Ignorar Perfuração I',                 status: 9,  bonus: null },
        { nome: 'Ignorar Perfuração II',                status: 16, bonus: 10  },
        { nome: 'Ignorar Perfuração III',               status: 23, bonus: 15  },
        { nome: 'Desfazer Ignorar Redução de Dano I',   status: 25, bonus: null },
        { nome: 'Desfazer Ignorar Redução de Dano II',  status: 50, bonus: 25  },
      ],
      expansoes: [
        { nome: 'Expansão Redução de Dano', valor: 98  },
        { nome: 'Expansão Defesa',           valor: 150 },
      ],
    },
  ];

  arvoresAtivas: string[] = [];

  isArvoreAtiva(id: string): boolean { return this.arvoresAtivas.includes(id); }

  toggleArvore(id: string): void {
    if (this.isArvoreAtiva(id)) {
      this.arvoresAtivas = this.arvoresAtivas.filter(a => a !== id);
    } else if (this.meritoDisponivel >= this.custoArvore(id)) {
      this.arvoresAtivas = [...this.arvoresAtivas, id];
    }
  }

  custoArvore(id: string): number { return this.arvoresDourado.find(a => a.id === id)?.custo ?? 0; }
  canAfford(custo: number): boolean { return this.meritoDisponivel >= custo; }

  get meritoGasto(): number { return this.arvoresAtivas.reduce((acc, id) => acc + this.custoArvore(id), 0); }
  get meritoDisponivel(): number { return Math.max(0, this.meritoAcumulado - this.meritoGasto); }
  get arvoresAtivasLista(): ArvoreStatus[] { return this.arvoresDourado.filter(a => this.isArvoreAtiva(a.id)); }

  /**
   * Retorna a pontuação bruta (valor) mínima para acumular
   * mérito suficiente para pagar `custo`, considerando o que já foi gasto.
   * null = impossível dentro da tabela.
   */
  checkpointParaArvore(custo: number): number | null {
    const alvo = this.meritoGasto + custo;
    let acumulado = 0;
    for (const faixa of this.dados) {
      acumulado += faixa.pg;
      if (acumulado >= alvo) {
        return faixa.ate;
      }
    }
    return null;
  }

  // --- Poder por atributo ---
  private readonly atributoNomeMap: Record<string, string> = {
    'Acerto':                            'Acerto',
    'Precisão':                          'Precisão',
    'Ignorar Bloqueio':                  'Ignorar Bloqueio',
    'Perfurar':                          'Perfuração',
    'Dano Adicional':                    'Dano Adicional',
    'Ignorar Redução de Dano':           'Ignorar Redução de Danos',
    'Bloqueio':                          'Bloqueio',
    'Evasão':                            'Evasão',
    'Ignorar Acerto':                    'Ignorar Acerto',
    'Desfazer Ignorar Bloqueio':         'Ignorar Bloqueio',
    'Cancelar Ignorar Perfuração':       'Cancelar Ignorar Perfuração',
    'Redução de Dano':                   'Redução de Danos',
    'Defesa':                            'Defesa',
    'Ignorar Perfuração':                'Ignorar Perfuração',
    'Desfazer Ignorar Redução de Dano':  'Desfazer Ignorar Redução de Danos',
  };

  poderPorUnidade(nomeHabilidade: string): number {
    const prefixo = Object.keys(this.atributoNomeMap)
      .sort((a, b) => b.length - a.length)
      .find(k => nomeHabilidade.startsWith(k));
    if (!prefixo) return 0;
    const nomeAtributo = this.atributoNomeMap[prefixo];
    return (atributosData as { atributo: string; poder: number }[]).find(a => a.atributo === nomeAtributo)?.poder ?? 0;
  }

  poderHabilidade(hab: Habilidade): number { return hab.status * this.poderPorUnidade(hab.nome); }

  get poderTotalAtivo(): number {
    return this.arvoresAtivasLista.reduce((total, arvore) =>
      total + arvore.habilidades.reduce((sub, hab) => {
        const pu = this.poderPorUnidade(hab.nome);
        return sub + (hab.status + (hab.bonus ?? 0)) * pu;
      }, 0)
    , 0);
  }

  private nomeBase(nome: string): string {
    return nome.replace(/\s+(I{1,3}|IV|VI{0,3}|IX|X)$/i, '').trim();
  }

  habAgrupadas(arvore: ArvoreStatus): { nome: string; statusTotal: number; bonusTotal: number; poderTotal: number }[] {
    const grupos = new Map<string, { statusTotal: number; bonusTotal: number; poderTotal: number }>();
    for (const hab of arvore.habilidades) {
      const base = this.nomeBase(hab.nome);
      const pu = this.poderPorUnidade(hab.nome);
      const bonus = hab.bonus ?? 0;
      const atual = grupos.get(base) ?? { statusTotal: 0, bonusTotal: 0, poderTotal: 0 };
      grupos.set(base, {
        statusTotal: atual.statusTotal + hab.status,
        bonusTotal:  atual.bonusTotal  + bonus,
        poderTotal:  atual.poderTotal  + (hab.status + bonus) * pu,
      });
    }
    return Array.from(grupos.entries()).map(([nome, v]) => ({ nome, ...v }));
  }
}
