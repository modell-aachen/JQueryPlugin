/**
 * foswiki setups wrt jQuery
 *
 * $Rev$
*/
var foswiki;
if (typeof(foswiki) == "undefined") {
  foswiki = {};
}

(function($) {
  /********************************************************
   * populate foswiki obj with meta data
   */
  $("head meta[name^='foswiki.']").each(function() {
    foswiki[this.name.substr(8)]=this.content;
  });

  /********************************************************
  /* dummy to be overridden by jquery.debug */
  $.log = function(message){};
  $.fn.debug = function() {};

})(jQuery);
