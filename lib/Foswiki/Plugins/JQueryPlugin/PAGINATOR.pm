# See bottom of file for license and copyright information
package Foswiki::Plugins::JQueryPlugin::PAGINATOR;
use strict;
use warnings;

use Foswiki::Func                          ();
use Foswiki::Plugins::JQueryPlugin::Plugin ();
our @ISA = qw( Foswiki::Plugins::JQueryPlugin::Plugin );

=begin TML

---+ package Foswiki::Plugins::JQueryPlugin::PAGINATOR

This is the perl stub for the jquery.paginator plugin.

=cut

=begin TML

---++ ClassMethod new( $class, ... )

Constructor

=cut

sub new {
    my $class = shift;

    my $this = bless(
        $class->SUPER::new(
            name         => 'Paginator',
            version      => '0.0.1',
            author       => 'Daniel Supplieth',
            homepage     => 'http://foswiki.org/Extensions/JQueryPlugin',
            tags         => 'PAGINATOR',
            css          => ['jquery.paginator.css'],
            javascript   => ['jquery.paginator.js'],
            dependencies => [ 'metadata', 'livequery' ],
        ),
        $class
    );

    return $this;
}

=begin TML

---++ ClassMethod handlePaginator ( $this, $params, $topic, $web ) -> $result

Tag handler for =%<nop>PAGINATOR%=.

=cut

sub handlePaginator {
    my ( $this, $params, $theTopic, $theWeb ) = @_;

    my $url       = $params->{url}     || Foswiki::Func::getScriptUrl() . '/rest/RenderPlugin/template';
    my $getData   = "";
    unless( $params->{url} ) {
        $getData  = "data-topic=\"$params->{topic}\" data-name=\"$params->{name}\" " .
                   "data-expand=\"$params->{expand}\"";
        $getData .= "data-data=\"$params->{data}\"";
    }
    my $nextText  = $params->{nexttext} || Foswiki::Func::expandTemplate("PagerNext") || "&#187;";
    my $prevText  = $params->{prevtext} || Foswiki::Func::expandTemplate("PagerPrev") || "&#171;";
    my $perPage   = $params->{perpage} || 20;
    my $total     = $params->{total}   || 0;
    my $sort      = "";
    my $randClass = "page_" . int(rand(99999));
    if ( $params->{sort} ) {
       $sort     .= "data-sort=\"$params->{sort}\"";
    }
    return
        "<div class=\"responseData $randClass\"></div><div class=\"renderPagination $randClass\"></div>" .
        "<div class=\"jqPaginator $randClass\" data-total=\"$total\" data-perPage=\"$perPage\" data-url=\"$url\"".
        " data-prevtext=\"$prevText\" data-nexttext=\"$nextText\" $getData $sort></div>";
}

1;

__END__
Foswiki - The Free and Open Source Wiki, http://foswiki.org/

Copyright (C) 2010-2015 Foswiki Contributors. Foswiki Contributors
are listed in the AUTHORS file in the root of this distribution.
NOTE: Please extend that file, not this notice.

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version. For
more details read LICENSE in the root of this distribution.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

As per the GPL, removal of this notice is prohibited.
