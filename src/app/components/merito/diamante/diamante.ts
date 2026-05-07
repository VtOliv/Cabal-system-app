import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

interface Faixa { de: number; ate: number; pg: number; }

const diamanteData: Faixa[] = [
  { de: 0,    ate: 100,    pg: 2 },
  { de: 100,  ate: 210,    pg: 2 },
  { de: 210,  ate: 330,    pg: 2 },
  { de: 330,  ate: 460,    pg: 2 },
  { de: 460,  ate: 600,    pg: 2 },
  { de: 600,  ate: 750,    pg: 3 },
  { de: 750,  ate: 910,    pg: 3 },
  { de: 910,  ate: 1080,   pg: 3 },
  { de: 1080, ate: 1260,   pg: 3 },
  { de: 1260, ate: 1450,   pg: 4 },
  { de: 1450, ate: 1650,   pg: 4 },
  { de: 1650, ate: 1860,   pg: 4 },
  { de: 1860, ate: 2080,   pg: 5 },
  { de: 2080, ate: 2310,   pg: 5 },
  { de: 2310, ate: 2550,   pg: 5 },
  { de: 2550, ate: 2800,   pg: 6 },
  { de: 2800, ate: 3060,   pg: 6 },
  { de: 3060, ate: 3330,   pg: 7 },
  { de: 3330, ate: 3610,   pg: 7 },
  { de: 3610, ate: 3900,   pg: 8 },
  { de: 3900, ate: 801500, pg: 8 },
];

@Component({
  selector: 'app-diamante',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './diamante.html',
  styleUrl: './diamante.css',
  host: { class: 'h-full' },
})
export class Diamante {
  valor = 1200;

  readonly dados: Faixa[] = diamanteData;

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
}
