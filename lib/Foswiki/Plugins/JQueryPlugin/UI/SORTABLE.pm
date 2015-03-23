package Foswiki::Plugins::JQueryPlugin::UI::SORTABLE;
use strict;
use warnings;

use Foswiki::Plugins::JQueryPlugin::Plugin;
our @ISA = qw( Foswiki::Plugins::JQueryPlugin::Plugin );

sub new {
    my $class = shift;

    my $this = bless(
        $class->SUPER::new(
            name         => 'UI::Sortable',
            version      => '1.8.23',
            puburl       => '%PUBURLPATH%/%SYSTEMWEB%/JQueryPlugin/ui',
            author       => 'see http://jqueryui.com/about',
            homepage     => 'http://docs.jquery.com/UI',
            javascript   => ['jquery.ui.sortable.js'],
            dependencies => [ 'ui' ],
        ),
        $class
    );

    return $this;
}

1;
