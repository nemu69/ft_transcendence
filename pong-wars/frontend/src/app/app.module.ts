import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule, MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar'; 
import { MatIconModule } from '@angular/material/icon';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { JwtHelperService, JWT_OPTIONS } from "@auth0/angular-jwt";
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SettingComponent } from './components/setting/setting.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RegisterComponent } from './components/register/register.component';
import { LogoutComponent } from './components/logout/logout.component';
import { MatchComponent } from './components/match/match.component';
import { StatsComponent } from './components/stats/stats.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FriendComponent } from './components/friend/friend.component';


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
	HttpClientModule,
	FormsModule,
	ReactiveFormsModule,

    MatIconModule,
	MatFormFieldModule,
	MatToolbarModule,
	MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatProgressBarModule,

    RouterModule.forRoot(routes),
  ],
  exports: [ RouterModule ],
  providers: [
	JwtHelperService, 
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


