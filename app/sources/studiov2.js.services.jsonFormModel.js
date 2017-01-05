/*
 * Json form model
 * studiov2.js.services.jsonjsonForm
 * 
 */
/*global require module Java logging scriptContext angular*/

(function() {
  angular
    .module('studio-v2')
    .service('jsonForm', jsonForm);
  
  jsonForm.$inject = ['$q'];
  
  function jsonForm($q){
    var form = setJsonForm();
    
    function setJsonForm(){
      return resetJsonForm();
    }
    
    function editKeyForm(key) {
      form.key = key;
    }

    function editLabelForm(label) {
      form.label = label;
    }

    function editPagination(pagination) {
      angular.extend(jsonForm.pagination, pagination);
    }

    function editBreadcrumb() {
       
    } 

    function editDataSource() {
      
    }

    function editViews() {
      
    }

    function buildFields(sections, jsonModel) {
       
    }

    function getFieldsFromSection(section) {
      
    }

    function resetJsonForm(){
    return {
        "key": "", 
        "label": "label.forms.pais",
        "pagination": {},
        "breadcrumb": [],
        "dataSource": {},
        "views": {
          "edit": {
            "templateCol": 1
          }
        },
        "fields": []
    };
  }
    
    function saveJsonForm(){
      //http.save(form);
    }
  
    
    function getJsonForm(){
      var deferred = $q.defer();

      form.views.edit = {
        templateCol: 1,
        label: '1 col'
      }

      form.fields.push({
        label: 'field 1',
        name: 'field-field1',
        templateType: '/forms/studiov2.forms.fields.string',
        meta: {
          type: 'string'
        }
      });

      deferred.resolve({data: form});
      return deferred.promise;
    }
    
    
    return {
      editKeyForm: editKeyForm,
      editLabelForm: editLabelForm,
      editPagination: editPagination,
      editBreadcrumb: editBreadcrumb,
      editDataSource: editDataSource,
      editViews: editViews,
      buildFields: buildFields,
      saveJsonForm: saveJsonForm,
      getJsonForm: getJsonForm
    };
  }
  
  
})();