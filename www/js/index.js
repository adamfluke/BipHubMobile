var post = function(action, data){
  return new Promise(function(resolve, reject){

    console.log("About to make a post call - ");
    console.log(action);
    console.log(data);

    var request = $.post(action, data);

    request.done(function(serverData){
      resolve(serverData)
    });

    request.fail(function(serverData){
      reject(serverData)
    });
  });
}

var get = function(action, data){
  return new Promise(function(resolve, reject){

    console.log("About to make a get call - ");
    console.log(action);
    console.log(data);

    var request = $.get(action, data);

    request.done(function(serverData){
      resolve(serverData)
    });

    request.fail(function(serverData){
      reject(serverData)
    });
  });
}

var view = {
  goTo: function(contentId){
    $(":mobile-pagecontainer").pagecontainer("change", contentId);
  },
  errorMessage: function(errorTarget, message){
    $(errorTarget).text("There was an error signing in. " + message);
  },
  loginUser: function(){
    this.updatePersonalInfo();
    this.goTo('#cardsPage');
  },
  logoutUser: function(){
    this.goTo('#loginPage');
  },
  updatePersonalInfo: function(){
    var name = localStorage.getItem("u_first_name");
    name += " " + localStorage.getItem("u_last_name");
    $(".uName").text(name);
    $(".uSchoolName").text(localStorage.getItem('u_school_name'));
  },
  showObservation: function(observations){
    form = this.makeObservationForm(observations);
    $("#recordsPrompt").html(form);
  },
  makeObservationForm: function(observations){
    var observation = observations[0];
    var record_inputs = this.makeRecordInputs(observation[1]);
    var intro = '<h3>Observation for</h3><h4>Student: ' + observation[0]["student_id"] + '</h4>'
    var form = '<form id="observationRecordsForm">' + record_inputs + '<input name="submit" type="submit" value="submit"/></form>';
    return intro + form
  },
  makeRecordInputs: function(records){
    console.log("Made it to makeRecordInputs");
    var inputs = ""
    $.each(records, function(index, record){
      input = '<label for="record_' + record["id"] + '">' + record["prompt"] + '</label>'
      input += '<input name="' + record["id"] + '" type="text" placeholder="10" />';
      inputs += input;
    });
    console.log(inputs);
    return inputs;
  }
}

var app = {
  initialize: function() {
    this.bindEvents();
  },
  bindEvents: function() {
    $("#loginForm").submit(this.submitLoginForm);
    $("#logoutLink").click(this.handleLogOut);
  },
  handleLogOut: function(){
    localStorage.removeItem("uid");
    localStorage.removeItem("utoken");
    view.logoutUser();
  },
  getObservations: function(user_id, authenticity_token){
    var data = "user_id=" + user_id + "&authenticity_token=" + authenticity_token;

    get('http://localhost:3000/api/v1/observations?' + data)
      .then(function(serverData){
        localStorage.setItem("observations", serverData);
        view.showObservation(serverData);
      })
      .catch(function(serverData){
        console.log('error');
        console.log(serverData.responseText)
      });
  },
  submitLoginForm: function(){
    var data = $("#loginForm").serialize();
    post('http://localhost:3000/api/v1/login', data)
      .then(function(serverData){
        console.log(serverData)
        localStorage.setItem("uid", serverData.id);
        localStorage.setItem("utoken", serverData.token);
        localStorage.setItem("u_first_name", serverData.first_name);
        localStorage.setItem("u_last_name", serverData.last_name);
        localStorage.setItem("u_school_name", serverData.school_name);

        app.getObservations(serverData.id, serverData.token);
        view.loginUser();
      })
      .catch(function(serverData){
        view.errorMessage('#loginError', serverData.responseText);
      });

    return false;
  }
};