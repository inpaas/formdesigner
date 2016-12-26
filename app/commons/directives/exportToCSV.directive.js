(function() {
  angular
    .module('dynaform') 
    .directive('exportToCsv', exportToCSV);

  exportToCSV.$inject = ['dynaformUtilsService', '$q'];

  function exportToCSV(dynaformUtilsService, $q){

    function link(scope, elem, attrs) {
      var filename = attrs.filename || 'data.csv';

      elem.click(doExport);

      function doExport() {
        var source = scope.source, 
            labels = getTableLabels(attrs.exportToCsv);

        var query = 'select ' + labels + ' into CSV("' + filename + '") from ?';
        alasql(query, [source]);
      }

      function getTableLabels(tableId) {
        var ngTable = angular.element(tableId).clone(),
            bindColumns = ngTable.find('tbody').find('tr').first().find('[sortable]');
            binds = _.map(bindColumns, function(el){ return el.attributes['sortable'].value.replace(/\'/g, '')});

        return binds.join(',');
      }

    }

    return {
      restrict: 'A',
      link: link, 
      scope: {
        source: '='
      }
    };
  }
})();