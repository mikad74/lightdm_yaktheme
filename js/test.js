var _self = null;
var _nothing = false;


console.log('test.js running')
class test {
	constructor(){
		if (null !== _self) {
			return _self;
		}

		_self = this;

		this.authentication_in_progress = false;
		this.authenticated_user = null;
		this.textbox = null;
		$( '#loginField' ).hide();


		console.log("constructor method started");
		this.user_list = $( '#user-list' );
		this.user_button = $( '#dropup-button' );
		console.log(`initial user list : ${ this.user_list }`);
		this.generate_users();
		this.selected_user = this.user_button.html();
		console.log(` constructing : selected_user = ${this.selected_user} ` );
		this.register_callbacks();
		console.log("constructor complete");
		return _self;
	}

	change_user() {
		console.log( `button clicked: ${_self.selected_user}` );
		$('#dropup-button').html( `${_self.selected_user}` );
		_self.start_authentication();
	}

	register_callbacks(){
		$( '.change-user' ).on('click', function() {
			console.log(`button clicked: selected user: ${_self.selected_user}`);
			_self.selected_user = $( this ).text();
			_self.change_user();
		});

		$( document ).keydown( _self.key_press_handler );
		$( '#passwordField' ).on( 'focus', _self.start_authentication )

		// LightDM callbacks
		window.show_prompt = _self.show_prompt;
		window.show_message = _self.show_message;
		window.start_authentication = _self.start_authentication;
		window.cancel_authentication = _self.cancel_authentication;
		window.authentication_complete = _self.authentication_complete;
		window.autologin_timer_expired = _self.cancel_authentication;
	}



	generate_users(){
		console.log("generating user list");
		var end_user = "";
		for (var user of lightdm.users){
			end_user += `<li><a class="change-user" href="#">${user.name}</a></li>`;
			console.log(user.name);
		}
		console.log("iterated through all users");
		_self.user_button.text( `${user.name}`);
		end_user += `<li><a class="change-user" href="#">manual</a></li>`;
		$( end_user ).appendTo( _self.user_list );
		console.log("Generate users complete");
		for (var session of lightdm.sessions) {
			console.log( `${session.name} available` );
		}
	}

	key_press_handler ( event ) {
		let action = null;

		switch( event.which ) {
			case 9:
				action = _self.start_authentication;
				break;
			case 13:
				console.log("<CR> was pressed");
				action = _self.authentication_in_progress ? _self.submit_password:_self.start_authentication;
				break;
			case 27:
				flgrp;
				break;
			case 32:
				action = _self.start_authentication;
				break;
		}
		if ( action instanceof Function) {
			action();
		}
	}

	submit_password( event ) {
		let passwd = $( _self.textbox ).val();

		lightdm.respond( passwd );
		if (_nothing) {console.log(event);}
	}

	show_prompt(text, type) {
		console.log( `show prompt: type: ${type}, text: ${text}` );
		if (type == 'password'){
			_self.textbox = '#passwordField';
			$( '#passwordField' ).show();
			$( '#loginField' ).hide();
			$( '#passwordField' ).focus();
		}
		if (type == 'text'){
			_self.textbox = '#loginField';
			$( '#passwordField' ).hide();
			$( '#loginField' ).show();
			console.log( 'getting login' );
			$( '#loginField' ).focus();
		}
	}

	show_message(text, type){
		console.log( `show prompt: type: ${type}, text: ${text}` );
	}

	start_authentication() {
		// authenticate selected user
		if ( false == _self.authentication_in_progress ) {
			_self.authentication_in_progress = true;
			_self.authentication_user = _self.selected_user;
			console.log( `starting to authenticate ${_self.selected_user}` );
			if (_self.selected_user == 'manual') {
				lightdm.authenticate();
			}
			else {
				lightdm.authenticate( _self.selected_user );
			}
		}
		
		else if ( _self.authentication_user !== _self.selected_user ) { 
			_self.cancel_authentication();
			_self.start_authentication();
		}
	}

	cancel_authentication( event ) {
		//cancel authentication
		_self.authentication_in_progress = false;
		lightdm.cancel_authentication();
		console.log( `authentication canceled for ${_self.authentication_user}` );
		if (_nothing) {console.log(event);}
	}

	authentication_complete() {
		if (lightdm.is_authenticated) {
			console.log('authentication_complete');
			lightdm.login(lightdm.authenticated_user, 'awesome');
		}
		else{
			console.log('authentication failed');
		}
	}
}

$( window ).on('load', () => {
	new test();
});
