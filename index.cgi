#!/usr/bin/perl
# Program name: nmon2graphite cgi perl script.
# Purpose: perl cgi script for nmon2graphite web interface.
# Author: Benoit C chmod666.org.
# Contact: bleachneeded@gmail.com
# Disclaimer: this programm is provided "as is". please contact me if you found bugs. 
# Last update :  Apr 17, 2013
# Version : 0.1a
# This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
# To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
# a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

use strict;
use warnings;
use LWP::Simple;
use CGI;

# all graphite graphs description are in this file
my $graph_list='graphlist.txt';
my $cgi = CGI->new();
print $cgi->header();

# css and js import
print $cgi->start_html( -title => 'nmon2graphite',-style=>[{'src'=>'anytime.css'},{'src'=>'nmon2graphite.css'},{'src'=>'jquery-ui.css'}],-script=>[{-type=>'javascript',-src=>'jquery.js'},{-type=>'javascript',-src=>'nmon2graphite.js'},{-type=>'javascript',-src=>'anytime.js'}, {-type=>'javascript',-src=>'jquery-form.js'}, {-type=>'javascript',-src=>'jquery-migrate.js'},  {-type=>'javascript',-src=>'jquery-ui.js'}, {-type=>'javascript',-src=>'jquery.form.js'}]);
print "<div id=\"full_container\">";

# top and title
print "<div id=\"top_title\">";
  print $cgi->h1("nmon2graphite");
print "</div>";
# start form
print $cgi->start_form( -name => 'nmon2graphite_form', -id => 'nmon2graphite_form',-action=>'do.pl' ,-method => 'POST', enctype=>'multipart/form-data');
#  lpar and frame choice
print "<div class=\"lpar_choice\">";
  print "<fieldset>";
  print "<legend>LPAR choice</legend>";
  print "<div class=\"sep_form\">";
  print $cgi->label("Frame :");
  print $cgi->popup_menu( -name => 'pseries', -id => 'pseries', title=>"Choose pserie from this list, lpars will be automatically updated");
  print "</div>";
  print "<div class=\"sep_form\">";
  print $cgi->label("Lpar :");
  print $cgi->popup_menu( -name => 'lpars', -id => 'lpars', title=>"Choose an lpar");
  print "</div>";
  print "</fieldset>";
print "</div>";
#  interval choice
print "<div class=\"fixed_time\">";
  print "<fieldset>";
  print "<legend>Interval</legend>";
  print "<div class=\"sep_form\">";
  print $cgi->label("From :");
  print $cgi->textfield( -name=>'date_value_from', -id=>'date_value_from', -class=>'redraw', title=>"Choose starting date");
  print $cgi->textfield( -name=>'time_value_from', -id=>'time_value_from', -class=>'redraw', title=>"Choose starting hour");
  print "</div>";
  print "<div class=\"sep_form\">";
  print $cgi->label("To :");
  print $cgi->textfield( -name=>'date_value_until', -id=>'date_value_until', -class=>'redraw', title=>"Choose ending date");
  print $cgi->textfield( -name=>'time_value_until', -id=>'time_value_until', -class=>'redraw', title=>"Choose ending hour");
  print "</div>";
  print "</fieldset>";
print "</div>";
#  real time
print "<div class=\"real_time\">";
  print "<fieldset>";
  print "<legend>Real time</legend>";
  print $cgi->checkbox(-name=>"real_time_checkbox", -id=>"real_time_checkbox", -class=>'redraw', -label=>"", title=>"Click on this checkbox to enable/disable realtime graphing, all already displayed graphs will be deleted");
  print $cgi->label("From :");
  print $cgi->textfield( -name=>'time_value', -value=>'1', -id=>'time_value', -class=>'redraw', -title=>"Realtime graphing will graph from now until this value");
  print $cgi->popup_menu( -name => 'time_unit', -values => [ 'h', 'min' ] , -default => 'h', -id => 'time_unit', -class=>'redraw');
  print "until now";
  print "</fieldset>";
print "</div>";
print "<div class=\"width_scale\">";
  print "<fieldset>";
  print "<legend>Scaling/Auto_scaling</legend>";
  print $cgi->p("If the width of the graph in pixel is smaller than the number of datapoints to be graphed, Graphite averages the value at each pixel, you can see peeks by zooming on graph. Choose a width below and click on the graph to open it in a new window with this width :");
  print $cgi->textfield( -name=>'width_box', -value=>'2000', -id=>'width_box', -class=>'redraw', -title=>"Choose a fixed witdh for link width");
  print $cgi->checkbox(-name=>"auto_scale", -id=>"auto_scale", -label=>"Auto scale", -class=>'redraw',-title=>"Enable/Disable link width auto-scaling");
  print "</fieldset>";
print "</div>";
print "<div class=\"inject\">";
  print "<fieldset>";
  print "<legend>Inject nmon file</legend>";
  print $cgi->filefield(-id=>"nmon_file_field", -name=>"nmon_file_field");
  print $cgi->submit(-id=>"nmon2graphite_submit", value=>"Submit");
  print "<div id=\"progressbox\">";
    print "<div id=\"progressbar\">";
    print "</div>";
    print "<div id=\"statustxt\">";
    print "0%";
    print "</div>";
    print "<div id=\"output\">";
    print "</div>";
  print "</div>";
  print "</fieldset>";
print "</div>";
#  metrics
print "<div class=\"all_checkboxes\">";
  print "<fieldset>";
  print "<legend>Metrics</legend>";
  ## graphs checkboxes
  print "<div class=\"checkboxes\">";
  open my $graph_list_fd, $graph_list
    or die "Cannot open $graph_list : $!";
  while ( my $graph_line = <$graph_list_fd> ) {
    my @graph_line_split=split(':',$graph_line);
    print $cgi->checkbox(-name=>$graph_line_split[1], -class=>"style-checkbox", -id=>"checkbox_$graph_line_split[0]", -label=>$graph_line_split[1]);
  }
  print "</div>";
  print "</fieldset>";
print "</div>";
# end form
print $cgi->end_form;
# start graph div
print "<div id=\"all_graphs\">";
  print "<fieldset id=\"draw_graphs\">";
  print "<legend>Graphs</legend>";
  print "</fieldset>";
print "</div>";
# end graph div
print "</div>";
print "<div class=\"clear\"></div>";
print $cgi->end_html;
