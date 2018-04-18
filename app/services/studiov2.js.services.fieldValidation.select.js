angular
  .module('studio-v2')
  .service('FieldValidationSelect', FieldValidationSelect)

FieldValidationSelect.$inject = ['FieldValidationDataSource']

function FieldValidationSelect(FieldValidationDataSource) {
  this.validate = validate;

  function validate(field, config){
    FieldValidationDataSource.validate(field, config); 
  }
}
