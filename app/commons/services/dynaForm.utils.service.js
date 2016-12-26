(function() {
  angular
    .module('dynaform')
    .service('dynaformUtilsService', dynaformUtilsService);

  dynaformUtilsService.$inject = ['$filter', '$q', 'uibDateParser'];

  function dynaformUtilsService($filter, $q, uibDateParser) {

    var self = this,
        formId = $q.defer(); 

    function translateDataFormat(date) {
      return moment(date).format('DDMMYYYY');
    } 

    function translateDateModelToWrite(date, type) {
      var formatToView; 

      if (type === 'date') {
        formatToView = $filter('translate')("fieldformat.date.description");
      }

      return moment(date, formatToView).format('YYYY-MM-DD');
    }

    function translateMoneyModelToView(model) {
      return  $filter('currency')(model); 
    }

    function translateMoneyModelToWrite(model) {
      return parseFloat(model
                          .replace(/\w\$/g, '') 
                          .replace('.', '')
                          .replace(',', '.')
                          );
    }

    function dataTransformationToView(data, meta) {
      if (angular.isArray(data)) {
        _.forEach(data, function(item, index) {
          translateDataToView(item, meta);
        });
      }else{
        translateDataToView(data, meta);
      } 
    }

    //Para lista o dado que tenha um format pattern, utilizamos o filtro para mascarar
    //No caso dos inputs, utilizamos a máscara no input
    function translateDataToView(data, type, formatPattern) {
      var parsed;
      if (!formatPattern) {return data;}

      switch(type) {
         case 'string':
            parsed = $filter('mask')(data, formatPattern);
          break;
        case 'date':
            parsed = translateDataFormat(data);
          break;
        default:
          parsed = data;
      } 

      return parsed;
    }

    function dataTransformationToEdit(data, meta){
      _.forEach(data, function(value, key) {
        var boundProperty = _.find(meta, {bind: key});

        if(boundProperty && boundProperty.formatPattern) {
          if (boundProperty.type === 'date') {
            data[key] = translateDataFormat(data[key]);
          }
        }
      });

      return data;
    }

    function normalizeDataToSave(data, meta) {
      var item = angular.copy(data);

      _.forEach(item, function(value, key) {
        var metaField = _.find(meta, {bind: key});

        if (metaField && metaField.type === 'date') {
          item[key] =  translateDateModelToWrite(item[key], metaField.type);
        }
      });

      return item;
    }

    function getTranslate(label) {
      return $filter('translate')(label);
    }

    return{
      dataTransformationToEdit: dataTransformationToEdit,
      dataTransformationToView: dataTransformationToView,
      translateDataToView: translateDataToView,
      normalizeDataToSave: normalizeDataToSave,
      translateDateModelToWrite: translateDateModelToWrite,
      getTranslate: getTranslate
    }
  }
})();
