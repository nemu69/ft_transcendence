import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SettingComponent } from './setting/setting.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    SettingComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot([
		{path: 'login', component: LoginComponent},
		{path: 'setting', component: SettingComponent},
		{path: '**', component: PageNotFoundComponent}
	  ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
