/*  
 * MODULE: Form Field
 * @author: Rafael Torres
 *
*/

(function ($) {

    //Declaring variables
    var settings = $(".settings");
    var sbProperty = $(".sb-property");
    var alertModal = $(".modal-alert");
    var sbEdit = $(".sb-edit");

    $(document).ready(function () {
        //Getting functions
        btnAction();
        widgetSb();
        newField();
    });

    //Functions of the actions of buttons
    function btnAction() {
      formSettings();

      $("#btnCancelPropriets").on("click", function(){
        settings.hide();
        sbProperty.hide();
        alertModal.hide();
      });
    }

    //Functions form settings
    function formSettings() {
      $("button#settings").on("click", function(){
        settings.show();
        sbProperty.show();
        alertModal.hide();
      });

      $("button#advancedMode").on("click", function(){
        sbProperty.hide();
        alertModal.show();
      });

      $("#cancelModal").on("click", function(){
        sbProperty.show();
        alertModal.hide();
      });
    }

    //Funcion Create Widget 
    function widgetSb(){
      $("#newWidget").on("click", function(){
        $(".sb-widget").show();
        sbEdit.hide();
        $(".active-this").show();
      });

      $("#btnWidgetCancel").on("click", function(){
        $(".sb-widget").hide();
        sbEdit.show();
        $(".active-this").hide();
      });

      $("#btnWidgetSave").on("click", function(){
        $(".sb-widget").hide();
        sbEdit.show();
        $(".active-this").hide();
        $(".row-new-widget").hide();
        $(".row-widget").show();
      });
    }

    //Function Field
    function newField(){
      $("#btnNewField").on("click", function(){
        $(".nav-components").hide();
        $(".sb-field").show();

        $(".active-this").hide();
        $(".row-new-widget").hide();
        $(".row-widget").show();
      });
    }

})(jQuery);