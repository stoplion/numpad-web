/**
 * @copyright 2019 Timur Atalay 
 * @homepage https://github.com/bornova/numpad
 * @license MIT https://github.com/bornova/numpad/blob/master/LICENSE
 */

// localStorage
var getLocal = key => JSON.parse(localStorage.getItem(key));
var setLocal = (key, value) => localStorage.setItem(key, JSON.stringify(value));

// Calculate on input change
$('#input').on('input', calculate);

// Default content if first visit
if (!getLocal('firstTime')) {
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
    setLocal('firstTime', 'no');
} else {
    $('#input').val(getLocal('input'));
}

// Dialog defaults
$.extend($.ui.dialog.prototype.options, {
    modal: true,
    resizable: false,
    draggable: false,
    focus: () => $('.ui-dialog :button').blur()
});

// Make input area resizable
$('#inputCol').resizable({
    handles: 'e',
    autoHide: true,
    stop: (e, ui) => {
        var parent = ui.element.parent();
        var iwidth = ui.element.width() / parent.width() * 100 + '%';
        ui.element.css('width', iwidth);
        settings.inputWidth = iwidth;
        setLocal('settings', settings);
    }
});

// Date format options
$('#dateFormat').append(
    '<option value="l">' + moment().format('l') + '</option>' +
    '<option value="L">' + moment().format('L') + '</option>' +
    '<option value="MMM DD, YYYY">' + moment().format('MMM DD, YYYY') + '</option>' +
    '<option value="ddd, l">' + moment().format('ddd, l') + '</option>' +
    '<option value="ddd, L">' + moment().format('ddd, L') + '</option>' +
    '<option value="ddd, MMM DD, YYYY">' + moment().format('ddd, MMM DD, YYYY') + '</option>'
);

// App settings, defaults
var settings;
var defaultSettings = {
    'autoRates': true,
    'inputWidth': '50%',
    'lineErrors': true,
    'lineNumbers': true,
    'precision': '4',
    'resizable': true,
    'dateFormat': 'l'
};

if (!getLocal('settings')) {
    setLocal('settings', defaultSettings);
}
applySettings();

// Apply app settings
function applySettings() {
    settings = getLocal('settings');

    $('#precisionBox').val(settings.precision);
    $('#dateFormat').val(settings.dateFormat);
    $('#resizeButton').prop('checked', settings.resizable);
    $('#lineNoButton').prop('checked', settings.lineNumbers);
    $('#lineErrorButton').prop('checked', settings.lineErrors);
    $('#autoRatesButton').prop('checked', settings.autoRates);

    $('#lineNoCol, #printLines').toggle(settings.lineNumbers);
    $('#inputCol').resizable(settings.resizable ? 'enable' : 'disable').css({
        'width': settings.inputWidth,
        'margin-left': settings.lineNumbers ? '0px' : '18px'
    });
    $('#output, #printOutput').css('text-align', settings.resizable ? 'left' : 'right');
    $('#inputCol, #printInput').css(settings.resizable ? {
        'border-right': '1px solid rgb(240, 240, 240)'
    } : {
        'border-right': 'none',
        'width': '50%'
    });

    calculate();
}

// Exchange rates
math.createUnit('USD');

if (!getLocal('rates') || settings.autoRates) {
    getRates();
} else {
    createRateUnits();
}

function getRates() {
    if (navigator.onLine) {
        try {
            return fetch('https://www.floatrates.com/widget/00000576/690c690b362ec255080e5f7b3c63bba0/usd.json')
                .then(response => response.json())
                .then(data => {
                    setLocal('rates', data);
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
    var data = getLocal('rates');
    Object.keys(data).forEach(currency => {
        math.createUnit(data[currency].code, math.unit(data[currency].inverseRate, 'USD'), {
            override: true
        });
    });
    calculate();
}

$('#updateRatesButton').click(() => getRates());

// Plot range
var defaultPlotRange = {
    'xMin': -10,
    'xMax': 10,
    'yMin': -10,
    'yMax': 10,
    'step': 0.5
};

if (!getLocal('plotRange')) {
    setLocal('plotRange', defaultPlotRange);
}

function setPlotRange() {
    var d = $('#dialog-plotRange');
    var plotRange = getLocal('plotRange');
    var rangeKeys = Object.keys(plotRange);
    d.dialog({
        height: 280,
        width: 320,
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
                    setLocal('plotRange', plotRange);
                    d.dialog('close');
                    drawPlot(funcStr);
                } else {
                    showError('Please correct invalid entries and try again.', 'Invalid range entries');
                }
            },
            'Reset': () => {
                setLocal('plotRange', defaultPlotRange);
                d.dialog('close');
                drawPlot(funcStr);
            },
            Cancel: () => d.dialog('close')
        }
    });
}

// Plot
var funcStr;

function drawPlot(func) {
    funcStr = func;
    var w = $(window).width();
    var h = $(window).height();
    var d = $('#dialog-plot');
    var plotRange = getLocal('plotRange');
    d.dialog({
        autoOpen: false,
        width: w - 50,
        height: h - 70,
        buttons: {
            'Plot Range': () => setPlotRange(),
            'Close': () => d.dialog('close')
        }
    });
    try {
        var expr = math.compile(func.split('=')[1]);
        var xValues = math.range(plotRange.xMin * 100, plotRange.xMax * 100, plotRange.step).toArray();
        var yValues = xValues.map(x => expr.eval({
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
        var layout = {
            title: func,
            autosize: true,
            width: w - 75,
            height: h - 160,
            xaxis: {
                range: [plotRange.xMin, plotRange.xMax]
            },
            yaxis: {
                range: [plotRange.yMin, plotRange.yMax]
            }
        };
        var data = [trace1];
        Plotly.newPlot('plot', data, layout, {
            scrollZoom: true
        });
        d.dialog('open');
    } catch (e) {
        showError(e);
    }
}

// Resize plot on window resize
$(window).resize(() => {
    var d = $('#dialog-plot');
    var isOpen = d.dialog({
        autoOpen: false
    }).dialog('isOpen');
    if (isOpen) {
        var w = $(window).width();
        var h = $(window).height();
        d.dialog({
            width: w - 50,
            height: h - 70
        });
        Plotly.relayout('plot', {
            width: w - 75,
            height: h - 160
        });
    }
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
                    setLocal('undoData', $('#input').val());
                    $('#input').val('');
                    calculate();
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
    if ($('#input').val().trim() != '') {
        var d = $('#dialog-save');
        d.dialog({
            height: 120,
            width: 220,
            open: () => $('#saveTitle').val(''),
            buttons: {
                'Save': () => {
                    var obj = getLocal('saved') || {};
                    var title = $('#saveTitle').val() || 'No title';
                    var id = moment().format('L LTS');
                    var data = $('#input').val();

                    obj[id] = [title, data];
                    setLocal('saved', obj);
                    showMsg('Saved');
                    d.dialog('close');
                },
                Cancel: () => d.dialog('close')
            }
        });
    } else {
        showMsg('Nothing to save');
    }
});

// Open saved calculations
$('#openButton').click(() => {
    var d = $('#dialog-open');
    d.dialog({
        height: 250,
        width: 280,
        open: () => populateSaved(),
        buttons: {
            'Delete All': () => {
                var d = $('#dialog-confirm');
                $("#confirmMsg").html('All saved calculations will be deleted. Are you sure?');
                d.dialog({
                    title: 'Delete all saved items?',
                    height: 130,
                    width: 250,
                    buttons: {
                        'Delete': () => {
                            localStorage.removeItem('saved');
                            populateSaved();
                            d.dialog('close');
                        },
                        Cancel: () => d.dialog('close')
                    }
                });
            },
            'Close': () => d.dialog('close')
        }
    });
});

function populateSaved() {
    var obj = getLocal('saved') || {};
    var savedItems = Object.keys(obj);
    $('#dialog-open').html('');
    if (savedItems.length > 0) {
        savedItems.forEach(id => $('#dialog-open').append(
            '<div class="dialog-open-wrapper">' +
            '<div class="dialog-open-left" onclick="loadSaved(&#39;' + id + '&#39;);">' + obj[id][0] +
            '<span class="saveDate">' + moment(new Date(id)).format('lll') + '</span></div>' +
            '<div class="dialog-open-right" title="Delete" onclick="deleteSaved(&#39;' + id + '&#39;);">&#10005;</div></div>'
        ));
    } else {
        $('#dialog-open').html('No saved calculations.');
        $('.ui-dialog button:nth-child(1)').button('disable');
    }
}

function loadSaved(id) {
    setLocal('undoData', $('#input').val());
    var obj = getLocal('saved');
    $('#input').val(obj[id][1]);
    calculate();
    $('#dialog-open').dialog('close');
    $('#undoButton').show();
}

function deleteSaved(id) {
    var d = $('#dialog-confirm');
    $("#confirmMsg").html('Are you sure?');
    d.dialog({
        title: 'Delete this item?',
        height: 120,
        width: 200,
        buttons: {
            'Yes': () => {
                var obj = getLocal('saved');
                delete obj[id];
                setLocal('saved', obj);
                populateSaved();
                d.dialog('close');
            },
            'No': () => d.dialog('close')
        }
    });
}

// Undo button
$('#undoButton').click(() => {
    $('#input').val(getLocal('undoData'));
    calculate();
    $('#undoButton').hide();
});

// RIGHT ACTIONS
// Settings
$('#settingsButton').click(() => {
    var d = $('#dialog-settings');
    d.dialog({
        height: 300,
        width: 300,
        open: () => {
            d.siblings('.ui-dialog-buttonpane').find('button:eq(0)').addClass('reset');
            $('#dateFormat').selectmenu();
            $('#precisionBox').spinner({
                min: 0,
                max: 16
            });
        },
        buttons: {
            'Reset': () => {
                var d = $('#dialog-confirm');
                $("#confirmMsg").html('All custom settings and data will be lost. Are you sure?');
                d.dialog({
                    title: 'Reset application?',
                    height: 120,
                    width: 350,
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
                setLocal('settings', settings);
                applySettings();
                showMsg('Settings saved');
                d.dialog('close');
            },
            'Defaults': () => {
                var d = $('#dialog-confirm');
                $("#confirmMsg").html('All settings will be reset. Are you sure?');
                d.dialog({
                    title: 'Revert back to default settings?',
                    height: 120,
                    width: 280,
                    buttons: {
                        'Set Defaults': () => {
                            setLocal('settings', defaultSettings);
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
        }
    });
});

// Help
$('#helpButton').click(() => {
    var d = $('#dialog-help');
    d.dialog({
        height: 350,
        width: 450,
        buttons: {
            'Ok': () => d.dialog('close')
        }
    });
});

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

//Show error message
function showError(e, title) {
    $('#errMsg').html(e);
    var d = $('#dialog-showError');
    d.dialog({
        title: title || 'Error',
        height: 'auto',
        width: 'auto',
        buttons: {
            'Ok': () => d.dialog('close')
        }
    });
}

// Show app messages
var showMsg = msg => $('#msg').html(msg).fadeIn('fast').delay(2000).fadeOut('fast');