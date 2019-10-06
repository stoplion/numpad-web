/**
 * @copyright 2019 Timur Atalay 
 * @homepage https://github.com/bornova/numpad
 * @license MIT https://github.com/bornova/numpad/blob/master/LICENSE
 */

(() => {
    const appName = 'Numpad';
    const appVersion = '4.4.2';
    const db = {
        defaults: {
            'precision': '4',
            'dateFormat': 'l',
            'inputWidth': '50%',
            'autoRates': true,
            'resizable': true,
            'lineErrors': true,
            'lineNumbers': true,
            'plotRange': {
                'xMin': -10,
                'xMax': 10,
                'yMin': -10,
                'yMax': 10,
                'step': 0.5
            }
        },
        get: (key) => JSON.parse(localStorage.getItem(key)),
        set: (key, value) => localStorage.setItem(key, JSON.stringify(value))
    };

    // Get element by id
    var $ = (id) => document.getElementById(id);

    // Set headers
    $('header-win').remove();
    $('header-mac').style.display = 'block';
    $('header-mac-title').innerHTML = appName;
    document.title = appName;

    $('print-title').innerHTML = appName;

    // Load last calculations and calculate on input change
    $('input').addEventListener('input', calculate);
    // Default content if first visit
    if (!db.get('firstTime')) {
        $('input').value = (
            'version # In addition to all math.js features you can do:\n' +
            '# Dates & Times\n' +
            'today\n' +
            'today + 1 day + 2 weeks\n' +
            'today + 3 days\n' +
            'today - 2 weeks\n' +
            'today + 5 years\n' +
            '5/8/2019 + 1 week\n' +
            'May 8, 2019 - 2 months\n' +
            '\n' +
            'now\n' +
            'now + 2 hours\n' +
            'now + 48 hours\n' +
            'ans + 30 minutes\n' +
            '\n' +
            '# ans token\n' +
            'ans + 5 days\n' +
            '2+2\n' +
            'ans * 5\n' +
            '\n' +
            '# line# token\n' +
            'line19 * 5 / 2\n' +
            'line12 + 10 days\n' +
            '\n' +
            '# Total all numbers up to this point\n' +
            'total\n' +
            '\n' +
            '# Percentages\n' +
            '5% of 100\n' +
            '100 + 5%\n' +
            '100 + 25%%4 + 1\n' +
            '100 + 20% of 100 + 10%3 - 10%\n' +
            '(100 + 20%)% of 80 + 10%3 - 10%\n' +
            '120% of 80 + (10%3 - 10%)\n' +
            'line22% of 80\n' +
            'line22 - ans%\n' +
            'line31 + line19%\n' +
            '\n' +
            '#Currencies (data from floatrates.com)\n' +
            '1 USD to EUR\n' +
            '25 EUR to CAD\n' +
            '\n' +
            '# Plot functions using Plotly\n' +
            'f(x) = sin(x)\n' +
            'f(x) = 2x^2 + 3x -5\n'
        );
        db.set('firstTime', 'no');
    } else {
        $('input').value = db.get('input');
    }

    // Apply settings
    var settings;
    applySettings();

    function applySettings() {
        settings = db.get('settings') || (db.set('settings', db.defaults), db.defaults);
        $('lineNo').style.display = settings.lineNumbers ? 'block' : 'none';
        $('printLines').style.display = settings.lineNumbers ? 'block' : 'none';

        $('handle').style.display = settings.resizable ? 'block' : 'none';
        $('inputCol').style.width = settings.resizable ? settings.inputWidth : '50%';
        $('printInput').style.width = settings.resizable ? settings.inputWidth : '50%';
        $('output').style.textAlign = settings.resizable ? 'left' : 'right';
        $('printOutput').style.textAlign = settings.resizable ? 'left' : 'right';

        $('inputCol').style.marginLeft = settings.lineNumbers ? '0px' : '18px';
        $('printInput').style.marginLeft = settings.lineNumbers ? '0px' : '18px';

        $("wrapper").style.visibility = 'visible';
        calculate();
    }

    // Panel resizer
    var handle = document.querySelector('.handle');
    var panel = handle.closest('.content');
    var resize = panel.querySelector('.resize');
    var isResizing = false;

    $('content').addEventListener('mouseup', (e) => isResizing = false);
    $('content').addEventListener('mousedown', (e) => isResizing = e.target === handle);
    $('content').addEventListener('mousemove', (e) => {
        var offset = $('lineNo').style.display == 'block' ? 54 : 30;
        var pointerRelativeXpos = e.clientX - panel.offsetLeft - offset;
        var iWidth = pointerRelativeXpos / panel.clientWidth * 100;
        var inputWidth = iWidth < 0 ? '0%' : iWidth > 100 ? '100%' : iWidth + '%';
        if (isResizing) {
            resize.style.width = inputWidth;
            settings.inputWidth = inputWidth;
            db.set('settings', settings);
        }
    });

    // Exchange rates
    math.createUnit('USD');
    if (db.get('rates')) createRateUnits();
    if (!db.get('rates') || settings.autoRates) getRates();

    function getRates() {
        if (navigator.onLine) {
            try {
                return fetch('https://www.floatrates.com/widget/00000576/690c690b362ec255080e5f7b3c63bba0/usd.json')
                    .then(response => response.json())
                    .then(data => {
                        db.set('rates', data);
                        createRateUnits();
                        showMsg('Updated exchange rates');
                    });
            } catch (error) {
                showMsg('Failed to get exchange rates');
            }
        } else {
            showMsg('No internet connection');
        }
    }

    function createRateUnits() {
        var data = db.get('rates');
        Object.keys(data).forEach(currency => math.createUnit(data[currency].code, math.unit(data[currency].inverseRate, 'USD'), {
            override: true
        }));
        calculate();
    }

    // App button actions
    $('actions').addEventListener('click', (e) => {
        switch (e.target.id) {
            case 'clearButton': // Clear board
                if ($('input').value != '') {
                    db.set('undoData', $('input').value);
                    $('input').value = '';
                    $('input').focus();
                    calculate();
                    showMsg('Board cleared');
                    $('undoButton').style.visibility = 'visible';
                }
                break;
            case 'printButton': // Print calculations
                if ($('input').value != '') window.print();
                break;
            case 'saveButton': // Save calcualtions
                if ($('input').value !== '') {
                    $('saveTitle').value = '';
                    UIkit.modal('#dialog-save').show();
                }
                break;
            case 'openButton': // Open saved calculations
                UIkit.modal('#dialog-open').show();
                break;
            case 'undoButton': // Undo action
                $('input').value = db.get('undoData');
                $('undoButton').style.visibility = 'hidden';
                calculate();
                break;

            case 'settingsButton': // Open settings dialog
                UIkit.modal('#dialog-settings').show();
                break;
            case 'helpButton': // Open help dialog
                UIkit.modal('#dialog-help').show();
                break;
            case 'aboutButton': // Open app info dialog
                UIkit.modal('#dialog-about').show();
                break;
        }
        e.stopPropagation();
    });

    // Output actions
    $('output').addEventListener('click', (e) => {
        switch (e.target.className) {
            case 'plotButton': // Plot function
                func = e.target.getAttribute('data-func');
                plot();
                break;
            case 'lineError': // Show line error
                var num = e.target.getAttribute('data-line');
                var err = e.target.getAttribute('data-error');
                showError(err, 'Error on Line ' + num);
                break;
        }
        e.stopPropagation();
    });

    // Dialog button actions
    // Dialog defaults
    UIkit.mixin({
        data: {
            bgClose: false,
            stack: true
        }
    }, 'modal');

    document.addEventListener('click', (e) => {
        switch (e.target.id) {
            case 'dialog-save-save': // Save calculation
                var obj = db.get('saved') || {};
                var id = moment().format('x');
                var title = $('saveTitle').value || 'No title';
                var data = $('input').value;

                obj[id] = [title, data];
                db.set('saved', obj);
                UIkit.modal('#dialog-save').hide();
                showMsg('Saved');
                break;
            case 'dialog-open-deleteAll': // Delete all saved calculations
                confirm('All saved calculations will be deleted.', () => {
                    localStorage.removeItem('saved');
                    populateSaved();
                });
                break;
            case 'dialog-settings-save': // Save settings
                settings.precision = $('precisionRange').value;
                settings.dateFormat = $('dateFormat').value;
                settings.lineErrors = $('lineErrorButton').checked;
                settings.lineNumbers = $('lineNoButton').checked;
                settings.resizable = $('resizeButton').checked;
                settings.autoRates = $('autoRatesButton').checked;
                db.set('settings', settings);
                applySettings();
                UIkit.modal('#dialog-settings').hide();
                showMsg('Settings saved');
                break;
            case 'dialog-settings-defaults': // Revert back to default settings
                confirm('All settings will revert back to defaults.', () => {
                    db.set('settings', db.defaults);
                    applySettings();
                    showMsg('Default settings applied');
                    UIkit.modal('#dialog-settings').hide();
                });
                break;
            case 'dialog-settings-reset': // Reset app
                confirm('All user settings and data will be lost.', () => {
                    localStorage.clear();
                    location.reload();
                });
                break;
            case 'updateRatesButton': // Update exchange rates
                getRates();
                break;
            case 'plotRangeButton': // Show plot range settings
                UIkit.modal('#dialog-plotRange').show();
                break;
            case 'set-plotRange': // Save plot range settings
                var allValid = true;
                var plotRange = settings.plotRange;
                Object.keys(plotRange).forEach(key => {
                    var val = $(key).value;
                    var min = $(key).getAttribute('min') || -1000000;
                    var max = $(key).getAttribute('max') || 1000000;

                    if (!isNaN(val) && ((val - min) * (val - max) <= 0)) {
                        $(key).style.backgroundColor = 'transparent';
                        UIkit.tooltip('#' + key).$destroy();
                        plotRange[key] = $(key).value;
                    } else {
                        $(key).style.backgroundColor = 'rgba(179, 49, 49, 0.2)';
                        UIkit.tooltip('#' + key, {
                            title: 'Enter a value between ' + min + ' and ' + max
                        });
                        allValid = false;
                    }
                });
                if (allValid) {
                    db.set('settings', settings);
                    UIkit.modal('#dialog-plotRange').hide();
                    plot();
                }
                break;
            case 'reset-plotRange': // Reset plot range
                confirm('Reset plot range to defaults?', () => {
                    var plotRange = settings.plotRange;
                    Object.keys(settings.plotRange).forEach(key => plotRange[key] = db.defaults.plotRange[key]);
                    db.set('settings', settings);
                    UIkit.modal('#dialog-plotRange').hide();
                    plot();
                });
                break;
            case 'confirm-yes': // Confirmation dialog yes button action
                yesAction();
                UIkit.modal('#dialog-confirm').hide();
                break;
        }

        // Open saved calculations dialog actions
        var pid;
        var saved = db.get('saved');
        if (e.target.parentNode.getAttribute('data-action') == 'load') {
            pid = e.target.parentNode.parentNode.id;
            db.set('undoData', $('input').value);
            $('input').value = saved[pid][1];
            calculate();
            $('undoButton').style.visibility = 'visible';
            UIkit.modal('#dialog-open').hide();
        }
        if (e.target.getAttribute('data-action') == 'delete') {
            pid = e.target.parentNode.id;
            confirm('Calculation "' + saved[pid][0] + '" will be deleted.', () => {
                delete saved[pid];
                db.set('saved', saved);
                populateSaved();
            });
        }
    });

    // Populate saved calculation
    UIkit.util.on('#dialog-open', 'beforeshow', () => populateSaved());

    function populateSaved() {
        var obj = db.get('saved') || {};
        var savedItems = Object.keys(obj);
        $('dialog-open-body').innerHTML = '';
        if (savedItems.length > 0) {
            $('dialog-open-deleteAll').disabled = false;
            savedItems.forEach(id => {
                $('dialog-open-body').innerHTML +=
                    '<div class="dialog-open-wrapper" id="' + id + '">' +
                    '<div data-action="load">' +
                    '<div class="dialog-open-title">' + obj[id][0] + '</div>' +
                    '<div class="dialog-open-date">' + moment(Number(id)).format('lll') + '</div>' +
                    '</div>' +
                    '<div class="dialog-open-delete" data-action="delete">&#10005;</div>' +
                    '</div>';
            });
        } else {
            $('dialog-open-deleteAll').disabled = true;
            $('dialog-open-body').innerHTML = 'No saved calculations.';
        }
    }

    // Initiate settings dialog
    UIkit.util.on('#dialog-settings', 'beforeshow', () => {
        $('precisionRange').value = settings.precision;
        $('precision-label').innerHTML = settings.precision;
        $('dateFormat').innerHTML = (
            '<option value="l">' + moment().format('l') + '</option>' +
            '<option value="L">' + moment().format('L') + '</option>' +
            '<option value="MMM DD, YYYY">' + moment().format('MMM DD, YYYY') + '</option>' +
            '<option value="ddd, l">' + moment().format('ddd, l') + '</option>' +
            '<option value="ddd, L">' + moment().format('ddd, L') + '</option>' +
            '<option value="ddd, MMM DD, YYYY">' + moment().format('ddd, MMM DD, YYYY') + '</option>'
        );
        $('dateFormat').value = settings.dateFormat;
        $('resizeButton').checked = settings.resizable;
        $('lineNoButton').checked = settings.lineNumbers;
        $('lineErrorButton').checked = settings.lineErrors;
        $('autoRatesButton').checked = settings.autoRates;
    });

    $('precisionRange').addEventListener('input', () => $('precision-label').innerHTML = $('precisionRange').value);

    // Help dialog content
    $('searchBox').addEventListener('input', (e) => {
        var str = $('searchBox').value;
        if (str.trim()) {
            try {
                $('searchResults').innerHTML = '';
                var res = JSON.stringify(math.help(str).toJSON());
                var obj = JSON.parse(res);
                $('searchResults').innerHTML = (
                    '<div>Name:</div><div>' + obj.name + '</div>' +
                    '<div>Description:</div><div>' + obj.description + '</div>' +
                    '<div>Category:</div><div>' + obj.category + '</div>' +
                    '<div>Syntax:</div><div>' + String(obj.syntax).split(',').join(', ') + '</div>' +
                    '<div>Examples:</div><div>' + String(obj.examples).split(',').join(', ') + '</div>' +
                    '<div>Also see:</div><div>' + String(obj.seealso).split(',').join(', ') + '</div>'
                );
            } catch (error) {
                $('searchResults').innerHTML = 'No results for "' + str + '"';
            }
        } else {
            $('searchResults').innerHTML = 'Start typing above to search...';
        }
    });

    // About info content
    $('dialog-about-title').innerHTML = appName + ' Calculator';
    $('dialog-about-appVersion').innerHTML = 'Version ' + appVersion;

    // Initiate plot range dialog
    UIkit.util.on('#dialog-plotRange', 'beforeshow', () => {
        var plotRange = settings.plotRange;
        Object.keys(plotRange).forEach(key => {
            $(key).style.backgroundColor = 'transparent';
            $(key).value = plotRange[key];
        });
    });

    // Plot
    var func;

    function plot() {
        $('plotTitle').innerHTML = func;
        try {
            var plotRange = settings.plotRange;
            var expr = math.compile(func.split('=')[1]);
            var xValues = math.range(plotRange.xMin * 100, plotRange.xMax * 100, plotRange.step).toArray();
            var yValues = xValues.map(x => expr.evaluate({
                x: x
            }));
            var trace1 = {
                x: xValues,
                y: yValues,
                type: 'scatter',
                line: {
                    shape: 'spline'
                }
            };
            var data = [trace1];
            var layout = {
                autosize: true,
                margin: {
                    l: 40,
                    r: 20,
                    b: 30,
                    t: 30,
                    pad: 10
                },
                width: window.innerWidth - 75,
                height: window.innerHeight - 160,
                xaxis: {
                    range: [plotRange.xMin, plotRange.xMax]
                },
                yaxis: {
                    range: [plotRange.yMin, plotRange.yMax]
                }
            };
            Plotly.newPlot('plot', data, layout, {
                scrollZoom: true
            });
        } catch (error) {
            showError(error);
        }
        UIkit.modal('#dialog-plot').show();
    }

    // Relayout plot on window resize
    window.addEventListener('resize', () => {
        if ($('dialog-plot').classList.contains('uk-modal')) {
            var h = window.innerHeight;
            var w = window.innerWidth;
            Plotly.relayout('plot', {
                width: w - 75,
                height: h - 160
            });
        }
    });

    // Show confirmation dialog
    var yesAction;

    function confirm(msg, action) {
        yesAction = action;
        UIkit.util.on("#dialog-confirm", 'beforeshow', () => $('confirmMsg').innerHTML = msg);
        UIkit.modal('#dialog-confirm').show();
    }

    // Show error dialog
    function showError(e, title) {
        UIkit.util.on("#dialog-error", 'beforeshow', () => {
            $('errTitle').innerHTML = title || 'Error';
            $('errMsg').innerHTML = e;
        });
        UIkit.modal('#dialog-error').show();
    }

    // Show app messages
    function showMsg(msg) {
        $('msg').innerHTML = msg;
        $('msg').style.opacity = '1';
        setTimeout(() => {
            $('msg').style.opacity = '0';
        }, 2000);
        setTimeout(() => {
            $('msg').innerHTML = '';
        }, 2300);
    }

    // Calculate answers
    function calculate() {
        var solve = math.evaluate;
        var input = $('input').value;
        var lines = input.split('\n');
        var lineIndex = 1;
        var lineNos = [];
        var scrolls = [];
        var answers = [];
        var totals = [];
        var prints = [];
        var scope = {};
        var expLim = {
            lowerExp: -12,
            upperExp: 12
        };
        var digits = {
            maximumFractionDigits: settings.precision
        };

        $('clearButton').className = input === '' ? 'noAction' : 'action';
        $('printButton').className = input === '' ? 'noAction' : 'action';
        $('saveButton').className = input === '' ? 'noAction' : 'action';

        scope.now = moment().format(settings.dateFormat + ' LT');
        scope.today = moment().format(settings.dateFormat);

        for (var i in lines) {
            var line = lines[i].trim();
            var lineNo = lineIndex++;
            var print = line;
            var nbsp = '&zwnj;';
            var answer = nbsp;

            if (line) {
                try {
                    line = lineNo > 1 && line.charAt(0).match(/[\+\-\*\/]/) && lines[i - 1].length > 0 ? scope.ans + line : line;
                    try {
                        answer = solve(line, scope);
                    } catch (e) {
                        while (line.match(/\([^\)]+\)/)) {
                            var s = line.substring(line.lastIndexOf('(') + 1);
                            var sp = line.substring(line.lastIndexOf('('));

                            s = s.substring(0, s.indexOf(')'));
                            sp = sp.substring(0, sp.indexOf(')') + 1);

                            if (sp.length === 0) break;

                            try {
                                line = line.replace(sp, solver(s, scope));
                            } catch (e) {
                                break;
                            }
                        }
                        answer = solver(line, scope);
                    }

                    if (answer !== undefined) {
                        scope.ans = scope['line' + lineNo] = answer;
                        answer = math.format(answer, expLim);

                        var a = answer.trim().split(' ')[0];
                        var b = answer.replace(a, '');
                        answer = !a.includes('e') && !isNaN(a) ? Number(a).toLocaleString(undefined, digits) + b : strip(answer);

                        if (!isNaN(a)) totals.push(Number(a));

                        scope.total = totals.reduce((a, b) => a + b, 0);

                        if (answer.match(/\w\(x\)/)) {
                            answer = '<a title="Plot ' + line + '" class="plotButton" data-func="' + line + '" uk-tooltip>Plot</a>';
                            scope.ans = scope['line' + lineNo] = line.split('=')[1].trim();
                        }
                    }
                } catch (e) {
                    var errStr = String(e).replace(/'|"/g, '`');
                    if (settings.lineErrors) {
                        answer = '<a title="' + errStr + '" class="lineError" data-line="' + lineNo + '" data-error="' + errStr + '" uk-tooltip>err</a>';
                        lineNo = '<span class="lineErrorNo">' + lineNo + '</span>';
                    }
                }
            }

            answers.push(answer);
            lineNos.push(lineNo);
            scrolls.push(nbsp);
            prints.push(print);
        }

        $('lineNo').innerHTML = lineNos.join('<br>');
        $('output').innerHTML = answers.join('<br>');
        $('scroll').innerHTML = scrolls.join('<br>');

        $('printLines').innerHTML = lineNos.join('<br>');
        $('printInput').innerHTML = prints.join('<br>');
        $('printOutput').innerHTML = answers.join('<br>');

        db.set('input', $('input').value);
        $('undoButton').style.visibility = 'hidden';

        function strip(s) {
            var t = s.length;
            if (s.charAt(0) === '"') s = s.substring(1, t--);
            if (s.charAt(--t) === '"') s = s.substring(0, t);
            return s;
        }

        // Solver
        function solver(line, scope) {
            Object.keys(scope).map(i => line = line !== i ? line.replace(new RegExp('\\b' + i + '\\b'), scope[i]) : line);

            var timeReg = 'hour|hours|minute|minutes|second|seconds';
            var dateReg = 'day|days|week|weeks|month|months|year|years|' + timeReg;
            var momentReg = new RegExp('[\\+\\-]\\s*\\d*\\s*(' + dateReg + ')\\s*$');

            if (line.match(momentReg)) {
                var lineDate = line.split(/[\+\-]/)[0];
                var rightOfDate = String(solve(line.replace(lineDate, ''), scope));
                var dwmy = rightOfDate.match(new RegExp(dateReg));
                var dateNum = rightOfDate.split(dwmy)[0];
                var timeFormat = line.match(new RegExp(timeReg)) ? settings.dateFormat + ' LT' : settings.dateFormat;

                line = '"' + moment(new Date(lineDate)).add(dateNum, dwmy).format(timeFormat) + '"';
            }

            var modReg = /\d*\.?\d%\d*\.?\d/g;
            var pcntReg = /[\w.]*%/g;
            var pcntOfReg = /%[ ]*of[ ]*/g;
            var pcntOfRegC = /[\w.]*%[ ]*of[ ]*/g;

            line = line.match(pcntOfRegC) ? line.replace(pcntOfReg, '/100*') : line;

            if (line.match(modReg)) line.match(modReg).forEach(m => line = line.replace(m, solve(m, scope)));

            while (line.match(pcntReg) && !line.match(modReg)) {
                var right = line.match(pcntReg)[0];
                var rightVal = solve(right.slice(0, -1), scope);
                var left = line.split(right)[0];
                var leftVal = solve(left.trim().slice(0, -1), scope);

                newval = solve(leftVal + '*' + rightVal + '/100', scope);
                line = line.replace(left + right, solve(left + newval, scope));
            }

            return solve(line, scope);
        }
    }
})();

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
            for (j in (names[name] = names[name] || [])) {
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