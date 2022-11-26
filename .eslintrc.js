/*
 * Eslint config file
 * Documentation: https://eslint.org/docs/user-guide/configuring/
 * Install the Eslint extension before using this feature.
 */
module.exports = {
    env: {
        es6: true,
        browser: true,
        node: true,
    },
    // ecmaFeatures: {
    //     modules: true,
    // },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
            // lambda表达式
            arrowFunctions: true,
            // 解构赋值
            destructuring: true,
            // class
            classes: true,
        },
    },
    globals: {
        wx: true,
        App: true,
        Page: true,
        getCurrentPages: true,
        getApp: true,
        Component: true,
        requirePlugin: true,
        requireMiniProgram: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint"
    ],
    extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        semi: "off", //不检查;结尾
        // ---ts---
        '@typescript-eslint/ban-ts-comment': 'off', // 关闭‘禁止使用@ts-’，默认开启
        '@typescript-eslint/no-empty-function': 'off', // 关闭‘禁止空方法’，默认为开启
        '@typescript-eslint/no-var-requires': 'warn', // 允许使用require，但是警告(默认不允许)
        '@typescript-eslint/explicit-module-boundary-types': 'off', // 关闭'函数必须定义参数类型和返回类型'，默认即开启
        "@typescript-eslint/no-explicit-any": "off",
        'prefer-const': 1, // 要求使用 const 声明那些声明后不再被修改的变量
        'max-len': 'off', // 强制一行的最大长度
        'no-console': 'off', // 禁用 console
        'no-debugger': 'off', // 禁用 debugger
        'no-plusplus': 0, // 禁止使用++，--
        'no-var': 'error', // 禁止使用var
        'no-extra-semi': 0, // 和prettier冲突
        'import/extensions': 0, // import不需要写文件扩展名
        'no-underscore-dangle': 0, // 禁止标识符中有悬空下划线
        'no-restricted-syntax': 0, // 禁用特定的语法
        'consistent-return': 'off', // 要求 return 语句要么总是指定返回的值，要么不指定
        'template-curly-spacing': 'off', // 要求或禁止模板字符串中的嵌入表达式周围空格的使用
        'linebreak-style': [0, 'error', 'unix'], // 强制使用一致的换行风格
        'arrow-parens': ['error', 'always'], // 要求箭头函数的参数使用圆括号
        'no-param-reassign': ['warn', {
            props: false
        }], // 禁止对 function 的参数进行重新赋值
        indent: [
            'warn',
            4,
            {
                ignoredNodes: ['TemplateLiteral'],
                SwitchCase: 1,
            },
        ],
    },
}