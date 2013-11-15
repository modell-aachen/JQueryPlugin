#!/usr/bin/perl -w
BEGIN {
    unshift @INC, split( /:/, $ENV{FOSWIKI_LIBS} );
}
use Foswiki::Contrib::Build;

# Create the build object
$build = new Foswiki::Contrib::Build('JQueryPlugin');

$build->{UPLOADTARGETWEB} = 'Extensions';
$build->{UPLOADTARGETPUB} = 'http://extensions.open-quality.com/pub';
$build->{UPLOADTARGETSCRIPT} = 'http://extensions.open-quality.com/bin';
$build->{UPLOADTARGETSUFFIX} = '';

# Build the target on the command line, or the default target
$build->build( $build->{target} );

