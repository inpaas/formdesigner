angular
  .module('studio-v2')
  .directive('codeMirror', InitCodeMirror);

InitCodeMirror.$inject = ['$timeout'];

function InitCodeMirror($timeout) {
  return {
    link: link,
    require: 'ngModel',
    scope: {
      model: '=ngModel'
    }
  }

  function link(scope, elem, attrs, ngModelCtrl) {
    var editor,
        keyMapping = {
          "Ctrl-Q": function(cm){ cm.foldCode(cm.getCursor()); },
          "Cmd-Q": function(cm){ cm.foldCode(cm.getCursor()); },
          "Ctrl-S": save,
          "Cmd-S": save,
          "Ctrl-Space": "autocomplete",
          "Shift-Cmd-Y": function(cm) {
            cm.replaceSelection(cm.getSelection().toLowerCase());
          },
          "Shift-Ctrl-Y": function(cm) {
            cm.replaceSelection(cm.getSelection().toLowerCase());
          },
          "Shift-Cmd-X": function(cm) {
            cm.replaceSelection(cm.getSelection().toUpperCase());
          },
          "Shift-Ctrl-X": function(cm) {
            cm.replaceSelection(cm.getSelection().toUpperCase());
          },
      },
      defaultOptions = {
        lineNumbers: true,
        matchBrackets: true,
        mode: {name: "javascript", globalVars: true},
        foldGutter: true,
        autoCloseBrackets: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        extraKeys: keyMapping
      };

    if(scope.model){
      elem.val(scope.model);
    }

    //Pelo fato de que a modal é carregada async, o codemirror não inicializa corretamente antes
    //terminar o compile da diretiva
    $timeout(initCodeMirror);

    function initCodeMirror(){
      editor = CodeMirror.fromTextArea(elem[0], defaultOptions);
      editor.on('change', updateModel);
    }

    function save(){
      updateModel();
      scope.$ctrl.ok();
    }

    function updateModel(){
      ngModelCtrl.$setViewValue(editor.getValue());
    }
  } 
}