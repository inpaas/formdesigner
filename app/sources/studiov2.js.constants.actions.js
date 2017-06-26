(function(){

	angular
		.module('studio-v2')
		.constant('ACTIONS', [
        {
          "action": "cancel",
          "class": "btn-default",
          "label": "button.cancel.title",
          "name": "cancel",
          "iconClass": 'fa-undo'
        },
        {
          "action": "remove",
          "label": "button.remove.title",
          "name": "remove",
          "class": "btn-danger",
          "iconClass": 'fa-trash-o'
        },
        {
          "action": "duplicate",
          "label": "button.duplicate.title",
          "name": "duplicate",
          "class": 'btn-success',
          "iconClass": 'fa-files-o'
        },
        {
          "action": "savenew",
          "label": "button.savenew.title",
          "name": "savenew",
          "class": 'btn-primary',
          "iconClass": 'fa-floppy-o'
        },
        {
          "action": "save",
          "label": "button.save.title",
          "name": "save",
          "class": 'btn-primary',
          "iconClass": 'fa-floppy-o'
        }			
		]);
})();