(function() {
  angular
    .module('dynaform')  
    .directive('printTable', printTable)

  printTable.$inject = ['$compile']
  function printTable($compile) {

    function link(scope, elem, attrs) {
      elem.click(print);

      function print(){
        var win = window.open(''),
            ngTable = angular.element(attrs.printTable).clone();

        win.document.write('<link rel="stylesheet" href="//static.inpaas-sandbox.com/assets/bootstrap-3.3.7/css/bootstrap.css">');
        win.document.write('<h1>'+ attrs.printTitle +'</h1>');
        var table = buildTable(scope.source, ngTable);

        win.document.write(table);
        win.setTimeout(win.print, 200);
      } 

      function buildTable(source, ngTable) {
        var table = [
              '<table class="table table-striped">',
                '<thead>',
                  '<tr>',
                    getColumns(ngTable),
                  '</tr>',
                '</thead>',
                '<tbody>',
                  buildTRs(source, ngTable),
                '</tbody>',
              '</table>'
            ];

        return table.join('');

        function buildTRs(source, ngTable) {
          var trs = [],
              bindColumns = ngTable.find('tbody').find('tr').first().find('[sortable]');

          source.forEach(function(obj, index) {
            var tr = '<tr>{{td}}</tr>',
                tds = [];

            bindColumns.each(function(index, domNode) {
              var bind = domNode.attributes['sortable'].value.replace(/\'/g, '');
              tds.push('<td>'+ (obj[bind] || '') +'</td>');
            });

            tr = tr.replace('{{td}}', tds.join(''));
            trs.push(tr);
          });

          return trs.join('');
        }

        function getColumns(ngTable) {
          var th = ngTable.find('th.sortable');
          return _.map(th, function(el){return el.outerHTML}).join('');
        }
      }

    }

    return {
      link: link,
      scope: {
        source: '='
      }
    }
  }

})();
