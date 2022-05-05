var _self = null;
var _nothing = false;


console.log('yak.js running')
class yak {
	constructor(){
		if (null !== _self) {
			return _self;
		}

		_self = this;

		this.authentication_in_progress = false;
		this.authenticated_user = null;
		this.textbox = null;
		$( '#loginField' ).hide();


		this.user_list = $( '#user-list' );
		this.user_button = $( '#dropup-button' );
		this.generate_users();
		this.selected_user = this.user_button.html();
		this.register_callbacks();

		this.updateClock();
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
			$( '#passwordField' ).empty();
			$( '#passwordField' ).show();
			$( '#loginField' ).hide();
			$( '#passwordField' ).focus();
		}
		if (type == 'text'){
			_self.textbox = '#loginField';
			$( '#loginField' ).empty();
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
			$( 'body' ).fadeOut( 500, () => {
				lightdm.login(lightdm.authenticated_user, 'awesome');
			});
		}
		else{
			console.log('authentication failed');
		}
	}



	russian_translation( to_be_translated, time_or_month ){
			var dict = {
				1: "один",
				2: "два",
				3: "три",
				4: "четыре",
				5: "пять",
				6: "шесть",
				7: "семь",
				8: "восемь",
				9: "девять",
				10: "десять",
				11: "одинадцать",
				12: "двенадцать",
				13: "тринадцать",
				14: "четырнадцать",
				15: "пятнадцать",
				16: "шестнадцать",
				17: "семнадцать",
				18: "восемнадцать",
				19: "девятнадцать",
				20: "двадцать",
				30: "тридцать",
				40: "сорок",
				50: "пятьдесят",
				0: ""
			};
			var month_dict = {
				1: "Января",
				2: "Февраля",
				3: "Марта",
				4: "Апреля",
				5: "Мая",
				6: "Июня",
				7: "Июля",
				8: "Августа",
				9: "Сентабря",
				10: "Октобря",
				11: "Ноября",
				12: "Декабря",
			};
			if (time_or_month == 'time') {
					const num = parseInt(to_be_translated);
					if (num > 20){
							const num_10 = (num /10) >> 0;
							const num_1 = num - 10*num_10;
							return dict[num_10 * 10] + ' ' + dict[num_1]
					}
					return dict[num];
			}
			if (time_or_month != 'time') {
					return month_dict[parseInt(to_be_translated)];
			}

	}



	updateClock(){
			var curr_time = theme_utils.get_current_localized_time();
			var h = curr_time.slice(0,2);
			var m = curr_time.slice(3,5);
			$( '#hour' ).html( _self.russian_translation( h, 'time') + ' ч.');
			$( '#minutes' ).html ( _self.russian_translation( m , 'time' ) );
			var curr_date = new Date().toISOString();
			var d = curr_date.slice(8,10);
			$( '#day' ).html( parseInt(d).toString()+'.' );
			var mm = curr_date.slice(5,7);
			$( '#month' ).html( _self.russian_translation( mm, 'date' ) );
			var y = curr_date.slice(0,4);
			$( '#year' ).html( y );


			setInterval(  function ()  { 
					var curr_time = theme_utils.get_current_localized_time();
					var h = curr_time.slice(0,2);
					var m = curr_time.slice(3,5);
					//var s = curr_time.slice(6,8);
					$( '#hour' ).html( _self.russian_translation( h, 'time') + ' ч.');
					$( '#minutes' ).html ( _self.russian_translation( m , 'time' ) );
					//$( '#minutes').html( russian_translation( m, 'time'));
					var curr_date = new Date().toISOString();
					var d = curr_date.slice(8,10);
					$( '#day' ).html( parseInt(d).toString()+'.' );
					var mm = curr_date.slice(5,7);
					$( '#month' ).html( _self.russian_translation( mm, 'date' ) );
					var y = curr_date.slice(0,4);
					$( '#year' ).html( y );
			}, 1000);
	}
}





$( window ).on('load', () => {
		new yak();
});
