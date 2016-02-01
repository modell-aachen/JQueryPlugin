# See bottom of file for license and copyright information
package Foswiki::Plugins::JQueryPlugin::TABPANE;
use strict;
use warnings;

use Foswiki::Func                          ();
use Foswiki::Plugins::JQueryPlugin::Plugin ();
our @ISA = qw( Foswiki::Plugins::JQueryPlugin::Plugin );

=begin TML

---+ package Foswiki::Plugins::JQueryPlugin::TABPABNE

This is the perl stub for the jquery.tabpane plugin.

=cut

=begin TML

---++ ClassMethod new( $class, ... )

Constructor

=cut

sub new {
    my $class = shift;

    my $this = bless(
        $class->SUPER::new(
            name         => 'Tabpane',
            version      => '1.2.2',
            author       => 'Michael Daum',
            homepage     => 'http://foswiki.org/Extensions/JQueryPlugin',
            tags         => 'TABPABNE, ENDTABPANE, TAB, ENDTAB',
            css          => ['jquery.tabpane.css'],
            javascript   => ['jquery.tabpane.js'],
            dependencies => [ 'metadata', 'livequery', 'easing' ],
        ),
        $class
    );

    return $this;
}

=begin TML

---++ ClassMethod handleTabPane( $this, $params, $topic, $web ) -> $result

Tag handler for =%<nop>TABPANE%=. 

=cut

sub handleTabPane {
    my ( $this, $params, $theTopic, $theWeb ) = @_;

    my $select        = $params->{select}        || 1;
    my $autoMaxExpand = $params->{automaxexpand} || 'off';
    my $minHeight     = $params->{minheight}     || 230;
    my $animate       = $params->{animate}       || 'off';
    my $class         = $params->{class}         || 'jqTabPaneDefault';

    $class =~ s/\b([a-z]+)\b/'jqTabPane'.ucfirst($1)/ge;

    $autoMaxExpand = ( $autoMaxExpand eq 'on' ) ? 'true' : 'false';
    $animate       = ( $animate       eq 'on' ) ? 'true' : 'false';

    if ( Foswiki::Func::getContext()->{static} ) {
        $class .= " jqInitedTabpane jqStatic";
    }

    return
"<div class=\"jqTabPane $class {select:'$select', autoMaxExpand:$autoMaxExpand, animate:$animate, minHeight:$minHeight}\">";
}

=begin TML

---++ ClassMethod handleTab( $this, $params, $topic, $web ) -> $result

Tag handler for =%<nop>TAB%=. 

=cut

sub handleTab {
    my ( $this, $params, $theTopic, $theWeb ) = @_;

    my $theName          = $params->{_DEFAULT}  || $params->{name} || 'Tab';
    my $beforeHandler    = $params->{before}    || '';
    my $afterHandler     = $params->{after}     || '';
    my $afterLoadHandler = $params->{afterload} || '';
    my $url              = $params->{url}       || '';
    my $container        = $params->{container} || '';
    my $tabClass         = $params->{id}        || '';
    my $height           = $params->{height};
    my $width            = $params->{width};
    my $tabId = 'jqTab' . Foswiki::Plugins::JQueryPlugin::Plugins::getRandom();

    my @metaData = ();
    if ($beforeHandler) {

        #    $beforeHandler =~ s/'/\\'/go;
        push @metaData,
          "beforeHandler: function(oldTabId, newTabId) {$beforeHandler}";
    }
    if ($afterHandler) {

        #    $afterHandler =~ s/'/\\'/go;
        push @metaData,
          "afterHandler: function(oldTabId, newTabId) {$afterHandler}";
    }
    if ($afterLoadHandler) {

        #    $afterLoadHandler =~ s/'/\\'/go;
        push @metaData,
          "afterLoadHandler: function(oldTabId, newTabId) {$afterLoadHandler}";
    }
    if ($container) {
        push @metaData, "container: '$container'";
    }
    if ($url) {
        push @metaData, "url: '$url'";
        $tabClass .= ' jqAjaxTab';
    }
    my $metaData = scalar(@metaData) ? ' {' . join( ',', @metaData ) . '}' : '';

    my $style = '';
    $style .= "height:$height;" if defined $height;
    $style .= "width:$width;"   if defined $width;
    $style = "style='$style'" if $style;

    return
"<!-- TAB --><div id='$tabId' class=\"$tabClass jqTab$metaData\">\n<h2 class='jqTabLabel'>$theName</h2>\n<div class='jqTabContents' $style>";
}

=begin TML

---++ ClassMethod handleEndTab( $this, $params, $topic, $web ) -> $result

Tag handler for =%<nop>ENDTAB%=. 

=cut

sub handleEndTab {
    return "</div></div><!-- //ENDTAB -->";
}

=begin TML

---++ ClassMethod handleEndTabPan ( $this, $params, $topic, $web ) -> $result

Tag handler for =%<nop>ENDTABPANE%=. 

=cut

sub handleEndTabPane {
    return "</div><!-- //ENDTABPANE -->";
}

=begin TML

---++ ClassMethod handleTabForEach ( $this, $params, $topic, $web, $topicObject ) -> $result

Tag handler for =%<nop>TABFOREACH%=.

=cut

sub handleTabForEach {
    my ($this, $params, $theTopic, $theWeb, $meta) = @_;
    my @values = split(/\s*,\s*/, $params->{_DEFAULT});
    my @titles; @titles = split(/\s*,\s*/, $params->{titles}) if $params->{titles};
    my $idx = 1;
    my $titleformat = $params->{titleformat} || '$title';
    my $urlformat = $params->{urlformat} || '';
    my $format = $params->{format} || '';
    my $exclude = $params->{exclude} || '';
    my @excludes = split(/\s*,\s*/, $exclude);

    my $session = $Foswiki::Plugins::SESSION;
    my $request = $session->{request};
    my $content_type = $request->param('contenttype');
    my $pdf = defined($content_type) && $content_type =~ /pdf/;

    my $pdfview = $params->{pdfview} || 'first';
    my $pdftitleformat = $params->{pdftitleformat} || '';
    my $pdfformat = $params->{pdfformat};
    my $pdfseparator = $params->{pdfseparator};
    my $render_pdf = $pdf && ($pdfview || $pdftitleformat || $pdfformat || $pdfseparator);

    my @out = $this->handleTabPane({ select => $params->{select} || 1, class => 'simple' });
    @out = () if $render_pdf;

    for my $v (@values) {
        if (grep {/^$v$/} @excludes) {
            shift (@titles);
            next;
        }

        my $title = ($pdf) ? $pdftitleformat : $titleformat;
        my $title_val = shift(@titles) || $v;
        $title =~ s/\$value\b/$v/g;
        $title =~ s/\$index\b/$idx/g;
        $title =~ s/\$title\b/$title_val/g;
        $title = Foswiki::Func::decodeFormatTokens($title);

        my $content = ($pdf && $pdfformat) ? $pdfformat : $format;
        $content =~ s/\$value\b/$v/g;
        $content =~ s/\$index\b/$idx/g;
        $content =~ s/\$title\b/$title_val/g;
        $content = Foswiki::Func::decodeFormatTokens($content);

        if ($render_pdf) {
            return '' if $pdfview eq 'hide';
            next if $pdfview =~ /^id:(.*)$/ && $1 ne $v;
            push @out, "$title$content";
            last if $pdfview eq 'first';
            $idx++;
            next;
        }

        my $url = $urlformat;
        $url =~ s/\$value\b/$v/g;
        $url =~ s/\$index\b/$idx/g;
        $url =~ s/\$title\b/$title_val/g;

        push @out, $this->handleTab({
            _DEFAULT => $title,
            id => $v,
            url => $url,
        }) . $content . $this->handleEndTab;
        $idx++;
    }
    return join(Foswiki::Func::decodeFormatTokens($pdfseparator || "\n\n"), @out) if $render_pdf;
    push @out, $this->handleEndTabPane;
    join('', @out);
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
