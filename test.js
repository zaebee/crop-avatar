window.app = (function(){
  
  return {}

})();

var app = app || {};

(function (app) {

  app.avatarEdit = new Ractive({
    el: '#avatarEdit',
    template: '#avatar-edit-template',
    data: {
      computerImageFiles: [],
      imageData: null,
      internetImageUrl: null,
    },

    /*
     Генерируем Base64 данные картинки из урла 
     и навешиваем кроппер.
    */
    getImageDataFromUrl: function(url) {
      var img = new Image(),
          canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d"),
          dataURL;
      img.crossOrigin = 'Anonymous';
      img.onload = function (e) {
        console.log(e);
        canvas.width = this.width;
        canvas.height = this.height;
        // TODO сделать валидацию

        ctx.drawImage(this, 0, 0);
        window.ctx = canvas;
        dataURL = canvas.toDataURL('image/png');
        app.avatarEdit.set('imageData', dataURL);
        app.avatarEdit.createCropper();
      };
      img.src = url;
    },

    /*
     Генерируем Base64 данные картинки из файла 
     и навешиваем кроппер.
    */
    getImageDataFromFile: function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        // TODO сделать валидацию

        app.avatarEdit.set('imageData', reader.result);
        app.avatarEdit.createCropper();
      };
      reader.readAsDataURL(file);
    },

    /*
     Создаем кроппер изображения.
    */
    createCropper: function() {
      var avatar = $('img.cropAvatar')[0];
      if (avatar) {
        this.cropper = new Cropper(avatar, {
          zoomable: false,
          preview: '.img-preview',
          aspectRatio: '1/1',
        });
      };
    },
  });

  app.avatarEdit.on({
    /*
     Событие для создания изображения из загруженного файла.
    */
    uploadFromComputer: function(event) {
      event.original.preventDefault();
      var files = this.get('computerImageFiles');
      this.reset();

      if (files.length > 0) {
        // get first image file
        var file = files.item(0);
        this.getImageDataFromFile(file);
      }
    },

    /*
     Событие для создания изображения по ссылке.
    */
    uploadFromInternet: function(event) {
      event.original.preventDefault();
      var url = this.get('internetImageUrl');
      this.reset();
      this.getImageDataFromUrl(url);
    },

    /*
     Событие для сохранения кропнутого аватара на сервере
    */
    saveAvatar: function(event) {
      event.original.preventDefault();
      var canvas = this.cropper.getCroppedCanvas(),
          dataURL = canvas.toDataURL("image/png");
      $('#mainAvatar').attr('src', dataURL);
      $.post('/save_avatar/', {data: dataURL}).done(function(res){
        console.log(res);
      });
      $('#avatarModal').modal('hide');
    },
  });

})(app);
