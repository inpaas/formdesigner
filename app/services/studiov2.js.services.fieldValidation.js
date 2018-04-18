angular
  .module('studio-v2')
  .service('FieldValidationService', FieldValidationService);

FieldValidationService.$inject = [
  'FieldValidationButton', 
  'FieldValidationCheckbox', 
  'FieldValidationDate',
  'FieldValidationEvent',
  'FieldValidationFile',
  'FieldValidationFinder',
  'FieldValidationNumber',
  'FieldValidationString',
  'FieldValidationSelect',
  'FieldValidationTime',
];

function FieldValidationService(
    FieldValidationButton,
    FieldValidationCheckbox, 
    FieldValidationDate, 
    FieldValidationEvent, 
    FieldValidationFile,
    FieldValidationFinder,
    FieldValidationNumber,
    FieldValidationString,
    FieldValidationSelect,
    FieldValidationTime){

  this.validateConfigField = validateConfigField;
  
  function validateConfigField(field, config){
    switch (field.meta.type){
      case 'button':
        FieldValidationButton.validate(field, config);
      break;

      case 'checkbox':
        FieldValidationCheckbox.validate(field, config);
      break;

      case 'currency':
        FieldValidationNumber.validate(field, config);
      break;
      
      case 'date':
        FieldValidationDate.validate(field, config);
      break; 

      case 'file':
        FieldValidationFile.validate(field, config);
      break;

      case 'finder':
        FieldValidationFinder.validate(field, config);
      break;

      case 'number':
        FieldValidationNumber.validate(field, config);
      break;

      case 'select':
        FieldValidationSelect.validate(field, config);
      break;

      case 'string':
        FieldValidationString.validate(field, config);
      break;
    
      case 'time':
        FieldValidationTime.validate(field, config);
      break;
    }
    
    FieldValidationEvent.validate(field, config);
  }

}
