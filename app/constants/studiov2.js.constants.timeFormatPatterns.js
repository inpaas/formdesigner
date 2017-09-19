(function(){
  angular
    .module('studio-v2')
    .constant('TIME_FORMAT_PATTERNS', [
      {key: 'fieldformat.hour', title: 'HH', mask: '99'},
      {key: 'fieldformat.time', title: 'HH:mm', mask: '99:99'},
      {key: 'fieldformat.fullhour', title: 'HH:mm:ss', mask: '99:99:99'},
      {key: 'fieldformat.minutes', title: 'mm', mask: '99'}
    ]);
})();