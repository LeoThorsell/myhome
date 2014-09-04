var koa = require('koa');
var app = koa();

app.use(function *(){
	this.body = 'hello there!';
});

app.listen(3001);
