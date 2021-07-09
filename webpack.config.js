const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const manifest = require('./plugins/manifest')

const production = process.env.NODE_ENV === "production";
const development = process.env.NODE_ENV === "development";
const mode = development ? "development" : "production";


// just display it to the console
console.log(`Build ENV: ${mode.toUpperCase()}`);




module.exports = {
    entry: {
        'content': './src/content/index.ts',
        'background': './src/background/index.ts'
    },
    mode,
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].bundle.js',
    },
    devtool: development ? "inline-source-map" : "source-map",
    resolve: {
        extensions: [".js", ".json", ".ts", ".tsx"],
        modules: [
            path.resolve(__dirname, '/src'),
            path.resolve(__dirname, 'node_modules/')
        ],
    },
    watch: development,
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Faceit pick map assistant',
            template: path.resolve(__dirname, './src/popup/template.html'),
            filename: "index.html",
            chunks: ['popup']
        }),
        new MiniCssExtractPlugin(),
        manifest,
        new CopyWebpackPlugin({
            patterns: [
                { from: 'static' }
            ]
        })
    ],
    module: {
        rules: [
            {
                test:  /\.(ts|js)x?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
}