/**
 * @fileoverview syncscroll - scroll several areas simultaniously
 * @version 0.0.3
 * 
 * @license MIT, see http://github.com/asvd/intence
 * @copyright 2015 asvd <heliosframework@gmail.com>
 * 
 * Modified by Timur Atalay
 */

(() => {
    var names = {};
    var scroll = () => {
        var elems = document.getElementsByClassName('syncscroll');
        var i, j, el, found, name;
        var scrollSync = (el, name) => {
            el.addEventListener('scroll', el.syn = () => {
                var elems = names[name];
                var scrollY = el.scrollTop;
                var yRate = scrollY / (el.scrollHeight - el.clientHeight);
                var updateY = scrollY != el.eY;

                el.eY = scrollY;
                for (i in elems) {
                    var otherEl = elems[i++];
                    if (otherEl != el) {
                        if (updateY && Math.round(otherEl.scrollTop - (scrollY = otherEl.eY = Math.round(yRate * (otherEl.scrollHeight - otherEl.clientHeight))))) {
                            otherEl.scrollTop = scrollY;
                        }
                    }
                }
            }, 0);
        };

        for (i = 0; i < elems.length;) {
            found = j = 0;
            el = elems[i++];
            if (!(name = el.getAttribute('name'))) continue;

            el = el.scroller || el;
            for (j  in (names[name] = names[name] || [])) {
                found |= names[name][j++] == el;
            }

            if (!found) names[name].push(el);

            el.eX = el.eY = 0;
            scrollSync(el, name);
        }
    };

    if (document.readyState == 'complete') {
        scroll();
    } else {
        window.addEventListener('load', scroll, 0);
    }
})();