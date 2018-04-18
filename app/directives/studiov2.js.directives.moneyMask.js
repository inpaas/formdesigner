/*
  Angular directive to mask inputs with currency values
  https://github.com/rwaltenberg/angular-money-mask
  v1.0.4

  Customizado por @danilorodrigues
*/

(function() {
  angular
    .module('studio-v2')
    .directive('moneyMask', moneyMask);

  moneyMask.$inject = ['$filter', '$locale'];

  function moneyMask($filter, $locale) {
    var directive = {
      require: 'ngModel',
      link: link,
      restrict: 'A',
      scope: {
        model: '=ngModel',
        thousandSeparator: '@',
        decimalSeparator:'@'
      }
    };

    return directive;

    function link(scope, element, attrs, ngModelCtrl) {
      var display, 
          cents,
          localeDecimalSep = $locale.NUMBER_FORMATS.DECIMAL_SEP,
          localeThousandSep = $locale.NUMBER_FORMATS.GROUP_SEP,
          scale = attrs.numScale? parseInt(attrs.numScale) : 2;

      if(scale > 6){
        scale = 6;
      }

      var powOfTen = Math.pow(10, scale);

      ngModelCtrl.$render = function () {
        if(cents == undefined || cents == null || cents == ''){
          display = '';

        }else{
          display = $filter('number')(cents / powOfTen, scope.numScale);
        }

        if(scope.thousandSeparator){
          display = display.replace(localeThousandSep, scope.thousandSeparator);
        }

        if(scope.decimalSeparator){
          display = display.replace(localeDecimalSep, scope.decimalSeparator);
        }

        if (attrs.moneyMaskPrepend) {
          display = attrs.moneyMaskPrepend + ' ' + display;
        }

        if (attrs.moneyMaskAppend) {
          display = display + ' ' + attrs.moneyMaskAppend;
        }

        element.val(display);
      }

      scope.$watch('model', function onModelChange(newValue) {
        if(newValue == undefined || newValue == null){return}

        if(newValue == ''){
          ngModelCtrl.$viewValue = newValue;
          ngModelCtrl.$render();
          return 
        }
        newValue = parseFloat(newValue) || 0;

        if (newValue !== cents) {
          cents = Math.round(newValue * powOfTen);
        }

        ngModelCtrl.$viewValue = newValue;
        ngModelCtrl.$render();
      });

      scope.$watch('thousandSeparator', function(newValue, oldValue) {
        if(newValue === oldValue){return}; 
        ngModelCtrl.$render();
      });

      scope.$watch('decimalSeparator', function(newValue, oldValue) {
        if(newValue === oldValue){return}; 
        ngModelCtrl.$render();
      });

      element.on('keydown', function (e) {
        if ((e.which || e.keyCode) === 8) {
          cents = parseInt(cents.toString().slice(0, -1)) || 0;

          ngModelCtrl.$setViewValue(cents / powOfTen);
          ngModelCtrl.$render();
          scope.$apply();
          e.preventDefault();
        }
      });

      element.on('keypress', function (e) {
        var key = e.which || e.keyCode;
        
        if(key === 9 || key === 13) {
          return true;
        }
        
        var char = String.fromCharCode(key);
        e.preventDefault();

        // Para evitar issues com big integers. O numero limite é 999.999.999.999,99
        if (char.search(/[0-9\-]/) === 0) {

          if(cents && cents.toString().length == 14){return false}

          if(cents == null || cents == undefined){ 
            cents = 0;
          }
          cents = parseInt(cents + char);
        }
        else {
          return false;
        }
        
        var target = e.target || e.srcElement;

        if(target.selectionEnd != target.selectionStart) {
          ngModelCtrl.$setViewValue(parseInt(char) / powOfTen);
        }
        else {
          ngModelCtrl.$setViewValue(cents / powOfTen);
        }
        ngModelCtrl.$render();
        scope.$apply();
      })
    }
  }
})();