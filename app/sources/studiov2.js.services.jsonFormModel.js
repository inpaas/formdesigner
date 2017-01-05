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
  
  jsonForm.$inject = ['$q', '$http'];
  
  function jsonForm($q, $http){
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
      return $http({
        method: 'get',
        url: '/api/app/js/studiov2.js.model.jsonFormModel'
      }).then(function(response) {
        var jsonModel = response.data; 

        jsonModel.views.edit = {
          templateCol: 1,
          label: '1 col'
        }  

        jsonModel.fields.forEach(function(field, index){
          field.templateType = '/forms/studiov2.forms.fields.' + field.meta.type;
        });

        return jsonModel;
      });
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