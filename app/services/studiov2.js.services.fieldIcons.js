(function(){
  angular
    .module('studio-v2')  
    .service('fieldIconsService', fieldIconsService);

  fieldIconsService.$inject = []; 

  function fieldIconsService(){
    function setIconForTypeField(field) {
      var icon = '';

      switch(field.type.toLowerCase()) {
        case 'char':
          icon = 'list-ul';
          break;

        case 'date':
        case 'datetime':
          icon = 'calendar-plus-o'; 
          break;

        case 'string':
          icon = 'font'; 
          break;

        case 'integer':
        case 'long':
          icon = 'hashtag';
          break;

        case 'binary':
          icon = 'file-o';
          break;

        case 'numeric':
          icon = 'numeric';
          break;
      }
      
      return icon;     
    }

    return {
      setIconForTypeField: setIconForTypeField    
    }
  }
})();