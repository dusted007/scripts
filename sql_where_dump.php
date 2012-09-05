#!/usr/bin/php
<?php
/**
  *
  * Most of the time, when we add some column to an exist table and what to give some data export to the online or test server, we need dump the colums to csv and group the sql update sql with no
  * useful tools, now with sql_where_dump we can just use command line tool to dump the sql file without errors.
  *
  * @example sql_where_dump -u root -p -h 127.0.0.1 -d wordpress_phar -w id -q "select post_author,ID from wp_posts;" -f hello.sql
  * 
  * @created  2012-08-15
  * @lastModify 2012-08-15
  * @modifyLogs:
  *		2012-08-15  : new file
  * 	
  * ------------------------
  * @category script
  * @tags sql,mysql,dump,where,update
  * @author @devctang <tqp860618@gmail.com> 
  *	@copyright (C)1996-2099 devctang Inc.
  *	@license BSD
  * @version 1.0
  * 
  *
**/
	
$args = parse_args($argv);
$table_name = NULL;
$dump_file_name = $args['dump_file'];
$sql = $args['query'];
print_r($args);

if (preg_match("/from ([\d\w]+)[ ]*/i", $sql, $matches)) {
	$table_name = $matches[1];
}
if (!$table_name) {
	help();
}
$conn = login_in($args['host'], $args['user'], $args['pwd'], $args['database']);

if (!$conn) {
	error('Can not connect the server');
}
$dump_sql_format = "UPDATE `%s` SET %s WHERE %s='%s';";
$result = mysql_query($sql, $conn);
if(!$result){
	error("No results!");
}
if ($result) {
	$dump_file_obj = NULL;
	$index=0;
	while ($row=mysql_fetch_array($result,MYSQL_ASSOC)) {
		if(!$dump_file_obj){
			$dump_file_obj=@fopen($dump_file_name, 'w+');
			fwrite($dump_file_obj, '-- dump by sql_where_dump ('.date('Y-m-d H:i:s').')'.PHP_EOL);
		}
		$update_seg = array();
		$where_value = NULL;
		foreach ($row as $k => $v) {
			if ($k != $args['where']) {
				$update_seg[] = sprintf("`%s`='%s'", $k, $v);
			} else {
				$where_value = $v;
			}
		}
		if($where_value===NULL){
			help();
		}
		$update_seg = implode(',', $update_seg);
		$sql_dump = sprintf($dump_sql_format, $table_name,$update_seg, $args['where'], $where_value);
		fwrite($dump_file_obj, $sql_dump.PHP_EOL);
		$index++;
	}
	msg('finished with '.$index.' lines.');
}

 /**
  * Login in the database
  *
  * @param string $host Host name
  * @param string $user User name
  * @param string $pwd  Password
  * @param string $database Database Name
  * @return Resource
  */
function login_in($host, $user, $pwd, $database) {

	$conn = @mysql_connect($host, $user, $pwd);
	@mysql_select_db($database);
	return $conn;
}

function parse_args($argv) {

	$args = array(
		'user' => 'root',
		'pwd' => '',
		'host' => '127.0.0.1:3306',
		'database' => NULL,
		'where' => NULL,
		'query' => NULL,
		'dump_file'=> './'.'DUMP_'.time().'.sql'
	);
	foreach ($argv as $index => $arg) {
		
		switch ($arg) {
			case '-f':
				$args['dump_file'] = arg_val($argv, $arg);
			break;
			case '-u':
				$args['user'] = arg_val($argv, $arg);
			break;
			case '-d':
				$args['database'] = arg_val($argv, $arg);
			break;
			case '-p':
				$pwd = arg_val($argv, $arg);
				
				if (substr($pwd, 0, 1) != '-') {
					$args['pwd'] = $pwd;
				} else {
					$args['pwd'] = '';
				}
			break;
			case '-h':
				$host = arg_val($argv, $arg);
				
				if (substr($host, 0, 1) != '-') {
					$args['host'] = $host;
				}
			break;
			case '-w':
				$where = arg_val($argv, $arg);
				if (substr($where, 0, 1) != '-') {
					$args['where'] = $where;
				}
			break;
			case '-q':
				$args['query'] = arg_val($argv, $arg);
				$args['query'] = trim($args['query'], '"');
			break;
		}
	}
	
	if (!$args['database'] || !$args['query'] || !$args['where']) {
		help();
	}
	return $args;
}

function arg_val($argv, $key) {

	$index = array_search($key, $argv);
	
	if (isset($argv[$index + 1])) return $argv[$index + 1];
	return NULL;
}

function help() {
	echo 'Help: sql_where_dump -u root -p -h 127.0.0.1 -d wordpress_phar -w id -q "select post_author,ID from wp_posts;" -f hello.sql' . PHP_EOL;
	exit();
}

function error($msg) {

	echo $msg . PHP_EOL;
	exit();
}

function msg($msg) {
	echo $msg.PHP_EOL;
}
?>