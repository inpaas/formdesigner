(function(){
  angular
    .module('studio-v2') 
    .constant('AUDIT_FIELDS', [
      {
        "alias": "audit.created.date",
        "fieldName": "DT_CREATED",
        "title": "Record Date (Autor)",
        "description": "Record Date (Autor)",
        "type": "Datetime",
        "readonly": true
      },
      {
        "alias": "audit.lastUpdated.date",
        "fieldName": "DT_UPDATED",
        "title": "Update Date (Autor)",
        "description": "Update Date (Autor)",
        "type": "Datetime",
        "readonly": true
      },
      {
        "alias": "audit.created.userId",
        "fieldName": "ID_USERCREATED",
        "title": "Record User Id (Autor)",
        "description": "Record User Id (Autor)",
        "type": "Integer",
        "readonly": true
      },
      {
        "alias": "audit.lastUpdated.userId",
        "fieldName": "ID_USERUPDATED",
        "title": "Update User Id (Autor)",
        "description": "Update User Id (Autor)",
        "type": "Integer",
        "readonly": true
      }
    ]);
})()