import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.scss'],
})
export class LoadingSpinnerComponent {
  loading: boolean;

  constructor(private loaderService: AuthService) {
    this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });
  }
}
