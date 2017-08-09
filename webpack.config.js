var path = require('path');
var fs = require('fs');
var glob = require('glob');
var webpack = require('webpack');
// var os = require('os')
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');


//定义文件夹路径
var ROOT_PATH = path.resolve(__dirname);
var SRC_PATH = path.resolve(ROOT_PATH, 'src');
var JS_PATH = path.resolve(SRC_PATH, 'js');
var BUILD_PATH = path.resolve(ROOT_PATH, 'build');


//提取CSS代码，生成单独的CSS文件
var extractCSS = new ExtractTextPlugin('css/[name].[hash:7].css');

var devpath;
//开发调试用地址变量----------------------------------------
// devpath='index';
// devpath='ticket-one-select';
// devpath='myInsureList';
//----------------------------------------------------------
// 获取页面入口文件
function getEntry() {
    var jsPath = path.resolve(SRC_PATH, 'js');
    var dirs = fs.readdirSync(jsPath);
    var matchs = [], files = {};
    dirs.forEach(function (item) {

        matchs = item.match(/(.+)\.js$/);
        if (matchs) {
            files[matchs[1]] = path.resolve(SRC_PATH, 'js', item);
        }
    });
    files["commons"]=files["comrequire"];
    delete files.comrequire;
    // 添加HMR模块，只用于开发模式
    // files["webpack-dev-server"] = "webpack-dev-server/client?http://0.0.0.0:8167/";
    //开发调试用----------------------------------------
    if(devpath!=null){
        var devfile={};
        devfile["commons"]=files["commons"];
        devfile[devpath]=files[devpath];
        return devfile;
    }
    //--------------------------------------------------



    return files;
}


//webpack 配置项
var config = {
    //源代码文件
    entry: getEntry(),
    // entry:entries,
    //输出文件夹
    output: {
        path: BUILD_PATH,
        filename: 'js/[name].[hash:7].js',
        chunkFilename: 'js/[id].chunk.js',
        publicPath: './'
    },
    resolve: {
        alias: {
            // jquery: SRC_PATH + "/js/lib/jquery.min.js",
            bootstrapjs: SRC_PATH + "/js/lib/bootstrap.min.js",
            bootstrapcss: SRC_PATH + "/css/lib/bootstrap.min.css",
            superslide:SRC_PATH + "/js/lib/jquery.SuperSlide.2.1.1.js",
            // cookie:SRC_PATH + "/js/lib/jquery.cookie.js",
            jPrint:SRC_PATH + "/js/lib/jQuery.print.js"
        }
    },

    devtool: "source-map",//用于开发，定位错误位置

    //开发调试时启动nodejs服务器
    devServer: {
        historyApiFallback: true,
        hot: true,
        port: 8167,
        host: "0.0.0.0"
    },
    module: {
        loaders: [
            // {
            //     test: /\.scss$/,
            //     loader: extractCSS.extract('style-loader', 'css-loader!sass-loader', {publicPath: '../'}),
            //     exclude: /node_modules/
            // },

            {
                test: /\.css$/,
                loader: extractCSS.extract('style-loader', 'css-loader', {publicPath: '../'})
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader: 'url-loader?name=img/[name].[hash:7].[ext]&limit=10000',
                exclude: /node_modules/
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg|otf)(\?.*$|$)/,
                loader: 'url-loader?importLoaders=1&limit=1000&name=fonts/[name].[hash:7].[ext]'
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.ejs$/,
                loader: 'ejs-compiled',
                exclude: /(node_modules|bower_components)/
            },
            {
                test: /\.hdbs$/,
                loader: "handlebars-loader?helperDirs[]="+ ROOT_PATH +"/src/helpers",
                exclude: /(node_modules|bower_components)/
            }
        ]
    },
    plugins: [
        // 需要直接复制的文件
        new CopyWebpackPlugin([
            // 所有img标签引用的非临时图片放到img目录下
            {
                from: path.join(SRC_PATH, 'img'),
                to: 'img'
            },
            {
                from: path.join(ROOT_PATH, 'plan'),
                to: 'plan'
            },
            {
                from: path.join(SRC_PATH, 'air-type-img'),
                to: 'air-type-img'
            },
            {
                from: path.join(ROOT_PATH, 'active-page'),
                to: 'active-page'
            },
            {
                from: path.join(JS_PATH, 'lib'),
                to: 'js-lib'
            },
            {
                from: path.join(ROOT_PATH, 'questionnaire'),
                to: ''
            }
        ]),

        //关掉console.log
        // new webpack.optimize.UglifyJsPlugin({
        //     compress:{
        //         warnings: false,
        //         drop_debugger: true,
        //         drop_console: true
        //     }
        // }),


        // 提取公用模块(单页面用不到,仅在多页面时候使用,此处仅作示例)
        // new CommonsChunkPlugin({
        //     name: 'commons',
        //     chunks: ['comrequire'],
        //     minChunks: 1
        // }),

        // 生成CSS文件
        extractCSS

    ]
    // externals: {
    //     'jquery': 'window.jquery'
    // }
};


var jsPath = path.resolve(SRC_PATH, 'js');
var dirs = fs.readdirSync(jsPath);
var matchs = [], pages = [];
dirs.forEach(function (item) {

    matchs = item.match(/(.+)\.js$/);
    if (matchs) {
        if(matchs[1]!='comrequire')pages.push(matchs[1])
    }
});
//开发调试用----------------------------------------
if(devpath!=null)pages=[devpath];
//--------------------------------------------------
pages.forEach(function (pathname) {
    // 配置生成的html文件，定义路径等
    var conf = {
        favicon:'./src/img/favicon.ico',
        template: path.join(SRC_PATH, 'tpl/')+pathname+'.ejs',   // 模板路径
        filename: pathname + '.html',
        inject: 'body',              // js插入位置
        // necessary to consistently work with multiple chunks via CommonsChunkPlugin
        minify:{    //压缩HTML文件
            removeComments:true,    //移除HTML中的注释
            collapseWhitespace:false    //删除空白符与换行符
        }
    };

    if (pathname in config.entry) {
        if(pathname=='loginloading'){
            conf.chunks = [pathname];
        }else{
            conf.chunks = ['commons',  pathname];
        }
        // conf.hash = true;
    }

    config.plugins.push(new HtmlWebpackPlugin(conf));
});


module.exports = config;