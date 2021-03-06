window.app = (function(){
  
  return {
    MIN_HEIGHT: 186, // min image height - 186px
    MIN_WIDTH: 186, // min image width - 186px
    MAX_SIZE: 5 * 1024 * 1024 // 5mb
  }

})();

var app = app || {};

(function (app) {

  app.avatarEdit = new Ractive({
    el: '#avatarEdit',
    template: '#avatar-edit-template',
    data: {
      loading: false,
      errors: {},
      computerImageFiles: [],
      imageData: null,
      internetImageUrl: null,
    },

    computed: {
      isValid: function(){
        return !this.get('errors.height') && !this.get('errors.width') && !this.get('errors.size');
      },
    },

    validate: function(size, height, width){
      console.log(size, height, width);
      if (height < app.MIN_HEIGHT ) {
        this.set('errors.height', 'Image height should be more then ' + app.MIN_HEIGHT + 'px');
      } else {
        this.set('errors.height', null);
      };
      if (width < app.MIN_WIDTH ) {
        this.set('errors.width', 'Image width should be more then ' + app.MIN_WIDTH + 'px');
      } else {
        this.set('errors.width', null);
      };
      if (size > app.MIN_SIZE) {
        this.set('errors.size', 'Image size should be less then ' + app.MIN_SIZE + 'bytes');
      } else {
        this.set('errors.size', null);
      };
    },

    /*
     Генерируем Base64 данные картинки из урла 
     и навешиваем кроппер.
    */
    getImageDataFromUrl: function(url) {
      var img = new Image(),
          canvas = document.createElement("canvas"),
          dataURL;

      app.avatarEdit.set('loading', true);
      img.crossOrigin = 'Anonymous';
      img.src = url;

      img.onload = function (e) {
        canvas.width = img.width;
        canvas.height = img.height;

        canvas.getContext('2d').drawImage(this, 0, 0);
        dataURL = canvas.toDataURL('image/png');

        app.avatarEdit.validate(dataURL.length, img.height, img.width);
        app.avatarEdit.set('imageData', dataURL);
        app.avatarEdit.set('loading', false);
        app.avatarEdit.createCropper();
        canvas = null;
        img = null;
      };
    },

    /*
     Генерируем Base64 данные картинки из файла 
    */
    getImageDataFromFile: function(file) {
      var reader = new FileReader();
      reader.onloadend = function(e) {
        app.avatarEdit.getImageDataFromUrl(reader.result);
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
        this.getImageDataFromFile(files[0]);
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

      // Save to server
      $.post('/save_avatar/', {data: dataURL}).done(function(res){

      });
      $('#avatarModal').modal('hide');
    },
  });

})(app);
