import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { MaterialModule } from './material/material.module';
import { ErrorPageComponent } from './error-page/error-page.component';
import { LoginComponent } from './login/login.component';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { SidenavModule } from './sidenav/sidenav.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from './core.module';
import { AlertPopupComponent } from './shared/alert-popup/alert-popup.component';
import { MyteamDialogboxComponent } from './shared/myteam-dialogbox/myteam-dialogbox.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    ErrorPageComponent,
    LoginComponent,
  ],
  entryComponents: [AlertPopupComponent, MyteamDialogboxComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    SidenavModule,
    CoreModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
