(function(){
  angular
    .module('studio-v2') 
    .directive('breadcrumb', breadcrumb); 

  function breadcrumb(){
    function link(scope, elem, attrs){
      var divisorType;

      angular.extend(scope, {
        changeDivisor: changeDivisor,
        removeItem: removeItem,
        addItem: addItem
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
            scope.breadcrumb[i].firsDivisor = true; 
            divisorType = scope.breadcrumb[i].divisor;
            break;
          }
        }
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
        var last = scope.breadcrumb[scope.breadcrumb.length-1];

        if (!last) {setIcon(); }

        if (!last.divisor && last.label == ' ') { return false; }

        if (scope.breadcrumb.length > 1) {
          addDivisor();
        }

        scope.breadcrumb.push({label: ' '});

        function addDivisor(){
          if (!last.divisor){
            if (!divisorType){ setFirstDivisor(); }
            scope.breadcrumb.push({divisor: divisorType});
          }
        }
      }

      function setIcon(){
        scope.breadcrumb.push({icon: 'fa fa-home'});
      }

      setFirstDivisor();
    }

    return{
      link: link, 
      templateUrl: '/forms/studiov2.forms.breadcrumb',
      scope: {
        breadcrumb: '='
      }
    }
  };

})();