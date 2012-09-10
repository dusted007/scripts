#!/usr/bin/php
<?php
define('GOOGLE_EMAIL','tqp860618@gmail.com');
define('GOOGLE_PASSWD','xxxxx');
define('ANDROID_DEVICEID','xxx');

if(!GOOGLE_EMAIL||!GOOGLE_PASSWD||!ANDROID_DEVICEID){
	echo('pls set the email,password,device_id with the script'.PHP_EOL);
	exit();
}


define('ANDROID_USERID',GOOGLE_EMAIL);
define('ANDROID_REALID',ANDROID_DEVICEID);
include("./libs/proto/protocolbuffers.inc.php");
include("./libs/proto/market.proto.php");
include("./libs/Market/MarketSession.php");

$session = new MarketSession();
$session->login(GOOGLE_EMAIL, GOOGLE_PASSWD);
$session->setAndroidId(ANDROID_DEVICEID);


$ar = new AppsRequest();
$ar->setQuery("pname:" . $argv[1]);
$ar->setStartIndex(0);
$ar->setEntriesCount(5);

$reqGroup = new Request_RequestGroup();
$reqGroup->setAppsRequest($ar);

$response = $session->execute($reqGroup);
$groups = $response->getResponsegroupArray();
foreach ($groups as $rg) {
	$appsResponse = $rg->getAppsResponse();
	$apps = $appsResponse->getAppArray();
	foreach ($apps as $app) {
		$fp = fopen (dirname(__FILE__) . '/' . $app->getPackageName() . '.apk', 'w+');//This is the file where we save the information
		$url='http://android.clients.google.com/market/download/Download?userId='.ANDROID_USERID.'&deviceId='.ANDROID_REALID.'&assetId='.$app->getId();
		echo $url;
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_TIMEOUT, 50);
		curl_setopt($ch, CURLOPT_FILE, $fp); //output to file
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($ch, CURLOPT_COOKIE, "ANDROID=".$session->authSubToken);
		curl_setopt($ch, CURLOPT_USERAGENT, "Android-Market/2 (sapphire PLAT-RC33); gzip");
		curl_exec($ch);
		curl_close($ch);
		fclose($fp);
	}
}
