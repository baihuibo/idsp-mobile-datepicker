//Created by baihuibo on 2016/10/18.

(function (angular) {
    "use strict";

    var mod = angular.module('mobile.datepicker', []);

    mod.directive('mobileDatepicker', function ($timeout) {
        return {
            restrict: 'E',
            template: `
            <div layout="row" layout-align="start center" ng-click="showPanel()">
                <button type="button" flex data-toggle="dropdown" class="form-control input-sm">
                    <div layout="row" layout-align="start center">
                        <div flex class="text-left d-text-overflow">{{startDate || '请选择开始日期'}}</div>
                        <div class="caret"></div>
                    </div>
                </button>
                <i style="margin:5px 7px;">-</i>
                <button type="button" flex data-toggle="dropdown" class="form-control input-sm">
                    <div layout="row" layout-align="start center">
                        <div flex class="text-left d-text-overflow">{{endDate || '请选择结束日期'}}</div>
                        <div class="caret"></div>
                    </div>
                </button>
            </div>
            <div class="mobile-datepicker-panel-bg" ng-click="hidePanel()"></div>
            <div class="mobile-datepicker-panel">
                <div class="mobile-datepicker-head" layout="row">
                    <div flex layout="row">
                        <a href="javascript:" class="mb-arrow" ng-click="goPrevYear()"> &lt; </a>
                        <div flex class="text-center">{{datePanel.year}}年</div>
                        <a href="javascript:" class="mb-arrow" ng-click="goNextYear()"> &gt; </a>
                    </div>
                    <div style="width:1em"></div>
                    <div flex layout="row">
                        <a href="javascript:" class="mb-arrow" ng-click="goPrevMonth()"> &lt; </a>
                        <div flex class="text-center">{{datePanel.month}}月</div>
                        <a href="javascript:" class="mb-arrow" ng-click="goNextMonth()"> &gt; </a>
                    </div>
                </div>
                <div class="mobile-datepicker-body">
                    <div class="mobile-datepicker-week text-center" layout="row">
                       <span flex>日</span> <span flex>一</span> <span flex>二</span>
                       <span flex>三</span> <span flex>四</span> <span flex>五</span> 
                       <span flex>六</span>
                    </div>
                    <div class="mobile-datepicker-dates">
                        <div class="mobile-datepicker-date" ng-repeat="datePanel in dates" ng-class="{
                                x_left:datePanel.left , 
                                x_right : datePanel.right , 
                                in: datePanel.in
                            }">
                            <div ng-repeat="theDay in datePanel.days" ng-class="{
                                    'to-day-date' : select.isToDay(theDay.time),
                                    'start-date' : select.isStart(theDay.time),
                                    'range-date' : select.isRange(theDay.time),
                                    'end-date' : select.isEnd(theDay.time)
                                }"
                                ng-click="selectData(theDay)" class="the-date {{theDay.cls}}">{{theDay.days}}</div>
                        </div>
                    </div>
                </div>
                <div class="mobile-datepicker-footer text-center">
                    <button type="button" class="btn btn-sm btn-primary" 
                        ng-disabled="!select.startDate || !select.endDate" ng-click="saveData()">确定</button>
                    <button type="button" class="btn btn-sm btn-default" ng-click="hidePanel()">取消</button>
                </div>
            </div>
            `,
            scope: {
                startDate: '=?',
                endDate: '=?'
            },
            require: '?ngModel',
            link: function (scope, el, attr, ngModel) {
                el.addClass('mobile-datepicker');

                var toDay = new Date();
                var toDayTime = Date.UTC(toDay.getFullYear(), toDay.getMonth(), toDay.getDate());

                var datePanel = scope.datePanel = {
                    $$year: toDay.getFullYear(),
                    get year() {
                        return this.$$year;
                    },
                    set year(value) {
                        this.$$year = parseInt(value);
                    },
                    $$month: toDay.getMonth() + 1, // 1-12
                    get month() {
                        return this.$$month;
                    },
                    set month(value) {
                        value = parseInt(value);
                        if (value === 0) {// 处理跨年
                            this.$$year -= 1;
                            this.$$month = 12;
                        } else if (value === 13) {
                            this.$$year += 1;
                            this.$$month = 1;
                        } else {
                            this.$$month = value;
                        }
                    }
                };

                function initDataPanel() {// 初始化日期面板
                    if (scope.startDate || scope.endDate) {
                        select.startDate = _createDayByDateStr(scope.startDate);
                        select.endDate = _createDayByDateStr(scope.endDate);
                    } else if (ngModel && ngModel.$viewValue) {
                        var arr = (ngModel.$viewValue + '').split(' - ');
                        if (arr.length) {
                            select.startDate = _createDayByDateStr(arr[0]);
                            if (arr.length == 2) {
                                select.endDate = _createDayByDateStr(arr[1]);
                            }
                        }
                    }
                    if (select.startDate) {
                        datePanel.year = select.startDate.year;
                        datePanel.month = select.startDate.month;
                    }
                }

                var select = scope.select = {
                    startDate: null,
                    endDate: null,
                    isStart: function (time) {
                        return this.startDate ? this.startDate == time : false;
                    },
                    isRange: function (time) {
                        return time > this.startDate && time < this.endDate;
                    },
                    isEnd: function (time) {
                        return this.endDate ? this.endDate == time : false;
                    },
                    isToDay: function (time) {
                        return time == toDayTime;
                    },
                    get size() {
                        if (this.endDate && this.startDate) {
                            return 2;
                        } else if (this.startDate) {
                            return 1;
                        }
                        return 0;
                    },
                    set size(size) {
                        if (size == 0) {
                            this.endDate = this.startDate = null;
                        }
                    }
                };

                scope.showPanel = function () {
                    initDataPanel();

                    // 初始化日期控件
                    scope.dates = [{days: getDays(), in: true}];

                    el.addClass('show');
                };

                scope.hidePanel = function () {
                    scope.dates = [];
                    el.removeClass('show');
                };

                // 选择日期处理
                scope.selectData = function (theDay) {
                    if (theDay.prev) {
                        scope.goPrevMonth();
                    } else if (theDay.next) {
                        scope.goNextMonth();
                    }
                    if (!select.size || select.size == 2) {
                        // 如果没有已选择的日期或者已经选择了俩个日期，将它们清空
                        select.size = 0;// clear all
                        select.startDate = theDay;
                    } else if (theDay < select.startDate) {
                        select.startDate = theDay;
                    } else {
                        select.endDate = theDay;
                    }
                };

                // 保存选择的日期到绑定model
                scope.saveData = function () {
                    if (select.startDate && select.endDate) {
                        scope.startDate = select.startDate.toString();
                        scope.endDate = select.endDate.toString();

                        ngModel && ngModel.$setViewValue(scope.startDate + ' - ' + scope.endDate);
                        el.trigger('change');
                    }
                    scope.hidePanel();
                };

                scope.goPrevYear = function () {// 前往上一个月
                    if (!animation) {
                        datePanel.year -= 1;
                        gotoDate('right');
                    }
                };
                scope.goNextYear = function () {// 前往下一个年
                    if (!animation) {
                        datePanel.year += 1;
                        gotoDate('right');
                    }
                };

                scope.goPrevMonth = function () {// 前往上一个月
                    if (!animation) {
                        datePanel.month -= 1;
                        gotoDate('left');
                    }
                };
                scope.goNextMonth = function () {// 前往下一个月
                    if (!animation) {
                        datePanel.month += 1;
                        gotoDate('right');
                    }
                };

                // 获取天模板
                function getDays() {
                    var year = datePanel.year;
                    var month = datePanel.month;
                    var monthDays = _getDaysInMonth(year, month);
                    var prevMonthDays = _getDaysInMonth(year, month - 1);
                    var week = _getWeekInFirstDay(year, month);

                    var prevMonthFix = _createDays(week, 'prev-month-date-fix date-fix', year, month - 1, prevMonthDays);// 上月日期占位符
                    prevMonthFix.forEach(function (item) {
                        item.prev = true;
                    });

                    var days = _createDays(monthDays, 'month-date', year, month);// 当月日期

                    var nextMonthFix = _createDays(42 - (days.length + prevMonthFix.length), 'next-month-date-fix date-fix', year, month + 1);// 下一个月占位符
                    nextMonthFix.forEach(function (item) {
                        item.next = true;
                    });

                    return [].concat(prevMonthFix.reverse(), days, nextMonthFix);
                }

                var animation = false;
                // 切换日期面板
                function gotoDate(go) {
                    var prevDate = scope.dates[0];
                    animation = true;

                    var currentDate = {days: getDays()};

                    if (go == 'left') {
                        prevDate.left = false;
                        prevDate.right = true;
                        currentDate.left = true;
                    } else {
                        prevDate.left = true;
                        prevDate.right = false;
                        currentDate.right = true;
                    }

                    scope.dates.push(currentDate);// 创建新日期面板

                    $timeout(function () {
                        el.find('.mobile-datepicker-date:first').on('bsTransitionEnd', function () {
                            scope.$apply('dates.shift()'); // 动画完成后删除旧面板
                            animation = prevDate = currentDate = null;
                        });
                        // 使得面板以动画的方式出现
                        prevDate.in = false;
                        currentDate.in = true; // 显示当前面板
                    });
                }
            }
        }
    });

    function _createDays(len, cls, year, month, preFix) {
        if (!month) {// 跨年处理
            year -= 1;
            month = 12;
        } else if (month == 13) {
            year += 1;
            month = 1;
        }
        let res = [];
        for (var d = 0; d < len; d++) {
            res[d] = _createDay(year, month, preFix ? preFix - d : d + 1, cls);
        }
        return res;
    }

    function _createDayByDateStr(str) {
        if (!str) {
            return null;
        }
        var arr = (str + '').split('-');
        return _createDay(+arr[0], +arr[1], +arr[2]);
    }

    function _createDay(year, month, days, cls) {
        return {
            cls: cls,
            days: days,
            year: year,
            month: month,
            time: Date.UTC(year, month - 1, days),
            valueOf: function () {
                return this.time;
            },
            toString: function () {
                return this.year + '-' + _pad(this.month, 2, '0') + '-' + _pad(this.days, 2, '0');
            }
        };
    }

    function _pad(num, len, fix) {
        var res = num + '';
        if (res.length < len) {
            var fix_num = len - res.length;
            var _prefix = fix;
            for (var i = 1; i < fix_num; i++) {
                _prefix += fix;
            }
            return _prefix + res;
        }
        return res;
    }

    // 获取某年某月有多少天 月 1-12
    function _getDaysInMonth(year, month) {
        return new Date(Date.UTC(year, month, 0)).getUTCDate();
    }

    // 计算某月1号是星期几 (0-6) 0表示周日
    function _getWeekInFirstDay(year, month) {
        return new Date(year, month - 1, 1).getDay();
    }

}(window.angular));