(function(global){
  angular
    .module('studio-v2')
    .directive("onlyNumber", onlyNumber);

    function onlyNumber(){
      function link(scope, elem, attr, ngModelCtrl){
        var char;

        ngModelCtrl.$render = function(){
          elem.val(ngModelCtrl.$viewValue);
        }

        elem.on('keydown', function(e){
          if ((e.which || e.keyCode) === 8) {
            viewValue = parseInt(elem.val().slice(0, -1));
            ngModelCtrl.$setViewValue(viewValue? parseInt(viewValue) : '');
            ngModelCtrl.$render();
            scope.$apply();
            e.preventDefault();
          }
        });

        elem.on('keypress', function(e){
          var char = String.fromCharCode( e.which || e.keyCode ), 
              valElem = elem.val() || '',
              viewValue = '', 
              maxLength = 14; //Maior número inteiro pra evitar bug do jvascript com números

          if ((e.which || e.keyCode) === 8) {
            viewValue = parseInt(elem.val().slice(0, -1));
            return;

          }else if(valElem.length < maxLength && ((char == '-' && valElem.search('-') < 0) || char.search(/[0-9]/g) == 0)){

            if(char == '-'){
              viewValue = char.concat(valElem);
            }else{
              viewValue = valElem.concat(char);
            }

            if(viewValue != '-'){
              viewValue = parseInt(viewValue); 
            }

            ngModelCtrl.$setViewValue(viewValue);
            ngModelCtrl.$render();
            scope.$apply();

          }else{
            return false;
          }

          e.preventDefault();
        });
      }

      return{
        link: link,
        require: 'ngModel',
        scope:{
          model: '=ngModel'
        }
      }
    }
})(window);