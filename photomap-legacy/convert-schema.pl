#!/usr/bin/perl
use warnings;
use strict;

use File::Slurp;


my $content = read_file("photos.dump.bak");
$content =~ s/(,1\))/,null\)/g;
write_file ("photos.dump",$content);
