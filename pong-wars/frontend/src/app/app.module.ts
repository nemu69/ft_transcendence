import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SettingComponent } from './setting/setting.component';
import { NavbarComponent } from './navbar/navbar.component';
import { RegisterComponent } from './register/register.component';
import { LogoutComponent } from './logout/logout.component';
import { MatchComponent } from './match/match.component';
import { StatsComponent } from './stats/stats.component';
import { ProfileComponent } from './profile/profile.component';
import { FriendComponent } from './friend/friend.component';

const routes: Routes = [

	{path: 'login', component: LoginComponent},
	{path: 'register', component: RegisterComponent},
	{path: 'setting', component: SettingComponent},
	{path: 'logout', component: LogoutComponent},
	{path: 'match', component: MatchComponent},
	{path: 'profile', component: ProfileComponent},
	{path: 'stats', component: StatsComponent},
	{path: 'friend', component: FriendComponent},
	{path: '', redirectTo: '/login', pathMatch: 'full'},
	{path: '**', component: PageNotFoundComponent}

  ]

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    SettingComponent,
    NavbarComponent,
    RegisterComponent,
    LogoutComponent,
    MatchComponent,
    StatsComponent,
    ProfileComponent,
    FriendComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
  ],
  exports: [ RouterModule ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


