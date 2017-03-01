(function(){
  angular
    .module('studio-v2') 
    .directive('breadcrumb', breadcrumb); 

  breadcrumb.$inject = ["$rootScope"];

  function breadcrumb($rootScope){
    function link(scope, elem, attrs){
      var divisorType;

      angular.extend(scope, {
        changeDivisor: changeDivisor,
        removeItem: removeItem,
        addItem: addItem,
        enableSelectFieldToBreadcrumb: enableSelectFieldToBreadcrumb,
        enableEditBreadcrumb: enableEditBreadcrumb
      });

      function changeDivisor(newDivisor){
        angular.forEach(scope.breadcrumb, function(item, index){
          if (item.divisor) {
            item.divisor = newDivisor;
            divisorType = newDivisor;
          }
        });
      }

      function setFirstDivisor() {
        for(var i = 0, length = scope.breadcrumb.length; i < length; i++){
          if (scope.breadcrumb[i].divisor) {
            scope.breadcrumb[i].firstDivisor = true; 
            divisorType = scope.breadcrumb[i].divisor;
            break;
          }
        }

        if (!divisorType) {
          divisorType = '>';
        }
        return divisorType;
      }

      function removeItem(index){
        //Tira o label e o divisor
        if (index === (scope.breadcrumb.length - 1) ) {
          scope.breadcrumb.splice((index - 1), 2);
        }else{
          scope.breadcrumb.splice(index, 2);
        }
      }

      function addItem(){
        var last = scope.breadcrumb[scope.breadcrumb.length - 1];

        if (!last || last.hasOwnProperty('divisor')) {
          addLabel();
        }else if (last.hasOwnProperty('label') || last.hasOwnProperty('bind')) { 
          addDivisor(); 
          addLabel();
        }

      }

      function addDivisor(){
        var divisor = divisorType || setFirstDivisor();
        scope.breadcrumb.push({divisor: divisor});
      }

      function addLabel() {
        scope.breadcrumb.push({label: ''});
      }
      
      function setIcon(){
        scope.breadcrumb.push({icon: 'fa fa-home'});
      }

      function enableSelectFieldToBreadcrumb(indexBreadcrumb){
        $rootScope.$emit('enableSelectFieldToBreadcrumb', indexBreadcrumb);
      }

      function enableEditBreadcrumb(bc){
        bc.label = '';
        delete bc.bind;
      }
    }

    return{
      link: link, 
      templateUrl: '/forms/studiov2.forms.breadcrumb',
      scope: {
        breadcrumb: '=',
      }  
    }
  };

})();