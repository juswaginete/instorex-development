<?php

if (isset($_POST['url'])) {
    $url = $_POST['url'];
    $parsedUrl = parse_url($url);
   
    //only allow http or https schemes
    if ( ! isset($parsedUrl['scheme']) || ! in_array($parsedUrl['scheme'], ['http', 'https'])) return;
  
    //only allow urls that are on a different domain
    $domain = str_ireplace('www.', '', $parsedUrl['host']);
   	if (strpos($domain, $_SERVER['HTTP_HOST']) !== false) return;

    $mime = pathinfo($url, PATHINFO_EXTENSION);

    if (function_exists('curl_version')) {
    	$handle = curl_init();
		curl_setopt($handle, CURLOPT_URL, $url);
		curl_setopt($handle, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);

		$data = curl_exec($handle);

		curl_close($handle);
    } else {
    	$data = file_get_contents($url);
    }

    //check that the file we've fetched is an actual image
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    if (strpos($finfo->buffer($data), 'image') === false) return;

    //base64 encode image data
    $imageData = base64_encode($data);
    $formatted = 'data: '.$mime.';base64,'.$imageData;

    echo $formatted;
}



