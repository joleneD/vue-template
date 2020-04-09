const path = require('path');
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin"); // 开启gzip压缩， 按需引用
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i; // 开启gzip压缩， 按需写入
const IS_PROD = ["production", "test"].includes(process.env.NODE_ENV);
const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
  publicPath: './',            // 公共,基本路径
  indexPath: 'index.html', // 相对于打包路径index.html的路径
  // 输出文件目录，不同的环境打不同包名
  outputDir: process.env.NODE_ENV === "development" ? 'devdist' : 'dist',
  assetsDir: 'static',        // 相对于outputDir的静态资源(js、css、img、fonts)目录
  // 默认在生成的静态资源文件名中包含hash以控制缓存
  filenameHashing: true,
  lintOnSave: process.env.NODE_ENV !== "production",         // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
  runtimeCompiler: true, // 是否使用包含运行时编译器的 Vue 构建版本
  productionSourceMap: false,  // 生产环境下css 分离文件, sourceMap 文件
  parallel: require("os").cpus().length > 1, // 是否为 Babel 或 TypeScript 使用 thread-loader。该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建。
  pwa: {}, // 向 PWA 插件传递选项。

  devServer: {
    port: 10002,
    host: "localhost",   // 0.0.0.0
    open: true,          // 配置自动启动浏览器
    https: false,
    hotOnly: true,// 热更新
    overlay: { // 让浏览器 overlay 同时显示警告和错误
      warnings: true,
      errors: true
    },
    //  配置代理
    // proxy: null,//,解决跨域的问题, 只有一个代理
    // proxy: { //配置多个跨域
    //   "/api": {
    //     target: "http://datahive.minedata.cn",
    //     changeOrigin: true,
    //     // ws: true,//websocket支持
    //     secure: false,
    //     pathRewrite: {
    //       "^/api": "/"
    //     }
    //   },
    //   "/api2": {
    //     target: "http://114.116.170.253:8008/",
    //     changeOrigin: true,
    //     //ws: true,//websocket支持
    //     secure: false,
    //     pathRewrite: {
    //       "^/api2": "/"
    //     }
    //   },
    // },
    before: app => { },     // 第三方插件
  },
  css: {
    extract: IS_PROD,      // 是否使用css分离插件 ExtractTextPlugin
    sourceMap: false,   // 开启 CSS source maps        
    requireModuleExtension: false,     // 启用 CSS modules for all css / pre-processor files.
    // css 预设器配置项
    loaderOptions: {
      // sass: {
      //   data: `
      //     @import "@/scss/variable.scss";
      //   `
      // }
      sass: {
        javascriptEnabled: true
      }
    }
  },
  chainWebpack: config => {
    // 修复HMR
    config.resolve.symlinks(true);
    //修复 Lazy loading routes Error
    config.plugin("html").tap(args => {
      // args[0].template = '/Users/username/proj/app/templates/index.html'
      args[0] = {
        ...args[0],
        title: "title", //"title",
        MINEMAP_CSS: process.env.VUE_APP_MINEMAP_CSS,
        MINEMAP_JS: process.env.VUE_APP_MINEMAP_JS
      };
      return args;
    });
    config.resolve.alias // 添加别名
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@store', resolve('src/store'));
    // 压缩图片
    // 需要 npm i -D image-webpack-loader
    config.module
      .rule("images")
      .use("image-webpack-loader")
      .loader("image-webpack-loader")
      .options({
        mozjpeg: { progressive: true, quality: 65 },
        optipng: { enabled: false },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 }
      });
    if (process.env.NODE_ENV === "production") {
      if (process.env.npm_config_report) {
        config
          .plugin("webpack-bundle-analyzer")
          .use(require("webpack-bundle-analyzer").BundleAnalyzerPlugin)
          .end();
        config.plugins.delete("prefetch");
      }
    }
  },
  configureWebpack: config => {
    const plugins = [
      // 删除 console.log
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            warnings: false,
            drop_debugger: true,
            drop_console: true
          }
        },
        sourceMap: false,
        parallel: true
      }),
      new BundleAnalyzerPlugin(),
      new CompressionPlugin({
        filename: "[path].gz[query]",
        algorithm: "gzip",
        test: productionGzipExtensions,
        threshold: 10240,
        minRatio: 0.8
      })
    ];
    // 公共代码抽离
    const optimization = {
      splitChunks: {
        cacheGroups: {
          vendor: {
            chunks: "all",
            test: /node_modules/,
            name: "vendor",
            minChunks: 1,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 100
          },
          common: {
            chunks: "all",
            test: /[\\/]src[\\/]js[\\/]/,
            name: "common",
            minChunks: 2,
            maxInitialRequests: 5,
            minSize: 0,
            priority: 60
          },
          styles: {
            name: "styles",
            test: /\.(sa|sc|c)ss$/,
            chunks: "all",
            enforce: true
          },
          runtimeChunk: {
            name: "manifest"
          }
        }
      }
    };
    if (process.NODE_ENV === "production") {
      config.plugins = [...config.plugins, ...plugins];
      config.optimization = [...config.optimization, ...optimization];
    }
  },
  // 第三方插件的选项
  pluginOptions: {
    env: {
      TEST: 'vue.config.js-->pluginOptions.env:TEST Global Parameters'
    },
    'style-resources-loader': {
      preProcessor: 'sass',
      patterns: [
        path.resolve(__dirname, './src/assets/scss/settings.scss')
      ]
    }
  }
}