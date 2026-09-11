import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type ContentStateKind = 'loading' | 'error' | 'empty';

@Component({
  selector: 'app-content-state',
  imports: [MatIconModule, MatProgressSpinnerModule],
  templateUrl: './content-state.html',
  styleUrl: './content-state.scss',
})
export class ContentState {
  readonly kind = input.required<ContentStateKind>();
  readonly title = input<string>();
  readonly message = input<string>();
  readonly icon = input<string>();

  protected readonly displayTitle = computed(
    () =>
      this.title() ??
      {
        loading: 'Loading',
        error: 'Something went wrong',
        empty: 'Nothing to show',
      }[this.kind()],
  );

  protected readonly displayIcon = computed(
    () =>
      this.icon() ??
      {
        loading: '',
        error: 'error_outline',
        empty: 'inbox',
      }[this.kind()],
  );
}
