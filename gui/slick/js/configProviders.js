$(document).ready(function(){

    $.fn.showHideProviders = function() {
        $('.providerDiv').each(function(){
            var providerName = $(this).attr('id');
            var selectedProvider = $('#editAProvider :selected').val();

            if (selectedProvider + 'Div' == providerName) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    /**
     * Gets categories for the provided newznab provider.
     * @param {String} isDefault
     * @param {Array} selectedProvider
     * @return no return data. Function updateNewznabCaps() is run at callback
     */
    $.fn.getCategories = function (isDefault, selectedProvider) {
    	
    	var name = selectedProvider[0];
    	var url = selectedProvider[1];
    	var key = selectedProvider[2];
    	
    	if (!name)
    		return;
    		
    	if (!url)
    		return;
    	
    	if (!key)
    		return;
    	
    	var params = {url: url, name: name, key: key};
    	var returnData;
    	
    	$(".updating_categories").wrapInner('<span><img src="' + sbRoot + '/images/loading16' + themeSpinner + '.gif"> Updating Categories ...</span>');
    	var jqxhr = $.getJSON(sbRoot + '/config/providers/getNewznabCategories', params,
                function(data){
                    $(this).updateNewznabCaps( data, selectedProvider );
                    console.debug(data.tv_categories);
            });
    	jqxhr.always(function() {
    		$(".updating_categories").empty();
    		 });
    };
    
    $.fn.addProvider = function (id, name, url, key, cat, isDefault, showProvider) {

		url = $.trim(url);
		if (!url)
			return;
			
		if (!/^https?:\/\//i.test(url))
			url = "http://" + url;
		
        if (url.match('/$') == null)
            url = url + '/';

        var newData = [isDefault, [name, url, key, cat]];
        newznabProviders[id] = newData;

        if (!isDefault){
            $('#editANewznabProvider').addOption(id, name);
            $(this).populateNewznabSection();
        }

        if ($('#provider_order_list > #'+id).length == 0 && showProvider != false) {
            var toAdd = '<li class="ui-state-default" id="' + id + '"> <input type="checkbox" id="enable_' + id + '" class="provider_enabler" CHECKED> <a href="' + anonURL + url + '" class="imgLink" target="_new"><img src="' + sbRoot
                + '/images/providers/newznab.png" alt="' + name + '" width="16" height="16"></a> ' + name + '</li>'

            $('#provider_order_list').append(toAdd);
            $('#provider_order_list').sortable("refresh");
        }

        $(this).makeNewznabProviderString();

    }

    $.fn.addTorrentRssProvider = function (id, name, url, cookies) {

        var newData = [name, url, cookies];
        torrentRssProviders[id] = newData;

        $('#editATorrentRssProvider').addOption(id, name);
        $(this).populateTorrentRssSection();

        if ($('#provider_order_list > #'+id).length == 0) {
            var toAdd = '<li class="ui-state-default" id="' + id + '"> <input type="checkbox" id="enable_' + id + '" class="provider_enabler" CHECKED> <a href="' + anonURL + url + '" class="imgLink" target="_new"><img src="' + sbRoot
                + '/images/providers/torrentrss.png" alt="' + name + '" width="16" height="16"></a> ' + name + '</li>'

            $('#provider_order_list').append(toAdd);
            $('#provider_order_list').sortable("refresh");
        }

        $(this).makeTorrentRssProviderString();

    }

    $.fn.updateProvider = function (id, url, key, cat) {

        newznabProviders[id][1][1] = url;
        newznabProviders[id][1][2] = key;
        newznabProviders[id][1][3] = cat;

        $(this).populateNewznabSection();

        $(this).makeNewznabProviderString();

    }

    $.fn.deleteProvider = function (id) {

        $('#editANewznabProvider').removeOption(id);
        delete newznabProviders[id];
        $(this).populateNewznabSection();
        $('li').remove('#'+id);
        $(this).makeNewznabProviderString();

    }

    $.fn.updateTorrentRssProvider = function (id, url, cookies) {
        torrentRssProviders[id][1] = url;
        torrentRssProviders[id][2] = cookies;
        $(this).populateTorrentRssSection();
        $(this).makeTorrentRssProviderString();
    }

    $.fn.deleteTorrentRssProvider = function (id) {
        $('#editATorrentRssProvider').removeOption(id);
        delete torrentRssProviders[id];
        $(this).populateTorrentRssSection();
        $('li').remove('#'+id);
        $(this).makeTorrentRssProviderString();
    }

    $.fn.populateNewznabSection = function() {

        var selectedProvider = $('#editANewznabProvider :selected').val();

        if (selectedProvider == 'addNewznab') {
            var data = ['','',''];
            var isDefault = 0;
            $('#newznab_add_div').show();
            $('#newznab_update_div').hide();
            $('#newznab_cat').attr('disabled','disabled');
            $('#newznab_cap').attr('disabled','disabled');
            $('#newznab_cat_update').attr('disabled','disabled');
            $('#newznabcapdiv').hide();
            
            $("#newznab_cat option").each(function() {
            	$(this).remove();
            	return;
            });
            
            $("#newznab_cap option").each(function() {
            	$(this).remove();
            	return;
            });
            
        } else {
            var data = newznabProviders[selectedProvider][1];
            var isDefault = newznabProviders[selectedProvider][0];
            $('#newznab_add_div').hide();
            $('#newznab_update_div').show();
            $('#newznab_cat').removeAttr("disabled");
            $('#newznab_cap').removeAttr("disabled");
            $('#newznab_cat_update').removeAttr("disabled");
            $('#newznabcapdiv').show();
        }

        $('#newznab_name').val(data[0]);
        $('#newznab_url').val(data[1]);
        $('#newznab_key').val(data[2]);
        
        //Check if not already array
        if (typeof data[3] === 'string') {
        	rrcat = data[3].split(",")
        } 
        else {
        	rrcat = data[3];
        }
        
        // Update the category select box (on the right)
        var newCatOptions = [];
        if (rrcat) {
        	rrcat.forEach(function (cat) {
        		if (cat != "")
        		    newCatOptions.push({text : cat, value : cat});
            });
        	$("#newznab_cat").replaceOptions(newCatOptions);
        };
        
        if (selectedProvider == 'addNewznab') {
            $('#newznab_name').removeAttr("disabled");
            $('#newznab_url').removeAttr("disabled");
        } else {

            $('#newznab_name').attr("disabled", "disabled");

            if (isDefault) {
                $('#newznab_url').attr("disabled", "disabled");
                $('#newznab_delete').attr("disabled", "disabled");
            } else {
                $('#newznab_url').removeAttr("disabled");
                $('#newznab_delete').removeAttr("disabled");
                
                //Get Categories Capabilities
                if (data[0] && data[1] && data[2] && !ifExists($.fn.newznabProvidersCapabilities, data[0])) {
                	$(this).getCategories(isDefault, data);
                }
                $(this).updateNewznabCaps( null, data );
            }
        }
    }

    ifExists = function(loopThroughArray, searchFor) {
    	var found = false;
    	
    	loopThroughArray.forEach(function(rootObject) { 
    		if (rootObject.name == searchFor) {
    			found = true;
    		}
    		console.log(rootObject.name + " while searching for: "+  searchFor);
    	});
    	return found;
    };
    
    /**
     * Updates the Global array $.fn.newznabProvidersCapabilities with a combination of newznab prov name 
     * and category capabilities. Return
     * @param {Array} newzNabCaps, is the returned object with newzNabprod Name and Capabilities.
     * @param {Array} selectedProvider
     * @return no return data. The multiselect input $("#newznab_cap") is updated, as a result.
     */
    $.fn.updateNewznabCaps = function( newzNabCaps, selectedProvider ) {
    	
    	if (newzNabCaps && !ifExists($.fn.newznabProvidersCapabilities, selectedProvider[0])) {
    		$.fn.newznabProvidersCapabilities.push({'name' : selectedProvider[0], 'categories' : newzNabCaps.tv_categories});
    	}
    	
    	//Loop through the array and if currently selected newznab provider name matches one in the array, use it to
        //update the capabilities select box (on the left).
        if (selectedProvider[0]) {
        	$.fn.newznabProvidersCapabilities.forEach(function(newzNabCap) {
            	                    	
            	if (newzNabCap.name && newzNabCap.name == selectedProvider[0] && newzNabCap.categories instanceof Array) {
            			var newCapOptions = [];
            			newzNabCap.categories.forEach(function(category_set) {
        					if (category_set.id && category_set.name) { 
        						newCapOptions.push({value : category_set.id, text : category_set.name + "(" + category_set.id + ")"});
        					}
        				});
        				$("#newznab_cap").replaceOptions(newCapOptions);
            	}
            });
        }
    };
    
    $.fn.makeNewznabProviderString = function() {

        var provStrings = new Array();

        for (var id in newznabProviders) {
            provStrings.push(newznabProviders[id][1].join('|'));
        }

        $('#newznab_string').val(provStrings.join('!!!'))

    }

    $.fn.populateTorrentRssSection = function() {

        var selectedProvider = $('#editATorrentRssProvider :selected').val();

        if (selectedProvider == 'addTorrentRss') {
            var data = ['','',''];
            $('#torrentrss_add_div').show();
            $('#torrentrss_update_div').hide();
        } else {
            var data = torrentRssProviders[selectedProvider];
            $('#torrentrss_add_div').hide();
            $('#torrentrss_update_div').show();
        }

        $('#torrentrss_name').val(data[0]);
        $('#torrentrss_url').val(data[1]);
        $('#torrentrss_cookies').val(data[2]);

        if (selectedProvider == 'addTorrentRss') {
            $('#torrentrss_name').removeAttr("disabled");
            $('#torrentrss_url').removeAttr("disabled");
            $('#torrentrss_cookies').removeAttr("disabled");
        } else {
            $('#torrentrss_name').attr("disabled", "disabled");
            $('#torrentrss_url').removeAttr("disabled");
            $('#torrentrss_cookies').removeAttr("disabled");
            $('#torrentrss_delete').removeAttr("disabled");
        }

    }

    $.fn.makeTorrentRssProviderString = function() {

        var provStrings = new Array();
        for (var id in torrentRssProviders) {
            provStrings.push(torrentRssProviders[id].join('|'));
        }

        $('#torrentrss_string').val(provStrings.join('!!!'))

    }


    $.fn.refreshProviderList = function() {
        var idArr = $("#provider_order_list").sortable('toArray');
        var finalArr = new Array();
        $.each(idArr, function(key, val) {
            var checked = + $('#enable_'+val).prop('checked') ? '1' : '0';
            finalArr.push(val + ':' + checked);
        });

            $("#provider_order").val(finalArr.join(' '));

        $(this).refreshEditAProvider();
    }

    $.fn.refreshEditAProvider = function() {
        $('#provider-list').empty();

        var idArr = $("#provider_order_list").sortable('toArray');
        var finalArr = new Array();
        $.each(idArr, function(key, val) {
            if ($('#enable_'+val).prop('checked')) {
                finalArr.push(val);
            }
        });
        
        if (finalArr.length > 0) {
            $('<select>').prop('id','editAProvider').addClass('form-control input-sm').appendTo('#provider-list');
            for (var i = 0; i < finalArr.length; i++) {
                var provider = finalArr[i];
                $('#editAProvider').append($('<option>').prop('value',provider).text($.trim($('#'+provider).text()).replace(/\s\*$/, '').replace(/\s\*\*$/, '')));
            }
        } else {
            document.getElementsByClassName('component-desc')[0].innerHTML = "No providers available to configure.";
        }

        $(this).showHideProviders();
    }

    var newznabProviders = new Array();
    var torrentRssProviders = new Array();
    
    $(this).on('change', '.newznab_key', function(){

        var provider_id = $(this).attr('id');
        provider_id = provider_id.substring(0, provider_id.length-'_hash'.length);

        var url = $('#'+provider_id+'_url').val();
        var cat = $('#'+provider_id+'_cat').val();
        var key = $(this).val();

        $(this).updateProvider(provider_id, url, key, cat);

    });

    $('#newznab_key,#newznab_url').change(function(){

        var selectedProvider = $('#editANewznabProvider :selected').val();

    if (selectedProvider == "addNewznab")
      return;
    
        var url = $('#newznab_url').val();
        var key = $('#newznab_key').val();

        var cat = $('#newznab_cat option').map(function(i, opt) {
        	  return $(opt).text();
        	}).toArray().join(',');
        
        $(this).updateProvider(selectedProvider, url, key, cat);

    });

    $('#torrentrss_url,#torrentrss_cookies').change(function(){

        var selectedProvider = $('#editATorrentRssProvider :selected').val();

    if (selectedProvider == "addTorrentRss")
      return;

        var url = $('#torrentrss_url').val();
        var cookies = $('#torrentrss_cookies').val();

        $(this).updateTorrentRssProvider(selectedProvider, url, cookies);
    });

    $('body').on('change', '#editAProvider',function(){
        $(this).showHideProviders();
    });

    $('#editANewznabProvider').change(function(){
        $(this).populateNewznabSection();
    });

    $('#editATorrentRssProvider').change(function(){
        $(this).populateTorrentRssSection();
    });

    $(this).on('click', '.provider_enabler', function(){
        $(this).refreshProviderList();
    });

    $('#newznab_cat_update').click(function(){
        console.debug('Clicked Button');
        
        // Maybe check if there is anything selected?
        $("#newznab_cat option").each(function() {
        	$(this).remove();
        });
        
        var newOptions = [];
        
        // When the update botton is clicked, loop through the capabilities list 
        // and copy the selected category id's to the category list on the right.
        $("#newznab_cap option:selected").each(function(){
            var selected_cat = $(this).val();
            console.debug(selected_cat);
            newOptions.push({text: selected_cat, value: selected_cat})
        });
        
        $("#newznab_cat").replaceOptions(newOptions);
        
        var selectedProvider = $("#editANewznabProvider :selected").val();
        if (selectedProvider == "addNewznab")
            return;
          
	    var url = $('#newznab_url').val();
	    var key = $('#newznab_key').val();

	    var cat = $('#newznab_cat option').map(function(i, opt) {
      	  return $(opt).text();
      	}).toArray().join(',');
	    
	    $("#newznab_cat option:not([value])").remove();
	    
        $(this).updateProvider(selectedProvider, url, key, cat);

    });
    
    
    $('#newznab_add').click(function(){

        var selectedProvider = $('#editANewznabProvider :selected').val();

        var name = $.trim($('#newznab_name').val());
        var url = $.trim($('#newznab_url').val());
        var key = $.trim($('#newznab_key').val());
        //var cat = $.trim($('#newznab_cat').val());
        
        var cat = $.trim($('#newznab_cat option').map(function(i, opt) {
        	  return $(opt).text();}).toArray().join(','));
        
        
        if (!name)
        	return;

        if (!url)
        	return;        	

        if (!key)
        	return;

        var params = {name: name};

        // send to the form with ajax, get a return value
        $.getJSON(sbRoot + '/config/providers/canAddNewznabProvider', params,
            function(data){
                if (data.error != undefined) {
                    alert(data.error);
                    return;
                }

                $(this).addProvider(data.success, name, url, key, cat, 0);
        });

    });

    $('.newznab_delete').click(function(){

        var selectedProvider = $('#editANewznabProvider :selected').val();

        $(this).deleteProvider(selectedProvider);

    });

    $('#torrentrss_add').click(function(){
        var selectedProvider = $('#editATorrentRssProvider :selected').val();

        var name = $('#torrentrss_name').val();
        var url = $('#torrentrss_url').val();
        var cookies = $('#torrentrss_cookies').val();
        var params = { name: name, url: url, cookies: cookies}

        // send to the form with ajax, get a return value
        $.getJSON(sbRoot + '/config/providers/canAddTorrentRssProvider', params,
            function(data){
                if (data.error != undefined) {
                    alert(data.error);
                    return;
                }

                $(this).addTorrentRssProvider(data.success, name, url, cookies);
                $(this).refreshEditAProvider();
        });
    });

    $('.torrentrss_delete').on('click', function(){
        var selectedProvider = $('#editATorrentRssProvider :selected').val();
        $(this).deleteTorrentRssProvider(selectedProvider);
        $(this).refreshEditAProvider();
    });


    $(this).on('change', "[class='providerDiv_tip'] input", function(){
        $('div .providerDiv ' + "[name=" + $(this).attr('name') + "]").replaceWith($(this).clone());
        $('div .providerDiv ' + "[newznab_name=" + $(this).attr('id') + "]").replaceWith($(this).clone());
    });

    $(this).on('change', "[class='providerDiv_tip'] select", function(){

    $(this).find('option').each( function() {
      if ($(this).is(':selected')) {
        $(this).prop('defaultSelected', true)
      } else {
        $(this).prop('defaultSelected', false);
      }
    });

    $('div .providerDiv ' + "[name=" + $(this).attr('name') + "]").empty().replaceWith($(this).clone())});

    $(this).on('change', '.enabler', function(){
      if ($(this).is(':checked')) {
          $('.content_'+$(this).attr('id')).each( function() {
              $(this).show()
          })
      } else {
            $('.content_'+$(this).attr('id')).each( function() {
                $(this).hide()
            })
      }
    });

    $(".enabler").each(function(){
        if (!$(this).is(':checked')) {
          $('.content_'+$(this).attr('id')).hide();
        } else {
          $('.content_'+$(this).attr('id')).show();
      }
    });

    $.fn.makeTorrentOptionString = function(provider_id) {

	    var seed_ratio  = $('.providerDiv_tip #'+provider_id+'_seed_ratio').prop('value');
	    var seed_time   = $('.providerDiv_tip #'+provider_id+'_seed_time').prop('value');
	    var process_met = $('.providerDiv_tip #'+provider_id+'_process_method').prop('value');
		var option_string = $('.providerDiv_tip #'+provider_id+'_option_string');	

        option_string.val([seed_ratio, seed_time, process_met].join('|'))

    }

    $(this).on('change', '.seed_option', function(){

        var provider_id = $(this).attr('id').split('_')[0];

		$(this).makeTorrentOptionString(provider_id);

    });
    
    
    $.fn.replaceOptions = function(options) {
        var self, $option;

        this.empty();
        self = this;

        $.each(options, function(index, option) {
          $option = $("<option></option>")
            .attr("value", option.value)
            .text(option.text);
          self.append($option);
        });
      };

    // initialization stuff

    
    $.fn.newznabProvidersCapabilities = [];

    $(this).showHideProviders();

    $("#provider_order_list").sortable({
        placeholder: 'ui-state-highlight',
        update: function (event, ui) {
            $(this).refreshProviderList();
        }
    });

    $("#provider_order_list").disableSelection();

    $(this).populateNewznabSection();

});

