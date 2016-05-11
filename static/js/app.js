window.app = (function(){

  return {
  }

})();

$(document).ready(function() {

  $.ajaxSetup({
    beforeSend: function (xhr) {
      xhr.setRequestHeader('X-CSRFToken', $.cookie('csrftoken'));
    }
  });

});
