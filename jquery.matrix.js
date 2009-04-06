/**
* MySource Matrix Simple Edit Tools (jquery.matrix.js)
* version: 0.2.8 (APR-06-2009)
* Copyright (C) 2009 Nicholas Hubbard
* @requires jQuery v1.2.6 or later
* @requires Trigger or Asset configuration in MySource Matrix
*
* Examples and documentation at: http://www.zedsaid.com/projects/simple-edit-tools
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/


/**
* Function that overrides page_on_load in limbo_outputter.inc.  
* This is nessessary to allow Matrix to open a frame as a stand alone.
*
* @version $Revision: 0.1 $
*/
function page_on_load() {
	SQ_DOCUMENT_LOADED = true;
};


(function ($) {
		  
  
/**
* Plugin that allows Asset Builders to be submitted using Ajax.  
* This is nessessary to allow Matrix to open a from as a stand alone.
*
* @version $Revision: 0.2
*/
$.fn.matrixForm = function (options) {
	var defaults = {
		findCreated: '',
		findTarget: '',
		loading: '',
		errorArray: false,
		errorSource: ''
	};

	var options = $.extend(defaults, options);

	return this.each(function () {

		var obj = $(this);
		var itemHref = obj.attr('action');
		obj.removeAttr('onsubmit');
		
		// Check to see if we are using an asset builder or custom form
		var form_type = $('#sq_commit_button', obj).length === 0;
		
		// Find our submit button for custom forms
		var form_submit = $("input[type='submit']", obj);
		var form_submit_name = form_submit.attr('name');
		var form_submit_val = form_submit.attr('value');
		var form_submit_class = form_submit.attr('class');
		
		// Check to see if we are uploading a file
		if ($(obj + ' input:file').length === 0) {
			$('#sq_commit_button').removeAttr('onclick');
			
			// Choose if we should set click for asset builder or custom form
			if (form_type) {
				var set_click = 'ajax_submit';
				
				// Hide the submit button
				form_submit.hide();
				
				// Add a new button
				form_submit.after('<input id="ajax_submit" type="button" class="' + form_submit_class +'" name="' + form_submit_name +'" value="' + form_submit_val +'" />');
				form_submit.remove();
				
				// Creat our own submit string, since serialize won't grab it
				var ajax_query = '&' + form_submit_name + '=' + form_submit_val + '';
			} else {
				var set_click = 'sq_commit_button';
			}// End else
			
			// Set our click function for commit button
			$('#' + set_click).click(function () {
				$('textarea[name^="news_item"], textarea[name^="calendar_event"]').each(function () {
					var textId = $(this).attr('id');
					$(this).val(eval('editor_' + textId + '.getHTML();'));
				});
				
				// Serialize all form data
				var serializeForm = obj.serialize();
				
				// Submit using Ajax
				$.ajax({
					type: 'POST',
					url: itemHref,
					data: serializeForm + ajax_query,
					beforeSend: function () {
						if (defaults.findTarget !== '') {
							$(defaults.findTarget).show();
						}
						if (defaults.loading !== '') {
							$('#' + set_click).after('<img id="loadingImage" src="' + defaults.loading + '" alt="Loading" />');
						}
					},
					success: function (data) {
						$('#loadingImage').remove();
						if (defaults.findCreated !== '' && defaults.findTarget !== '') {
							$(defaults.findTarget).html($(data).find(defaults.findCreated));
							
							setTimeout(function () {
								$(defaults.findTarget).fadeOut('slow',
									function () {
										$(this).html('');
									});
								},
								5000
								
							);// End timout
							
						}// End if
							
						if (defaults.errorArray) {
							// We don't want to create multiples
							if ($('#errorsHiddenHold').length < 1) {
								// Create a hidden div to hold our errors
								$('body').append('<div id="errorsHiddenHold" style="display:none;"></div>');
							}
							// Add our content
							$('#errorsHiddenHold').html($(data).find(defaults.errorSource));
							
							// Create an array of our error messages
							var arr_errors = new Array();
							$('#errorsHiddenHold li').each(function() { 
								arr_errors.push($(this).text()); 
							});
							
							// Is array empty?
							if (arr_errors.length < 1) {
								var arry_empyty = true;
							} else {
								var arry_empyty = false;
							}// End if
							
							// Display alert if array is not empty
							if (!arry_empyty) {
								alert('Please correct the following errors:\n\n' + arr_errors.toString().replace(',', '\n'));	
							}
							
						}// End if
							
					}// End success
					
				});// End Ajax
				
			});// End Click
			
		} else {
			
			// Use iframe if form is uploading a file
			$('body').append('<iframe id="assetBuilderFrame" name="assetBuilderFrame" style="position:absolute; top:-1000px; left:-1000px;"></iframe>');
			$('#assetBuilderFrame').attr('src', 'javascript:false;document.write("")');
			obj.attr('target', 'assetBuilderFrame');
			
			$('#sq_commit_button').click(function () {
				obj.submit();
			});// End click
	  
		}// End else

	});// End each

};// End matirixForm
  

/**
* This Plugin filters a list of matched elements. Great when used with Asset Listings.  
* Filter searching is similar to iTunes search.
*
* @version $Revision: 0.2
*/
$.fn.matrixFilter = function (options) {
	var defaults = {
		target: 'body',
		count: true
	};

	var options = $.extend(defaults, options);

	// Add our input field and counter
	$(defaults.target).append('<input id="filter" type="text" /> <span id="count"></span>');

	var obj = $(this);
	var total = obj.length;
	if (defaults.count) {
		$('#count').text(total + ' of ' + total);
	}// End if
	
	$('#filter').keyup(function () {
								
		var filter = $('#filter').val(),
		count = 0;
		
		obj.each(function () {
						  
			if ($(this).text().search(new RegExp(filter, 'i')) < 0) {
				$(this).hide();
			} else {
				$(this).show();
				count++;
			}// End else
			
		});// End each
		
		if (defaults.count) {
			$('#count').text(count + ' of ' + total);
		}// End if
	
	}); // End keyup
  
};// End matrixFilter


/**
* This Plugin is used to stay within the same page while opening Simple Edit pages.  
* It creates an iframe, then opens URLs within the iframe.
*
* @version $Revision: 0.2
*/
$.fn.matrixFrame = function (options) {
	var defaults = {
		urlSuffix: '',
		target: 'body'
	};

	var options = $.extend(defaults, options);

	// Add our iFrame
	$(defaults.target).append('<iframe name="assetEditFrame" id="assetEditFrame" scrolling="no" frameborder="0"></iframe>');

	return this.each(function () {

		var obj = $(this);
		var itemHref = obj.attr('href');
		obj.attr('target', 'assetEditFrame');
		obj.attr('href', itemHref + defaults.urlSuffix);
		
	});// End each
	
};// End matrixFrame


/**
* This Plugin will delete single or multiple assets using Ajax.  
* Plugin requires the configuration of a Trigger to delete assets.
*
* @version $Revision: 0.2.5
*/
$.fn.matrixDelete = function (options) {
	var defaults = {
		multiple: false,
		checkboxClass: 'delete',
		checkboxAfter: true,
		urlSuffix: '?action=delete',
		target: 'body',
		simpleEdit: false,
		removeParent: false,
		beforeComplete: function () {},
		onComplete: function () {}
	};
	
	var options = $.extend(defaults, options);
	
	if (defaults.multiple) {
		$(defaults.target).append('<input id="massDelete" type="button" value="Delete Multiple" />');
	}// End if
	
	return this.each(function () {
							  
		var obj = $(this);
		
		// Grab asset info
		var itemDesc = obj.attr('rel'); 
		
		// Remove simple edit url addition for links
		if (!defaults.simpleEdit) {
			var itemHref = obj.attr('href');
		} else {
			var itemHref = obj.attr('href').replace('/_edit', '');
			obj.attr('href', itemHref);
		}// End if
		
		// Add our multiple delete checkbox
		if (defaults.multiple) {
			var deleteCheckbox = '<input class="' + defaults.checkboxClass + '" type="checkbox" value="' + itemHref + '" />';
			if (defaults.checkboxAfter) {
				obj.after(deleteCheckbox);
			} else {
				obj.before(deleteCheckbox);
			}// End else
			
		}// End if
		
		obj.click(function () { 
			// Be nice with our wording
			if (!itemDesc == '') {
				var question = confirm('Are you sure you want to delete "' + itemDesc + '"?');
			} else {
				var question = confirm('Are you sure you want to delete this?');
			}// End else
			
			if (question) {
				// Run our custom callback
				defaults.beforeComplete.apply(obj, []);
			
				$.ajax({
					type: 'POST',
					url: itemHref + defaults.urlSuffix
				});// End ajax
				
				if (defaults.removeParent) {
					obj.parent().remove();
				}// End if
		  
				// Run our custom callback
				defaults.onComplete.apply(obj, []);
		  
			}// End if
			
			return false;
			
		});// End click
		
		// Check to see if the user wants to delete multiples
		if (defaults.multiple) {
			$('#massDelete').unbind('click');
			$('#massDelete').click(function () { 
											
				// Lets count how many items we are going to delete
				var deleteCount = $('.' + defaults.checkboxClass + ':checked').length; 
				
				// Lets be kind with our wording
				if (deleteCount <= 1) {
					var deleteWord = 'item';
				} else {
					var deleteWord = 'items';
				}// End if
				
				var answerDelete = confirm('You are about to delete ' + deleteCount + ' ' + deleteWord + ', are you sure you want to do this?'); 
				
				// If the user confirms, continue
				if (answerDelete) {
					$('input:checked').each(function () {
						// Run our custom callback
						defaults.beforeComplete.apply($(this), []);
						
						// Loop through each match and run a POST for that URL
						$.ajax({
							type: 'POST',
							url: this.value + defaults.urlSuffix
						});// End ajax
				
						// Run our custom callback
						defaults.onComplete.apply($(this), []);
			  
					});// End each
					
					// Check to see if we can remove parents
					if (defaults.removeParent) {
						$(this + ':checked').parent().remove();
					}// End removeParent
			  
				}// End if (answerDelete)
			
			});// End click function
		  
		}// End if (defaults.multiple)
	
	});// End each
  
};// End matrixDelete


/**
* This Plugin will clone the current asset and link to the same parent.  
* Plugin requires the configuration of a Trigger to clone assets.
*
* @version $Revision: 0.2.5
*/
$.fn.matrixClone = function (options) {
	var defaults = {
		limit: 10,
		urlSuffix: '?action=duplicate',
		target: 'body',
		beforeComplete: function () {},
		onComplete: function () {}
	};

	var options = $.extend(defaults, options);

	// Add our duplicate field and button
	$(defaults.target).append('<input id="duplicateInput" type="text" value="" /> <input id="duplicateConfirm" type="button" value="Duplicate" />');

	return this.each(function () {

		var obj = $(this);
		obj.click(function () {
			var itemHref = obj.attr('href');
			var itemDesc = obj.attr('rel');
			$('#duplicateConfirm').unbind('click');
			$('#duplicateConfirm').click(function () {
				var duplicateVal = $('#duplicateInput').val();
				
				// Check if it is a number
				if (isNaN(duplicateVal)) {
					alert('You have entered a value that is not a number. Please enter a number.');
					$('#duplicateInput').val('');
					return false;
				}// End if
				
				var dulicateCheck = parseInt(duplicateVal);
				
				// Check our duplication limit
				if (dulicateCheck <= defaults.limit) {
					if (!itemDesc == '') {
						var cloneAnswer = confirm('Are you sure you want duplicate "' + itemDesc + '" ' + dulicateCheck + ' times?');
					} else {
						var cloneAnswer = confirm('Are you sure you want duplicate this ' + dulicateCheck + ' times?');
					}// End if
					
					if (cloneAnswer) {
				
						// Run our custom callback
						defaults.beforeComplete.apply(obj, []);
				
						for (var i = 1; i <= dulicateCheck; i++) {
							$.ajax({
								type: 'POST',
								url: itemHref + defaults.urlSuffix
							});// End ajax
							
						}// End for loop
			  
						// Run our custom callback
						defaults.onComplete.apply(obj, []);
			  
					}// End if
					
				} else {
					alert('You are limited to ' + defaults.limit + ' duplicates or less, please adjust your value.');
					$('#duplicateInput').val('');
				}// End else
		  
			}); // End DuplicateConfirm
		
			return false;
		
		}); // End obj.click
	  
	});// End each
	
};// End matrixClone

  
/**
* This Plugin will change the status of an asset.  
* Plugin requires the configuration of a Trigger to clone assets.
*
* @version $Revision: 0.2.5
*/
$.fn.matrixStatus = function (options) {
	var defaults = {
		urlSuffix: '?action=live',
		beforeComplete: function () {},
		onComplete: function () {}
	};

	var options = $.extend(defaults, options);

	return this.each(function () {
		var obj = $(this);
		var itemDesc = obj.attr('rel');
		var itemHref = obj.attr('href');
		obj.click(function () {
			
			// Make sure we want to change status
			if (!itemDesc == '') {
				var question = confirm('Are you sure you want to change the status of "'+itemDesc+'"?');
			} else {
				var question = confirm('Are you sure you want to change the status?');
			}// End if
			
			if (question) {
				
				// Run our custom callback
				defaults.beforeComplete.apply(obj, []);
		  
				$.ajax({
					type: 'POST',
					url: itemHref + defaults.urlSuffix
				});// End ajax
		  
				// Run our custom callback
				defaults.onComplete.apply(obj, []);
		  
			}// End if
			
			return false;
		
		});// End click
	  
	});// End each
	
};// End matrixStatus
  

/**
* This Plugin is VERY experimental and hardly even functional.  
* It is used to edit text inline and POST back using ajax.
* Current page URL, %asset_url% must be passed to function
* Work in progress!!
* Plugin requires the configuration of a Trigger to work.
*
* @version $Revision: 0.1
*/
$.fn.matrixEdit = function (options) {
	var defaults = {
		//None yet
	};
	
	var options = $.extend(defaults, options);
	
	return this.each(function () {
		
		var obj = $(this);
		
		obj.click(function () {
			obj.attr('contentEditable', 'true').css('background-color', '#ccc');
		});// End click
		
		obj.blur(function () {
			obj.attr('contentEditable', 'false').css('background-color', '#fff');
		});// End blur
		
		$('#save').click(function () {
			var saveContent = obj.html();
			var currentHref = defaults.currentPage;
			
			$.ajax({
				type: 'POST',
				url: location.href,
				data: '?action=change&details=' + saveContent
			});// End ajax
				
		});// End click
		
	});// End each
	
};// End matrixEdit

  
})(jQuery);