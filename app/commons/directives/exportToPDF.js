(function() {
  angular
    .module('dynaform')
    .directive('exportToPdf', exportToPDF);

  function exportToPDF() {

    function link(scope, elem, attrs) {
      elem.click(doExport);

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

      function doExport() {
        var ngTable = angular.element(attrs.exportToPdf).clone(),
            table = buildTable(scope.source, ngTable),
            pdf = new jsPDF('p', 'pt', 'letter')

          // source can be HTML-formatted string, or a reference
          // to an actual DOM element from which the text will be scraped.
          , source = table

          // we support special element handlers. Register them with jQuery-style
          // ID selector for either ID or node name. ("#iAmID", "div", "span" etc.)
          // There is no support for any other type of selectors
          // (class, of compound) at this time.
          , specialElementHandlers = {
            // element with id of "bypass" - jQuery style selector
            '#bypassme': function(element, renderer) {
              // true = "handled elsewhere, bypass text extraction"
              return true
            }
          }

          margins = {
            top: 30,
            bottom: 30,
            left: 30,
            width: 600
          };

        // all coords and widths are in jsPDF instance's declared units
        // 'inches' in this case
        pdf.fromHTML(
          source // HTML string or DOM elem ref.
          , margins.top // x coord
          , margins.left // y coord
          , {
            //'width': margins.width // max width of content on PDF
            //  ,
            //'elementHandlers': specialElementHandlers
          },
          function(dispose) {
            // dispose: object with X, Y of the last line add to the PDF
            // this allow the insertion of new lines after html
            pdf.save('Test.pdf');
          },
          margins
        )   
      } 
    }

    return {
      link: link,
      scope:{
        source: '='
      }
    };
  }

})();