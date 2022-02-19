import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { AlertPopupComponent } from './alert-popup/alert-popup.component';
import { MaterialModule } from '../material/material.module';
import { MyteamDialogboxComponent } from './myteam-dialogbox/myteam-dialogbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipe } from '../pipes/filter.pipe';
import { PopupComponent } from './popup/popup.component';
import { DeclareleaveDialogboxComponent } from './declareleave-dialogbox/declareleave-dialogbox.component';
import { NgxDatatableComponent } from './ngx-datatable/ngx-datatable.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SortAlphabetPipe } from '../pipes/sort-alphabet.pipe';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    AlertPopupComponent,
    MyteamDialogboxComponent,
    FilterPipe,
    SortAlphabetPipe,
    PopupComponent,
    DeclareleaveDialogboxComponent,
    NgxDatatableComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDatatableModule,
  ],
  exports: [
    LoadingSpinnerComponent,
    AlertPopupComponent,
    FilterPipe,
    SortAlphabetPipe,
    NgxDatatableComponent,
  ],
})
export class SharedModule {}
