(function() {
  angular
    .module('dynaform') 
    .directive('maskData', maskData);
  
    maskData.$inject = ['$compile', 'dynaformUtilsService'];

    function maskData($compile, dynaformUtilsService) {

      function link(scope, elem, attrs) {
        if (!attrs.formatPattern) {
          elem.text(scope.toMask);
        }

        var masked = dynaformUtilsService.translateDataToView(scope.toMask, attrs.type, attrs.formatPattern);
        elem.text(masked);
      }

      return {
        link: link,
        scope: {
          toMask: '='
        }
      };
    }
})();