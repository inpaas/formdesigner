(function() {
	angular.module('dynaform')
				.service('dynaformValidationService', dynaformValidationService);

	dynaformValidationService.$inject = ['$http', 'Notification', '$q'];

	function dynaformValidationService($http, Notification, $q) {
    var validations,
        errorMessages;

    function setValidationsMessages(_validations) {
      validations = _validations;
    }

    function validateModel(bindName, fieldValue, fieldMeta, fieldName, formId, entity) {
      var validateResults = {
            error: false,
            errorMessages: {} 
          },
          deferred = $q.defer();

      if (fieldMeta.required && !validateResults.error) {
        validateRequired(fieldValue, bindName, fieldMeta.required, validateResults);

      }if (fieldMeta.maxLength && !validateResults.error) {
        validateMaxLength(fieldValue, bindName, fieldMeta.maxLength, validateResults);

      }if (fieldMeta.minLength && !validateResults.error) {
        validateMinLength(fieldValue, bindName, fieldMeta.minLength, validateResults);

      }if (fieldMeta.validation && fieldMeta.validation.type === 'function' && !validateResults.error) {
        validateCustomFn(fieldValue, bindName, fieldMeta.validation, validateResults);

      }if (fieldMeta.validation && fieldMeta.validation.type === 'event' && !validateResults.error) {
        validateByEvent(entity, fieldName, formId)
          .then(function(response) {
            if (!response.data.validation.isValid) {
              setMessageError(bindName, 'javascriptFailed', validateResults, response.data.validation.message);
            }
            deferred.resolve(validateResults);
          }, function(response) {
            deferred.reject(validateResults);
          });

      }else{
        deferred.resolve(validateResults);
      }

      return deferred.promise;
    }

    function validateRequired(value, bindName, metaValue, validateResults) {
      if (metaValue.type && metaValue.type === 'boolean') {
        if (!value || !value.toString().length) {
          setMessageError(bindName, 'required', validateResults);
        }
      }
    }

    function validateMaxLength(value, dataKey, metaValue, validateResults) {
      if (value && value.length > metaValue) {
        setMessageError(dataKey, 'maxLength', validateResults);
      }
    }

    function validateMinLength(value, dataKey, metaValue, validateResults) {
      if (value && value.length < metaValue) {
        setMessageError(dataKey, 'minLength', validateResults);
      }
    }

    function validateCustomFn(value, dataKey, metaValue, validateResults) {
      var param = _.set({}, dataKey, value),
          fn = window.eval(metaValue.expression);
      !fn(param) && setMessageError(dataKey, 'javascriptFailed', validateResults);
    } 

    function validateByEvent(data, inputName, formId) {
      var href = '/api/forms-v2/' + formId + '/validation/' +  inputName;

      return $http({
        method: 'POST',
        url: href,
        data: {data: data}
      }); 
    }

    function getMessageError(name) {
      return errorMessages[name];
    }

    function setErrorMessages(msgs) {
      errorMessages = msgs;
    }

    function setMessageError(dataKey, metaKey, validateResults, msgCustom) {
      validateResults.error = true;

      if (!validateResults.errorMessages[dataKey]) {
        validateResults.errorMessages[dataKey] = {};
      }
      validateResults.errorMessages[dataKey][metaKey] = msgCustom || getMessageError(metaKey);
    }

		return{
      setValidationsMessages: setValidationsMessages, 
      validateModel: validateModel,
      setErrorMessages: setErrorMessages,
      validateByEvent: validateByEvent
		}
	}
})();
