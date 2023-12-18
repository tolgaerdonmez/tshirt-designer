// 'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fontManager = require('@samuelmeuli/font-manager');
var React = require('react');
var React__default = _interopDefault(React);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
// /* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function getFontId(fontFamily) {
    return fontFamily.replace(/\s+/g, "-").toLowerCase();
}
var FontPicker = (function (_super) {
    __extends(FontPicker, _super);
    function FontPicker(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            expanded: false,
            loadingStatus: "loading",
        };
        var _a = _this.props, apiKey = _a.apiKey, activeFontFamily = _a.activeFontFamily, pickerId = _a.pickerId, families = _a.families, categories = _a.categories, scripts = _a.scripts, variants = _a.variants, filter = _a.filter, limit = _a.limit, sort = _a.sort, onChange = _a.onChange;
        var options = {
            pickerId: pickerId,
            families: families,
            categories: categories,
            scripts: scripts,
            variants: variants,
            filter: filter,
            limit: limit,
            sort: sort,
        };
        _this.fontManager = new fontManager.FontManager(apiKey, activeFontFamily, options, onChange);
        _this.fontManager
            .init()
            .then(function () {
            _this.setState({
                loadingStatus: "finished",
            });
        })["catch"](function (err) {
            _this.setState({
                loadingStatus: "error",
            });
            console.error("Error trying to fetch the list of available fonts");
            console.error(err);
        });
        _this.onClose = _this.onClose.bind(_this);
        _this.onSelection = _this.onSelection.bind(_this);
        _this.setActiveFontFamily = _this.setActiveFontFamily.bind(_this);
        _this.toggleExpanded = _this.toggleExpanded.bind(_this);
        return _this;
    }
    FontPicker.prototype.componentDidUpdate = function (prevProps) {
        var _a = this.props, activeFontFamily = _a.activeFontFamily, onChange = _a.onChange;
        if (activeFontFamily !== prevProps.activeFontFamily) {
            this.setActiveFontFamily(activeFontFamily);
        }
        if (onChange !== prevProps.onChange) {
            this.fontManager.setOnChange(onChange);
        }
    };
    FontPicker.prototype.onClose = function (e) {
        var targetEl = e.target;
        var fontPickerEl = document.getElementById("font-picker" + this.fontManager.selectorSuffix);
        while (true) {
            if (targetEl === fontPickerEl) {
                return;
            }
            if (targetEl.parentNode) {
                targetEl = targetEl.parentNode;
            }
            else {
                this.toggleExpanded();
                return;
            }
        }
    };
    FontPicker.prototype.onSelection = function (e) {
        var target = e.target;
        var activeFontFamily = target.textContent;
        if (!activeFontFamily) {
            throw Error("Missing font family in clicked font button");
        }
        this.setActiveFontFamily(activeFontFamily);
        this.toggleExpanded();
    };
    FontPicker.prototype.setActiveFontFamily = function (activeFontFamily) {
        this.fontManager.setActiveFont(activeFontFamily);
    };
    FontPicker.prototype.generateFontList = function (fonts) {
        var _this = this;
        var activeFontFamily = this.props.activeFontFamily;
        var loadingStatus = this.state.loadingStatus;
        if (loadingStatus !== "finished") {
            return React__default.createElement("div", null);
        }
        return (React__default.createElement("ul", { className: "font-list" }, fonts.map(function (font) {
            var isActive = font.family === activeFontFamily;
            var fontId = getFontId(font.family);
            return (React__default.createElement("li", { key: fontId, className: "font-list-item" },
                React__default.createElement("button", { type: "button", id: "font-button-" + fontId + _this.fontManager.selectorSuffix, className: "font-button " + (isActive ? "active-font" : ""), onClick: _this.onSelection, onKeyPress: _this.onSelection }, font.family)));
        })));
    };
    FontPicker.prototype.toggleExpanded = function () {
        var expanded = this.state.expanded;
        if (expanded) {
            this.setState({
                expanded: false,
            });
            document.removeEventListener("click", this.onClose);
        }
        else {
            this.setState({
                expanded: true,
            });
            document.addEventListener("click", this.onClose);
        }
    };
    FontPicker.prototype.render = function () {
        var _a = this.props, activeFontFamily = _a.activeFontFamily, sort = _a.sort;
        var _b = this.state, expanded = _b.expanded, loadingStatus = _b.loadingStatus;
        var fonts = Array.from(this.fontManager.getFonts().values());
        if (sort === "alphabet") {
            fonts.sort(function (font1, font2) { return font1.family.localeCompare(font2.family); });
        }
        return (React__default.createElement("div", { id: "font-picker" + this.fontManager.selectorSuffix, className: expanded ? "expanded" : "" },
            React__default.createElement("button", { type: "button", className: "dropdown-button", onClick: this.toggleExpanded, onKeyPress: this.toggleExpanded },
                React__default.createElement("p", { className: "dropdown-font-family" }, activeFontFamily),
                React__default.createElement("p", { className: "dropdown-icon " + loadingStatus })),
            loadingStatus === "finished" && this.generateFontList(fonts)));
    };
    FontPicker.defaultProps = {
        activeFontFamily: fontManager.FONT_FAMILY_DEFAULT,
        onChange: function () { },
        pickerId: fontManager.OPTIONS_DEFAULTS.pickerId,
        families: fontManager.OPTIONS_DEFAULTS.families,
        categories: fontManager.OPTIONS_DEFAULTS.categories,
        scripts: fontManager.OPTIONS_DEFAULTS.scripts,
        variants: fontManager.OPTIONS_DEFAULTS.variants,
        filter: fontManager.OPTIONS_DEFAULTS.filter,
        limit: fontManager.OPTIONS_DEFAULTS.limit,
        sort: fontManager.OPTIONS_DEFAULTS.sort,
    };
    return FontPicker;
}(React.PureComponent));

module.exports = FontPicker;
