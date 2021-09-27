import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CreateRoomComponent } from './components/create-room/create-room.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { PrivateRoutingModule } from './private-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SelectUsersComponent } from './components/select-users/select-users.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component'
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { SettingComponent } from '../private/components/setting/setting.component';
import { LogoutComponent } from '../private/components/logout/logout.component';
import { MatchComponent } from '../private/components/match/match.component';
import { ProfileComponent } from '../private/components/profile/profile.component';
import { FriendComponent } from '../private/components/friend/friend.component';
import { TwoFactorComponent } from './components/two-factor/two-factor.component';
import { MatStepperModule } from '@angular/material/stepper';
import { TwoFactorDisabledComponent } from './components/two-factor-disabled/two-factor-disabled.component';
import { ProfileusersComponent } from './components/profile-users/profile-users.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CreateRoomComponent,
    SelectUsersComponent,
    ChatRoomComponent,
    ChatMessageComponent,
	PageNotFoundComponent,
	SettingComponent,
	LogoutComponent,
	MatchComponent,
	ProfileComponent,
	ProfileusersComponent,
	FriendComponent,
	TwoFactorComponent,
	TwoFactorDisabledComponent
  ],
  imports: [
    CommonModule,
    PrivateRoutingModule,
    MatListModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
	FormsModule,
	MatSlideToggleModule,
	MatStepperModule
  ]
})
export class PrivateModule { }
