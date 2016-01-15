/**
 * Created by owenhong on 2015/11/9.
 */

var express = require('express');
var app = express();

var path = require('path');

var Routes = require('./routes.js');
var Config = require('./config.js');

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multipart = require('connect-multiparty');


//TODO parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//TODO parse application/json
app.use(bodyParser.json());

//TODO 4.0 method-override
app.use(methodOverride());

//TODO connect-multiparty
app.use(multipart());


//设置端口
app.set('port', Config.port);


//设置静态文件目录
app.set('views', path.join(__dirname, 'views'));


// 更改模板引擎
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

//静态中心
app.use(express.static(path.join(__dirname, 'public')));


//日志中心
var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'console' },
        {
            type: 'file',
            filename: 'logs/cheese.log',
            category: 'normal'
        }
    ],
    //以[INFO] console代替console默认样式
    replaceConsole: true
});

var logger = log4js.getLogger('default');
//log4js的输出级别6个: trace, debug, info, warn, error, fatal
logger.setLevel('INFO');
app.use(log4js.connectLogger(logger, {
    level: 'aoto',
    format: 'method :url'
}));



//启动路由中心
Routes.handle(app);





/*
 *
 * 启动服务
 *
 * */
if(Config.debug){
    console.log('abc');
    app.listen(app.get('port'),function(){
        console.log('Node listening on port:' + app.get('port'));
    });

}else{
    exports.startServer = function(){
        app.listen(app.get('port'),function(){
            console.log('Node listening on port:' + app.get('port'));
        });
    }
}
