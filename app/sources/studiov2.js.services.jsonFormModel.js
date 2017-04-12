/*
 * Json form model
 * studiov2.js.services.jsonjsonForm
 * 
 */
/*global require module Java logging scriptContext angular*/
(function() {
  angular
    .module("studio-v2")
    .service("jsonFormService", jsonFormService);
  
  jsonFormService.$inject = ["$q", "$filter"];
  
  function jsonFormService($q, $filter){
    var form = {}
    
    function setJsonForm(_form){
      form = _form;
    }
    
    function editKey(key) {
      form.key = key;
    }

    function editLabel(label) {
      form.label = label;
    }

    function editPagination(pagination) {
      angular.extend(jsonForm.pagination, pagination);
    }

    function editBreadcrumb(breadcrumb, view) {
      form.views[view].breadcrumb = breadcrumb;
    } 

    function editActions(actions, view){
      form.views[view].actions = actions;
    }

    function editDataSource(dataSource) {
      form.dataSource = dataSource;
    }

    function editViews() {
    }

    function editFields(fields) {
      form.fields = fields;
    }

    function getFormTemplate(){
      var deferred = $q.defer(),
          form = {
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
                    "label": "button.viewedit.title"
                  },
                  {
                    "action": "list.remove",
                    "name": "listDelete",
                    "label": "button.remove.title"
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

      setJsonForm(form);
      form.firstConfig = true;
      deferred.resolve(form);
      return deferred.promise;
    }
    
    function getNewFormId() {
      var deferred = $q.defer();
      deferred.resolve(getFormTemplate());

      return deferred.promise;
    }
 
    function getActionsTypes() {
      return [
        "new",
        "list.remove",
        "list.view_edit",
        "list.custom",
        "list.modal",
        "modal",
        "custom",
        "cancel",
        "remove",
        "save",
        "save_new",
        "duplicate",
        "include.add",
        "include.row.edit",
        "include.row.remove"
      ]; 

    }

    function getFormWithLabels(){
      return form; 
    }

    function setKeyToDetails(key){
      form.views.list.keyToDetails = key;
    }

    function editConfigForm(configForm){
      var key = configForm.key || configForm.label.toLowerCase().replace(/\s/g, '-');
      editKey(key);
      editLabel(configForm.label);
      editDataSource(configForm.dataSource);
      editTemplate(configForm.template);
    }

    function editTemplate(template){
      form.template = template;
    }

    return {
      editKey: editKey,
      editLabel: editLabel,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      editFields: editFields,
      editActions: editActions,
      getFormTemplate: getFormTemplate,
      setJsonForm: setJsonForm,
      getActionsTypes: getActionsTypes,
      getFormWithLabels: getFormWithLabels,
      setKeyToDetails: setKeyToDetails,
      editConfigForm: editConfigForm
    };
  }
})();