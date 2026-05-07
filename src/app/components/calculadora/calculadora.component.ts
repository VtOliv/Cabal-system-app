import { Component, signal, inject, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap, forkJoin, of } from 'rxjs';
import { IndexedDBService } from './indexeddb.service';
import { ApiService } from '../../service/api-service';
import { CharacterService } from '../../service/character.service';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora.component.html',
  styleUrls: ['./calculadora.component.css']
})
export class CalculadoraComponent implements OnInit {

  // ── Configuração (dados da API) ───────────────────────────────
  nivelAtual        = signal(1);
  gradeAsa          = signal('—');
  expBase           = signal(0);
  carregandoGrade   = signal(false);
  carregandoNivel   = signal(false);
  erroBuscaNivel    = signal<string | null>(null);
  calculando        = signal(false);
  gradeAlvo         = signal('');

  transicaoGrade = computed(() => {
    const atual = this.gradeAsa();
    const alvo  = this.gradeAlvo();
    if (!alvo) return this.capitalizeFirst(atual);
    if (atual === '\u2014' || atual === alvo) return this.capitalizeFirst(alvo);
    return `${this.capitalizeFirst(atual)} \u2192 ${this.capitalizeFirst(alvo)}`;
  });

  // ── Inputs: Poções de EXP ─────────────────────────────────────
  p100k = signal(0);
  p500k = signal(0);
  p1m   = signal(0);
  p2m   = signal(0);
  p3m   = signal(0);
  p4m   = signal(0);
  p5m   = signal(0);

  // ── Resultados ────────────────────────────────────────────────
  expTotalPocoes  = signal(0);
  totalExp        = signal(0);
  nivel           = signal(0);
  niveisGanhos    = signal(0);
  faltante        = signal(0);
  essenciaArcana  = signal(0);
  asaRaro         = signal(0);
  asaUnico        = signal(0);
  asaEpica        = signal(0);
  asaMestre       = signal(0);

  // Essência Arcana acumulada do nível atual (base para subtração)
  private forceEssenceBase = signal(0);

  // Percentual de EXP dentro do nível alvo em direção ao próximo
  percentualProximoNivel = signal(0);

  private indexedDBService = new IndexedDBService();
  private apiService       = inject(ApiService);
  private characterService = inject(CharacterService);
  private expAcumulada     = signal<number[]>([]);

  // Sincroniza automaticamente quando um personagem é selecionado
  private readonly _syncChar = effect(() => {
    const p = this.characterService.personagemAtivo();
    if (p && p.nivelAsa > 0) this.nivelAtual.set(p.nivelAsa);
  });

  ngOnInit(): void {
    this.carregarExpAcumulada();
    this.carregarGradeAsa();
    const personagem = this.characterService.personagemAtivo();
    if (personagem && personagem.nivelAsa > 0) {
      this.nivelAtual.set(personagem.nivelAsa);
    } else {
      this.carregarNivelAtualDaAPI();
    }
    // Carrega dados iniciais do nível 1
    this.buscarExpDoNivel();
  }

  // ── Tabela de EXP acumulada (nível 1–500) ────────────────────
  private carregarExpAcumulada(): void {
    this.apiService.getAccumulatedExp().subscribe({
      next: (dados) => {
        const expArray: number[] = [0];
        dados.forEach(item => {
          if (item.level && item.acumulatedExp !== undefined) {
            expArray[item.level] = item.acumulatedExp;
          }
        });
        this.expAcumulada.set(expArray);
      },
      error: (err) => console.error('Erro ao carregar EXP acumulada:', err)
    });
  }

  // ── API: Grade da Asa ─────────────────────────────────────────
  // TODO: habilitar quando o endpoint estiver disponível
  private carregarGradeAsa(): void {
    this.carregandoGrade.set(true);
    // this.apiService.getWingGrade().subscribe({
    //   next:  (res)  => { this.gradeAsa.set(res.grade); this.carregandoGrade.set(false); },
    //   error: (err)  => { console.error('Erro ao carregar grade:', err); this.carregandoGrade.set(false); }
    // });
    this.carregandoGrade.set(false); // remover ao habilitar a chamada acima
  }

  // ── API: Nível Atual do Jogador (stub — habilitar quando disponível) ────────
  private carregarNivelAtualDaAPI(): void {
    // this.apiService.getPlayerCurrentLevel().subscribe({
    //   next: (res) => {
    //     this.nivelAtual.set(res.level);
    //     this.buscarExpDoNivel();
    //   },
    //   error: (err) => console.error('Erro ao carregar nível:', err)
    // });
  }

  // ── Busca EXP acumulada do nível via API e seta como marco inicial ──────────
  buscarExpDoNivel(): void {
    const nivel = this.nivelAtual() > 0 ? this.nivelAtual() : 1;
    this.nivelAtual.set(nivel);
    this.erroBuscaNivel.set(null);
    this.carregandoNivel.set(true);

    const atual$  = this.apiService.getAccumulatedExpByLevel(nivel);
    const proximo$ = nivel < 500
      ? this.apiService.getAccumulatedExpByLevel(nivel + 1)
      : of(null);

    forkJoin({ atual: atual$, proximo: proximo$ }).subscribe({
      next: ({ atual, proximo }) => {
        const expAtual = Number(atual.acumulatedExp) || 0;

        // Seta estado base — sem poções aplicadas
        this.expBase.set(expAtual);
        this.totalExp.set(expAtual);
        this.forceEssenceBase.set(Number(atual.accumulatedForceEssence) || 0);
        this.nivel.set(nivel);
        this.niveisGanhos.set(0);
        this.gradeAsa.set(this.capitalizeFirst(atual.grade ?? ''));
        this.gradeAlvo.set('');

        // EXP para próximo nível = acumulado(nivel+1) - acumulado(nivel)
        const expProximo = Number(proximo?.acumulatedExp) || 0;
        this.faltante.set(proximo ? Math.max(0, expProximo - expAtual) : 0);

        // Zera resultados de poções
        this.essenciaArcana.set(0);
        this.asaRaro.set(0);
        this.asaUnico.set(0);
        this.asaEpica.set(0);
        this.asaMestre.set(0);
        this.percentualProximoNivel.set(0);

        this.carregandoNivel.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar EXP do nível:', err);
        this.erroBuscaNivel.set('Não foi possível buscar a EXP para esse nível.');
        this.carregandoNivel.set(false);
      }
    });
  }

  // ── Limpa erro ao editar o campo manualmente ─────────────────
  onNivelAtualChange(): void {
    this.erroBuscaNivel.set(null);
  }

  // ── Cálculo Principal (via API) — só age quando há poções ───────────────────
  calcular(): void {
    const expPocoes =
      this.p100k() * 100_000 +
      this.p500k() * 500_000 +
      this.p1m()   * 1_000_000 +
      this.p2m()   * 2_000_000 +
      this.p3m()   * 3_000_000 +
      this.p4m()   * 4_000_000 +
      this.p5m()   * 5_000_000;

    // Atualiza sempre de forma síncrona, independente de API
    this.expTotalPocoes.set(expPocoes);
    const base           = Number(this.expBase()) || 0;
    const totalExpComBase = base + expPocoes;
    this.totalExp.set(totalExpComBase);

    // Sem poções: restaura estado base (faltante já foi setado por buscarExpDoNivel)
    if (expPocoes === 0) {
      this.nivel.set(this.nivelAtual());
      this.niveisGanhos.set(0);
      this.gradeAlvo.set('');
      this.essenciaArcana.set(0);
      this.asaRaro.set(0);
      this.asaUnico.set(0);
      this.asaEpica.set(0);
      this.asaMestre.set(0);
      return;
    }

    this.calculando.set(true);

    this.apiService.getLevelByAccumulatedExp(totalExpComBase).pipe(
      switchMap((nivelRes) => {
        // nivelRes.level é o PRÓXIMO nível a atingir (teto), não o nível atual
        // Piso = exp acumulada do nível atual real (nivelFinal - 1)
        // Teto = exp acumulada de nivelFinal (limiar a cruzar)
        const pisoAtual$ = nivelRes.level > 1
          ? this.apiService.getAccumulatedExpByLevel(nivelRes.level - 1)
          : of(null);
        const tetoProximo$ = this.apiService.getAccumulatedExpByLevel(nivelRes.level);
        const essenciaAsa$ = this.apiService.getEssenceByRange(this.nivelAtual(), nivelRes.level);
        return forkJoin({ nivelRes: of(nivelRes), pisoAtual: pisoAtual$, tetoProximo: tetoProximo$, essenciaAsa: essenciaAsa$ });
      })
    ).subscribe({
      next: ({ nivelRes, pisoAtual, tetoProximo, essenciaAsa }) => {
        const nivelInicio = this.nivelAtual();
        // Nível alvo real = nivelFinal - 1 (onde o jogador chegará com essa EXP)
        const nivelFinal  = nivelRes.level - 1;

        this.nivel.set(nivelFinal);
        this.niveisGanhos.set(nivelFinal - nivelInicio);
        this.gradeAlvo.set(this.capitalizeFirst(nivelRes.grade ?? ''));

        // Faltante = quanto falta para cruzar o teto (nivelFinal + 1)
        const expTeto = Number(tetoProximo?.acumulatedExp) || 0;
        const expPiso = Number(pisoAtual?.acumulatedExp)   || 0;
        this.faltante.set(Math.max(0, expTeto - totalExpComBase));

        // Progresso dentro do intervalo nivelFinal → nivelFinal+1
        const rangeDoNivel  = expTeto - expPiso;
        const dentroDoNivel = totalExpComBase - expPiso;
        const pct = rangeDoNivel > 0
          ? Math.min(100, Math.max(0, (dentroDoNivel / rangeDoNivel) * 100))
          : 100;
        this.percentualProximoNivel.set(pct);

        const essencia = Math.max(0, (Number(nivelRes.accumulatedForceEssence) || 0) - this.forceEssenceBase());

        this.essenciaArcana.set(essencia);
        this.asaRaro.set(essenciaAsa.essenceByGrade['Rare']   ?? 0);
        this.asaUnico.set(essenciaAsa.essenceByGrade['Unique'] ?? 0);
        this.asaEpica.set(essenciaAsa.essenceByGrade['Epic']   ?? 0);
        this.asaMestre.set(essenciaAsa.essenceByGrade['Master'] ?? 0);
        this.calculando.set(false);

        this.indexedDBService.salvarUltimoCalculo({
          p100k:          this.p100k(),
          p500k:          this.p500k(),
          p1m:            this.p1m(),
          p2m:            this.p2m(),
          p3m:            this.p3m(),
          p4m:            this.p4m(),
          p5m:            this.p5m(),
          totalExp:       this.totalExp(),
          nivel:          this.nivel(),
          faltante:       this.faltante(),
          essenciaArcana: this.essenciaArcana(),
          asaEpica:       this.asaEpica(),
          asaMestre:      this.asaMestre()
        });
      },
      error: (err) => {
        console.error('Erro ao calcular nível:', err);
        this.calculando.set(false);
      }
    });
  }

  capitalizeFirst(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  formatNumber(num: number): string {
    return num.toLocaleString('pt-BR');
  }
}

