(function(){
  angular
    .module('studio-v2')
    .constant('JSONMODEL', {
      "key": "", 
      "label": "",
      "pagination": {
        "type": "server",
        "countPerPage": 10 
      },
      "dataSource": {
        "type": "E"
      },
      "views": {
        "edit": {
          "actions": [
            {
              "action": "cancel",
              "label": "button.cancel.title",
              "name": "cancel"
            },
            {
              "action": "remove",
              "label": "button.remove.title",
              "name": "remove"
            },
            {
              "action": "duplicate",
              "label": "button.duplicate.title",
              "name": "duplicate",
            },
            {
              "action": "savenew",
              "label": "button.savenew.title",
              "name": "save"
            },
            {
              "action": "save",
              "label": "button.save.title",
              "name": "save"
            }
          ],
          "breadcrumb": []
        },
        "filter":{}
      },
      "fields": []
    });
})();