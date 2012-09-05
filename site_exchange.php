#!/usr/bin/php

<?php
/**
  *
  *	 
  *
  * @example 
  * 
  * @example site_exchange -l		-- list all the site and switchable path
  * @example site_exchange -l site_name|ident  --list switchable path for site_name|ident
  * @example site_exchange -l site_name|ident -i path_ident|raw_path  --switch to the path_ident for site_name|indent
  * @created  2012-09-05 18:08:04
  * @lastModify 2012-09-05 18:08:04
  * @modifyLogs:
  *		2012-09-05 18:08:04  : new file
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
$args=parse_args($argv);
//print_r($args);
//parse the ini file
$conf_ini_file_path=$args['conf_ini_file_path'];
$confs=array();
if($conf_ini_file_path){
	$confs=parse_conf($conf_ini_file_path);
}
if(!$confs){
	error("No confs");
}
switch($args['action']){
	case 'list_all':
		print_r($confs);
	break;
	case 'list_single':
		if(!isset($confs[$args['args']['site']])){
			error(sprintf("%s is not confed in site_exchange.ini file",$args['args']['site']));	
		}
		print_r($confs[$args['args']['site']]);
	break;
	case 'exchange_single':
		if(!isset($confs[$args['args']['site']])){
			error(sprintf("Site %s is not configured in site_exchange.ini file",$args['args']['site']));	
		}
		if(!is_dir($args['args']['exchange'])){
			if(!isset($confs[$args['args']['site']]['exchanges'][$args['args']['exchange']])){
				error(sprintf("Exchange \"%s\" for Site \"%s\" is not configured in site_exchange.ini file",$args['args']['exchange'],$args['args']['site']));	
			}
		}
		else{
			if(!file_exists($args['args']['exchange'])){
				error(sprintf("Exchange Raw Path \"%s\" for Site \"%s\" is not exist",$args['args']['exchange'],$args['args']['site']));	
			}
		}
		
		exchange($confs[$args['args']['site']],$args['args']['exchange']);
		restart_server();
	
	break;
	case 'help':
	default:
		echo "
Help:\n
Most of the time, when you want to switch two path for the same host, it is a complex and easy mistake work to do. Just use site_exchange to make it easier.\n
Now this script is only for apache
This script need root to restart the server or modify the host configure file.\n
So:\n
sudo site_exchange -l		-- list all the site and switchable path
	sudo site_exchange.php -l
sudo site_exchange -l site_name|ident  --list switchable path for site_name|ident
	sudo site_exchange.php -l ziyou
sudo site_exchange -l site_name|ident -i path_ident|raw_path  --switch to the path_ident for site_name|indent
	sudo site_exchange.php -l ziyou -i /Users/vincent/Workspace/Sina/ziyou/svn/trunk
	sudo site_exchange.php -l ziyou -i trunk
";	
	break;
}


function exchange($conf,$to_ident){
	//print_r($conf);
	
	$conf_file=$conf['host'];
	if(!is_dir($to_ident)){
		$to_path=$conf['exchanges'][$to_ident];
	}
	else{
		$to_path=$to_ident;
	}
	$content=file_get_contents($conf_file);
	//echo $content;
	//echo '----------------------------'.PHP_EOL;
	
		
	$content=preg_replace("/DocumentRoot .+/","DocumentRoot \"{$to_path}\"",$content);
	
	$content=preg_replace("/<Directory .+/","<Directory \"{$to_path}\">",$content);
	
	//echo $content;
	file_put_contents($conf_file,$content);
	echo 'Write Host configure file successful'.PHP_EOL;
}

function restart_server(){
	echo '-------------------------'.PHP_EOL;
	echo "Restart the apache server\n";
	exec("apachectl restart");
}






function parse_conf($conf_file){
	$confs=array();
	$arr=parse_ini_file($conf_file, true);
	//print_r($arr);
	$require_keys=array('host_conf_path','indent','site');
	$path_exist_chk=array('host_conf_path');
	
	if($arr){
		foreach($arr as $seg_num=>$row){
			foreach($require_keys as $require_key){
				if(!isset($row[$require_key])){
					error(sprintf("%s is required for segment %s",$require_key,seg_num),'parse conf');		
				}
			}
			
			foreach($path_exist_chk as $path_key){
				if(!file_exists($row[$path_key])){
					error(sprintf("PATH %s should be existed for segment %s",$path_key,seg_num),'parse conf');						
				}
			}
			$ident=$row['indent'];
			if(!$ident){
				$ident=$row['site'];
			}
			if(!$ident){
				$ident=$seg_num;
			}
			$confs[$ident]=array('exchanges'=>array());
			$confs[$ident]['host']=$row['host_conf_path'];
			$confs[$ident]['site']=$row['site'];
			foreach($row as $k=>$v){
				if(preg_match("/^exchange\.(.+)$/", $k, $matches)){
					if(!file_exists($v)){
						error(sprintf("%s should be existed for segment %s",$v,seg_num),'parse conf');							
					}
					$confs[$ident]['exchanges'][$matches[1]]=$v;
				}
			}
			
		}
	}
	//print_r($confs);
	return $confs;
	
}
		
function parse_args($argv){
	$argc=count($argv)-1;
	$action='help';
	$args=array();
	if($argc==0){
		$action='help';		
	}
	elseif($argc==1){
		if($argv[1]=='-l'){
			$action='list_all';		
		}
	}
	elseif($argc==2){
		if($argv[1]=='-l'){
			$action='list_single';
			$args=array('site'=>$argv[2]);
		}
	}
	elseif($argc==4){
		if($argv[1]=='-l'&&$argv[3]=='-i'){
			$action='exchange_single';
			$args=array('site'=>$argv[2],'exchange'=>$argv[4]);
		}
	}
	return array('conf_ini_file_path'=>'site_exchange.ini','action'=>$action,'args'=>$args);
}
function error($msg,$type='common'){
	echo sprintf("Err(%s):\t%s\n",$type,$msg);
	exit();
}

?>
