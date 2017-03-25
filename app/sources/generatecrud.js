/*
 * generateCrudV2
 * studiov2.rest.generateCrudV2
 * 
 */
 /*global require module Java logging scriptContext*/

 (function generateCrudV2(scope) {
  'use strict';
  
  
  /*global RESTService*/
  RESTService.addEndpoint({ "name": "generateCrud", "method": "GET", "path": "/{entityKey}" }, generateCrud);
  
  
  function loadEntity(id){
    return require("inpaas.devstudio.service.entitymanagement").get(id);
  }

  function generateCrud(params){
    var entity = loadEntity(params.entityKey),
        JSONForm = {};
    
    JSONForm.id = 1;
    JSONForm.key = "form-" + entity.name.toLowerCase();
    JSONForm.label = "label." + entity.name.toLowerCase();

    JSONForm.pagination = buildPagination();

    function buildPagination(){
      return {
        "type": "server",
        "countPerPage": 10
      }
    }

    JSONForm.dataSource = {
      "type" : "E",
      "key" : entity.name
    };

    JSONForm.views = {};
    JSONForm.views.filter = {};
    JSONForm.views.list = {
      "breadcrumb": [],
      "columns": 1,
      "actions": [
        {"action": "new"}
      ]
    };

    JSONForm.views.edit = {
      "breadcrumb": [],
      "columns": 1,
      "actions": [
      {
        "action": "cancel"
      }, {
        "action": "remove"
      }, {
        "action": "duplicate"
      }, {
        "action": "save"
      }, {
        "action": "savenew"
      }
      ]
    };
    
    JSONForm.fields = [];
    
    for(var k in entity.attributes){
      var field = {};
      var item = entity.attributes[k];
      
      field.label = item.alias;
      field.name = "input" + item.alias;
      field.meta = {};
      field.meta.bind = item.alias;
      
      if(item.primaryKey){
        JSONForm.views.list.keyToDetails = item.alias;
      }  
      
      if(item.required == true){
        field.meta.required = {
          "type": "boolean",
          "expression": true 
        }
      };
      
      if(item.type == "Integer" || item.type == "Long"){
        field.meta.type = "number";
      } else if (item.type == "Char"){
        if(item.domains.length > 2){
          field.meta.type = "select";

          field.meta.options = [];
          
          for(var k in item.domains){
            var domain =  {};
            domain.label = item.domains[k].label;
            domain.value = item.domains[k].value;

            field.meta.options.push(domain)

          };
        } else if(item.domains.length == 2){
          field.meta.type = "checkbox";
          field.meta.checked = item.domains[0].value;
          field.meta.unchecked = item.domains[1].value;
        }
      } else {
        field.meta.type = item.type.toLowerCase();;
      };
      
      if(item.size){
        field.meta.maxLength = item.size;
      };
      
      field.views = {
        "list" : {},
        "edit" : {}
      }
      
      
      JSONForm.fields.push(field);
    };
    
    return Java.asJSONCompatible(JSONForm);
  };


  
})(typeof module !== "undefined" ? module.exports : {});