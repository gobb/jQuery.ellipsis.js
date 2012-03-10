(function( $ ) {
    $.widget( "hypebeast.ellipsis", {

        // These options will be used as defaults
        options: { 
            ellipsis: '...',
            afterElement: null,
            height: null,
            wrapping: 'word'
        },

        // Set up the widget
        _create: function() {
            var self = this,
                $element = $(self.element);

            // save oringal content
            self.originalContent = $element.clone();

            // add container for testing
            $element.wrapInner('<div style="padding: 0; margin: 0; border: none;" />');
            self.container = $element.children()[0];

            // ellipsis content
            self._ellipsis(self.container);

            // remove the container
            self._removeContainer();
        },

        revert: function() {
            var self = this;

            $(self.element).replaceWith(self.originalContent);
        },

        _removeContainer: function() {
            $(this.container).find('> *:first').unwrap();
        },
        
        /**
         * Ellipsis function.
         * Detect to see if an element need further ellipsis (ellipsisElement function) by appending 
         * element one by one and test the width.
         */
        _ellipsis: function(element) {
            var self = this,
                $elem = $(element),
                $elements = $elem.contents(),
                isTruncated = false;
            
            $elem.empty();

            for (var i = 0, l = $elements.length; i < l; i++) {

                var $node = $($elements[i]);

                if (typeof $node[0] == 'undefined') {
                    continue;
                }

                $elem.append($node);

                if ($node[0].nodeType == 3) {
                    // Test overflow only if node type is "text" because only text
                    // can be truncate.
                    if (self._testOverflow(self.container, self.element)) {
                        // Yes, it overflowed, do ellipsis.
                        isTruncated = self._ellipsisElement($node);
                    }
                } else {
                    isTruncated = self._ellipsis($node);
                }

                if (isTruncated) {
                    break;
                }
            }

            return isTruncated;
        },

        /**
         * Do further text ellipsis on an element, word by word.
         *
         * @param $e            The element going to be ellipsis
         * @param $container    The container used for test height.
         */
        _ellipsisElement: function($e) {
            var self = this,
                $parent = $e.parent(),
                isTruncated = false,
                e           = $e[0],
                $after = $(self.options.afterElement);

            if (typeof e == 'undefined') {
                return false;
            }

            var seporator   = (self.options.wrapping == 'letter') ? '' : ' ',
                textArr     = $e.text().split(seporator);

            // Append text
            self.setTextContent(e, textArr.join(seporator) + self.options.ellipsis);

            // Get ready to test height with after element
            if($after.length > 0) {
                var notx = 'a, table, thead, tbody, tfoot, tr, col, colgroup, object, embed, param, ol, ul, dl, select, optgroup, option, textarea';
                $after[$parent.is(notx)?'insertAfter':'appendTo']($parent);
            }

            // Ellipsis text in the element
            for (var a = textArr.length - 1; a >= 0; a--) {
                if (self._testOverflow(self.container, self.element)) {
                    // Overflowed. Cut one word from the end and test again
                    truncate($e, textArr);
                } else {
                    // Done! It fit!
                    isTruncated = true;
                    break;
                }
            }

            // Run this function again if needed
            if (!isTruncated) {
                var $w = $e.parent();
                $e.remove();
                $n = $w.contents().eq(-1);

                if($after) $after.remove();

                isTruncated = self._ellipsisElement($n);
            }

            return isTruncated;

            function truncate($e, textArr) {
                var e = $e[0],
                    end = $e.text().length - (textArr[a].length + seporator.length + self.options.ellipsis.length),
                    text = (end > 0) ? $e.text().substring(0, end) : '';

                if(text.length > 0) {
                    // Cut one word + ellipsis(dotdotdot)
                    self.setTextContent(e, text + self.options.ellipsis);

                    isTruncated = false;
                } else {
                    // No more text can be truncated. 
                    // Truncate its previous element instead.
                    var $parent = $e.parent();
                    $e.remove();

                    // Find a parent node that contain at least one child.
                    while($parent[0].childNodes.length === 0) {
                        var $grandparent = $parent.parent();
                        $parent.remove();
                        $parent = $grandparent;
                    }

                    if($after) $after.remove();

                    // Ellipsis the last element in parent node.
                    isTruncated = self._ellipsisElement($parent.contents().eq(-1));
                }
            }
        },

        /**
         * Test the height of two elements.
         * Return true if need further ellipsis (content is higher than its container.)
         */
        _testOverflow: function (inner, outter) {
            return $(inner).height() > $(outter).height();
        },

        setTextContent: function(e, content) {
            if (e.innerText) {
                e.innerText = content;
            } else if (e.nodeValue) {
                e.nodeValue = content;
            } else if (e.textContent) {
                e.textContent = content;
            }
        },

        // Use the _setOption method to respond to changes to options
        _setOption: function( key, value ) {
            switch( key ) {
                case "ellipsis":
                case "afterElement":
                    // handle changes to clear option
                    break;
            }
       
            $.Widget.prototype._setOption.apply( this, arguments );
        }
    });
}( jQuery ) );