#!/usr/bin/perl

use strict;
use warnings;
use File::Find;
use File::Basename;
use Cwd;


find (sub {
       my $file = $File::Find::name;
       print "looking at $file\n";
       if (-f $file && $file !~ /thumb/ && $file =~ /\.(jpg|JPG)/){
	   print "took file!\n";
	   my ($file,$dir,$suffix) = fileparse($file);
	   my $thumb = "${dir}/thumb${file}";
	   print "processing $file ...\n";
	   system("convert $file -thumbnail x600 -resize '600x<' -resize 50%  -gravity center -crop 300x300+0+0 +repage $thumb");
       }
      },getcwd."/public/photos");
