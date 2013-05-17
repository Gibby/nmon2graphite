/*
# Program name: nmon2graphite jquery/javascript script.
# Purpose: jquery/javascript cgi script for nmon2graphite web interface.
# Author: Benoit C chmod666.org.
# Contact: bleachneeded@gmail.com
# Disclaimer: this programm is provided "as is". please contact me if you found bugs.
# Last update :  Apr 17, 2013
# Version : 0.1a
# This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
# To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
# a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.
*/

/* # fill pseries select box */
function f_pseries_select(graphite_ip, select_pseries) {
  $.getJSON("http://"+graphite_ip+"/render?target=nmon.*.list&format=json&jsonp=?",null,function(result) {
    $.each(result, function(i, item) {
      var values = result[i].target.split(".");
      $(select_pseries).append(new Option(values[1],values[1],true,true));
    });
  });
}

/* # fill lpars select box */
function f_lpars_select(graphite_ip, select_pseries, select_lpars) {
  $(select_lpars).empty();
  var current_val = $(select_pseries).val();
  $.getJSON("http://"+graphite_ip+"/render?target=nmon."+current_val+".*.list&format=json&jsonp=?",null,function(lpars_result) {
    $.each(lpars_result, function(i, item){
      var lpar_values = lpars_result[i].target.split(".");
      $(select_lpars).append(new Option(lpar_values[2],lpar_values[2],true,true));
    });
  });
}

/* # inittimers */
function f_init_times(date_from, time_from, date_until, time_until) {
  var current_date   = new Date();
  var current_month  = ("0" + (current_date.getMonth() + 1)).slice(-2);
  var current_day    = ("0" + current_date.getDate()).slice(-2);
  var current_year   = current_date.getFullYear();
  var current_hour   = ("0" + current_date.getHours()).slice(-2);
  var current_minute = ("0" + current_date.getMinutes()).slice(-2);
  $(date_until).val(current_year+"/"+current_month+"/"+current_day);
  $(time_until).val(current_hour+":"+current_minute);
  $(date_until).AnyTime_picker({format: "%Y/%m/%d", labelTitle: "Date",firstDOW: 1});
  $(time_until).AnyTime_picker({format: "%H:%i", labelTitle: "Hour", labelHour: "Hour", labelMinute: "Minute"});
  current_date.setDate(current_date.getDate()-1);
  current_month  = ("0" + (current_date.getMonth() + 1)).slice(-2);
  current_day    = ("0" + current_date.getDate()).slice(-2);
  current_year   = current_date.getFullYear();
  current_hour   = ("0" + current_date.getHours()).slice(-2);
  current_minute = ("0" + current_date.getMinutes()).slice(-2);
  $(date_from).val(current_year+"/"+current_month+"/"+current_day);
  $(time_from).val(current_hour+":"+current_minute);
  $(date_from).AnyTime_picker({format: "%Y/%m/%d", labelTitle: "Date",firstDOW: 1});
  $(time_from).AnyTime_picker({format: "%H:%i", labelTitle: "Hour", labelHour: "Hour", labelMinute: "Minute"});
}

/* # real time or not ? */
function f_toggle_real_time(real_time, real_unit, real_checkbox, graphs_div, date_from, time_from, date_until, time_until, checkbox_class, interval_array){
  $(real_time).attr('disabled','disabled');
  $(real_unit).attr('disabled','disabled');
  $(real_checkbox).click(function() {
    var $this = $(this);
    if ($this.is(':checked')) {
      $(date_from).attr('disabled','disabled');
      $(date_until).attr('disabled','disabled');
      $(time_until).attr('disabled','disabled');
      $(time_from).attr('disabled','disabled');
      $(real_time).removeAttr('disabled');
      $(real_unit).removeAttr('disabled');
      $(checkbox_class).prop('checked', false);
      $(graphs_div).children('img').remove();
      $(graphs_div).children('a').remove();
    } 
    else {
      $(date_from).removeAttr('disabled');
      $(date_until).removeAttr('disabled');
      $(time_until).removeAttr('disabled');
      $(time_from).removeAttr('disabled');
      $(real_time).attr('disabled','disabled');
      $(real_unit).attr('disabled','disabled');
      $(checkbox_class).prop('checked', false);
      $(graphs_div).children('img').remove();
      $(graphs_div).children('a').remove();
      /* # clearing all intervals */
      $.each(interval_array, function(index, value) { 
        clearInterval(interval_array[index]);
      });
    } 
  });
}

/* # auto_scale or not ?*/
function f_toggle_auto_scale(scale_checkbox, width_value) {
  $(scale_checkbox).click(function() {
    var $this = $(this);
    if ($this.is(':checked')) {
      $(width_value).attr('disabled','disabled');
    } else {
      $(width_value).removeAttr('disabled');
    }
  });
}

/* # caculate different between from date and until date in secondes */
function f_calculate_autoscale(date_from, time_from, date_until, time_until, interval_sec) {
  var array_date_value_from  = $(date_from).val().split('/');
  var array_date_value_until = $(date_until).val().split('/');
  var array_time_value_from  = $(time_from).val().split(':');
  var array_time_value_until = $(time_until).val().split(':');
  var date_from_picked = new Date(array_date_value_from[0],array_date_value_from[1],array_date_value_from[2],array_time_value_from[0],array_time_value_from[1],0,0);
  var date_until_picked = new Date(array_date_value_until[0],array_date_value_until[1],array_date_value_until[2],array_time_value_until[0],array_time_value_until[1],0,0);
  var epoch_from        = date_from_picked.getTime()/1000.0;
  var epoch_until       = date_until_picked.getTime()/1000.0;
  var number_of_seconds = epoch_until-epoch_from;
  var size              = number_of_seconds/interval_sec;
  return size;
}

function f_upload_and_progress_bar(progress_box, progress_bar, status_txt, submit, form, output) {
  var progressbox     = $(progress_box);
  var progressbar     = $(progress_bar);
  var statustxt       = $(status_txt);
  var submitbutton    = $(submit);
  var myform          = $(form);
  var output          = $(output);
  var completed       = '0%';

  $(form).ajaxForm({
    beforeSubmit: function() {                                          // # before sending form
      submitbutton.attr('disabled', '');                                // # disable upload button
      statustxt.empty();
      progressbox.slideDown();                                          // # show progressbar
      progressbar.width(completed);                                     // # initial value 0% of progressbar
      statustxt.html(completed);                                        // # set status text
      statustxt.css('color','#000');                                    // # initial color of status text
    },
    uploadProgress: function(event, position, total, percentComplete) { // # on progress
      progressbar.width(percentComplete + '%')                          // # update progressbar percent complete
      statustxt.html(percentComplete + '%');                            // # update status text
      if(percentComplete>50) {
        statustxt.css('color','#fff');                                  // # change status text to white after 50%
      }
    },
    complete: function(response) {                                     // # on complete
      output.html(response.responseText);                              // # update element with received data
      myform.resetForm();                                              // # reset form
      submitbutton.removeAttr('disabled');                             // # enable submit button
      progressbox.slideUp();                                           // # hide progressbar
    }
  });
}

/* # redraw all graphs */
function f_redraw_graphs(graph_div, date_from, time_from, date_until, time_until, checkbox_real_time, real_time_value, real_time_unit, interval_array, checkbox_auto_scale, width, interval_sec) {
  /* # clearing all intervals already open */
  f_clear_all_timeout(interval_array);
  
  /* # step 1 : find all images in graph div */ 
  $(graph_div).find('img').each( function(){
    var graph_string        = this.src;
    var image_id            = $(this).attr('class');
    var from_date_formated  = $(time_from).val()+"_"+$(date_from).val().replace(/\//g,"");
    var until_date_formated = $(time_until).val()+"_"+$(date_until).val().replace(/\//g,"");
    graph_string            = graph_string.replace(/"/g,"%22");
    graph_string            = graph_string.replace(/ /g,"%20");
    /* # replace existing from and until date by new ones */
    graph_string            = graph_string.replace(/from=\d{2}:\d{2}_\d{8}/g,"from="+from_date_formated);
    graph_string            = graph_string.replace(/until=\d{2}:\d{2}_\d{8}/g,"until="+until_date_formated);
    /* # if real timed already checked and real time value changed, value will be replaced below */
    graph_string            = graph_string.replace(/from=-[0-9]+[h|min]/g,"from="+from_date_formated);
	
    /* # if real time check */
    if ($(checkbox_real_time).prop("checked")) {
      /* # get new values ...*/
      from_date_formated = "-"+$(real_time_value).val()+$(real_time_unit).val();
      /* # replace from ...*/
      graph_string = graph_string.replace(/from=\d{2}:\d{2}_\d{8}/g,"from="+from_date_formated);
      /* # and delete until ...*/
      graph_string = graph_string.replace(/\&until=\d{2}:\d{2}_\d{8}/g,'');
    }
	
    /* # add a uniqattr if exists, or replace if it doesnt exisits */
    if(graph_string.indexOf("uniqattr") >= 0) {
      graph_string = graph_string.replace(/uniqattr=[0-9]+/,"uniqattr="+Math.floor(Math.random()*10000));
    }
    else {
      graph_string = graph_string+"&uniqattr="+Math.floor(Math.random()*10000);
    }
	
    /* # if real time check, add an interval */
    if ($(checkbox_real_time).prop("checked")) {
      graph_string=graph_string.replace(/uniqattr=[0-9]+/,"");
      var current_length=interval_array.length;
      $("."+image_id).attr('src',graph_string);
      interval_array[current_length]=setInterval(function() {
        f_change_image_src("."+image_id, graph_string+"&uniqattr="+Math.floor(Math.random()*10000)) 
	    }, interval_sec*100);
    }
    /* # else redraw the image */
    else {
      $("."+image_id).attr('src',graph_string);
    }
  });

  /* # step 2 : recreate all links for auto scaling */
  $(graph_div).find('a').each( function() {
    var href_string           = $(this).attr('href');
    var href_id               = $(this).attr('class');
    var from_date_formated_h  = $(time_from).val()+"_"+$(date_from).val().replace(/\//g,"");
    var until_date_formated_h = $(time_until).val()+"_"+$(date_until).val().replace(/\//g,"");
    href_string               = href_string.replace(/"/g,"%22");
    href_string               = href_string.replace(/ /g,"%20");
    href_string               = href_string.replace(/from=\d{2}:\d{2}_\d{8}/g,"from="+from_date_formated_h);
    href_string_link          = href_string.replace(/width=[0-9]+/g,"width="+$(width).val());
	
    if ($(checkbox_real_time).prop("checked")) {
      from_date_formated = "-"+$(real_time_value).val()+$(real_time_unit).val();
      href_string_link   = href_string_link.replace(/from=-[0-9]+[h|min]/g,"from="+from_date_formated);
    }
	
    if ($(checkbox_auto_scale).is(':checked')) {
      /* # if auto_scale check update graph_string_link with good width */
      var width_autoscaled_f = f_calculate_autoscale(date_from, time_from, date_until, time_until, interval_sec);
      href_string_link       = href_string.replace(/width=[0-9]+/g,"width="+width_autoscaled_f);
    }
	
    $("."+href_id).attr('href',href_string_link);
  });
}

function f_clear_all_timeout(array_timeout) {
  var highest_id = array_timeout.length; 
  for (var i=0 ; i < highest_id ; i++) {
    clearInterval(array_timeout[i]);
  }
  array_timeout.length=0;
}

function f_change_image_src(image_class, source_string) {
 $(image_class).attr('src',source_string);
}

function f_add_graph(graphite_url,graph_container,graph_url,graph_link,graph_identifier,date_from_container,time_from_container,date_until_container,time_until_container,interval,checkbox_real_time,intervals_array) {
  $("<a class=href_"+graph_identifier+" href=http://"+graphite_url+"/render?"+graph_link+"><img class=img_"+graph_identifier+" src=\"http://"+graphite_url+"/render?"+graph_url+"\"/></a>").appendTo(graph_container);
  
  /* # if auto scale */
  if ($('#auto_scale').is(':checked')) {
    /* # if auto_scale checked update graph_string_link with good width */
    var width_autoscaled = f_calculate_autoscale(date_from_container, time_from_container, date_until_container, time_until_container, interval);
    graph_link           = graph_link.replace(/width=1000/g,"width="+width_autoscaled);
  }
  
  /* # if real time */
  if ($(checkbox_real_time).prop("checked")) {
    var current_length = intervals_array.length;
    intervals_array[current_length]=setInterval(function() { f_change_image_src(".img_"+graph_identifier,"http://"+graphite_url+"/render?"+graph_url+"&uniqattr="+Math.floor(Math.random()*10000))}, interval*100);
  }
}

/* # document ready */
$(document).ready(function (){

  var graph_file = "graphlist.txt"
 
  /* # Put graphite box IP here */
  var graphite_url = "10.10.10.10";
  
  /* # Put nmon interval here ; in seconds */
  var nmon_interval = "30";
  
  /* # vars fixed*/
  var real_time_intervals = [];
  var graphs_to_draw      = [];
  var graphs_to_draw_link = [];
  var width_autoscaled;
  var graph_string_link;
  
  /* # enabling tooltips */
  $(document).tooltip();
  
  /* # clear intervals before starting */
  f_clear_all_timeout(real_time_intervals);

  /* # fill chooseboxes */
  f_pseries_select(graphite_url, '#pseries');
  $('#pseries').change(function() {
     f_lpars_select(graphite_url, '#pseries', '#lpars')
  });
  $('#pseries').focus(function() {
     f_lpars_select(graphite_url, '#pseries', '#lpars')
  });

  f_init_times('#date_value_from', '#time_value_from', '#date_value_until', '#time_value_until');
  f_toggle_real_time('#time_value', '#time_unit', '#real_time_checkbox', '#draw_graphs', '#date_value_from', '#time_value_from', '#date_value_until', '#time_value_until', '.style-checkbox', real_time_intervals);
  f_toggle_auto_scale('#auto_scale', '#width_box');

  /* # if any element of redraw  class change redraw all graphs */
  $('.redraw').change(function() {
    f_redraw_graphs('#draw_graphs', '#date_value_from', '#time_value_from', '#date_value_until', '#time_value_until', '#real_time_checkbox', '#time_value', '#time_unit', real_time_intervals, '#auto_scale', '#width_box', nmon_interval);
  });
  
  $('.redraw').keyup(function() {
    f_redraw_graphs('#draw_graphs', '#date_value_from', '#time_value_from', '#date_value_until', '#time_value_until', '#real_time_checkbox', '#time_value', '#time_unit', real_time_intervals, '#auto_scale', '#width_box', nmon_interval);
  });

  f_upload_and_progress_bar('#progressbox', '#progressbar', '#statustxt', '#nmon2graphite_submit', '#nmon2graphite_form', '#output');

  /* on a checkbox checked draw graph */
  $('#nmon2graphite_form :checkbox').click(function() {

    /* # empty graphs and graph link arrays */
    graphs_to_draw.length      = 0;
    graphs_to_draw_link.length = 0;

    /* # create new id/class for newly created graphs */
    var $this     = $(this);
    var wanted_id = this.id;
    wanted_id     = wanted_id.replace("checkbox_","");

    /* # $this will contain a reference to the checkbox */
    if ($this.is(':checked')) {

      /* # browse the graph file to find associated graphs url render */
      $.get(graph_file,function(data){
        var array = data.split('\n');
        $.each(array, function(index, value) {
          var array_line = value.split(':');

          /* if graph match graph_file */
          if ( array_line[0] == wanted_id ) {
            var from_date_formated=$("#time_value_from").val()+"_"+$("#date_value_from").val().replace(/\//g,"");
            var until_date_formated=$("#time_value_until").val()+"_"+$("#date_value_until").val().replace(/\//g,"");
            var graph_string=array_line[2];
            var sel_pserie=$("#pseries").val();
            var sel_lpar=$("#lpars").val();
            graph_string = graph_string.replace(/"/g,"%22");
            graph_string = graph_string.replace(/ /g,"%20");
            graph_string = graph_string.replace(/PPPPP/g,sel_pserie);
            graph_string = graph_string.replace(/LLLLL/g,sel_lpar);
            if ($("#real_time_checkbox").prop("checked")) {
              graph_string = graph_string.replace(/\&until\=UUUUU/g,'');
              from_date_formated="-"+$('#time_value').val()+$('#time_unit').val();
            }
            graph_string = graph_string.replace(/UUUUU/g,until_date_formated);
            graph_string = graph_string.replace(/SSSSS/g,from_date_formated);

            /* # if fixed scale */
            graph_string_link = graph_string.replace(/width=1000/g,"width="+$("#width_box").val());

            /* # if multiple graphs */
            if ( array_line[0].indexOf("cust") >= 0 ) {
              var cust_index = array_line[4];
              json_string = array_line[3];
              json_string = json_string.replace(/"/g,"%22");
              json_string = json_string.replace(/ /g,"%20");
              json_string = json_string.replace(/PPPPP/g,sel_pserie);
              json_string = json_string.replace(/LLLLL/g,sel_lpar);
              json_string = json_string.replace(/UUUUU/g,until_date_formated);
              json_string = json_string.replace(/SSSSS/g,from_date_formated);
              /* get multiple */
              $.getJSON("http://"+graphite_url+"/render?"+json_string,null,function(cust_result){
                $.each(cust_result, function(i, item) {
                  var my_val             = cust_result[i].target.split(".");
                  var buffer_string      = graph_string;
                  var buffer_string_link = graph_string;
                  buffer_string          = buffer_string.replace(/ZZZZZ/g,my_val[cust_index]);
                  buffer_string_link     = buffer_string.replace(/width=1000/g,"width="+$("#width_box").val());
                  graphs_to_draw[i]      = buffer_string;
                  graphs_to_draw_link[i] = buffer_string_link;
                  f_add_graph(graphite_url,'#draw_graphs',buffer_string,buffer_string_link,wanted_id+"_"+my_val[cust_index],'#date_value_from', '#time_value_from', '#date_value_until', '#time_value_until', nmon_interval,'#real_time_checkbox', real_time_intervals);
                });
              });
            }
            /* if single graph */
            else {
                  f_add_graph(graphite_url,'#draw_graphs',graph_string,graph_string_link,wanted_id,'#date_value_from', '#time_value_from', '#date_value_until', '#time_value_until', nmon_interval,'#real_time_checkbox', real_time_intervals);
            }
          }
        }); 
      });

    /* # removing graph if checkbox uncheked */
    }
	else {
       /* # remove all fixed img */
       $(".img_"+wanted_id).remove();
       /* # remove all cust images */
       $('img[class^="img_cust"]').remove();
    }
  });
});
