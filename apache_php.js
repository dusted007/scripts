#!/usr/local/bin/node

/**
  *
  * Open a folder as a website for Temporary use
  * For Apache and PHP
  *
  * @example 
  * apache_php tmp_site create
  * apache_php tmp_site delete
  * 
  * @created  2012-09-14 15:46:37
  * @lastModify 2012-09-14 15:46:37
  * @modifyLogs:
  *		2012-09-14 15:46:37  : new file
  * 	
  * ------------------------
  * @category 
  * @tags 
  * @author @devctang <tqp860618@gmail.com> 
  *	@copyright (C)1996-2099 devctang Inc.
  *	@license BSD
  * @version 1.0
  * 
  *
**/
hosts_file_path='/etc/hosts';
apache_conf_path='/opt/local/apps/apache-httpd-2.4.2/conf/httpd.conf';






var child_process = require('child_process');
var util=require('util');
var fs=require('fs');


var app={
  help:function(){
msg='Usage:\n\
  [create new template site for current folder]:\n\
    apache_php tmp_site c|create|new|add\n\
  [delete the template site for current folder]:\n\
    apache_php tmp_site d|delete|del|remove\n\
  [flush all the confs]:\n\
    apache_php tmp_site f|flush|\n\
';
  errmsg(msg);
},
  tmp_site:function(type,path){
    if(type==undefined){
      type='create';
    }
    //get the host name file
    
    //unicode path
    if(path==undefined){
      path=process.cwd();  
    }
    try{
      stats=fs.statSync(path);
      if(!stats||!stats.isDirectory()){
        errmsg(path+" is not a vaild directory");  
      }
      path=fs.realpathSync(path);  
    }
    catch(ex){
      errmsg(path+" is not a vaild directory");  
    }
    
    
    var folder=/\/([^\/]+)\/?$/.exec(path);
    var sign=md5(path);
    hostname=folder[1]+'_'+sign+'.com';
    
    //modify the httpd.conf
    apache_http_conf_file_temp='\n\
#sign<%s>\n\
<VirtualHost *:80>\n\
  DocumentRoot "%s"\n\
  ServerName %s\n\
  <Directory "%s">\n\
    Options Indexes FollowSymlinks\n\
    Allow from all\n\
    AllowOverride All\n\
  </Directory>\n\
</VirtualHost>\n\
#sign<%s>\n\
\n\
';
    apache_http_conf=util.format(apache_http_conf_file_temp,sign, path,hostname,path,sign);



//hosts    
    hosts_format='\n\
#sign<%s>\n\
127.0.0.1  %s\n\
#sign<%s>\n\
\n\
';

    hosts_conf=util.format(hosts_format,sign,hostname,sign);


    switch(type){
      case 'refresh':
      case 'flush':
      case 'f':
        http_host_conf_flush(apache_conf_path,function(){
          console.log('apache httpd.conf \'s related host conf is flush successful');
          hosts_flush(hosts_file_path,function(){
            console.log('hosts file \'s related line is flush successful');
            child_process.exec('apachectl restart',function(error,stdout,stderr){
              if(error) errmsg(error);
              if(stderr) errmsg(stderr);
              if(!stdout){
                console.log('apachctl restart succeed');
              }
            });
          });
        });
      break;
      case 'create':
      case 'add':
      case 'new':
      case 'c':
      case '1':
        http_host_conf_push(apache_conf_path, apache_http_conf,function(){
          console.log('apache httpd.conf is set successful');
          hosts_push(hosts_file_path, hosts_conf,function(){
            console.log('hosts file is set successful');
            child_process.exec('apachectl restart',function(error,stdout,stderr){
              if(error) errmsg(error);
              if(stderr) errmsg(stderr);
              if(!stdout){
                console.log('apachctl restart succeed');
                console.log('open the browser');
                child_process.spawn('open', ['http://'+hostname]);    
              }
            });
          });
        });
      break;
      case 'delete':
      case 'del':
      case 'remove':
      case 'd':
      case '0':
        http_host_conf_pop(apache_conf_path, apache_http_conf,function(){
          console.log('apache httpd.conf \'s related host conf is delete successful');
          hosts_pop(hosts_file_path, hosts_conf,function(){
            console.log('hosts file \'s related line is delete successful');
            child_process.exec('apachectl restart',function(error,stdout,stderr){
              if(error) errmsg(error);
              if(stderr) errmsg(stderr);
              if(!stdout){
                console.log('apachctl restart succeed');
              }
            });
          });
        });
      break;
      default:
      errmsg(type+' is not support with tmp_site');
      
    }

  }
};

rpc_logic(process.argv);



// ------------------------------------------
// ------------------------------------------


function http_host_conf_push(apache_conf_path, apache_http_conf,callback){
  if(chk_string_exist(apache_conf_path, apache_http_conf)){
    callback();
    return;
  }
  fs.appendFile(apache_conf_path, apache_http_conf, function (err) {
    if (err) errmsg("The apache http.conf can not be opened to append data!");
    callback();
  });  
}

function http_host_conf_pop(apache_conf_path, apache_http_conf,callback){
  if(!chk_string_exist(apache_conf_path, apache_http_conf)){
    callback();
    return;
  }
  data=fs.readFileSync(apache_conf_path);
  data=data.toString();
  data=data.replace(apache_http_conf,'');
  fs.writeFile(apache_conf_path, data, function (err) {
    if (err) errmsg("The apache http.conf can not be opened to delete data!");
    callback();
  });  
}


function http_host_conf_flush(apache_conf_path,callback){
  data=fs.readFileSync(apache_conf_path);
  data=data.toString();
  data=data.replace(/#sign<[\w\d]+?>[\s\S]+#sign<[\w\d]+?>/i,'');
  fs.writeFile(apache_conf_path, data, function (err) {
    if (err) errmsg("The apache http.conf can not be opened to flush data!"+err);
    callback();
  });  
}


function hosts_flush(hosts_file_path,callback){
  data=fs.readFileSync(hosts_file_path);
  data=data.toString();
  data=data.replace(/#sign<[\w\d]+?>[\s\S]+#sign<[\w\d]+?>/i,'');
  fs.writeFile(hosts_file_path, data, function (err) {  
    if (err) errmsg("The hosts can not be opened to flush data!");
    callback();
  });
}





function hosts_push(hosts_file_path, hosts_conf,callback){
  if(chk_string_exist(hosts_file_path, hosts_conf)){
    callback();
    return;
  }
  fs.appendFile(hosts_file_path, hosts_conf, function (err) {  
    if (err) errmsg("The hosts can not be opened to append data!");
    callback();
  });
}

function hosts_pop(hosts_file_path, hosts_conf,callback){
  
  if(!chk_string_exist(hosts_file_path, hosts_conf)){
    callback();
    return;
  }
  
  data=fs.readFileSync(hosts_file_path);
  data=data.toString();
  data=data.replace(hosts_conf,'');
  
  fs.writeFile(hosts_file_path, data, function (err) {  
    if (err) errmsg("The hosts can not be opened to delete data!");
    callback();
  });
}

function chk_string_exist(filepath,needle){
  
  data=fs.readFileSync(filepath);
  data=data.toString();
  
  if(!data){
    errmsg(filepath+" can not be read!");
  }
  //console.log(data,needle);
  if(data.indexOf(needle)==-1){
      return false;
  }
  return true;
}

function rpc_logic(argv){
  methods_support=['help','tmp_site'];
  method_and_args={'method':'help','args':[]};
  if(argv[2]!=undefined){
    method_and_args['method']=argv[2];
  }
  method_and_args['args']=argv.slice(3);

  if(methods_support.indexOf(method_and_args['method'])==-1){
    errmsg(method_and_args['method']+" is not supported");
  }
  return call_func_array('app.'+method_and_args['method'],method_and_args['args']);
}








//common func
function errmsg(msg){
  console.log(msg+'\n');
  process.exit();
}

function md5(name){
  var crypto = require('crypto');  
  return crypto.createHash('md5').update(name).digest("hex");
}
function call_func_array(func,args){
  func_str=util.format("%s.apply(this,args)",func);
  return eval(func_str);
}
