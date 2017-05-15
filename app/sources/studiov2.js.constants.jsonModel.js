(function(){
  angular
    .module('studio-v2')
    .constant('JSONMODEL', jsonModel);

  var jsonModel = {
    "key": "", 
    "label": "",
    "pagination": {
      "type": "server",
      "countPerPage": 10 
    },
    "dataSource": {},
    "views": {
      "list": {
        "actions":[
          {
            "action": "new",
            "name": "new",
            "label": "button.new.title"
          },
          {
            "action": "list.view_edit", 
            "name": "view_edit",
            "label": "button.viewedit.title",
            "notDisplayLabel": true
          },
          {
            "action": "list.remove",
            "name": "listDelete",
            "label": "button.remove.title",
            "notDisplayLabel": true
          }
        ],
        "breadcrumb": []
      },
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
  }

})();