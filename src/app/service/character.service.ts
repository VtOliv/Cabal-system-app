import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Character } from '../models/types';

@Injectable({ providedIn: 'root' })
export class CharacterService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8097/api/character';

  // ── Estado global ──────────────────────────────────────────────────────────
  readonly personagens = signal<Character[]>([]);
  readonly personagemAtivo = signal<Character | null>(null);

  // ── Atalhos computados para uso nos componentes ────────────────────────────
  readonly meritoDourado  = computed(() => this.personagemAtivo()?.meritoDourado  ?? 0);
  readonly meritoPlatina  = computed(() => this.personagemAtivo()?.meritoPlatina  ?? null);
  readonly meritoDiamante = computed(() => this.personagemAtivo()?.meritoDiamante ?? null);
  readonly nivelAsa       = computed(() => this.personagemAtivo()?.nivelAsa       ?? 0);

  // ── API calls ──────────────────────────────────────────────────────────────
  // GET /api/character
  listar(): Observable<Character[]> {
    return this.http.get<Character[]>(this.API_URL).pipe(
      tap(lista => this.personagens.set(lista))
    );
  }

  // GET /api/character/{nome}
  buscarPorNome(nome: string): Observable<Character> {
    return this.http.get<Character>(`${this.API_URL}/${encodeURIComponent(nome)}`);
  }

  // POST /api/character
  criar(dados: Omit<Character, 'id'>): Observable<Character> {
    return this.http.post<Character>(this.API_URL, dados).pipe(
      tap(novo => this.personagens.update(lista => [...lista, novo]))
    );
  }

  // PUT /api/character/{id}
  atualizar(id: string, dados: Omit<Character, 'id'>): Observable<Character> {
    return this.http.put<Character>(`${this.API_URL}/${id}`, dados).pipe(
      tap(atualizado => {
        this.personagens.update(lista =>
          lista.map(p => (p.id === id ? atualizado : p))
        );
        if (this.personagemAtivo()?.id === id) {
          this.personagemAtivo.set(atualizado);
        }
      })
    );
  }

  // DELETE /api/character/{id}
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.personagens.update(lista => lista.filter(p => p.id !== id));
        if (this.personagemAtivo()?.id === id) {
          this.personagemAtivo.set(null);
        }
      })
    );
  }

  selecionar(personagem: Character | null): void {
    this.personagemAtivo.set(personagem);
  }
}
