/*
 * TCall Platform
 *
 * @author Innovator Dev, https://innovator.dev
 * @copyright (c) 2022. All rights reserved.
 */

'use strict';

/**
 * Observer.
 */
class Observer {

    /**
     * Creates a new Observer instance.
     */
    constructor() {
        this.items = [];
    }

    /**
     * Adds a new observer item.
     *
     * @param name Item name
     * @param callback Item callback function
     */
    add(name, callback) {
        this.items.push({
            name: name, callback: callback
        });
    }

    /**
     * Fire item callback.
     */
    fire() {
        this.items.forEach(item => {
            item.callback();
        });
    }
}

/**
 * Dialog.js is a multipurpose lightweight highly configurable dialog library.
 *
 * @author Eugen Bușoiu <eugen@eugen.pro>
 * @link https://github.com/eugenb/dialog.js
 *
 * @licence MIT <https://raw.githubusercontent.com/eugenb/dialog.js/master/LICENSE>
 */

class Dialog {

    /**
     * Dialog constructor.
     *
     * @param body Dialog content
     * @param args Dialog arguments
     */
    constructor(body, args) {

        // Default options
        this.options = {

            // Styling classes
            dialogClassName: null, dialogPlaceholderClassName: null,

            // Size
            size: {
                x: 0, y: 0
            }, position: {},

            // Automatically trigger dialog show
            autoShow: true,

            // Events
            autoClose: false, closeOnEsc: true, closeOnOutsideClick: true,

            // Callbacks
            callback: {
                onBeforeShow: null, onShow: null, onClose: null
            },

            // Attach dialog relative to element
            linkTo: null
        };

        // Extend options
        this.options = Object.assign(this.options, args);

        // Create dialog
        this.create(body);
    }

    /**
     * Checks if given element is a child of given dialog.
     *
     * @param elem Element
     * @param dialog Dialog parent
     * @return {boolean}
     */
    static isChild(elem, dialog) {

        // Get descendents
        let d = dialog.getElementsByTagName('*');
        for (let i = 0; i < d.length; i++) {
            if (d[i] === elem) {
                return true;
            }
        }
        return false;
    }

    /**
     * Close all open dialogs.
     */
    static closeAll() {

        // Close all open dialogs
        document.querySelectorAll('.dialog[dialog-id]').forEach(dlg => {
            if (typeof dlg.close === 'function') {
                dlg.close();
            } else {
                dlg.parentNode.removeChild(dlg);
            }
        });
    }

    /**
     * Creates dialog.
     *
     * @param body Dialog content
     */
    create(body) {

        // Elements
        this.dlg = document.createElement('div');
        this.dlgPlaceholder = document.createElement('div');

        // Apply default classes
        this.dlgPlaceholder.classList.add('dialog-placeholder');
        this.dlg.classList.add('dialog');

        // Apply given classes
        if (this.options.dialogPlaceholderClassName !== null) {
            this.dlgPlaceholder.classList.add(this.options.dialogPlaceholderClassName);
        }

        if (this.options.dialogClassName !== null) {
            this.dlg.classList.add(this.options.dialogClassName);
        }

        // Set dialog placeholder attributes
        this.dlgPlaceholder.setAttribute('dialog-id', Math.random().toString(36).substring(2, 9));
        this.dlgPlaceholder.style.visibility = 'hidden';

        // Set dialog attributes
        this.dlg.setAttribute('dialog-id', Math.random().toString(36).substring(2, 9));

        // Set dialog body
        this.dlg.innerHTML = body;

        // Append dialog
        document.body.appendChild(this.dlgPlaceholder);

        // Calculate viewport size(s)
        let viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0,
            viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

        // Render dialog attached to an existing element
        if (this.options.linkTo !== null) {

            // Move dialog next to linkTo element
            this.options.linkTo.parentNode.insertBefore(this.dlg, this.options.linkTo.nextSibling);

            // Set position coordinates based on linked element coords
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` : 0;
            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` : 0;
        } else {

            // Append dialog to placeholder
            this.dlgPlaceholder.appendChild(this.dlg);

            // Get dialog width
            const dlgStyle = getComputedStyle(this.dlg), dlgStyleWidth = dlgStyle.getPropertyValue('width'),
                dlgStyleHeight = dlgStyle.getPropertyValue('height');

            // Calculate sizes
            this.options.size = {
                x: dlgStyleWidth.match(/px/) ? parseInt(dlgStyleWidth.replace(/px/, '')) : dlgStyleWidth.match(/%/) ? (viewportWidth * parseInt(dlgStyleWidth.replace(/%/, ''))) / 100 : this.dlg.offsetWidth,
                y: dlgStyleHeight.match(/px/) ? parseInt(dlgStyleHeight.replace(/px/, '')) : dlgStyleHeight.match(/%/) ? (viewportHeight * parseInt(dlgStyleHeight.replace(/%/, ''))) / 100 : this.dlg.offsetHeight
            };

            // Set position coordinates based on provided values
            this.dlg.style.marginLeft = this.options.position.x !== undefined ? `${this.options.position.x}px` : `${(viewportWidth - parseInt(this.options.size.x)) / 2}px`;

            this.dlg.style.marginTop = this.options.position.y !== undefined ? `${this.options.position.y}px` : `${(viewportHeight - parseInt(this.options.size.y)) / 2}px`;
        }

        // AutoClose
        if (this.options.autoClose) {
            setTimeout(() => {
                this.close()
            }, parseInt(this.options.autoClose) * 1000);
        }

        // Close dialog on escape
        if (this.options.closeOnEsc) {
            document.addEventListener('keyup', e => {

                let key = e.code, target = e.target;

                if (target.nodeType === 3) {
                    target = target.parentNode;
                }

                if (!/(ArrowUp|ArrowDown|Escape|Space)/.test(key) || /input|textarea/i.test(target.tagName)) {
                    return;
                }

                if (key === 'Escape' && this.isVisible()) {
                    this.close();
                }
            });
        }

        // Close dialog when outside click
        if (this.options.closeOnOutsideClick) {
            this.dlgPlaceholder.addEventListener('click', e => {
                let target = e.target;
                if (this.isVisible() && target !== this.dlg && !Dialog.isChild(target, this.dlg)) {
                    this.close();
                }
            });
        }

        // Attach callbacks
        Object.defineProperty(this.dlg, 'show', {
            value: () => {

                // Trigger onBeforeShow callback
                if (typeof this.options.callback.onBeforeShow === 'function') {
                    this.options.callback.onBeforeShow();
                }

                // Show dialog
                this.dlgPlaceholder.style.visibility = 'visible';

                // Trigger onBeforeShow callback
                if (typeof this.options.callback.onShow === 'function') {
                    this.options.callback.onShow();
                }
            }, configurable: true
        });

        Object.defineProperty(this.dlg, 'close', {
            value: () => {

                // Remove dialog
                if (this.isVisible()) {

                    // Trigger onClose callback
                    if (typeof this.options.callback.onClose === 'function') {
                        this.options.callback.onClose();
                    }

                    // Remove dialog
                    if (this.dlg.parentNode) {
                        this.dlg.parentNode.removeChild(this.dlg);
                    }

                    // Remove dialog placeholder
                    if (this.dlgPlaceholder.parentNode) {
                        this.dlgPlaceholder.parentNode.removeChild(this.dlgPlaceholder);
                    }
                    this.dlgPlaceholder = null;
                }
            }, configurable: true
        });

        // Show dialog (if autoShow is true)
        if (this.options.autoShow) {
            this.show();
        }
    }

    /**
     * Checks if dialog is visible.
     *
     * @return {boolean}
     */
    isVisible() {
        return this.dlgPlaceholder && !(this.dlgPlaceholder.style.visibility === 'hidden');
    }

    /**
     * Checks if dialog has been created.
     *
     * @return {boolean}
     */
    isCreated() {
        return this.dlgPlaceholder !== null;
    }

    /**
     * Closes dialog.
     */
    close() {
        this.dlg.close();
    }

    /**
     * Show dialog (if hidden)
     */
    show() {
        this.dlg.show();
    }
}

/**
 * VIVcoin app.
 *
 * @type {{dd: ((function(): {})|*), dialog: enableDialog, ob: Observer, route: (function(): {}), portfolio: renderPortfolio, spin: string, options: {url: string}, language: enableLanguageChange, exchange: renderExchangeRates, api: (function(*, *=, *=): Promise<Response>), notify: notification}}
 */
const vivCoin = (() => {

    /**
     * App options.
     * @type {{url: string}}
     */
    const op = {
        url: 'https://vivcoin.idealweb.ro/'
    };

    /**
     * Spinner elem.
     * @type {string}
     */
    const spinner = `<div class="spinner spinner-sm"></div>`;

    /**
     * Observer.
     * @type {Observer}
     */
    const observer = new Observer();

    /**
     * Call API endpoint.
     *
     * @param url
     * @param method
     * @param body
     * @return {Promise<Response>}
     */
    async function apiCall(url, method = 'GET', body = '') {

        // Prepare API call
        const apiCall = {
            method: method, mode: 'cors', cache: 'no-cache', credentials: 'same-origin', headers: {
                'Accept': 'application/json', 'Content-Type': 'application/json'
            }, body: body ? JSON.stringify(body) : ''
        };

        // POST request?
        if (method === 'GET' || method === 'HEAD') {
            delete apiCall.body;
        }

        return await fetch(`${vivCoin.options.url}${url}`, apiCall);
    }

    /**
     * Get route path.
     * @return {{}}
     */
    function getRoutePath() {

        const map = ['route', 'method', 'query'], path = window.location.pathname, hash = window.location.hash, route = {};

        // Populate path data
        if (path) {
            let tokens = path.replace(/^\/?|\/?$/g, '').split('/');
            if (tokens.length > 0) {

                for (let i = 0; i < map.length; i++) {
                    route[map[i]] = tokens[i];
                }
            }
        }

        // Populate hash
        if (hash) {
            route['hash'] = hash.substring(1);
        }

        return route;
    }

    /**
     * Enable dialogs across the app.
     */
    function enableDialog(dialog, callback = null) {

        const dialogAction = document.querySelectorAll(dialog);
        if (dialogAction.length > 0) {
            dialogAction.forEach((d) => {

                // Get dialog ref
                let dialogRef = d.getAttribute('data-ref'),
                    dialogBody = document.querySelector(dialogRef);

                if (dialogRef && dialogBody) {
                    d.addEventListener('click', () => {

                        // Close all previous dialogs
                        Dialog.closeAll();

                        // Create dialog
                        const dlg = new Dialog(dialogBody.innerHTML, {
                            dialogClassName: 'dialog-shadowed',
                            dialogPlaceholderClassName: 'dialog-placeholder-shadowed',
                            closeOnEsc: true,
                            closeOnOutsideClick: false
                        });

                        if (callback) {
                            callback(dlg, d.dataset || null);
                        }

                        // Close button action (if exists)
                        const closeButton = dlg.dlg.querySelector('.close-dialog');
                        if (closeButton) {
                            closeButton.addEventListener('click', (e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                dlg.close();
                            });
                        }
                    });
                }
            });
        }
    }

    /**
     * Trigger notification rendering.
     *
     * @param container Notification placeholder
     * @param message Notification message
     * @param type (Optional) Notification type (error, info, success, warning)
     * @param autoHide (Optional) Auto hide notification after given seconds
     */
    function notification(container, message, type = 'error', autoHide = 0) {

        // Validate container
        if (container) {

            container.classList.add('notification', 'notification-sm', 'notification-inline');

            // Clear existing class types
            container.classList.remove('error', 'success', 'info', 'warning');

            // Add type
            container.classList.add(type);

            // Add message
            container.innerHTML = message;

            // Auto hide message
            if (autoHide > 0) {

                // Hide notification after seconds
                setTimeout(() => {
                    container.classList.remove('notification', 'notification-sm', 'notification-inline');
                    container.innerHTML = '';
                }, (autoHide * 1000));
            }
        }
    }

    /**
     * Enable language change.
     */
    function enableLanguageChange() {

        const languageSwitch = document.querySelector('.lang');
        if (languageSwitch) {

            // Get dropdown menu ref
            let ddMenuRef = languageSwitch.getAttribute('data-ref'), ddMenuRefEl = document.querySelector(ddMenuRef);

            if (ddMenuRef && ddMenuRefEl) {

                languageSwitch.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Keep el selected
                    languageSwitch.classList.add('selected');

                    // Close all previous dialogs
                    Dialog.closeAll();

                    // Create dialog
                    const dlg = new Dialog(ddMenuRefEl.innerHTML, {
                        dialogClassName: 'dialog-languages',
                        dialogPlaceholderClassName: 'dialog-placeholder',
                        closeOnEsc: true,
                        closeOnOutsideClick: true,
                        linkTo: languageSwitch,
                        callback: {
                            onClose: () => {
                                languageSwitch.classList.remove('selected');
                            }
                        },
                        position: {
                            x: -4, y: 7
                        }
                    });
                });
            }
        }
    }

    /**
     * Enable dropdown menus across the app.
     * @return {{}}
     */
    function enableDropdownMenus() {

        const dropdownMenus = document.querySelectorAll('.trigger-dropdown-menu');
        if (dropdownMenus.length > 0) {

            dropdownMenus.forEach((d) => {

                // Get dropdown menu ref
                let ddMenuRef = d.getAttribute('data-ref'), ddMenuRefEl = document.querySelector(ddMenuRef);

                if (ddMenuRef && ddMenuRefEl) {

                    d.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        // Keep el selected
                        d.classList.add('selected');

                        // Close all previous dialogs
                        Dialog.closeAll();

                        // Create dialog
                        const dlg = new Dialog(ddMenuRefEl.innerHTML, {
                            dialogClassName: 'dialog',
                            dialogPlaceholderClassName: 'dialog-placeholder',
                            closeOnEsc: true,
                            closeOnOutsideClick: true,
                            linkTo: d,
                            callback: {
                                onClose: () => {
                                    d.classList.remove('selected');
                                }
                            },
                            position: {
                                x: -4, y: 7
                            }
                        });
                    });
                }
            });
        }
    }

    return {

        // Options
        options: op,

        // Spinner
        spin: spinner,

        // Observer
        ob: observer,

        // API call
        api: apiCall,

        // Route path
        route: getRoutePath,

        // Dropdown menus
        dd: enableDropdownMenus,

        // Dialogs
        dialog: enableDialog,

        // Language switch
        language: enableLanguageChange,

        // Notification
        notify: notification

    };

})();

/**
 * Initialize app.
 */
(() => {

    // Enable language switch
    vivCoin.language();

    // Enable dropdown menus
    vivCoin.dd();

})();