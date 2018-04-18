angular
  .module('studio-v2')
  .service('FieldValidationDataSource', FieldValidationDataSource)

function FieldValidationDataSource(){
  this.validate = validate;

  function validate(field, config) {
    if(config){
      validateConfig(field, config);
    }else{
      validateConfigAll(field, config);
    }
  }

  function validateConfig(field, config){
    switch(config){
      case 'datasource_type':
        validateDataSourceType(field, config);
      break;

      case 'datasource_finder_entityName':
      case 'datasource_finder_key':
      case 'datasource_finder_fieldIndex':
        validateDataSourceFinder(field, config);
      break;

      case 'datasource_service_key':
      case 'datasource_service_sourceKey':
      case 'datasource_service_method':
        validateDataSourceService(field, config);
      break;
    }
  }

  function validateConfigAll(field){
    validateDataSourceType(field);

    if(field.dataSourceType == 'E'){
      validateDataSourceFinder(field);

    }else if(field.dataSourceType == 'FS' || field.dataSourceType == 'S'){
      validateDataSourceService(field);
    }
  }

  function validateDataSourceType(field){
    if(!field.dataSourceType){
      field.error.datasource_type = true;
    }else{
      field.error.datasource_type = false;
    }
  }

  function validateDataSourceFinder(field, config){
    if(config){
      return validateConfig();

    }else{
      return validateAll();
    }

    function validateConfig(){
      var bind = config.split('_').pop();

      if(_.get(field.finder, bind)){
        field.error[config] = false;
      }
    }

    function validateAll(){
      if(!_.get(field.finder, 'entityName')){
        field.error.datasource_finder_entityName = true;
      }

      if(!_.get(field.finder, 'key')){
        field.error.datasource_finder_key = true;
      }

      if(field.meta.type == 'select'){
        if(!_.get(field.finder, 'fieldIndex')){
          field.error.datasource_finder_fieldIndex = true;
        }
      }
    }
  }

  function validateDataSourceService(field, config){
    if(config){
      return validateConfig();
    }else{
      return validateAll();
    }

    function validateConfig(){
      var bind = config.split('_').pop();

      if(_.get(field.serviceSource, bind) || _.get(field.finder, bind)){
        field.error[config] = false;
      }
    }

    function validateAll(){
      if(field.meta.type == 'select'){
        field.error.datasource_service_sourceKey = !_.get(field.serviceSource, 'key');
        field.error.datasource_service_method = !_.get(field.serviceSource, 'method');

      }else{
        field.error.datasource_service_sourceKey =  !_.get(field.finder, 'sourceKey');
        field.error.datasource_service_method = !_.get(field.finder, 'method');
      }

    }
  }
}