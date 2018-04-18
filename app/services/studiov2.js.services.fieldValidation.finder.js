angular
  .module('studio-v2')
  .service('FieldValidationFinder', FieldValidationFinder)

FieldValidationFinder.$inject = ['FieldValidationDataSource']

function FieldValidationFinder(FieldValidationDataSource) {
  this.validate = validate;

  function validate(field, config){
    FieldValidationDataSource.validate(field, config); 
  }
}
