/**
 * @copyright 2019 Timur Atalay 
 * @homepage https://github.com/bornova/numpad
 * @license MIT https://github.com/bornova/numpad/blob/master/LICENSE
 */

// Calculate answers
function calculate() {
    var solve = math.evaluate;
    var settings = JSON.parse(localStorage.getItem('settings'));
    var lines = $('#input').val().split('\n');
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
                        answer = '<a title="Plot" class="plotButton" data-func="' + line + '"><svg height="24" viewBox="0 0 24 24" width="24"><polyline fill="none" points="23 6 13.5 15.5 8.5 10.5 1 18" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><polyline fill="none" points="17 6 23 6 23 12" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg></a>';
                        scope.ans = scope['line' + lineNo] = line.split('=')[1].trim();
                    }
                }
            } catch (e) {
                var errStr = String(e).replace(/'|"/g, '`');
                if (settings.lineErrors) {
                    answer = '<a title="' + errStr + '" class="lineError" data-line="' + lineNo + '" data-error="' + errStr + '">err</a>';
                    lineNo = '<span class="lineErrorNo">' + lineNo + '</span>';
                }
            }
        }

        answers.push(answer);
        lineNos.push(lineNo);
        scrolls.push(nbsp);
        prints.push(print);
    }
    $('#output, #printOutput').html(answers.join('<br>'));
    $('#lineNo, #printLines').html(lineNos.join('<br>'));
    $('#printInput').html(prints.join('<br>'));
    $('#scroll').html(scrolls.join('<br>'));

    localStorage.setItem('input', JSON.stringify($('#input').val()));
    $('#undoButton').hide();

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