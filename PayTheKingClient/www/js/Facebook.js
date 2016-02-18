/// <reference path="Settings.js" />
/// <reference path="openfb.js" />
Facebook = {
    appId: "158327870889130",
    Version: "0.0.0.0"
};

Facebook.logoutFacebook = function () {
    openFB.init({ appId: '158327870889130', tokenStore: window.localStorage });
    openFB.logout();

    //save name and email
    var settings = new Settings();
    settings.settings["avatar"] = "images/Avatars/default-avatar.png";
    //settings.settings["facebookid"] = null;
    settings.settings["facebooktoken"] = null;
    settings.save();
/////populatePage();
}
Facebook.loginFacebook = function(callback) {
    openFB.init({ appId: '158327870889130', tokenStore: window.localStorage });
    openFB.login(
              function (response) {
                  if (response.status === 'connected') {
                      // alert('Facebook login succeeded, got access token: ' + response.authResponse.accessToken);
                      var settings = new Settings();
                      settings.settings["facebooktoken"] = response.authResponse.accessToken;
                      settings.save();
                      Facebook.getInfo(response.authResponse.accessToken,callback);
                  } else {
                      alert('Facebook login failed: ' + response.error);
                  }
              }, { scope: 'email' });
}



Facebook.getInfo = function (accessToken, callback) {
    if (accessToken)
        openFB.init({ appId: '158327870889130', accessToken: accessToken });
    else
        openFB.init({
            appId: '158327870889130', tokenStore: window.localStorage
    });
    openFB.api({
        path: '/me',
        success: function (data) {
            console.log(JSON.stringify(data));

            //save name and email
            var settings = new Settings();
            settings.settings["name"] = data.first_name;
            settings.settings["email"] = data.email;
            settings.settings["avatar"] = "https://graph.facebook.com/" + data.id + "/picture?type=normal";;
            settings.settings["facebookid"] = data.id;
            settings.save();

            if (callback) {
                callback(data);
            }

        },
        error: function errorHandler(error) {
            // alert(error.message);

            //todo: should relogin, but i dont what to keep trying to log in if the error is never resolved
            //todo: for now, just let it fail silently
            //for now clear log in to facebook so they can hit re login.
            Facebook.logoutFacebook();
        }
    });
}
Facebook.ping = function (facebooktoken, callback) {
    var settings = new Settings();
    if (typeof openFB != 'undefined' && facebooktoken) {
        console.log("Pinging facebook ...");
        openFB.init({ appId: '158327870889130', tokenStore: window.localStorage });
        openFB.api({
            path: '/me',
            success: function (data) {
                console.log("Facebook pinged:");
                console.log(JSON.stringify(data));

                if (callback)  callback(data);
            },
            error: function errorHandler(error) { console.log("Facebookping failed: " + error.message); }
        });
    } else {
        console.log("Error: openFB script failed. openFB is not included or not logged in");
    }
}
Facebook.openCommunityPage = function () {
    alert('Facebook.openCommunityPage ');
   // window.open('fb://profile/847181962036765', '_system');
    window.open('https://www.facebook.com/847181962036765', '_system');
};