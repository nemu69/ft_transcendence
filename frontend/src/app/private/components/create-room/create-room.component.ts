import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { UserI } from 'src/app/model/user/user.interface';
import { ChatService } from '../../services/chat-service/chat.service';

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.scss']
})
export class CreateRoomComponent {

	radio: boolean = true;
	form: FormGroup = new FormGroup({
	  name: new FormControl(null, [Validators.required]),
	  description: new FormControl(null),
	  password: new FormControl({value: 'Password', disabled: true}),
	  users: new FormArray([], [Validators.required]),
	  admin: new FormArray([]),
	  muted: new FormArray([])
	});

  constructor(private chatService: ChatService,
	private router: Router,
	private activatedRoute: ActivatedRoute,
	) { }

  create() {
    if (this.form.valid) {
      try {
        this.chatService.createRoom(this.form.getRawValue());
        this.router.navigate(['../dashboard'], { relativeTo: this.activatedRoute });
      } catch (error) {
        
      }
    }
  }

  initUser(user: UserI) {
    return new FormControl({
      id: user.id,
      username: user.username,
      email: user.email
    });
  }

  addUser(userFormControl: FormControl) {
    this.users.push(userFormControl);
  }

  removeUser(userId: number) {
    this.users.removeAt(this.users.value.findIndex((user: UserI) => user.id === userId));
  }

  get name(): FormControl {
    return this.form.get('name') as FormControl;
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get users(): FormArray {
    return this.form.get('users') as FormArray;
  }

  radioChange($event: MatRadioChange) {
    console.log($event.source.name, $event.value);

    if ($event.value == 'no') {
        this.form.get('password').disable();
    }
	else {
		this.form.get('password').enable();
	}
}

}
