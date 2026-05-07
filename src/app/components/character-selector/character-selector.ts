import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { CharacterService } from '../../service/character.service';
import { Character } from '../../models/types';

@Component({
  selector: 'app-character-selector',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './character-selector.html',
})
export class CharacterSelector implements OnInit {
  readonly characterService = inject(CharacterService);

  modalAberto = signal(false);
  modoEdicao  = signal<Character | null>(null);

  // Formulário de novo / editar personagem
  form: Omit<Character, 'id'> = {
    nome: '',
    classe: '',
    meritoDourado: 0,
    meritoPlatina: null,
    meritoDiamante: null,
    nivelAsa: 0,
  };

  ngOnInit(): void {
    this.characterService.listar().subscribe();
  }

  abrirModal(personagem?: Character): void {
    if (personagem) {
      this.modoEdicao.set(personagem);
      this.form = { ...personagem };
    } else {
      this.modoEdicao.set(null);
      this.form = { nome: '', classe: '', meritoDourado: 0, meritoPlatina: null, meritoDiamante: null, nivelAsa: 0 };
    }
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
  }

  salvar(): void {
    if (!this.form.nome.trim()) return;
    const edicao = this.modoEdicao();
    if (edicao) {
      this.characterService.atualizar(edicao.id, this.form).subscribe(() => this.fecharModal());
    } else {
      this.characterService.criar(this.form).subscribe(() => this.fecharModal());
    }
  }

  excluir(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.characterService.excluir(id).subscribe();
  }

  selecionar(personagem: Character): void {
    const ativo = this.characterService.personagemAtivo();
    this.characterService.selecionar(ativo?.id === personagem.id ? null : personagem);
  }
}
