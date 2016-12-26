(function () {
  angular.
    module("dynaform").
    directive("copyToClipboard", copyClipboardDirective);
    
  function copyClipboardDirective() {

    function link(scope, elem, attrs) {
      function clipboardSimulator() {
        var self = this,
            textarea,
            container;

        function createTextarea() {
          if (!self.textarea) {
            container = document.createElement('div');
            container.id = 'simulate-clipboard-container';
            container.setAttribute('style', ['position: fixed;', 'left: 0px;', 'top: 0px;', 'width: 0px;', 'height: 0px;', 'z-index: 100;', 'opacity: 0;', 'display: block;'].join(''));
            document.body.appendChild(container);
            textarea = document.createElement('textarea');
            textarea.setAttribute('style', ['width: 1px;', 'height: 1px;', 'padding: 0px;'].join(''));
            textarea.id = 'simulate-clipboard';
            self.textarea = textarea;
            container.appendChild(textarea);
          }
        }
        createTextarea();
      }

      clipboardSimulator.prototype.copy = function(textToCopy) {
        this.textarea.innerHTML = '';
        this.textarea.appendChild(document.createTextNode(textToCopy));
        this.textarea.focus();
        this.textarea.select();

        setTimeout(function() {
          document.execCommand('copy');
        }, 20);
      };
      
      function buildCSVFormat(tableId) {
        var ngTable = angular.element(tableId).clone(),
            table = angular.element(buildTable(scope.source, ngTable))[0],
            csvString = '';

          for (var i = 0; i < table.rows.length; i++) {
            var rowData = table.rows[i].cells;

            for (var j = 0; j < rowData.length; j++) {
              csvString = csvString + rowData[j].innerHTML + ",";
            }

            csvString = csvString.substring(0, csvString.length - 1);
            csvString = csvString + "\n";
          }

          csvString = csvString.substring(0, csvString.length - 1);
          return csvString;
        } 


      var copy = new clipboardSimulator();

      elem.click(function(){
        copy.copy(buildCSVFormat(attrs.copyToClipboard));
      });

      function buildTable(source, ngTable) {
        var table = [
              '<table class="table table-striped">',
                '<thead>',
                  getColumns(ngTable),
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
          return _.map(th, function(el){return '<th>' + el.innerText + '</th>'}).join('');
        }
      }
    }
    return {
      link: link,
      scope: {
        source: '='
      }
    };
  }
}());