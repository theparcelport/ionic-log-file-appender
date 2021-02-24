/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LogProvider } from './log.service';
export { LogProvider } from './log.service';
var LogFileAppenderModule = /** @class */ (function () {
    function LogFileAppenderModule() {
    }
    /**
     * @return {?}
     */
    LogFileAppenderModule.forRoot = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: LogFileAppenderModule,
            providers: [LogProvider]
        };
    };
    /**
     * @return {?}
     */
    LogFileAppenderModule.forChild = /**
     * @return {?}
     */
    function () {
        return {
            ngModule: LogFileAppenderModule,
            providers: [LogProvider]
        };
    };
    LogFileAppenderModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule],
                    providers: [LogProvider]
                },] },
    ];
    return LogFileAppenderModule;
}());
export { LogFileAppenderModule };
function LogFileAppenderModule_tsickle_Closure_declarations() {
    /** @type {!Array<{type: !Function, args: (undefined|!Array<?>)}>} */
    LogFileAppenderModule.decorators;
    /**
     * @nocollapse
     * @type {function(): !Array<(null|{type: ?, decorators: (undefined|!Array<{type: !Function, args: (undefined|!Array<?>)}>)})>}
     */
    LogFileAppenderModule.ctorParameters;
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLWZpbGUtYXBwZW5kZXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vaW9uaWMtbG9nLWZpbGUtYXBwZW5kZXIvIiwic291cmNlcyI6WyJsb2ctZmlsZS1hcHBlbmRlci5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUM3QyxPQUFPLEVBQXNCLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1RCxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTFDLDRCQUFjLGVBQWUsQ0FBQzs7Ozs7OztJQVFkLDZCQUFPOzs7O1FBQ2xCLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQztTQUN6QixDQUFDOzs7OztJQUdTLDhCQUFROzs7O1FBQ3BCLE9BQU87WUFDTCxRQUFRLEVBQUUscUJBQXFCO1lBQy9CLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQztTQUN6QixDQUFBOzs7Z0JBaEJKLFFBQVEsU0FBQztvQkFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7b0JBQ3ZCLFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQztpQkFDekI7O2dDQVZEOztTQVdhLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtMb2dQcm92aWRlcn0gZnJvbSAnLi9sb2cuc2VydmljZSc7XHJcblxyXG5leHBvcnQgKiBmcm9tICcuL2xvZy5zZXJ2aWNlJztcclxuZXhwb3J0ICogZnJvbSAnLi9jb25maWcnO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICBwcm92aWRlcnM6IFtMb2dQcm92aWRlcl1cclxufSlcclxuZXhwb3J0IGNsYXNzIExvZ0ZpbGVBcHBlbmRlck1vZHVsZSB7XHJcbiAgcHVibGljIHN0YXRpYyBmb3JSb290KCk6IE1vZHVsZVdpdGhQcm92aWRlcnMge1xyXG4gICAgIHJldHVybiB7XHJcbiAgICAgICBuZ01vZHVsZTogTG9nRmlsZUFwcGVuZGVyTW9kdWxlLFxyXG4gICAgICAgcHJvdmlkZXJzOiBbTG9nUHJvdmlkZXJdXHJcbiAgICAgfTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBzdGF0aWMgZm9yQ2hpbGQoKTogTW9kdWxlV2l0aFByb3ZpZGVycyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBuZ01vZHVsZTogTG9nRmlsZUFwcGVuZGVyTW9kdWxlLFxyXG4gICAgICBwcm92aWRlcnM6IFtMb2dQcm92aWRlcl1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19