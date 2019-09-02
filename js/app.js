/**
 * @copyright 2019 Timur Atalay 
 * @homepage https://github.com/bornova/numpad
 * @license MIT https://github.com/bornova/numpad/blob/master/LICENSE
 */

(() => {
    const db = {
        def: {
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

<<<<<<< HEAD
    $('.header-mac-title, .print-title').html('Numpad');
    $('#header-mac, .leftActions, .rightActions').css('display', 'block');

=======
>>>>>>> 5a625df4051c907c6dbf34a24e235ef8e72066f4
    // Default content if first visit
    if (!db.get('firstTime')) {
        $('#input').val(
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
        $('#input').val(db.get('input'));
    }

    // Load last calculations and calculate on input change
<<<<<<< HEAD
    $('#input').on('input', calculate);
=======
    $('#input').on('input', calculate).val(db.get('input'));
>>>>>>> 5a625df4051c907c6dbf34a24e235ef8e72066f4

    // Apply settings
    function applySettings() {
        var settings = db.get('settings') || (db.set('settings', db.def), db.def);
        $('#lineNoCol, #printLines').toggle(settings.lineNumbers);
        $('#inputCol, #printInput').resizable({
            disabled: !settings.resizable,
            handles: 'e',
            autoHide: true,
            stop: (e, ui) => {
                var parent = ui.element.parent();
                var iwidth = ui.element.width() / parent.width() * 100 + '%';
                settings.inputWidth = iwidth;
                db.set('settings', settings);
            }
        }).css(settings.resizable ? {
            'border-right': '1px solid rgb(240, 240, 240)',
            'width': settings.inputWidth,
        } : {
            'border-right': 'none',
            'width': '50%'
        }).css('margin-left', settings.lineNumbers ? '0px' : '18px');
        $('#output, #printOutput').css('text-align', settings.resizable ? 'left' : 'right');
        calculate();
    }
    applySettings();

    // Exchange rates
    (() => {
        var settings = db.get('settings');
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
                } catch (e) {
                    showMsg('Failed to get exchange rates.');
                }
            } else {
                showMsg('No internet connection.');
            }
        }

        function createRateUnits() {
            var data = db.get('rates');
            Object.keys(data).forEach(currency => math.createUnit(data[currency].code, math.unit(data[currency].inverseRate, 'USD'), {
                override: true
            }));
            calculate();
        }

        $('#updateRatesButton').click(() => getRates());
    })();

    // Dialog defaults
    $.extend($.ui.dialog.prototype.options, {
        modal: true,
        resizable: false,
        draggable: false,
        focus: () => $('.ui-dialog :button').blur()
    });

    // LEFT ACTIONS
    // Clear board
    $('#clearButton').click(() => {
        if ($('#input').val()) {
            var d = $('#dialog-confirm');
            $("#confirmMsg").html('All calculations will be permanently deleted. Are you sure?');
            d.dialog({
                title: 'Clear the board?',
                height: 130,
                width: 300,
                buttons: {
                    'Clear Board': () => {
                        db.set('undoData', $('#input').val());
                        $('#input').val('').trigger('input');
                        showMsg('Board cleared');
                        $('#undoButton').show();
                        d.dialog('close');
                    },
                    Cancel: () => d.dialog('close')
                }
            });
        }
    });

    // Print
    $('#printButton').click(() => window.print());

    // Save calculations
    $('#saveButton').click(() => {
        if ($('#input').val().trim() !== '') {
            var d = $('#dialog-save');
            d.dialog({
                height: 120,
                width: 220,
                buttons: {
                    'Save': () => {
                        var obj = db.get('saved') || {};
                        var id = moment().format('L LTS');
                        var title = $('#saveTitle').val() || 'No title';
                        var data = $('#input').val();

                        obj[id] = [title, data];
                        db.set('saved', obj);
                        showMsg('Saved');
                        d.dialog('close');
                    },
                    Cancel: () => d.dialog('close')
                },
                open: () => $('#saveTitle').val('')
            });
        } else {
            showMsg('Nothing to save');
        }
    });

    // Open saved calculations
    $('#openButton').click(() => {
        var d = $('#dialog-open');
        d.dialog({
            width: 280,
            height: 250,
            buttons: {
                'Delete All': () => {
                    var d = $('#dialog-confirm');
                    $("#confirmMsg").html('All saved calculations will be deleted. Are you sure?');
                    d.dialog({
                        title: 'Delete all saved items?',
                        width: 250,
                        height: 130,
                        buttons: {
                            'Delete': () => {
                                db.delete('saved');
                                populateSaved();
                                d.dialog('close');
                            },
                            Cancel: () => d.dialog('close')
                        }
                    });
                },
                'Close': () => d.dialog('close')
            },
            open: () => populateSaved()
        });

        function populateSaved() {
            var obj = db.get('saved') || {};
            var savedItems = Object.keys(obj);
            $('#dialog-open').html('');
            if (savedItems.length > 0) {
                savedItems.forEach(id => $('#dialog-open').append(
                    '<div class="dialog-open-wrapper">' +
                    '<div class="dialog-open-left" id="' + id + '">' + obj[id][0] +
                    '<span class="saveDate">' + moment(new Date(id)).format('lll') + '</span></div>' +
                    '<div class="dialog-open-right" id="' + id + '">&#10005;</div></div>'
                ));
            } else {
                $('#dialog-open').html('No saved calculations.');
                $('.ui-dialog button:nth-child(1)').button('disable');
            }
            bindButtons();
        }

        function bindButtons() {
            $('.dialog-open-left').click(function () {
                var id = $(this).attr('id');
                db.set('undoData', $('#input').val());
                var obj = db.get('saved');
                $('#input').val(obj[id][1]).trigger('input');
                $('#dialog-open').dialog('close');
                $('#undoButton').show();
            });

            $('.dialog-open-right').click(function () {
                var id = $(this).attr('id');
                var d = $('#dialog-confirm');
                $("#confirmMsg").html('Are you sure?');
                d.dialog({
                    title: 'Delete this item?',
                    width: 200,
                    height: 120,
                    buttons: {
                        'Yes': () => {
                            var obj = db.get('saved');
                            delete obj[id];
                            db.set('saved', obj);
                            populateSaved();
                            d.dialog('close');
                        },
                        'No': () => d.dialog('close')
                    }
                });
            });
        }
    });

    // Undo button
    $('#undoButton').click(() => {
        $('#input').val(db.get('undoData')).trigger('input');
        $('#undoButton').hide();
    });

    // RIGHT ACTIONS
    // Settings
    $('#settingsButton').click(() => {
        var settings = db.get('settings');
        var d = $('#dialog-settings');
        d.dialog({
            width: 300,
            height: 300,
            buttons: {
                'Reset': () => {
                    var d = $('#dialog-confirm');
                    $("#confirmMsg").html('All custom settings and data will be lost. Are you sure?');
                    d.dialog({
                        title: 'Reset application?',
                        width: 350,
                        height: 120,
                        buttons: {
                            'Reset': () => {
                                localStorage.clear();
                                location.reload();
                            },
                            Cancel: () => d.dialog('close')
                        },
                        open: () => d.siblings('.ui-dialog-buttonpane').find('button:eq(0)').addClass('reset-confirm')
                    });
                },
                'Save': () => {
                    settings.precision = $('#precisionBox').spinner('value');
                    settings.dateFormat = $('#dateFormat').val();
                    settings.lineErrors = $('#lineErrorButton').is(':checked');
                    settings.lineNumbers = $('#lineNoButton').is(':checked');
                    settings.resizable = $('#resizeButton').is(':checked');
                    settings.autoRates = $('#autoRatesButton').is(':checked');
                    db.set('settings', settings);
                    applySettings();
                    d.dialog('close');
                    showMsg('Settings saved');
                },
                'Defaults': () => {
                    var d = $('#dialog-confirm');
                    $("#confirmMsg").html('All settings will be reset. Are you sure?');
                    d.dialog({
                        title: 'Revert back to default settings?',
                        width: 280,
                        height: 120,
                        buttons: {
                            'Set Defaults': () => {
                                db.set('settings', db.def);
                                applySettings();
                                d.dialog('close');
                                $('#dialog-settings').dialog('close');
                                showMsg("Default settings applied");
                            },
                            Cancel: () => d.dialog('close')
                        }
                    });
                },
                Cancel: () => d.dialog('close')
            },
            open: () => {
                d.siblings('.ui-dialog-buttonpane').find('button:eq(0)').addClass('reset');
                $('#precisionBox').val(settings.precision).spinner({
                    min: 0,
                    max: 16
                });
                $('#dateFormat').html(
                    '<option value="l">' + moment().format('l') + '</option>' +
                    '<option value="L">' + moment().format('L') + '</option>' +
                    '<option value="MMM DD, YYYY">' + moment().format('MMM DD, YYYY') + '</option>' +
                    '<option value="ddd, l">' + moment().format('ddd, l') + '</option>' +
                    '<option value="ddd, L">' + moment().format('ddd, L') + '</option>' +
                    '<option value="ddd, MMM DD, YYYY">' + moment().format('ddd, MMM DD, YYYY') + '</option>'
                ).selectmenu().val(settings.dateFormat).selectmenu("refresh");
                $('#resizeButton').prop('checked', settings.resizable);
                $('#lineNoButton').prop('checked', settings.lineNumbers);
                $('#lineErrorButton').prop('checked', settings.lineErrors);
                $('#autoRatesButton').prop('checked', settings.autoRates);
            }
        });
    });

    // Show about info
    $('#aboutButton').click(() => {
        var d = $('#dialog-about');
        d.dialog({
            width: 250,
            height: 220,
            buttons: {
                'Ok': () => d.dialog('close')
            },
            open: () => {
                $('.dialog-about-title').html('Numpad Calculator');
                $('#dialog-about-appVersion').html('Version 1.0.0');
            }
        });
    });

    // Help
    $('#helpButton').click(() => {
        var d = $('#dialog-help');
        d.dialog({
            minWidth: 450,
            minHeight: 240,
            buttons: {
                'Ok': () => d.dialog('close')
            },
            open: () => {
                $('#searchBox').on('input change propertychange paste', () => {
                    var str = $('#searchBox').val().trim();
                    if (str) {
                        try {
                            $('#searchResults').html('');
                            var res = JSON.stringify(math.help(str).toJSON());
                            var obj = JSON.parse(res);
                            $('#searchResults').append(
                                '<div>Name:</div><div>' + obj.name + '</div>' +
                                '<div>Description:</div><div>' + obj.description + '</div>' +
                                '<div>Category:</div><div>' + obj.category + '</div>' +
                                '<div>Syntax:</div><div>' + String(obj.syntax).split(',').join(', ') + '</div>' +
                                '<div>Examples:</div><div>' + String(obj.examples).split(',').join(', ') + '</div>' +
                                '<div>Also see:</div><div>' + String(obj.seealso).split(',').join(', ') + '</div>'
                            );
                        } catch (e) {
                            $('#searchResults').html('No results for "' + str + '"');
                        }
                    } else {
                        $('#searchResults').html('Start typing above to search...');
                    }
                });
            }
        });
    });

    // Plot
    $(document).on('click', '.plotButton', function () {
        var d = $('#dialog-plot');
        var func = $(this).attr('data-func');
        d.dialog({
            autoOpen: false,
            title: func,
            width: $(window).width() - 50,
            height: $(window).height() - 70,
            buttons: {
                'Plot Range': () => {
                    var settings = db.get('settings');
                    var plotRange = settings.plotRange;
                    var rangeKeys = Object.keys(plotRange);
                    var d = $('#dialog-plotRange');
                    d.dialog({
                        width: 320,
                        height: 280,
                        buttons: {
                            'Set': () => {
                                var allValid = true;
                                rangeKeys.forEach(key => {
                                    if ($('#' + key).spinner('isValid')) {
                                        plotRange[key] = $('#' + key).spinner('value');
                                    } else {
                                        $('#' + key).css('background-color', 'rgba(179, 49, 49, 0.2)');
                                        allValid = false;
                                    }
                                });
                                if (allValid) {
                                    db.set('settings', settings);
                                    d.dialog('close');
                                    drawPlot();
                                } else {
                                    showError('Please correct invalid entries and try again.', 'Invalid range entries');
                                }
                            },
                            'Reset': () => {
                                var d2 = $('#dialog-confirm');
                                $("#confirmMsg").html('Are you sure?');
                                d2.dialog({
                                    title: 'Reset plot range to defaults?',
                                    height: 120,
                                    width: 280,
                                    buttons: {
                                        'Yes': () => {
                                            settings.plotRange = db.def.plotRange;
                                            db.set('settings', settings);
                                            d.dialog('close');
                                            d2.dialog('close');
                                            drawPlot();
                                        },
                                        'No': () => d2.dialog('close')
                                    }
                                });
                            },
                            Cancel: () => d.dialog('close')
                        },
                        open: () => {
                            $('#xMin, #yMin').spinner({
                                max: -1
                            });
                            $('#xMax, #yMax').spinner({
                                min: 1
                            });
                            $('#step').spinner({
                                step: 0.1,
                                min: 0.1
                            });
                            rangeKeys.forEach(key => $('#' + key).spinner('value', plotRange[key]).css('background-color', 'transparent'));
                        },
                    });
                },
                'Close': () => d.dialog('close')
            }
        }).dialog('open');

        function drawPlot() {
            try {
                var plotRange = db.get('settings').plotRange;
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
                        b: 25,
                        t: 30,
                        pad: 5
                    },
                    width: $(window).width() - 75,
                    height: $(window).height() - 160,
                    xaxis: {
                        range: [plotRange.xMin, plotRange.xMax]
                    },
                    yaxis: {
                        range: [plotRange.yMin, plotRange.yMax]
                    }
                };
<<<<<<< HEAD
                Plotly.newPlot('plot', data, layout, {
=======
                plotly.newPlot('plot', data, layout, {
>>>>>>> 5a625df4051c907c6dbf34a24e235ef8e72066f4
                    scrollZoom: true
                });
            } catch (e) {
                showError(e);
            }
        }
        drawPlot();
    });

    // Resize plot on window resize
    $(window).resize(() => {
        var w = $(window).width();
        var h = $(window).height();
        var d = $('#dialog-plot');
        if (d.dialog({
                autoOpen: false
            }).dialog('isOpen')) {
            d.dialog({
                width: w - 50,
                height: h - 70
            });
<<<<<<< HEAD
            Plotly.relayout('plot', {
=======
            plotly.relayout('plot', {
>>>>>>> 5a625df4051c907c6dbf34a24e235ef8e72066f4
                width: w - 75,
                height: h - 160
            });
        }

        $(".ui-dialog-content").dialog("option", "position", {
            my: "center",
            at: "center",
            of: window
        });
    });

    // Show line error message
    $(document).on('click', '.lineError', function () {
        var num = $(this).attr('data-line');
        var err = $(this).attr('data-error');
        showError(err, 'Error on Line ' + num);
    });

    // Show error message
    function showError(e, title) {
        $('#errMsg').html(e);
        var d = $('#dialog-showError');
        d.dialog({
            title: title || 'Error',
            width: 'auto',
            buttons: {
                'Ok': () => d.dialog('close')
            }
        });
    }

    // Show app messages
    function showMsg(msg) {
        $('#msg').html(msg).fadeIn('fast').delay(2000).fadeOut('fast');
    }
})();