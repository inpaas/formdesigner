!function(){function e(e,t,n,i){i.startSymbol("{[{"),i.endSymbol("}]}"),t.state("forms",{url:"/forms",controller:"FormEditController",controllerAs:"ctrl",templateUrl:"/forms/studiov2.forms.dashboard"}).state("forms.new-view-edit",{url:"/new/view-edit",views:{sidebar:{templateUrl:"/forms/studiov2.forms.sidebar.edit"},view:{templateUrl:"/forms/studiov2.forms.view-edit"}}}).state("forms.new-view-list",{url:"/new/view-list",views:{sidebar:{templateUrl:"/forms/studiov2.forms.sidebar.edit"},view:{templateUrl:"/forms/studiov2.forms.view-list"}}}).state("forms.edit-form-edit",{url:"/:id/view-edit",views:{sidebar:{templateUrl:"/forms/studiov2.forms.sidebar.edit"},view:{templateUrl:"/forms/studiov2.forms.view-edit"}}}).state("forms.edit-form-list",{url:"/:id/view-list",views:{sidebar:{templateUrl:"/forms/studiov2.forms.sidebar.edit"},view:{templateUrl:"/forms/studiov2.forms.view-list"}}}),n.otherwise("/forms/new/view-edit"),e.setOptions({delay:4e3,startTop:20,startRight:10,verticalSpacing:20,horizontalSpacing:20,positionX:"right",positionY:"top"})}function t(e,t){e.NUMBER_FORMATS.DECIMAL_SEP=t("translate")("fieldformat.numeral.decimal_separator"),e.NUMBER_FORMATS.GROUP_SEP=t("translate")("fieldformat.numeral.grouping_separator"),e.NUMBER_FORMATS.CURRENCY_SYM=t("translate")("fieldformat.currency.symbol")}var n=["ui.mask","ui.bootstrap","ngTable","ui-notification","ngFileUpload","ui.router","angular-clipboard","ngSanitize","Localization",angularDragula(angular)];angular.module("studio-v2",n).config(e).run(t)}(),function(){function e(e,t,n,i,o){function s(){a().then(function(e){te.jsonModel=angular.copy(e),n.params.id||q()}).then(function(e){r(te.jsonModel),d(te.jsonModel.fields),v(),J(5).then(function(e){ee()}),te.jsonModel.dataSource.key&&V(5).then(function(e){H(te.jsonModel.dataSource.key)})})}function a(){return i.getJsonForm(n.params.id)}function r(e){return!!e.fields.length&&void te.sections.push({columns:e.views.edit.columns,fields:[],label:e.views.edit.label,displayLabel:!0,type:"main"})}function d(e){return!!e.length&&void e.forEach(function(e,t){"include"!=e.meta.type&&(e.id=t,te.sections[0].fields.push(e))})}function l(e){te.ready=!0,te.data.permissions=e}function u(e,t){f(e,void 0,t)}function c(){f("",void 0,"custom")}function f(e,t,n){var i;angular.isUndefined(t)?(i.action=n,i.mapExpression=[],i.btCustom=n.indexOf("custom")!=-1):(i=te.jsonModel.views[e].actions[t],i.btCustom=i.action.indexOf("custom")!=-1,i.index=t,i.mapExpression=[],i.visible&&(i.visibility=!0,i.visibilityType=i.visible.type,"map"==i.visible.type?angular.forEach(i.visible.expression,function(e,t){i.mapExpression.push({prop:t,value:e})}):"function"==i.visible.type?i.fnExpression=i.visible.expression:i.booleanExpression=i.visible.expression),i.event&&(editBt.setEvent=!0)),i.view=e,te.editBt=i,D()}function p(){function e(){n.visibility&&"map"===n.visibilityType?(i.visible={type:"map",expression:{}},n.mapExpression.forEach(function(e,t){angular.extend(i.visible.expression,e)})):n.visibility&&"function"===n.visibilityType&&(i.visible={type:"function",expression:n.fnExpression})}function t(){n.setEvent&&(i.event={method:n.method,sourceKey:n.sourceKey})}var n=angular.copy(te.editBt),i={};if(i.name=n.name||n.label.toLowerCase().replace(/\s/g,"-"),e(),t(),angular.isUndefined(n.index))te.jsonModel.views[n.view].actions.push(n);else{var o=te.jsonModel.views[n.view].actions[n.index];angular.extend(o,n)}k()}function m(e,t){var n={};n[e]=t,te.editBt.map.push(n)}function v(){te.data.dependents=[]}function g(){$(),te.newSection={}}function b(){var e=angular.copy(te.newSection);e.fields=[],e.id="section-".concat(te.sections.length),e.type="main",te.sections.length&&(e.type="include",e.meta={},e.include={},w(e)),te.sections.push(e),U(te.sections.length-1),k()}function w(e){te.jsonModel.fields.push(e)}function h(){k(),angular.extend(te.newSection,{})}function E(e){te.fieldEdit.meta.type=e,te.fieldEdit.templateType="/forms/studiov2.forms.fields."+e,_()}function y(){return!!te.sections.length&&(S(te.fieldEdit),x(te.fieldEdit),j(te.fieldEdit),M(te.fieldEdit),F(te.fieldEdit),angular.isUndefined(te.fieldEdit.id)&&C(),te.sectionSelected.onNewField=!1,te.fieldEdit={},void k())}function F(e){e.name="input".concat(e.label.replace(/\s/g,""))}function M(e){e.views.edit={},e.viewList&&(e.views.list={})}function S(e){return!!e.required&&void(e.meta.required={type:"boolean",expression:!0})}function x(e){return!!e.disabled&&void(e.meta.disabled={type:"boolean",expression:!0})}function j(e){return!!e.filter&&(e.views.filter={},void(te.jsonModel.views.filter||(te.jsonModel.views.filter={})))}function C(){var e=angular.copy(te.fieldEdit);e.id=te.sectionSelected.fields.length,"main"==te.sectionSelected.type&&te.jsonModel.fields.push(e),te.sectionSelected.fields.push(e)}function T(){te.sectionSelected=te.sections[0]}function B(){}function L(e){return!!te.sections.length&&(te.sections.length&&!te.sectionSelected&&T(),te.fieldEdit={meta:{},views:{}},e&&(te.fieldEdit.meta.bind=e.alias),A(),void(te.sectionSelected.onNewField=!0))}function U(e){return te.sectionSelected!==te.sections[e]&&(te.sectionSelected&&(te.sectionSelected.onNewField=!1),void(te.sectionSelected=te.sections[e]))}function N(){te.sectionSelected.onNewField=!1,A()}function O(){R(te.sections)}function R(e){te.jsonModel.key=te.jsonModel.label.replace(/\s/g,"-").toLowerCase(),console.log(JSON.stringify(te.jsonModel))}function _(){te.onEditField=!0,te.onNewSection=!1,te.onTypeField=!1,te.onComponents=!1}function k(){te.onComponents=!0,te.onNewSection=!1,te.onNewField=!1,te.onTypeField=!1,te.onEditField=!1,te.onCreateButton=!1}function $(){te.onNewSection=!0,te.onComponents=!1,te.onTypeField=!1}function A(){te.onTypeField=!0,te.onEdit=!1,te.onComponents=!1,te.onEditField=!1}function D(){te.onCreateButton=!0,te.onComponents=!1}function P(e,t){te.jsonModel.views[e].actions.splice(t,1)}function q(){te.configForm={label:te.jsonModel.label,dataSource:te.jsonModel.dataSource,module:te.jsonModel.module,template:te.jsonModel.template,description:te.jsonModel.description},o.getApps().then(function(e){te.apps=e.data}),te.onConfigForm=!0}function J(e){return o.getModule(e).then(function(e){te.module=e.data,te.entities=e.data["data-sources"]})}function V(e){return o.getEntities(e).then(function(e){te.entities=e.data})}function H(e){var t;te.entities.forEach(function(n,i){n.name==e&&(t=n.id)}),o.getFieldsByEntity(t).then(function(e){te.data.entityFields=e.data.attributes})}function z(){angular.extend(te.jsonModel,te.configForm),te.onConfigForm=!1}function I(){te.configForm={},te.onConfigForm=!1}function K(){angular.extend(te.editBt,{}),k()}function Y(e,t){te.fieldEdit=e,_()}function G(){angular.isUndefined(te.mapEdit.index)&&te.editBt.mapExpression.push(te.mapEdit),Q()}function X(e,t){te.mapEdit=e,te.mapEdit.index=t}function Q(){te.mapEdit=!1}function W(){te.mapEdit={newMap:!0}}function Z(){te.editBt.mapExpression.splice(1,te.mapEdit.index),Q()}function ee(){if(!te.jsonModel.views.edit.breadcrumb.length&&!n.params.id){var e=te.jsonModel.views.edit.breadcrumb;e.push({label:te.module.title}),e.push({divisor:">"}),e.push({label:te.jsonModel.label}),e.push({divisor:">"}),e.push({label:"Recurso Id"})}}var te=this;angular.extend(te,{onComponents:!0,data:{},sections:[],actions:[],activate:l,addButton:u,saveEditField:y,setNewField:L,setTypeField:E,editField:Y,cancelEditField:N,addSection:B,addNewSection:g,setNewSection:b,selectSection:U,cancelNewSection:h,showTypeFields:A,showConfigBt:D,editButton:f,saveEditButton:p,addMapToBt:m,cancelCreateButton:K,removeBt:P,addCustomButton:c,showComponents:k,saveForm:O,showConfigForm:q,saveConfigForm:z,cancelConfigForm:I,saveVisibleMap:G,addVisibleMap:W,editVisibleMap:X,removeVisibleMap:Z,getEntitiesByModule:V,getFieldsByEntity:H,getModule:J}),s()}angular.module("studio-v2").controller("FormEditController",e),e.$inject=["$scope","$q","$state","jsonForm","httpService"]}(),function(){function e(){function e(e,t){function n(e){e.dataTransfer.effectAllowed="move";var t=e.dataTransfer.items;return t.add(this.innerHTML,"text/html"),t.add(this.id,"text/plain"),this.classList.add("onDrag"),!1}function i(e){return this.classList.remove("onDrag"),!1}var o=t[0];o.draggable=!0,o.addEventListener("dragstart",n),o.addEventListener("dragEnd",i,!1)}return{link:e,dragCallback:"="}}angular.module("studio-v2").directive("draggable",e)}(),function(){function e(){function e(e,t){function n(e){return e.preventDefault&&e.preventDefault(),e.dataTransfer.dropEffect="move",this.classList.add("dragOver"),!1}function i(e){return this.classList.add("dragOver"),!1}function o(e){e.stopPropagation&&e.stopPropagation(),this.classList.remove("dragOver");var t=document.getElementById(e.dataTransfer.getData("text/plain"));return t.innerHTML=this.innerHTML,this.innerHTML=e.dataTransfer.getData("text/html"),!1}function s(e){return this.classList.remove("dragOver"),!1}var a=t[0];a.draggable=!0,a.addEventListener("dragover",n),a.addEventListener("dragEnter",i,!1),a.addEventListener("dragLeave",s,!1),a.addEventListener("drop",o,!1)}return{link:e,dropCallback:"="}}angular.module("studio-v2").directive("droppable",e)}(),function(){function e(e,t){function n(e){var n="https://studio-v2.inpaas.com/api/studio/modules/".concat(e);return t({method:"get",url:n})}function i(){var e="https://studio-v2.inpaas.com/api/studio/apps";return t({method:"get",url:e})}function o(e){var n="https://studio-v2.inpaas.com/api/studio/modules/".concat(e).concat("/entities");return t({method:"get",url:n})}function s(e){var n="https://studio-v2.inpaas.com/api/studio/entities/".concat(e);return t({method:"get",url:n})}function a(e){var n="https://studio-v2.inpaas.com/api/studio/modules/5/forms-v2/".concat(e);return t({method:"get",url:n})}return{getModule:n,getApps:i,getEntities:o,getFieldsByEntity:s,getForm:a}}angular.module("studio-v2").service("httpService",e),e.$inject=["$q","$http"]}(),function(){function e(t,n,i){function o(){return f()}function s(e){b.key=e}function a(e){b.label=e}function r(t){angular.extend(e.pagination,t)}function d(){}function l(){}function u(){}function c(e,t){}function f(){return{key:"",label:"Form Title",pagination:{type:"server",countPerPage:10},dataSource:{},views:{list:{actions:[{action:"new",name:"new"}],breadcrumb:[]},edit:{actions:[{action:"save",label:n("translate")("button.save.title"),name:"save",visible:{type:"map",expression:{id:23}}},{action:"savenew",label:n("translate")("button.savenew.title"),name:"save_new",visible:{type:"function",expression:"(function (data){ console.log(data) })"}},{action:"duplicate",label:n("translate")("button.duplicate.title"),name:"duplicate"},{action:"remove",label:n("translate")("button.remove.title"),name:"remove"},{action:"cancel",label:n("translate")("button.cancel.title"),name:"cancel"}],breadcrumb:[]}},fields:[]}}function p(e){}function m(){var e=t.defer();return e.resolve(f()),e.promise}function v(e){var t;return t=e?i.getForm(e).then(function(e){var t=e.data;return JSON.parse(t.json)}):m()}function g(){return["new","list.remove","list.view_edit","list.custom","list.modal","modal","custom","cancel","remove","save","save_new","duplicate","include.add","include.row.edit"]}var b=o();return{editKeyForm:s,editLabelForm:a,editPagination:r,editBreadcrumb:d,editDataSource:l,editViews:u,buildFields:c,saveJsonForm:p,getJsonForm:v,getActionsTypes:g}}angular.module("studio-v2").service("jsonForm",e),e.$inject=["$q","$filter","httpService"]}();