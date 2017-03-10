/*
 * Json form model
 * studiov2.js.services.jsonjsonForm
 * 
 */
/*global require module Java logging scriptContext angular*/
(function() {
  angular
    .module('studio-v2')
    .service('jsonFormService', jsonFormService);
  
  jsonFormService.$inject = ['$q', '$filter'];
  
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

    function editDataSource() {
    }

    function editViews() {
    }

    function buildFields(sections, jsonModel) {
    }

    function getFieldsFromSection(section) {
    }

    function getFormTemplate(){
      var deferred = $q.defer(),
          form = {
            'key': '', 
            'label': '',
            'pagination': {
              'type': 'server',
              'countPerPage': 10 
            },
            'dataSource': {},
            'views': {
              'list': {
                'actions':[
                  {
                    'action': 'new',
                    'name': 'new'
                  }
                ],
                'breadcrumb': []
              },
              'edit': {
                'actions': [
                  {
                    'action': 'save',
                    'label': 'button.save.title',
                    'name': 'save',
                    'visible': {
                      'type': 'map',
                      'expression': {
                        'id': 23
                      }
                    }              
                  },
                  {
                    'action': 'savenew',
                    'label': 'button.savenew.title',
                    'name': 'save_new', 
                    'visible': {
                      'type': 'function', 
                      'expression': '(function (data){ console.log(data) })'
                    }
                  },
                  {
                    'action': 'duplicate',
                    'label': 'button.duplicate.title',
                    'name': 'duplicate',
                  },
                  {
                    'action': 'remove',
                    'label': 'button.remove.title',
                    'name': 'remove'
                  },
                  {
                    'action': 'cancel',
                    'label': 'button.cancel.title',
                    'name': 'cancel'
                  }
                ],
                'breadcrumb': []
              }
            },
            'fields': []
          }

      setJsonForm(form);
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
        'new',
        'list.remove',
        'list.view_edit',
        'list.custom',
        'list.modal',
        'modal',
        'custom',
        'cancel',
        'remove',
        'save',
        'save_new',
        'duplicate',
        'include.add',
        'include.row.edit'
      ]; 
    }

    function getFormWithLabels(){
      return form; 
    }

    return {
      editKey: editKey,
      editLabel: editLabel,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      buildFields: buildFields,
      getFormTemplate: getFormTemplate,
      setJsonForm: setJsonForm,
      getActionsTypes: getActionsTypes,
      getFormWithLabels: getFormWithLabels
    };
  }
})();