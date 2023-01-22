// @ts-nocheck
const pkg = require('../package.json')
const eslint = require('@rollup/plugin-eslint')
const json = require('@rollup/plugin-json')
const path = require('path')
const { babel } = require('@rollup/plugin-babel')
const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const typescript = require('rollup-plugin-typescript2')
const copy = require('rollup-plugin-copy')
const postcss = require('postcss')

const sass = require('rollup-plugin-sass')
const alias = require('@rollup/plugin-alias')
const scssVariable = require('rollup-plugin-sass-variables')
const peerDepsExternal = require('rollup-plugin-peer-deps-external')
const { parseObject2Array } = require('./utils.js')
const postCssPlugins = require('../postcss.config').plugins

const entry = './src/index.ts'

const aliasList = {
    '@components': path.resolve(__dirname, '../src/components'),
    '@src': path.resolve(__dirname, '../src'),
    '@common': path.resolve(__dirname, '../src/common'),
    '@managers': path.resolve(__dirname, '../src/managers'),
    'assets': path.resolve(__dirname, "../src/assets")
}

const sassConfig = {
    output: true,
    processor: (css) => postcss(postCssPlugins)
        .process(css, { from: undefined })
        .then(res => res.css)
}

const babelConfig = {
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    exclude: [
        '**/node_modules/**'
    ]
}

const basePlugins = [
    peerDepsExternal({
        includeDependencies: true
    }), //自动将package.json的peerDependencies作为external
    alias({
        entries: parseObject2Array(aliasList, 'find', 'replacement')
    }),
    json(), //处理json文件到es6 module
    scssVariable(),
    nodeResolve({
        main: true,
        preferBuiltins: true,
        dedupe: [ path.resolve(__dirname, '../src/assets/*') ]
    }), //解析node_modules中导入的模块
    eslint(),
    typescript(),
    sass(sassConfig),
    commonjs({
        browser: true
    }),
    babel(babelConfig),
    copy({
        targets: [
            { src: 'src/assets/', dest: 'dist/' },
        ]
    })
]

const baseOutput = [
    {
        file: pkg.main,
        format: 'esm',
    }, //前端使用时需要cjs转译
]

const baseConfig = {
    input: entry,
    output: [], // 输出
    plugins: [],
    externals: [],
    globals: {}
}

module.exports = {
    basePlugins,
    baseOutput,
    baseConfig,
}