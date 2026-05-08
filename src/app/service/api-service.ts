import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Collection, ActiveBonus } from '../models/types';
import { environment } from '../../environments/environment';

export interface Faixa { de: number; ate: number; pg: number; }

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api`;
  private readonly USER_ID = 'user-logado'; // No futuro, pegue de um Auth Service

  getCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${this.API_URL}/collections`);
  }

  updateItemValue(collectionId: string, itemName: string, owned: number): Observable<Collection> {
    const params = new HttpParams()
      .set('owned', owned.toString())
      .set('userId', this.USER_ID);
    
    return this.http.patch<Collection>(
      `${this.API_URL}/collections/${collectionId}/items/${itemName}`, 
      {}, 
      { params }
    );
  }

  resetCollection(collectionId: string): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/collections/${collectionId}/reset`, {});
  }

  getStockBalance(stockKey: string): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/stocks/${this.USER_ID}/balance/${stockKey}`);
  }

  updateStockLevel(stockKey: string, quantity: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/stocks/${this.USER_ID}/${stockKey}`, quantity);
  }

  getMeritFaixas(merito: 'Dourado' | 'Platina'): Observable<Faixa[]> {
    return this.http
      .get<{ de: number; ate: number; pontosGanhos: number }[]>(`${this.API_URL}/merit/${merito}`)
      .pipe(map(items => items.map(i => ({ de: i.de, ate: i.ate, pg: i.pontosGanhos }))));
  }

  getBonuses(): Observable<ActiveBonus[]> {
    return this.http.get<ActiveBonus[]>(`${this.API_URL}/stats/${this.USER_ID}/bonuses`);
  }

  getAccumulatedExp(): Observable<{ level: number; acumulatedExp: number }[]> {
    return this.http.get<{ level: number; acumulatedExp: number }[]>(`${environment.apiUrl}/wing/accumulated-exp`);
  }

  getAccumulatedExpByLevel(level: number): Observable<{ level: number; acumulatedExp: number; grade?: string; accumulatedForceEssence?: number }> {
    return this.http.get<{ level: number; acumulatedExp: number; grade?: string; accumulatedForceEssence?: number }>(`${environment.apiUrl}/wing/accumulated-exp/${level}`);
  }

  getLevelByAccumulatedExp(acumulatedExp: number): Observable<{ level: number; acumulatedExp: number; grade: string; accumulatedForceEssence?: number }> {
    return this.http.get<{ level: number; acumulatedExp: number; grade: string; accumulatedForceEssence?: number }>(`${environment.apiUrl}/wing/level-by-accumulated-exp/${acumulatedExp}`);
  }

  getEssenceByRange(fromLevel: number, toLevel: number): Observable<{
    fromLevel: number;
    toLevel: number;
    essenceByGrade: { [grade: string]: number };
    totalEssence: number;
  }> {
    return this.http.get<{
      fromLevel: number;
      toLevel: number;
      essenceByGrade: { [grade: string]: number };
      totalEssence: number;
    }>(`${environment.apiUrl}/wing/essence-by-range/${fromLevel}/${toLevel}`);
  }

  // ── Wing grade (ex.: "Raro", "Único", "Épico", "Mestre") ───────────────────
  // TODO: ajustar endpoint quando disponível
  getWingGrade(): Observable<{ grade: string }> {
    return this.http.get<{ grade: string }>(`${environment.apiUrl}/wing/grade`);
  }

  // ── Nível atual do jogador ──────────────────────────────────────────────────
  // TODO: ajustar endpoint quando disponível
  getPlayerCurrentLevel(): Observable<{ level: number }> {
    return this.http.get<{ level: number }>(`${environment.apiUrl}/wing/current-level`);
  }
}