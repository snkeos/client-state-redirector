
var reqJS = document.getElementById('req-js');
reqJS.hidden = true;

function die(message) {
	var e = document.getElementById('error');
	e.innerText = message;
	e.hidden = false;
	throw new Error(message);
}

try {
	var url = new URL(window.location.href);
	var cognitoUrl = url.searchParams.get('cognito_url');
	var storage = window.localStorage;

	if(cognitoUrl) {
		var SAVE_PARAMS = ['post_logout_redirect_uri', 'state'];

		// phase 1: Keycloak -> this page -> Cognito

		SAVE_PARAMS.forEach(function (paramName) {
			var paramValue = url.searchParams.get(paramName);
			if(!paramValue) {
				die(paramName + ' parameter is missing');
			}
			storage.setItem(paramName, paramValue);
		});

		cognitoUrl = new URL(cognitoUrl);
		// Restrict to http and https protocols (avoid javascript:)
		if(!['http:', 'https:'].includes(cognitoUrl.protocol)) {
			die('cognito_url is not a valid url');
		}
		cognitoUrl.searchParams.set('logout_uri', window.location.href.split('?')[0]);

		// For local testing:
		// cognitoUrl.searchParams.set('logout_uri', 'https://127.0.0.1:8000/index.html');

		window.location = cognitoUrl.toString();

	} else {
		// phase 2: Cognito -> this page -> Keycloak

		var postLogoutRedirectUri = storage.getItem('post_logout_redirect_uri');
		storage.removeItem('post_logout_redirect_uri');
		if(!postLogoutRedirectUri) {
			die('post_logout_redirect_uri was not found in local storage');
		}

		var state = storage.getItem('state');
		storage.removeItem('state');
		if(!state) {
			die('state was not found in local storage');
		}

		var dst = new URL(postLogoutRedirectUri);
		// Restrict to http and https protocols (avoid javascript:)
		if(!['http:', 'https:'].includes(dst.protocol)) {
			die('post_logout_redirect_uri is not a valid url');
		}
		dst.searchParams.set('state', state);

		window.location = dst.toString();
	}
} catch(err) {
	die(err.message);
}