/*
 * MySource Matrix Simple Edit Tools (jquery.matrix.js)
 * version: 0.9 (OCT-24-2008)
 * Copyright (C) 2008 Nicholas Hubbard
 * @requires jQuery v1.2.6 or later
 * @requires Trigger configuration in MySource Matrix
 *
 * Examples and documentation at: http://www.zedsaid.com/projects/simple-edit-tools
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 */

//Overwrite function so that we can open frames
function page_on_load() {
  SQ_DOCUMENT_LOADED = true;
};

(function($) {
  /*
	 *This Plugin will delete single or multiple assets
	 */
  $.fn.matrixDelete = function(options) {
    var defaults = {
      multiple: false,
      checkboxClass: 'delete',
      urlMatch: 'action=delete'
    };

    var options = $.extend(defaults, options);

    return this.each(function() {

      var obj = $(this);
      var itemId = obj.attr('id');
      var itemHref = obj.attr('href');
      if (defaults.multiple == false) {
        //Display nothing
      } else {
        obj.after('<input id="' + itemId + '" name="' + itemId + '" type="checkbox" value="' + itemHref + '" />').addClass(defaults.checkboxClass);
      }
      obj.click(function() {
        var question = confirm('Are you sure you want to delete asset #' + itemId);
        if (question) {
          $.ajax({
            type: 'POST',
            url: itemHref + '?' + defaults.urlMatch
          });
          obj.hide();
          obj.next('input').hide();
        }
        return false;
      });
    });
  };
  /*
	 *This Plugin will clone the current asset and link to the same parent
	 */
  $.fn.matrixClone = function(options) {
    var defaults = {
      limit: 10
    };

    var options = $.extend(defaults, options);

    $('body').append('<p><input id="duplicateInput" type="text" value="" /> <input id="duplicateConfirm" type="button" value="Duplicate" />');

    return this.each(function() {
      var obj = $(this);

      obj.click(function() {
        var itemId = obj.attr('id');
        var itemHref = obj.attr('href');
        $("#duplicateConfirm").unbind('click');
        $("#duplicateConfirm").click(function() {
          var dulicateCheck = parseInt($('#duplicateInput').val());
          if (dulicateCheck <= defaults.limit) {
            var cloneAnswer = confirm('Are you sure you want duplicate asset #' + itemId + ' ' + dulicateCheck + ' times?');
            if (cloneAnswer) {
              //Loop through number value, posting to the trigger each time
              for (i = 1; i <= dulicateCheck; i++) {
                $.ajax({
                  type: "POST",
                  url: itemHref + "?action=duplicate"
                });
              } // for
            }
          } else {
            alert('You are limited to ' + defaults.limit + ' duplicates or less, please adjust your value.');
            $("#duplicateInput").val("");
          }
        }); //end DuplicateConfirm
        return false;
      }); //end obj.click
    });
  };
  /*
	 *This Plugin will change the status of an asset
	 */
  $.fn.matrixStatus = function(options) {
    var defaults = {
      status: 'live'
    };

    var options = $.extend(defaults, options);

    return this.each(function() {

      var obj = $(this);

      var itemId = obj.attr('id');
      var itemHref = obj.attr('href');
      obj.click(function() {
        var question = confirm('Are you sure you want set the status of asset #' + itemId + ' to ' + defaults.status + '?');
        if (question) {
          $.ajax({
            type: 'POST',
            url: itemHref + '?action=' + defaults.status
          });
        }
        return false;
      });

    });

  };
})(jQuery);