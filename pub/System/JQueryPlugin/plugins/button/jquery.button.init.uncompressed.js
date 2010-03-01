jQuery(function($) {
  $(".jqButton:not(.jqInitedButton)").livequery(function() {
    var $this = $(this), options;
    $this.addClass("jqInitedButton");
    options = $.extend({}, $this.metadata({type:'attr', name:'data'}));
    if (options.onclick) {
      $this.click(function() {
        return options.onclick.call(this);
      });
    }
    // TODO hover
  });
});


