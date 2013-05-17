#!/usr/bin/perl
# Program name: do.pl
# Purpose: jquery/javascript cgi script for nmon2graphite web interface.
# Author: Benoit C chmod666.org.
# Contact: bleachneeded@gmail.com
# Disclaimer: this programm is provided "as is". please contact me if you found bugs.
# Last update :  Apr 17, 2013
# Version : 0.1a
# This work is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported License.
# To view a copy of this license, visit http://creativecommons.org/licenses/by-sa/3.0/ or send
# a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

use strict;
use CGI;

my $upload_dir = "./data";
my $query = new CGI;
print $query->header();
my $filename = $query->param("nmon_file_field");
my $upload_filehandle = $query->upload("nmon_file_field");

open UPLOADFILE, "+>$upload_dir/$filename" or die "cool : $!";
binmode UPLOADFILE;

# uploading the file
while ( <$upload_filehandle> )
{
  print UPLOADFILE;
}

close UPLOADFILE;

my $result = `./nmon2graphite < $upload_dir/$filename`
