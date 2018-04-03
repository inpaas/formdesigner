(function(){
  angular
    .module('studio-v2') 
    .constant('AUDIT_FIELDS', [
      {
        "alias": "audit.created.date",
        "fieldName": "DT_CREATED",
        "label": "label.dt_created",
        "type": "Datetime",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.lastUpdated.date",
        "fieldName": "DT_UPDATED",
        "label": "label.dt_updated",
        "type": "Datetime",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.created.userId",
        "fieldName": "ID_USERCREATED",
        "label": "label.id_usercreated",
        "type": "Integer",
        "readonly": true,
        "auditField": true
      },
      {
        "alias": "audit.lastUpdated.userId",
        "fieldName": "ID_USERUPDATED",
        "label": "label.id_userupdated",
        "type": "Integer",
        "readonly": true,
        "auditField": true
      }
    ]);
})()