(function(){
  angular
  .module('studio-v2')
  .controller('ConfigDisplayController', ConfigDisplayController)
  
  ConfigDisplayController.$inject = ['$uibModalInstance', 'expression', 'formFields', 'typeConfig']; 

  function ConfigDisplayController($uibModalInstance, expression, formFields, typeConfig){
    var $ctrl = this;

    $ctrl.formFields = formFields;
    $ctrl.key;
    $ctrl.value;
    $ctrl.typeConfig = typeConfig;

    switch(typeConfig){
      case 'map':
        $ctrl.expression = (expression && objToArray(expression)) || [];
        break;

      case 'options':
        if (expression && Object.keys(expression).length) {
          expression.forEach(function(item, index){
            item.key = item.label;
          });
          
        }else{
          expression = [];
        }
        $ctrl.expression = expression;
        break;

      case 'function':
        $ctrl.expression = expression;
        break;
    }


    function objToArray(obj) {
      var arr = [];

      for(key in obj){
        var singleObject = {}
        singleObject.key = key;
        singleObject.value = obj[key];

        arr.push(singleObject);
      };

      return arr;
    }

    function arrayToObj(_array) {
      var map = {};

      _array.forEach(function(item, index){
        map[item.key] = item.value;
      });

      return map;
    }


    function ok() {
      var result = angular.copy($ctrl.expression);

      if($ctrl.key && $ctrl.value){
        result.push({key: $ctrl.key, value: $ctrl.value});
      }

      switch(typeConfig){
        case 'map': 
          result = arrayToObj(result);
          break;

        case 'options':
          result.forEach(function(item, index){
            item.label = item.key;
          });
        break;
      }

      $uibModalInstance.close(result);
    };

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.ok = ok;
    $ctrl.cancel = cancel;
  }
})();
