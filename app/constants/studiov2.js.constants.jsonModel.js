(function(){
  angular
    .module('studio-v2')
    .constant('JSONMODEL', {
      'key': '', 
      'label': '',
      'pagination': {
        'type': 'server',
        'countPerPage': 10 
      },
      'dataSource': {
        'type': 'E'
      },
      'views': {
        'edit': {
          'actions': [
            {
              'action': 'cancel',
              'label': 'button.cancel.title',
              'name': 'cancel',
              'iconclass': 'fa-undo'
            },
            {
              'action': 'remove',
              'label': 'button.remove.title',
              'name': 'remove',
              'iconclass': 'fa-trash-o'
            },
            {
              'action': 'duplicate',
              'label': 'button.duplicate.title',
              'name': 'duplicate',
              'iconclass': 'fa-files-o'
            },
            {
              'action': 'savenew',
              'label': 'button.savenew.title',
              'name': 'savenew',
              'iconclass': 'fa-floppy-o'
            },
            {
              'action': 'save',
              'label': 'button.save.title',
              'name': 'save',
              'iconclass': 'fa-floppy-o'
            }
          ],
          'breadcrumb': []
        },
        'filter':{}
      },
      'fields': []
    });
})();