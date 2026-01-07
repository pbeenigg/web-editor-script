// ==UserScript==
// @name         网页内容全功能编辑器 v2.2
// @namespace    http://tampermonkey.net/
// @version      2.2
// @description  强大的网页内容编辑工具，支持富文本编辑、智能格式化、高亮显示等功能
// @author       PbEeNiG
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    GM_addStyle(`
        /* 编辑器工具栏样式 */
        #webpage-editor-toolbar {
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            z-index: 999999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            transition: all 0.3s ease;
            opacity: 0.9;
        }

        #webpage-editor-toolbar:hover {
            opacity: 1;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }

        .editor-btn {
            width: 48px;
            height: 48px;
            border: none;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            font-size: 18px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }

        .editor-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }

        .editor-btn:active {
            transform: scale(0.95);
        }

        .editor-btn.active {
            background: rgba(76, 175, 80, 0.9);
            box-shadow: 0 0 20px rgba(76, 175, 80, 0.6);
        }

        /* 编辑模式样式 */
        [contenteditable="true"] {
            outline: 2px dashed #4CAF50 !important;
            outline-offset: 4px;
            background-color: rgba(76, 175, 80, 0.05) !important;
            transition: all 0.3s ease;
            position: relative;
        }

        [contenteditable="true"]:hover {
            outline-color: #FFC107 !important;
            background-color: rgba(255, 193, 7, 0.1) !important;
        }

        [contenteditable="true"]:focus {
            outline: 3px solid #2196F3 !important;
            outline-offset: 6px;
            background-color: rgba(33, 150, 243, 0.1) !important;
            box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
        }

        /* 编辑横幅 */
        #edit-mode-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 999998;
            background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
            color: white;
            padding: 12px 20px;
            text-align: center;
            font-family: 'Arial', sans-serif;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
            from {
                transform: translateY(-100%);
            }
            to {
                transform: translateY(0);
            }
        }

        .banner-icon {
            display: inline-block;
            margin: 0 8px;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.2);
            }
        }

        /* 格式化工具栏 */
        #format-toolbar {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999999;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 12px 20px;
            display: none;
            flex-wrap: wrap;
            gap: 8px;
            max-width: 90%;
        }

        #format-toolbar.active {
            display: flex;
        }

        .format-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
        }

        .format-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .format-btn:active {
            transform: translateY(0);
        }

        /* 元素选择器高亮 */
        .element-selector-highlight {
            outline: 3px solid #FF5722 !important;
            outline-offset: 4px;
            background-color: rgba(255, 87, 34, 0.1) !important;
            cursor: pointer !important;
        }

        /* 工具提示 */
        .editor-tooltip {
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            white-space: pre-line;
            pointer-events: none;
            z-index: 1000000;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .editor-tooltip.show {
            opacity: 1;
        }

        /* 颜色选择器 */
        #color-picker-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000000;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            padding: 24px;
            display: none;
        }

        #color-picker-panel.active {
            display: block;
            animation: zoomIn 0.3s ease;
        }

        @keyframes zoomIn {
            from {
                transform: translate(-50%, -50%) scale(0.8);
                opacity: 0;
            }
            to {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }

        .color-grid {
            display: grid;
            grid-template-columns: repeat(8, 40px);
            gap: 8px;
            margin: 16px 0;
        }

        .color-swatch {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }

        .color-swatch:hover {
            transform: scale(1.1);
            border-color: #333;
        }

        /* 快捷键提示 */
        #shortcuts-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000000;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            padding: 24px;
            width: 500px;
            max-height: 600px;
            overflow-y: auto;
            display: none;
        }

        #shortcuts-panel.active {
            display: block;
            animation: zoomIn 0.3s ease;
        }

        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
        }

        .shortcut-key {
            background: #f5f5f5;
            padding: 6px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-weight: bold;
            color: #667eea;
        }
    `);

    // 编辑器状态
    let editorState = {
        editMode: false,
        selectorMode: false,
        formatToolbarVisible: false,
        history: [],
        historyIndex: -1,
        selectedElement: null
    };

    // 创建工具栏
    function createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'webpage-editor-toolbar';
        toolbar.innerHTML = `
            <button class="editor-btn" id="edit-mode-btn" title="切换编辑模式 (Ctrl+E)">
                ✏️
            </button>
            <button class="editor-btn" id="selector-mode-btn" title="元素选择器 (Ctrl+S)">
                🎯
            </button>
            <button class="editor-btn" id="format-toolbar-btn" title="格式化工具栏 (Ctrl+F)">
                🎨
            </button>
            <button class="editor-btn" id="undo-btn" title="撤销 (Ctrl+Z)">
                ↶
            </button>
            <button class="editor-btn" id="redo-btn" title="重做 (Ctrl+Y)">
                ↷
            </button>
            <button class="editor-btn" id="save-btn" title="保存修改 (Ctrl+Shift+S)">
                💾
            </button>
            <button class="editor-btn" id="reset-btn" title="重置页面 (Ctrl+R)">
                🔄
            </button>
            <button class="editor-btn" id="shortcuts-btn" title="快捷键说明 (F1)">
                ❓
            </button>
        `;
        document.body.appendChild(toolbar);

        // 绑定事件
        document.getElementById('edit-mode-btn').addEventListener('click', toggleEditMode);
        document.getElementById('selector-mode-btn').addEventListener('click', toggleSelectorMode);
        document.getElementById('format-toolbar-btn').addEventListener('click', toggleFormatToolbar);
        document.getElementById('undo-btn').addEventListener('click', undo);
        document.getElementById('redo-btn').addEventListener('click', redo);
        document.getElementById('save-btn').addEventListener('click', saveChanges);
        document.getElementById('reset-btn').addEventListener('click', resetPage);
        document.getElementById('shortcuts-btn').addEventListener('click', showShortcuts);
    }

    // 创建格式化工具栏
    function createFormatToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'format-toolbar';
        toolbar.innerHTML = `
            <button class="format-btn" data-command="bold">
                <strong>粗体</strong>
            </button>
            <button class="format-btn" data-command="italic">
                <em>斜体</em>
            </button>
            <button class="format-btn" data-command="underline">
                <u>下划线</u>
            </button>
            <button class="format-btn" data-command="strikeThrough">
                <s>删除线</s>
            </button>
            <button class="format-btn" id="color-btn">
                🎨 颜色
            </button>
            <button class="format-btn" id="highlight-btn">
                🖍️ 高亮
            </button>
            <button class="format-btn" data-command="formatBlock" data-value="h1">
                H1
            </button>
            <button class="format-btn" data-command="formatBlock" data-value="h2">
                H2
            </button>
            <button class="format-btn" data-command="formatBlock" data-value="p">
                段落
            </button>
            <button class="format-btn" data-command="insertUnorderedList">
                • 列表
            </button>
            <button class="format-btn" data-command="insertOrderedList">
                1. 列表
            </button>
            <button class="format-btn" data-command="indent">
                ➡️ 缩进
            </button>
            <button class="format-btn" data-command="outdent">
                ⬅️ 减少缩进
            </button>
            <button class="format-btn" data-command="justifyLeft">
                ⬅ 左对齐
            </button>
            <button class="format-btn" data-command="justifyCenter">
                ⬌ 居中
            </button>
            <button class="format-btn" data-command="justifyRight">
                ➡ 右对齐
            </button>
            <button class="format-btn" id="clear-format-btn">
                🧹 清除格式
            </button>
            <button class="format-btn" id="format-json-btn">
                📋 格式化JSON
            </button>
            <button class="format-btn" id="format-html-btn">
                📝 格式化HTML
            </button>
        `;
        document.body.appendChild(toolbar);

        // 绑定标准格式化命令
        toolbar.querySelectorAll('[data-command]').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.getAttribute('data-command');
                const value = btn.getAttribute('data-value');
                document.execCommand(command, false, value);
            });
        });

        // 绑定特殊功能按钮
        document.getElementById('color-btn').addEventListener('click', showColorPicker);
        document.getElementById('highlight-btn').addEventListener('click', showHighlightPicker);
        document.getElementById('clear-format-btn').addEventListener('click', clearFormat);
        document.getElementById('format-json-btn').addEventListener('click', formatJSON);
        document.getElementById('format-html-btn').addEventListener('click', formatHTML);
    }

    // 切换编辑模式
    function toggleEditMode() {
        editorState.editMode = !editorState.editMode;
        const btn = document.getElementById('edit-mode-btn');

        if (editorState.editMode) {
            enableEditMode();
            btn.classList.add('active');
        } else {
            disableEditMode();
            btn.classList.remove('active');
        }
    }

    // 启用编辑模式
    function enableEditMode() {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, li, td, th, a, button, label');
        textElements.forEach(el => {
            if (!el.closest('#webpage-editor-toolbar') && !el.closest('#format-toolbar')) {
                el.contentEditable = 'true';
                el.addEventListener('input', () => saveToHistory(el));
            }
        });
        showEditBanner();
    }

    // 禁用编辑模式
    function disableEditMode() {
        const textElements = document.querySelectorAll('[contenteditable="true"]');
        textElements.forEach(el => {
            el.contentEditable = 'false';
        });
        const banner = document.getElementById('edit-mode-banner');
        if (banner) banner.remove();
    }

    // 显示编辑横幅
    function showEditBanner() {
        if (document.getElementById('edit-mode-banner')) return;

        const banner = document.createElement('div');
        banner.id = 'edit-mode-banner';
        banner.innerHTML = `
            <span class="banner-icon">✏️</span>
            编辑模式已激活 | 按 Ctrl+E 退出 | 按 Ctrl+F 显示格式化工具栏
            <span class="banner-icon">✨</span>
        `;
        document.body.insertBefore(banner, document.body.firstChild);
    }

    // 切换元素选择器模式
    function toggleSelectorMode() {
        editorState.selectorMode = !editorState.selectorMode;
        const btn = document.getElementById('selector-mode-btn');

        if (editorState.selectorMode) {
            enableSelectorMode();
            btn.classList.add('active');
        } else {
            disableSelectorMode();
            btn.classList.remove('active');
        }
    }

    // 启用元素选择器
    function enableSelectorMode() {
        document.addEventListener('mouseover', highlightElement);
        document.addEventListener('click', selectElement, true);
    }

    // 禁用元素选择器
    function disableSelectorMode() {
        document.removeEventListener('mouseover', highlightElement);
        document.removeEventListener('click', selectElement, true);

        document.querySelectorAll('.element-selector-highlight').forEach(el => {
            el.classList.remove('element-selector-highlight');
        });
    }

    // 高亮元素
    function highlightElement(e) {
        if (e.target.closest('#webpage-editor-toolbar') || e.target.closest('#format-toolbar')) return;

        document.querySelectorAll('.element-selector-highlight').forEach(el => {
            el.classList.remove('element-selector-highlight');
        });

        e.target.classList.add('element-selector-highlight');
    }

    // 选择元素
    function selectElement(e) {
        if (e.target.closest('#webpage-editor-toolbar') || e.target.closest('#format-toolbar')) return;

        e.preventDefault();
        e.stopPropagation();

        editorState.selectedElement = e.target;
        editorState.selectedElement.contentEditable = 'true';
        editorState.selectedElement.focus();

        toggleSelectorMode();
        showTooltip(e.target, '元素已选中，现在可以编辑');
    }

    // 切换格式化工具栏
    function toggleFormatToolbar() {
        editorState.formatToolbarVisible = !editorState.formatToolbarVisible;
        const toolbar = document.getElementById('format-toolbar');
        const btn = document.getElementById('format-toolbar-btn');

        if (editorState.formatToolbarVisible) {
            toolbar.classList.add('active');
            btn.classList.add('active');
        } else {
            toolbar.classList.remove('active');
            btn.classList.remove('active');
        }
    }

    // 验证是否为有效的 JSON
    function isValidJSON(str) {
        if (!str) return false;

        const trimmed = str.trim();
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
            return false;
        }

        try {
            JSON.parse(trimmed);
            return true;
        } catch {
            return false;
        }
    }

    // 验证是否为有效的 HTML
    function isValidHTML(str) {
        if (!str) return false;

        const trimmed = str.trim();
        const hasHTMLTags = /<[a-z][\s\S]*>/i.test(trimmed);
        if (!hasHTMLTags) {
            return false;
        }

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(trimmed, 'text/html');
            const parserErrors = doc.querySelectorAll('parsererror');
            return parserErrors.length === 0;
        } catch {
            return false;
        }
    }

    // 格式化JSON
    function formatJSON() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            alert('⚠️ 请先选中需要格式化的文本');
            return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (!selectedText) {
            alert('⚠️ 未选中任何文本');
            return;
        }

        if (!isValidJSON(selectedText)) {
            alert('❌ 所选内容不是有效的 JSON 格式\n\n提示：JSON 应该以 { 或 [ 开头');
            return;
        }

        try {
            const parsed = JSON.parse(selectedText);
            const formatted = JSON.stringify(parsed, null, 2);

            range.deleteContents();
            const pre = document.createElement('pre');
            pre.style.cssText = 'background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.5;';
            pre.textContent = formatted;
            range.insertNode(pre);

            showTooltip(pre, '✅ JSON 格式化成功');
        } catch (error) {
            alert('❌ JSON 格式化失败：' + error.message);
        }
    }

    // 格式化HTML
    function formatHTML() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            alert('⚠️ 请先选中需要格式化的文本');
            return;
        }

        const range = selection.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (!selectedText) {
            alert('⚠️ 未选中任何文本');
            return;
        }

        if (!isValidHTML(selectedText)) {
            alert('❌ 所选内容不是有效的 HTML 格式\n\n提示：HTML 应该包含标签，如 <div>、<p> 等');
            return;
        }

        try {
            let formatted = selectedText
                .replace(/></g, '>\n<')
                .replace(/^\s*\n/gm, '');

            let indent = 0;
            const indentSize = 2;
            formatted = formatted.split('\n').map(line => {
                const trimmedLine = line.trim();

                if (trimmedLine.match(/^<\/\w+/)) {
                    indent = Math.max(0, indent - 1);
                }

                const result = ' '.repeat(indent * indentSize) + trimmedLine;

                if (trimmedLine.match(/<\w+[^>]*[^/]>$/) && !trimmedLine.match(/<(br|hr|img|input|meta|link)\b/i)) {
                    indent++;
                }

                return result;
            }).join('\n');

            range.deleteContents();
            const pre = document.createElement('pre');
            pre.style.cssText = 'background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 14px; line-height: 1.5;';
            pre.textContent = formatted;
            range.insertNode(pre);

            showTooltip(pre, '✅ HTML 格式化成功');
        } catch (error) {
            alert('❌ HTML 格式化失败：' + error.message);
        }
    }

    // 清除格式
    function clearFormat() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            alert('⚠️ 请先选中需要清除格式的文本');
            return;
        }

        const range = selection.getRangeAt(0);
        let selectedText = range.toString();

        if (!selectedText) {
            alert('⚠️ 未选中任何文本');
            return;
        }

        let cleanedText = selectedText
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .replace(/\\r\\n/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\r\n/g, ' ')
            .replace(/\n/g, ' ')
            .replace(/\r/g, ' ')
            .replace(/\t/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/[\u00A0]/g, ' ')
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .trim();

        range.deleteContents();
        const textNode = document.createTextNode(cleanedText);
        range.insertNode(textNode);

        const removedChars = selectedText.length - cleanedText.length;
        showTooltip(textNode, `✅ 已清除格式\n移除了 ${removedChars} 个特殊字符`);
    }

    // 显示颜色选择器
    function showColorPicker() {
        const picker = createColorPicker('文字颜色', (color) => {
            document.execCommand('foreColor', false, color);
        });
        document.body.appendChild(picker);
    }

    // 显示高亮颜色选择器
    function showHighlightPicker() {
        const picker = createColorPicker('背景高亮', (color) => {
            document.execCommand('hiliteColor', false, color);
        });
        document.body.appendChild(picker);
    }

    // 创建颜色选择器
    function createColorPicker(title, callback) {
        const panel = document.createElement('div');
        panel.id = 'color-picker-panel';
        panel.classList.add('active');

        const colors = [
            '#000000', '#424242', '#666666', '#999999', '#BDBDBD', '#E0E0E0', '#F5F5F5', '#FFFFFF',
            '#D32F2F', '#E53935', '#F44336', '#EF5350', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE',
            '#C2185B', '#D81B60', '#E91E63', '#EC407A', '#F06292', '#F48FB1', '#F8BBD0', '#FCE4EC',
            '#7B1FA2', '#8E24AA', '#9C27B0', '#AB47BC', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5',
            '#512DA8', '#5E35B1', '#673AB7', '#7E57C2', '#9575CD', '#B39DDB', '#D1C4E9', '#EDE7F6',
            '#303F9F', '#3949AB', '#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9', '#E8EAF6',
            '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', '#E3F2FD',
            '#0288D1', '#039BE5', '#03A9F4', '#29B6F6', '#4FC3F7', '#81D4FA', '#B3E5FC', '#E1F5FE',
            '#0097A7', '#00ACC1', '#00BCD4', '#26C6DA', '#4DD0E1', '#80DEEA', '#B2EBF2', '#E0F7FA',
            '#00796B', '#00897B', '#009688', '#26A69A', '#4DB6AC', '#80CBC4', '#B2DFDB', '#E0F2F1',
            '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9',
            '#689F38', '#7CB342', '#8BC34A', '#9CCC65', '#AED581', '#C5E1A5', '#DCEDC8', '#F1F8E9',
            '#AFB42B', '#C0CA33', '#CDDC39', '#D4E157', '#DCE775', '#E6EE9C', '#F0F4C3', '#F9FBE7',
            '#FBC02D', '#FDD835', '#FFEB3B', '#FFEE58', '#FFF176', '#FFF59D', '#FFF9C4', '#FFFDE7',
            '#FFA000', '#FFB300', '#FFC107', '#FFCA28', '#FFD54F', '#FFE082', '#FFECB3', '#FFF8E1',
            '#F57C00', '#FB8C00', '#FF9800', '#FFA726', '#FFB74D', '#FFCC80', '#FFE0B2', '#FFF3E0',
            '#E64A19', '#F4511E', '#FF5722', '#FF7043', '#FF8A65', '#FFAB91', '#FFCCBC', '#FBE9E7',
            '#5D4037', '#6D4C41', '#795548', '#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'
        ];

        panel.innerHTML = `
            <h3 style="margin: 0 0 16px 0; color: #333;">${title}</h3>
            <div class="color-grid">
                ${colors.map(color => `
                    <div class="color-swatch" style="background-color: ${color};" data-color="${color}"></div>
                `).join('')}
            </div>
            <div style="margin-top: 16px; text-align: center;">
                <input type="color" id="custom-color" style="width: 60px; height: 40px; border: none; border-radius: 8px; cursor: pointer;">
                <button class="format-btn" style="margin-left: 12px;" id="close-color-picker">关闭</button>
            </div>
        `;

        panel.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.getAttribute('data-color');
                callback(color);
                panel.remove();
            });
        });

        panel.querySelector('#custom-color').addEventListener('change', (e) => {
            callback(e.target.value);
            panel.remove();
        });

        panel.querySelector('#close-color-picker').addEventListener('click', () => {
            panel.remove();
        });

        return panel;
    }

    // 保存到历史记录
    function saveToHistory(element) {
        const snapshot = {
            element: element,
            content: element.innerHTML,
            timestamp: new Date().toLocaleString()
        };

        editorState.history = editorState.history.slice(0, editorState.historyIndex + 1);
        editorState.history.push(snapshot);
        editorState.historyIndex++;

        if (editorState.history.length > 50) {
            editorState.history.shift();
            editorState.historyIndex--;
        }
    }

    // 撤销
    function undo() {
        if (editorState.historyIndex > 0) {
            editorState.historyIndex--;
            const snapshot = editorState.history[editorState.historyIndex];
            snapshot.element.innerHTML = snapshot.content;
            showTooltip(snapshot.element, '↶ 已撤销');
        } else {
            alert('⚠️ 没有可撤销的操作');
        }
    }

    // 重做
    function redo() {
        if (editorState.historyIndex < editorState.history.length - 1) {
            editorState.historyIndex++;
            const snapshot = editorState.history[editorState.historyIndex];
            snapshot.element.innerHTML = snapshot.content;
            showTooltip(snapshot.element, '↷ 已重做');
        } else {
            alert('⚠️ 没有可重做的操作');
        }
    }

    // 保存修改
    function saveChanges() {
        const changes = [];
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            changes.push({
                selector: getElementSelector(el),
                content: el.innerHTML
            });
        });

        const url = window.location.href;
        GM_setValue(`edits_${url}`, JSON.stringify(changes));

        alert('💾 修改已保存！\n\n保存了 ' + changes.length + ' 个元素的修改。');
    }

    // 重置页面
    function resetPage() {
        if (confirm('🔄 确定要重置页面吗？所有未保存的修改将丢失！')) {
            const url = window.location.href;
            GM_setValue(`edits_${url}`, null);
            location.reload();
        }
    }

    // 显示快捷键说明
    function showShortcuts() {
        if (document.getElementById('shortcuts-panel')) {
            document.getElementById('shortcuts-panel').remove();
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'shortcuts-panel';
        panel.classList.add('active');
        panel.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #667eea; text-align: center;">⌨️ 快捷键说明</h2>
            <div class="shortcut-item">
                <span>切换编辑模式</span>
                <span class="shortcut-key">Ctrl + E</span>
            </div>
            <div class="shortcut-item">
                <span>元素选择器</span>
                <span class="shortcut-key">Ctrl + S</span>
            </div>
            <div class="shortcut-item">
                <span>格式化工具栏</span>
                <span class="shortcut-key">Ctrl + F</span>
            </div>
            <div class="shortcut-item">
                <span>撤销</span>
                <span class="shortcut-key">Ctrl + Z</span>
            </div>
            <div class="shortcut-item">
                <span>重做</span>
                <span class="shortcut-key">Ctrl + Y</span>
            </div>
            <div class="shortcut-item">
                <span>保存修改</span>
                <span class="shortcut-key">Ctrl + Shift + S</span>
            </div>
            <div class="shortcut-item">
                <span>粗体</span>
                <span class="shortcut-key">Ctrl + B</span>
            </div>
            <div class="shortcut-item">
                <span>斜体</span>
                <span class="shortcut-key">Ctrl + I</span>
            </div>
            <div class="shortcut-item">
                <span>下划线</span>
                <span class="shortcut-key">Ctrl + U</span>
            </div>
            <div class="shortcut-item">
                <span>显示此帮助</span>
                <span class="shortcut-key">F1</span>
            </div>

            <h3 style="margin: 20px 0 10px 0; color: #667eea; font-size: 16px;">💡 格式化功能说明</h3>
            <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 8px 0;"><strong>📋 JSON 格式化：</strong>自动识别 JSON 格式并美化缩进</p>
                <p style="margin: 0 0 8px 0;"><strong>📝 HTML 格式化：</strong>自动识别 HTML 标签并格式化</p>
                <p style="margin: 0;"><strong>🧹 清除格式：</strong>移除 \\n、\\r、\\t 等特殊字符，保留文本内容</p>
            </div>

            <div style="margin-top: 20px; text-align: center;">
                <button class="format-btn" id="close-shortcuts">关闭</button>
            </div>
        `;

        document.body.appendChild(panel);

        panel.querySelector('#close-shortcuts').addEventListener('click', () => {
            panel.remove();
        });
    }

    // 显示工具提示
    function showTooltip(element, message) {
        const tooltip = document.createElement('div');
        tooltip.className = 'editor-tooltip show';
        tooltip.textContent = message;

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.top - 60) + 'px';

        document.body.appendChild(tooltip);

        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 200);
        }, 3000);
    }

    // 获取元素选择器
    function getElementSelector(element) {
        if (element.id) return `#${element.id}`;

        let path = [];
        while (element.parentElement) {
            let selector = element.tagName.toLowerCase();
            if (element.className) {
                selector += '.' + element.className.split(' ').join('.');
            }
            path.unshift(selector);
            element = element.parentElement;
        }

        return path.join(' > ');
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            toggleEditMode();
        }

        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            toggleSelectorMode();
        }

        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            toggleFormatToolbar();
        }

        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }

        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            redo();
        }

        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            saveChanges();
        }

        if (e.key === 'F1') {
            e.preventDefault();
            showShortcuts();
        }

        if (e.key === 'Escape') {
            if (editorState.editMode) toggleEditMode();
            if (editorState.selectorMode) toggleSelectorMode();
            if (editorState.formatToolbarVisible) toggleFormatToolbar();

            ['color-picker-panel', 'shortcuts-panel'].forEach(id => {
                const panel = document.getElementById(id);
                if (panel) panel.remove();
            });
        }
    });

    // 加载保存的修改
    function loadSavedChanges() {
        const url = window.location.href;
        const saved = GM_getValue(`edits_${url}`);

        if (saved) {
            try {
                const changes = JSON.parse(saved);
                changes.forEach(change => {
                    const element = document.querySelector(change.selector);
                    if (element) {
                        element.innerHTML = change.content;
                    }
                });
                console.log('✅ 已加载 ' + changes.length + ' 个保存的修改');
            } catch (error) {
                console.error('❌ 加载保存的修改失败:', error);
            }
        }
    }

    // 初始化
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        createToolbar();
        createFormatToolbar();
        loadSavedChanges();

        console.log('✨ 网页内容全功能编辑器 v2.2 已启动！');
        console.log('💡 按 F1 查看快捷键说明');
    }

    init();
})();
