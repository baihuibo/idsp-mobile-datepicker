# idsp-mobile-datepicker
移动端日期选择器


# 下载方法
```bash
npm install idsp-mobile-datepicker --save
```

# 使用
```js
var app = angular.module('app' , ['mobile-datepicker' , 'ngTouch']);
```

```html
<mobile-datepicker 
    ng-model="date" 
    start-date="startDate" 
    end-date="endDate"
    ng-change="doChange()"></mobile-datepicker>

date = {{date}} <br>
startDate = {{startDate}} <br>
endDate = {{endDate}}
```
