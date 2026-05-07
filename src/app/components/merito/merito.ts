import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass, DecimalPipe } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import douradoData from './baseJsons/dourado.json';
import platinaData from './baseJsons/platina.json';

interface Faixa { de: number; ate: number; pg: number; }
type TipoMerito = 'dourado' | 'platina' | 'diamante';

const diamanteData: Faixa[] = [
  { de: 0,    ate: 100,   pg: 2 },
  { de: 100,  ate: 210,   pg: 2 },
  { de: 210,  ate: 330,   pg: 2 },
  { de: 330,  ate: 460,   pg: 2 },
  { de: 460,  ate: 600,   pg: 2 },
  { de: 600,  ate: 750,   pg: 3 },
  { de: 750,  ate: 910,   pg: 3 },
  { de: 910,  ate: 1080,  pg: 3 },
  { de: 1080, ate: 1260,  pg: 3 },
  { de: 1260, ate: 1450,  pg: 4 },
  { de: 1450, ate: 1650,  pg: 4 },
  { de: 1650, ate: 1860,  pg: 4 },
  { de: 1860, ate: 2080,  pg: 5 },
  { de: 2080, ate: 2310,  pg: 5 },
  { de: 2310, ate: 2550,  pg: 5 },
  { de: 2550, ate: 2800,  pg: 6 },
  { de: 2800, ate: 3060,  pg: 6 },
  { de: 3060, ate: 3330,  pg: 7 },
  { de: 3330, ate: 3610,  pg: 7 },
  { de: 3610, ate: 3900,  pg: 8 },
  { de: 3900, ate: 801500, pg: 8 },
];

@Component({
  selector: 'app-merito',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, NgClass, DecimalPipe],
  templateUrl: './merito.html',
  styleUrl: './merito.css',
})
export class Merito {
  calculadoraAtiva = false;

  private readonly tabelas: Record<TipoMerito, Faixa[]> = {
    dourado: douradoData as Faixa[],
    platina: platinaData as Faixa[],
    diamante: diamanteData,
  };

  // --- Calculadora: Lógica 1 — Completar Mérito ---
  calc1Tipo: TipoMerito = 'dourado';
  calc1PontoAtual = 0;
  calc1PontosPorTkt = 20;
  calc1TktPorTg = 5;
  calc1WexpPorTkt = 125;

  get calc1PontoMax(): number {
    const t = this.tabelas[this.calc1Tipo];
    return t[t.length - 1]?.ate ?? 0;
  }

  get calc1PontosRestantes(): number {
    return Math.max(0, this.calc1PontoMax - this.calc1PontoAtual);
  }

  get calc1TktsNecessarios(): number {
    if (this.calc1PontosPorTkt <= 0) return 0;
    return Math.ceil(this.calc1PontosRestantes / this.calc1PontosPorTkt);
  }

  get calc1TgsNecessarios(): number {
    if (this.calc1TktPorTg <= 0) return 0;
    return Math.ceil(this.calc1TktsNecessarios / this.calc1TktPorTg);
  }

  get calc1WexpTotal(): number {
    return this.calc1TktsNecessarios * this.calc1WexpPorTkt;
  }

  // --- Calculadora: Lógica 2 — De X até Y ---
  calc2Tipo: TipoMerito = 'dourado';
  calc2PontoInicial = 0;
  calc2PontoFinal = 5000;
  calc2PontosPorTkt = 20;
  calc2TktPorTg = 5;
  calc2WexpPorTkt = 125;

  get calc2PontosNecessarios(): number {
    return Math.max(0, this.calc2PontoFinal - this.calc2PontoInicial);
  }

  get calc2TktsNecessarios(): number {
    if (this.calc2PontosPorTkt <= 0) return 0;
    return Math.ceil(this.calc2PontosNecessarios / this.calc2PontosPorTkt);
  }

  get calc2TgsNecessarios(): number {
    if (this.calc2TktPorTg <= 0) return 0;
    return Math.ceil(this.calc2TktsNecessarios / this.calc2TktPorTg);
  }

  get calc2WexpTotal(): number {
    return this.calc2TktsNecessarios * this.calc2WexpPorTkt;
  }
}
