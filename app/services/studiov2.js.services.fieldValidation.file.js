angular
  .module('studio-v2')
  .service('FieldValidationFile', FieldValidationFile)

function FieldValidationFile() {
  this.validate = validate;

  function validate(field) {
    if(field.meta.maxSize == undefined || !field.meta.maxSize.toString()){
      field.error.file_minSize = false;
      field.error.file_maxSize = false;
      field.error.file_maxSizeNumber = false;

    }else if(!angular.isNumber(Number(field.meta.maxSize))){
      field.error.file_maxSizeNumber = true;

    } else if(field.meta.maxSize > 50){
      field.error.file_maxSize = true;

    } else if(field.meta.maxSize < 1){
      field.error.file_minSize = true;
      
    }else{
      field.error.file_minSize = false;
      field.error.file_maxSize = false;
      field.error.file_maxSizeNumber = false;
    }
  } 
}